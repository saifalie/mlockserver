import { StatusCodes } from 'http-status-codes';
import { HttpException } from './root.js';
export class BadRequestException extends HttpException {
    constructor(message, errorCode) {
        super(message, errorCode, StatusCodes.BAD_REQUEST, null);
    }
}
//# sourceMappingURL=bad-request.js.map