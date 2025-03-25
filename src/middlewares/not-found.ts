import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

// Middleware to handle requests to non-existent routes
export const notFoundMiddleware = (req: Request, res: Response) => {
    res.status(StatusCodes.NOT_FOUND).send('Route does not exists');
};
