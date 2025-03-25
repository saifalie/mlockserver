import { StatusCodes } from 'http-status-codes';
import { ErrorCode, HttpException } from './root.js';

export class NotFoundException extends HttpException {
    constructor(message: string, errorCode: ErrorCode) {
        super(message, errorCode, StatusCodes.NOT_FOUND, null);
    }
}
