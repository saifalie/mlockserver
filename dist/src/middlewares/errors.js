// Middleware to handle errors and send structured JSON responses
export const errorMiddleware = (error, req, res, next) => {
    // Set the response status code from the error object
    const statusCode = error.statusCode || 500;
    res.status(error.statusCode).json({
        message: error.message, // Provide the error message
        ErrorCode: error.errorCode, // Include an error code for reference
        errors: error.errors // Include any additional error details
    });
};
//# sourceMappingURL=errors.js.map