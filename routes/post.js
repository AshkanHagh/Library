const router = require('express').Router();
const { body } = require('express-validator');
const isAuth = require("../middlewares/verify-token");

const postControl = require('../controllers/post');


router.post('/', isAuth, body('title').trim().notEmpty(), postControl.createPost);

router.get('/', isAuth, postControl.getPosts);

router.get('/:postId', isAuth, postControl.getSinglePost);

router.put('/:postId', isAuth, body('title').trim().notEmpty(), postControl.updatePost);

router.delete('/:postId', isAuth, postControl.deletePost);


module.exports = router;