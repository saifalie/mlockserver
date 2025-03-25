import { StatusCodes } from 'http-status-codes';
import { ErrorCode, HttpException } from './root.js';

export class UnauthoirzedException extends HttpException {
    constructor(message: string, errorCode: ErrorCode, errors?: any) {
        super(message, errorCode, StatusCodes.UNAUTHORIZED, errors);
    }
}
