import express, { type NextFunction, type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { ErrorMiddleware } from './middlewares/error';

import authRoute from './routes/auth.route';
import productRoute from './routes/product.route';

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin : process.env.ORIGIN}));

app.get('/', (req : Request, res : Response) => res.status(200).json({success : true, message : 'Welcome'}));

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/product', productRoute);

app.get('*', (req : Request, res : Response, next : NextFunction) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    next(error);
});

app.use(ErrorMiddleware);