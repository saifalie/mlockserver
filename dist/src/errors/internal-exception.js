import { StatusCodes } from 'http-status-codes';
import { HttpException } from './root.js';
export class InternalException extends HttpException {
    constructor(message, errorCode, error) {
        super(message, errorCode, StatusCodes.INTERNAL_SERVER_ERROR, error);
    }
}
//# sourceMappingURL=internal-exception.js.map