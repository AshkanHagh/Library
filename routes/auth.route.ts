import { Router, type NextFunction, type Request, type Response } from 'express';
import { login, logout, refreshToken, register, verifyAccount } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);

router.post('/verify', verifyAccount);

router.post('/login', login);

router.get('/logout', logout);

router.get('/refresh', refreshToken);

router.all('*', (req : Request, res : Response, next : NextFunction) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    next(error);
});

export default router;