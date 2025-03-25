import { UnauthoirzedException } from '../errors/unauthorized.js';
import { ErrorCode } from '../errors/root.js';
import * as jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../../secrets.js';
import { User } from '../models/user.model.js';
import { NotFoundException } from '../errors/not-found.js';
// Middleware to authenticate the user using JWT
const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    // Check if the authorization header exists and starts with 'Bearer'
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        throw new UnauthoirzedException('Unauthorized', ErrorCode.HTTP_UNAUTHORIZED);
    }
    const token = authHeader.split(' ')[1];
    // Check if the ACCESS_TOKEN_SECRET is defined
    if (!ACCESS_TOKEN_SECRET) {
        throw new UnauthoirzedException('ACCESS_TOKEN_SECRET is not defined', ErrorCode.TOKEN_NOT_FOUND);
    }
    try {
        // Verify the token
        const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
        // Check if the payload is valid and not a string
        if (!payload || typeof payload === 'string') {
            throw new UnauthoirzedException('Authentication Invalid', ErrorCode.HTTP_UNAUTHORIZED);
        }
        // Attach user info to the request object
        req.user = { id: payload.id, full_name: payload.full_name };
        // Attach socket info to the request object
        req.socket = req.io;
        // Find the user in the database
        const user = await User.findById(payload.id);
        if (!user) {
            throw new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND);
        }
        // Proceed to the next middleware or route handler
        next();
    }
    catch (error) {
        // Handle token verification errors
        throw new UnauthoirzedException('Authentication Invalid', ErrorCode.HTTP_UNAUTHORIZED);
    }
};
export default auth;
//# sourceMappingURL=authentication.js.map