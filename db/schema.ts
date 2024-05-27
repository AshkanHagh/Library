import { relations } from 'drizzle-orm';
import { integer, pgEnum, pgTable, primaryKey, real, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';


export const UserRole = pgEnum('role', ['admin', 'user']);

export const UserTable = pgTable('user', {
    id : uuid('id').primaryKey().defaultRandom(),
    fullName : varchar('fullName', {length : 255}).notNull(),
    phone : varchar('phone', {length : 255}).notNull(),
    email : varchar('email', {length : 255}).notNull(),
    role : UserRole('role').notNull().default('user'),
    password : varchar('password', {length : 255}).notNull(),
    createdAt : timestamp('createdAt').defaultNow(),
    updatedAt : timestamp('updatedAt').defaultNow()
}, table => {
    return { emailIndex : uniqueIndex('emailIndex').on(table.email) }
});

export const BookTable = pgTable('books', {
    id : uuid('id').primaryKey().defaultRandom(),
    name : varchar('name', {length : 255}).notNull(),
    description : varchar('description', {length : 1500}).notNull(),
    price : real('price').notNull(),
    authorId : uuid('authorId').references(() => UserTable.id, {onDelete : 'cascade'}).notNull(),
    createdAt : timestamp('createdAt').defaultNow(),
    updatedAt : timestamp('updatedAt').defaultNow()
});

export const CategoryTable = pgTable('category', {
    id : uuid('id').primaryKey().defaultRandom(),
    name : varchar('name', {length : 255}).notNull(),
    createdAt : timestamp('createdAt').defaultNow(),
    updatedAt : timestamp('updatedAt').defaultNow()
});

export const BookCategoryTable = pgTable('postCategory', {
    bookId : uuid('bookId').references(() => BookTable.id, {onDelete : 'cascade'}).notNull(),
    categoryId : uuid('categoryId').references(() => CategoryTable.id, {onDelete : 'cascade'})
}, table => {
    return { pk : primaryKey({columns : [table.bookId, table.categoryId]}) }
});

export const InventoryTable = pgTable('inventory', {
    id : uuid('id').primaryKey().defaultRandom(),
    bookId : uuid('bookId').references(() => BookTable.id, {onDelete : 'cascade'}),
    availableQuantity : integer('available_quantity').notNull()
});

export const UserTableRelations = relations(UserTable, ({one, many}) => {
    return {
        books : many(BookTable)
    }
});

export const BookTableRelations = relations(BookTable, ({one, many}) => {
    return {
        author : one(UserTable, {
            fields : [BookTable.authorId],
            references : [UserTable.id]
        }),
        categories : many(BookCategoryTable),
        inventory : one(InventoryTable, {
            fields : [BookTable.id],
            references : [InventoryTable.bookId]
        })
    }
});

export const CategoryRelations = relations(CategoryTable, ({many}) => {
    return {
        books : many(BookCategoryTable)
    }
});

export const PostCategoryTableRelations = relations(BookCategoryTable, ({one}) => {
    return {
        books : one(BookTable, {
            fields : [BookCategoryTable.bookId],
            references : [BookTable.id]
        }),
        categories : one(CategoryTable, {
            fields : [BookCategoryTable.categoryId],
            references : [CategoryTable.id]
        })
    }
});

export const InventoryTableRelations = relations(InventoryTable, ({one}) => {
    return {
        book : one(BookTable, {
            fields : [InventoryTable.bookId],
            references : [BookTable.id]
        })
    }
})