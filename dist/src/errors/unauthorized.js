import { StatusCodes } from 'http-status-codes';
import { HttpException } from './root.js';
export class UnauthoirzedException extends HttpException {
    constructor(message, errorCode, errors) {
        super(message, errorCode, StatusCodes.UNAUTHORIZED, errors);
    }
}
//# sourceMappingURL=unauthorized.js.map