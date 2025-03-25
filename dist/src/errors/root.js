export class HttpException extends Error {
    constructor(message, errorCode, statusCode, errors = null) {
        super(message);
        this.message = message;
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.errors = errors;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
export var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["USER_NOT_FOUND"] = 6001] = "USER_NOT_FOUND";
    ErrorCode[ErrorCode["USER_ALREADY_EXSISTS"] = 6002] = "USER_ALREADY_EXSISTS";
    ErrorCode[ErrorCode["LOCKER_NOT_FOUND"] = 5001] = "LOCKER_NOT_FOUND";
    ErrorCode[ErrorCode["HTTP_UNAUTHORIZED"] = 4001] = "HTTP_UNAUTHORIZED";
    ErrorCode[ErrorCode["FIELDS_NOT_FOUND"] = 4003] = "FIELDS_NOT_FOUND";
    ErrorCode[ErrorCode["TOKEN_NOT_FOUND"] = 4003] = "TOKEN_NOT_FOUND";
    ErrorCode[ErrorCode["FILE_NOT_FOUND"] = 4006] = "FILE_NOT_FOUND";
    ErrorCode[ErrorCode["FILE_INTERNAL_EXCEPTION"] = 5004] = "FILE_INTERNAL_EXCEPTION";
    ErrorCode[ErrorCode["SECRET_KEY_NOT_FOUND"] = 4005] = "SECRET_KEY_NOT_FOUND";
    ErrorCode[ErrorCode["INVALID_TOKEN"] = 4006] = "INVALID_TOKEN";
    ErrorCode[ErrorCode["AUTH_INTERNAL_EXCEPTION"] = 5001] = "AUTH_INTERNAL_EXCEPTION";
})(ErrorCode || (ErrorCode = {}));
//# sourceMappingURL=root.js.map