import { UnauthoirzedException } from '../errors/unauthorized.js';
import { ErrorCode } from '../errors/root.js';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../../secrets.js';
import { User } from '../models/user.model.js';
import { NotFoundException } from '../errors/not-found.js';
// Middleware to authenticate the user using JWT
const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthoirzedException('Unauthorized', ErrorCode.HTTP_UNAUTHORIZED);
    }
    const token = authHeader.split(' ')[1];
    if (!ACCESS_TOKEN_SECRET) {
        throw new UnauthoirzedException('Token secret missing', ErrorCode.INVALID_TOKEN);
    }
    try {
        const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
        if (typeof payload === 'string' || !payload.id) {
            throw new UnauthoirzedException('Invalid token payload', ErrorCode.HTTP_UNAUTHORIZED);
        }
        req.user = { id: payload.id, fullName: payload.fullName };
        req.socket = req.io; // Ensure this is needed
        const user = await User.findById(payload.id);
        if (!user)
            throw new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND);
        next();
    }
    catch (error) {
        console.error('Authentication Error:', error);
        if (error instanceof jwt.TokenExpiredError) {
            throw new UnauthoirzedException('Token expired. Please login again.', ErrorCode.TOKEN_EXPIRED // Add this to your ErrorCode enum
            );
        }
        else if (error instanceof jwt.JsonWebTokenError) {
            throw new UnauthoirzedException('Invalid token', ErrorCode.INVALID_TOKEN);
        }
        else if (error instanceof NotFoundException || error instanceof UnauthoirzedException) {
            throw error; // Rethrow custom errors
        }
        throw new UnauthoirzedException('Authentication failed', ErrorCode.HTTP_UNAUTHORIZED);
    }
};
// const auth = async (req: CustomRequest, res: Response, next: NextFunction) => {
//     const authHeader = req.headers.authorization;
//     // Check if the authorization header exists and starts with 'Bearer'
//     if (!authHeader || !authHeader.startsWith('Bearer')) {
//         throw new UnauthoirzedException('Unauthorized', ErrorCode.HTTP_UNAUTHORIZED);
//     }
//     const token = authHeader.split(' ')[1];
//     console.log('token is here ',token);
//     // Check if the ACCESS_TOKEN_SECRET is defined
//     if (!ACCESS_TOKEN_SECRET) {
//         throw new UnauthoirzedException('ACCESS_TOKEN_SECRET is not defined',ErrorCode.TOKEN_NOT_FOUND);
//     }
//     try {
//         try {
//             console.log('token is here', token);
//             const payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as jwt.JwtPayload;
//             console.log('payload ---', payload);
//             // Continue with your logic...
//                // Check if the payload is valid and not a string
//         if (!payload || typeof payload === 'string') {
//             console.log('payload in the error---',payload);
//             throw new UnauthoirzedException('Authentication Invalid', ErrorCode.HTTP_UNAUTHORIZED);
//         }
//         // Attach user info to the request object
//         req.user = { id: payload.id, full_name: payload.full_name };
//         // Attach socket info to the request object
//         req.socket = req.io;
//         // Find the user in the databasen
//         const user = await User.findById(payload.id);
//         if (!user) {
//             throw new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND);
//         }
//         console.log('user in the auth middle',user);
//         // Proceed to the next middleware or route handler
//         next();
//           } catch (error) {
//             console.error('Error during token verification:', error);
//             throw new UnauthoirzedException('Authentication Invalid', ErrorCode.HTTP_UNAUTHORIZED);
//           }
//     } catch (error) {
//         // Handle token verification errors
//         throw new UnauthoirzedException('Authentication Invalid', ErrorCode.HTTP_UNAUTHORIZED);
//     }
// };
export default auth;
//# sourceMappingURL=authentication.js.map