import { StatusCodes } from 'http-status-codes';
import { HttpException } from './root.js';
export class UnprocesableEntity extends HttpException {
    constructor(message, errorCode, errors) {
        super(message, errorCode, StatusCodes.UNPROCESSABLE_ENTITY, errors);
    }
}
//# sourceMappingURL=validation.js.map