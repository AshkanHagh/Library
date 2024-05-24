import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload, type Secret } from 'jsonwebtoken';
import { CatchAsyncError } from './catchAsyncError';
import ErrorHandler from '../utils/errorHandler';
import redis from '../db/redis';

export const isAuthenticated = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const token = req.cookies.access_token;
        if(!token) return next(new ErrorHandler('Please login to access this resource', 400));

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN as Secret) as JwtPayload;
        if(!decoded) return next(new ErrorHandler('Invalid token', 400));

        const user = await redis.get(`user:${decoded.id}`);
        if(!user) return next(new ErrorHandler('Please login to access this resource', 400));

        req.user = JSON.parse(user);
        next()
        
    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const authorizeRoles = (...role : string[]) => {
    return async (req : Request, res : Response, next : NextFunction) => {
        if(!role.includes(req.user?.role || '')) {
            return next(new ErrorHandler(`Role : ${req.user?.role} is not allowed to access this resource`, 400));
        }
        next()
    }
};