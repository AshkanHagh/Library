import type { NextFunction, Request, Response } from 'express';
import { CatchAsyncError } from '../middlewares/catchAsyncError';
import ErrorHandler from '../utils/errorHandler';
import { validateNewProduct, validateUpdateProduct } from '../validation/Joi';
import type { TInferInsertBook, TInferInsertCategory, TInferInsertInventory, TInferSelectBook, TInferSelectInventory } from '../@types';
import { db } from '../db/db';
import { BookCategoryTable, BookTable, CategoryTable, InventoryTable } from '../db/schema';
import redis from '../db/redis';
import { eq } from 'drizzle-orm';

export const createBook = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const {error, value} = validateNewProduct(req.body);
        if(error) return next(new ErrorHandler(error.message, 400));
        const { name, description, price, availableQuantity, categories } = value as TInferInsertBook & TInferInsertInventory & {categories : string[]}

        const userId = req.user?.id || '';

        const book = await db.insert(BookTable).values({name, description, price, authorId: userId}).returning();
        const bookResult = book[0] as TInferSelectBook;

        const inventory = await db.insert(InventoryTable).values({ bookId: bookResult.id, availableQuantity }).returning();
        const inventoryResult = inventory[0] as TInferSelectInventory;

        if(categories && categories.length > 0) {

            const existingCategory = await db.query.CategoryTable.findMany({
                where : (table, funcs) => funcs.inArray(table.name, categories)
            });

            const existingCategoryName = existingCategory.map(category => category.name);
            const newCategoryNames = categories.filter(categoryName => !existingCategoryName.includes(categoryName));

            let newCategories : TInferInsertCategory[] = [];
            if (newCategoryNames.length > 0) {

                newCategories = await db.insert(CategoryTable).values(
                    newCategoryNames.map(name => ({name}))
                ).returning()
            }

            const allCategories = [...existingCategory, ...newCategories];

            await db.insert(BookCategoryTable).values(
                allCategories.map(category => ({bookId: bookResult.id, categoryId: category.id}))
            ).execute();
        }
        
        const fullBook = await db.query.BookTable.findFirst({
            where : (table, funcs) => funcs.eq(table.id, bookResult.id),
            with : {
                author: {columns: {password: false, updatedAt: false}},
                categories : {columns : {bookId : false, categoryId : false}, with : {categories : {columns : {name : true}}}},
                inventory: {columns: {id: false, bookId: false}}
            }
        });

        const mappedBook = {
            id: fullBook!.id, name: fullBook!.name, description: fullBook!.description, price: fullBook!.price, createdAt: fullBook!.createdAt,
            authorId: {
                id: fullBook!.author.id,
                email: fullBook!.author.email
            },
            categories: fullBook!.categories.map(category => category.categories?.name),
            availableQuantity: fullBook!.inventory.availableQuantity
        };

        await redis.set(`book:${fullBook!.id}`, JSON.stringify(mappedBook));

        res.status(200).json({success : true, book : mappedBook});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const books = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const keys = await redis.keys('book:*');
        if(keys.length > 0) {
            const books = await Promise.all(keys.map(async (key : string) => {

                const data = await redis.get(key);
                const book = JSON.parse(data!);
                return book
            }));

            const sortedResult = books.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
            res.status(200).json({success : true, sortedResult});
        }
        const books = await Promise.all(keys.map(async (key : string) => {

            const bookId = key.slice(5);
            return bookId;
        }));

        const book = await db.query.BookTable.findMany({
            where : (table, funcs) => funcs.inArray(table.id, books),
            with : {author : {columns : {password : false, updatedAt : false}}, 
                categories : {columns : {bookId : false, categoryId : false}, with : {categories : {columns : {name : true}}}}, 
                inventory : {columns : {id : false, bookId : false}}
            }
        });

        const result = book.map(book => {
            const categories = book.categories.map(category => {return category.categories?.name});

            return {
                id : book.id, name : book.name, description : book.description, price : book.price, createdAt : book.createdAt,
                authorId : {
                    id : book.author.id,
                    email : book.author.email
                },
                categories, availableQuantity : book.inventory.availableQuantity
            }
        });

        const sortedResult = result.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
        sortedResult.map(async (books) => {
            await redis.set(`book:${books.id}`, JSON.stringify(books));
        });

        res.status(200).json({success : true, sortedResult});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const searchBook = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { query } = req.params;

        const keys = await redis.keys('book:*');
        const books = await Promise.all(keys.map(async (key : string) => {

            const data = await redis.get(key);
            const book = JSON.parse(data!);

            const regex = new RegExp(query, 'i');
            if(regex.test(book.name) || regex.test(book.categories)) return book
        }));

        res.status(200).json({success : true, books : books.filter(Boolean)});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const singleBook = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id : bookId } = req.params as {id : string};

        const bookResult = await redis.get(`book:${bookId}`);
        const book = JSON.parse(bookResult || '');

        res.status(200).json({success : true, book});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const deleteBook = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id : bookId } = req.params as {id : string}
        const authorId = req.user?.id;

        const book = await db.query.BookTable.findFirst({
            where : (table, funcs) => funcs.and(eq(table.id, bookId), eq(table.authorId, authorId!))
        });

        if(!book) return next(new ErrorHandler('Unauthorized - Admins can only delete their book', 400));

        const deletedBook = await db.delete(BookTable).where(eq(BookTable.id, bookId)).returning();
        const deletedBookResult = deletedBook[0] as TInferSelectBook;

        await redis.del(`book:${deletedBookResult.id}`);

        res.status(200).json({success : true, message : `Book has been deleted`, bookId : deletedBookResult});
        
    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const editBook = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    
    try {
        const {error, value} = validateUpdateProduct(req.body);
        if(error) return next(new ErrorHandler(error.message, 400));

        const { name, description, price, availableQuantity, categories } = value as TInferInsertBook & TInferInsertInventory & {categories : string[]}
        const { id : bookId } = req.params as {id : string};
        const authorId = req.user?.id;

        const book = await db.query.BookTable.findFirst({
            where : (table, funcs) => funcs.and(eq(table.id, bookId), eq(table.authorId, authorId!))
        });

        if (!book) return next(new ErrorHandler('Unauthorized - Users can only edit their own book', 400));

        const updatedBook = await db.update(BookTable).set({
            name : name ?? book.name, description: description ?? book.description, price: price ?? book.price,
            updatedAt : new Date()
        }).where(eq(BookTable.id, bookId)).returning()
        const bookResult = updatedBook[0] as TInferSelectBook;

        if(availableQuantity !== undefined) {
            await db.update(InventoryTable).set({availableQuantity}).where(eq(InventoryTable.bookId, bookId));
        }

        if(categories !== undefined) {
            const existingCategory  = await db.query.CategoryTable.findMany({
                where : (table, funcs) => funcs.inArray(table.name, categories)
            });

            const existingCategoryName = existingCategory.map(category => category.name);
            const newCategoryNames = categories.filter(categoryName => !existingCategoryName.includes(categoryName));

            let newCategories : TInferInsertCategory[] = [];
            if(newCategoryNames.length > 0) {

                newCategories = await db.insert(CategoryTable).values(newCategoryNames.map(name => ({name}))).returning()
            }

            const allCategories = [...existingCategory, ...newCategories];
            await db.insert(BookCategoryTable).values(allCategories.map(category => ({bookId : bookResult.id, categoryId : category.id}))).
            onConflictDoNothing();
        }

        const updatedBooks = await db.query.BookTable.findFirst({
            where : (table, funcs) => funcs.eq(table.id, bookResult.id),
            with : {
                author: {columns: {password: false, updatedAt: false}},
                categories : {columns : {bookId : false, categoryId : false}, with : {categories : {columns : {name : true}}}},
                inventory: {columns: {id: false, bookId: false}}
            }
        });

        const result = {
            id : updatedBooks?.id, name : updatedBooks?.name, description : updatedBooks?.description, price : updatedBooks?.price, 
            createdAt : updatedBooks?.createdAt,
            authorId : {
                id : updatedBooks?.author.id,
                email : updatedBooks?.author.email
            },
            categories : updatedBooks?.categories.map(category => category.categories?.name),
            availableQuantity : updatedBooks?.inventory.availableQuantity
        }

        await redis.set(`book:${updatedBooks?.id}`, JSON.stringify(result));

        res.status(200).json({success : true, message : 'Book has been updated', book : result});
        
    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});