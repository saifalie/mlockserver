import { StatusCodes } from 'http-status-codes';

export class HttpException extends Error {
    message: string;
    errorCode: ErrorCode;
    statusCode: StatusCodes;
    errors: any;

    constructor(message: string, errorCode: ErrorCode, statusCode: StatusCodes, errors: any = null) {
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

export enum ErrorCode {

    //NOT FOUND
    USER_NOT_FOUND = 6004,
    LOCKER_NOT_FOUND = 7004,
    // TOKEN_NOT_FOUND = 4004,
    SECRET_KEY_NOT_FOUND = 4004,
    FILE_NOT_FOUND = 4004,
    LOCKERSTATION_NOT_FOUND =3004,
    BOOKING_NOT_FOUND = 9004,
    RATING_NOT_FOUND = 8004,

    // ALREADY EXISISTS
    USER_ALREADY_EXSISTS = 6002,
    LOCKER_ALREADY_EXSITS = 5002,
    LOCKERSTATION_ALREADY_EXSISTS=3002,
    ALREADY_RATED = 8002,

    // INTERNAL EXCEPTION
    INTERNAL_EXCEPTION = 5002,
    HTTP_UNAUTHORIZED = 4001,
    FIELDS_NOT_FOUND = 4003,
    FILE_INTERNAL_EXCEPTION = 5004,
    INVALID_TOKEN = 4006,
    AUTH_INTERNAL_EXCEPTION = 5001,
    TOKEN_EXPIRED = 9000,
    RATING_ERROR = 5446

}
