import { StatusCodes } from 'http-status-codes';
import { ErrorCode, HttpException } from './root.js';

export class BadRequestException extends HttpException {
    constructor(message: string, errorCode: ErrorCode) {
        super(message, errorCode, StatusCodes.BAD_REQUEST, null);
    }
}
