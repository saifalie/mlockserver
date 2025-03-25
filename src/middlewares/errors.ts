import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../errors/root.js';

// Middleware to handle errors and send structured JSON responses
export const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
    // Set the response status code from the error object

    console.log('errorMiddleware - ',error);
    
    

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        message: error.message, // Provide the error message
        ErrorCode: error.errorCode, // Include an error code for reference
        errors: error.errors // Include any additional error details
    });
};
