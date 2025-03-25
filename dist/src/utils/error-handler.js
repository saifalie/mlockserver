import { ErrorCode, HttpException } from '../errors/root.js';
import { InternalException } from '../errors/internal-exception.js';
export const errorHanlder = (method) => {
    return async (req, res, next) => {
        try {
            await method(req, res, next);
        }
        catch (error) {
            let exception;
            if (error instanceof HttpException) {
                exception = error;
            }
            else {
                exception = new InternalException('Something went wrong', ErrorCode.FILE_INTERNAL_EXCEPTION, error);
            }
            next(exception);
        }
    };
};
//# sourceMappingURL=error-handler.js.map