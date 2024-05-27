import { Router, type NextFunction, type Request, type Response } from 'express';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import { books, createBook, deleteBook, editBook, searchBook, singleBook } from '../controllers/product.controller';

const router = Router();

router.post('/create', [isAuthenticated, authorizeRoles('admin')], createBook);

router.get('/', books);

router.get('/search/:query', searchBook);

router.get('/:id', singleBook);

router.delete('/:id', [isAuthenticated, authorizeRoles('admin')], deleteBook);

router.put('/:id', [isAuthenticated, authorizeRoles('admin')], editBook);

router.all('*', (req : Request, res : Response, next : NextFunction) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    next(error);
});

export default router;