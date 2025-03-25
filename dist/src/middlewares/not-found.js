import { StatusCodes } from 'http-status-codes';
// Middleware to handle requests to non-existent routes
export const notFoundMiddleware = (req, res) => {
    res.status(StatusCodes.NOT_FOUND).send('Route does not exists');
};
//# sourceMappingURL=not-found.js.map