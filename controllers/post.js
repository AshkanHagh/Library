const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

const Book = require('../models/book');
const User = require('../models/user');


exports.createPost = async (req, res, next) => {

    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {

            const error = new Error('invalid data from your data, please check your value');
            error.statusCode = 422;
            throw error;
        }

        if(!req.file) {

            const error = new Error('Please upload a image')
            error.statusCode = 422;
            throw error;
        }

        const book = new Book({

            title : req.body.title,
            desc : req.body.desc,
            author : req.userId,
            photo : req.file.path
        });

        const result = await book.save();

        const user = await User.findById(req.userId);

        user.posts.push(result);

        const author = await user.save();

        res.status(201).json({message : 'Post has been created', book : result, author : author});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}

exports.getPosts = async (req, res, next) => {

    try {
        const post = await Book.find().populate('author', 'username');
        if(!post) {

            const error = new Error('Nothing found...');
            error.statusCode = 422;
            throw error;
        }

        res.status(200).json({message : 'Posts has been fetched', posts : post});
        
    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}

exports.getSinglePost = async (req, res, next) => {

    try {
        const post = await Book.findById(req.params.postId).populate('author', 'username');
        if(!post) {

            const error = new Error('Nothing found...');
            error.statusCode = 422;
            throw error;
        }

        res.status(200).json({message : 'Your post has been fetched', post : post});

    } catch (error) {
        
        if(!error.statusCode) {
            
            error.statusCode = 500;
        }
        next(error);
    }

}

exports.updatePost = async (req, res, next) => {

    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {

            const error = new Error('invalid data from your data, please check your value');
            error.statusCode = 422;
            throw error;
        }

        const post = await Book.findById(req.params.postId);
        if(!post) {

            const error = new Error('Nothing found...');
            error.statusCode = 404;
            throw error;
        }

        if(post.author.toString() != req.userId) {

            const error = new Error("not authorized");
            error.statusCode = 403;
            throw error;
        }

        let image = req.body.image;
        if(req.file) {

            image = req.file.path
        }

        if(image != post.photo && image != 'undefined') {

            clearImage(post.photo);

            await post.updateOne({
                $set : { photo : image}
            });
        }

        post.title = req.body.title,
        post.desc = req.body.desc;

        await post.save();

        res.status(201).json({message : 'Post has been updated...', post : post});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}

exports.deletePost = async (req, res, next) => {

    try {
        const post = await Book.findById(req.params.postId);
        if(!post) {

            const error = new Error('Nothing found...');
            error.statusCode = 404;
            throw error;
        }

        if(post.author.toString() != req.userId) {

            const error = new Error("not authorized");
            error.statusCode = 403;
            throw error;
        }

        clearImage(post.photo);

        await post.deleteOne();

        const user = await User.findById(req.userId);

        user.posts.remove(req.params.postId);
    
        await user.save();

        res.status(200).json({message : 'Post has been deleted', postId : post._id});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}


const clearImage = (filePath) => {

    filePath = path.join(__dirname, '..', filePath);

    if(fs.existsSync(filePath)) {

        fs.unlinkSync(filePath);
        console.log('image deleted successfully');
    }
    else {
        console.log('image not found');
    }

}