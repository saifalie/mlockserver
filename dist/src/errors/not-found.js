import { StatusCodes } from 'http-status-codes';
import { HttpException } from './root.js';
export class NotFoundException extends HttpException {
    constructor(message, errorCode) {
        super(message, errorCode, StatusCodes.NOT_FOUND, null);
    }
}
//# sourceMappingURL=not-found.js.map