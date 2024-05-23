import type { NextFunction, Request, Response } from 'express';

export const ErrorMiddleware = (error : IError, req : Request, res : Response, next : NextFunction) => {

    error.statusCode = error.statusCode || 500;
    error.message = error.message || 'Internal server error';

    res.status(Number(error.statusCode)).json({message : error.message});
}