import { NextFunction, Request, Response } from 'express';
import { ErrorCode, HttpException } from '../errors/root.js';
import { InternalException } from '../errors/internal-exception.js';

export const errorHandler = (method: Function) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await method(req, res, next);
        } catch (error) {
            let exception: HttpException;
            if (error instanceof HttpException) {
                exception = error;
            } else {
                exception = new InternalException('Something went wrong', ErrorCode.FILE_INTERNAL_EXCEPTION, error);
            }

            next(exception);
        }
    };
};
