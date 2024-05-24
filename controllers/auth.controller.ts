import type { NextFunction, Request, Response } from 'express';
import { CatchAsyncError } from '../middlewares/catchAsyncError';
import { validateLogin, validateRegister, validateVerifyAccount } from '../validation/Joi';
import ErrorHandler from '../utils/errorHandler';
import { UserTable } from '../db/schema';
import { db } from '../db/db';
import bcrypt from 'bcrypt';
import { createActivationToken } from '../utils/activationToken';
import sendEmail from '../utils/sendMail';
import jwt, { type JwtPayload, type Secret } from 'jsonwebtoken';
import type { TActivationRequest, TInferInsert, TInferSelect } from '../@types';
import { accessTokenOption, refreshTokenOption, sendToken } from '../utils/jwt';
import redis from '../db/redis';

export const register = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    
    try {
        const { error, value } = validateRegister(req.body);
        if(error) return next(new ErrorHandler(error.message, 400));
        const { fullName, email, phone, password } = value as TInferInsert;

        const isEmailExists = await db.query.UserTable.findFirst({where : (table, func) => func.eq(UserTable.email, email)}) as TInferSelect;
        if(isEmailExists) return next(new ErrorHandler('Email already exists', 400));

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = {
            fullName, email, phone, password : hashedPassword
        }

        const activationToken = createActivationToken(user);
        const activationCode = activationToken.activationCode;

        await sendEmail({
            email: user.email,
            subject: 'Activate Your Account',
            text: 'Please use the following code to activate your account: ' + activationCode,
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #4CAF50;">Activate Your Account</h2>
                <p>Please use the following code to activate your account:</p>
                <div style="border: 1px solid #ddd; padding: 10px; font-size: 20px; margin-top: 20px; text-align: center;">
                  <strong>${activationCode}</strong>
                </div>
                <p>If you did not request this code, please ignore this email or contact our support team.</p>
                <p>Best regards,<br>The Support Team</p>
              </div>
            `
          });

          res.status(200).json({success : true, message : 'Please check your email', activationToken : activationToken.token});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const verifyAccount = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const {error, value} = validateVerifyAccount(req.body);
        if(error) return next(new ErrorHandler(error.message, 400));
        const { activationToken, activationCode } = value as TActivationRequest;

        const newUser : {user : TInferSelect, activationCode : string} = jwt.verify(activationToken, 
            process.env.ACTIVATION_TOKEN as Secret
        ) as {user : TInferSelect, activationCode : string}

        if(newUser.activationCode !== activationCode) return next(new ErrorHandler('Invalid verify code', 400));

        const { fullName, email, phone, password } = newUser.user;

        const isEmailExists = await db.query.UserTable.findFirst({where : (table, func) => func.eq(UserTable.email, email)}) as TInferSelect;
        if(isEmailExists) return next(new ErrorHandler('Email already exists', 400));

        await db.insert(UserTable).values({fullName, email, phone, password});

        res.status(200).json({success : true, message : 'Account created you can login now'});
        
    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const login = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const {error, value} = validateLogin(req.body);
        if(error) return next(new ErrorHandler(error.message, 400));
        const { email, password } = value as TInferInsert

        const user = await db.query.UserTable.findFirst({where : (table, func) => func.eq(UserTable.email, email)}) as TInferSelect;
        const isPasswordMatch = await bcrypt.compare(password, user?.password || '');

        if(!user || !isPasswordMatch) return next(new ErrorHandler('Invalid email or password', 400));

        sendToken(user, 200, res);

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const logout = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        res.cookie('access_token', '', {maxAge : 1});
        res.cookie('refresh_token', '', {maxAge : 1});

        await redis.del(`user:${req.user?.id}`);

        res.status(200).json({success : true, message : 'Logged out successfully'});
        
    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const refreshToken = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const refresh_token = req.cookies.refresh_token;
        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as Secret) as JwtPayload;
        if(!decoded) return next(new ErrorHandler('Could not refresh token', 400));
        
        const session = await redis.get(`user:${decoded.id}`);
        if(!session) return next(new ErrorHandler('Plase login to access this resources', 400));

        const user = JSON.parse(session);
        req.user = user;

        const accessToken = jwt.sign({id : user.id}, process.env.ACCESS_TOKEN as Secret, {expiresIn : '5m'});
        const refreshToken = jwt.sign({id : user.id}, process.env.REFRESH_TOKEN as Secret, {expiresIn : '7d'});

        res.cookie('access_token', accessToken, accessTokenOption);
        res.cookie('refresh_token', refreshToken, refreshTokenOption);

        await redis.set(`user:${user.id}`, JSON.stringify(user), 'EX', 604800);

        res.status(200).json({success : true, accessToken});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});