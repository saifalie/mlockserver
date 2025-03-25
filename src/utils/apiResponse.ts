import { StatusCodes } from 'http-status-codes';

export class ApiResponse {
    message: string;
    data: any;
    statusCode: StatusCodes;

    constructor(statusCode: StatusCodes, data: any, message: string = 'success') {
        (this.statusCode = statusCode), (this.data = data), (this.message = message);
    }
}
