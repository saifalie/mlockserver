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
    //NOT FOUND
    ErrorCode[ErrorCode["USER_NOT_FOUND"] = 6004] = "USER_NOT_FOUND";
    ErrorCode[ErrorCode["LOCKER_NOT_FOUND"] = 7004] = "LOCKER_NOT_FOUND";
    // TOKEN_NOT_FOUND = 4004,
    ErrorCode[ErrorCode["SECRET_KEY_NOT_FOUND"] = 4004] = "SECRET_KEY_NOT_FOUND";
    ErrorCode[ErrorCode["FILE_NOT_FOUND"] = 4004] = "FILE_NOT_FOUND";
    ErrorCode[ErrorCode["LOCKERSTATION_NOT_FOUND"] = 3004] = "LOCKERSTATION_NOT_FOUND";
    ErrorCode[ErrorCode["BOOKING_NOT_FOUND"] = 9004] = "BOOKING_NOT_FOUND";
    ErrorCode[ErrorCode["RATING_NOT_FOUND"] = 8004] = "RATING_NOT_FOUND";
    // ALREADY EXISISTS
    ErrorCode[ErrorCode["USER_ALREADY_EXSISTS"] = 6002] = "USER_ALREADY_EXSISTS";
    ErrorCode[ErrorCode["LOCKER_ALREADY_EXSITS"] = 5002] = "LOCKER_ALREADY_EXSITS";
    ErrorCode[ErrorCode["LOCKERSTATION_ALREADY_EXSISTS"] = 3002] = "LOCKERSTATION_ALREADY_EXSISTS";
    ErrorCode[ErrorCode["ALREADY_RATED"] = 8002] = "ALREADY_RATED";
    // INTERNAL EXCEPTION
    ErrorCode[ErrorCode["INTERNAL_EXCEPTION"] = 5002] = "INTERNAL_EXCEPTION";
    ErrorCode[ErrorCode["HTTP_UNAUTHORIZED"] = 4001] = "HTTP_UNAUTHORIZED";
    ErrorCode[ErrorCode["FIELDS_NOT_FOUND"] = 4003] = "FIELDS_NOT_FOUND";
    ErrorCode[ErrorCode["FILE_INTERNAL_EXCEPTION"] = 5004] = "FILE_INTERNAL_EXCEPTION";
    ErrorCode[ErrorCode["INVALID_TOKEN"] = 4006] = "INVALID_TOKEN";
    ErrorCode[ErrorCode["AUTH_INTERNAL_EXCEPTION"] = 5001] = "AUTH_INTERNAL_EXCEPTION";
    ErrorCode[ErrorCode["TOKEN_EXPIRED"] = 9000] = "TOKEN_EXPIRED";
    ErrorCode[ErrorCode["RATING_ERROR"] = 5446] = "RATING_ERROR";
})(ErrorCode || (ErrorCode = {}));
//# sourceMappingURL=root.js.map