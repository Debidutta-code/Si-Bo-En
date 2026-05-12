import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

import { AppError } from '../utils/error.util';
import { CastError } from 'mongoose';
import { WriteError } from 'mongodb';

const sendDevError = (err: AppError, res: Response): void => {
    res.status(err.statusCode).json({
        status: err.status,
        err: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendProdError = (err: AppError, res: Response): void => {
    err.isOperational
        ? res.status(err.statusCode).json({
              status: err.status,
              message: err.message,
          })
        : res.status(500).json({
              status: 'error',
              message: 'Something went wrong, please try again later!',
          });
};

const handleCastError = (err: CastError): AppError => {
    const message = `Value ${err.path}:${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsError = (err: WriteError): AppError => {
    const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
    const message = `Duplicate field value: ${value}, Please try again with another value`;
    return new AppError(message, 400);
};

const handleValidationError = (err: any): AppError => {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    const message = `Invalid input data, ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleTokenExpiredError = (err: any): AppError => {
    const message = `Token has expired, please login to try again`;
    return new AppError(message, 401);
};

const handleJsonWebTokenError = (err: any): AppError => {
    const message = `Invalid token, please login again!`;
    return new AppError(message, 401);
};

export const errorHandler: ErrorRequestHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    err.statusCode = +err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendDevError(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        if (error.name === 'CastError') error = handleCastError(error);
        if (error.code === 11000) error = handleDuplicateFieldsError(error);
        if (error.name === 'ValidationError')
            error = handleValidationError(error);
        if (error.name === 'TokenExpiredError')
            error = handleTokenExpiredError(error);
        if (error.name === 'JsonWebTokenError')
            error = handleJsonWebTokenError(error);
        sendProdError(error, res);
    }
};
