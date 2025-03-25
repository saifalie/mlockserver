import { Server } from 'socket.io';
import { File } from 'multer';
// Extend the Express Request interface to include the 'io' property of type Server
declare module 'express-serve-static-core' {
    interface Request {
        io: Server; // This allows access to the Socket.IO server instance in request handlers
    }
}
// Extend the global Express namespace to include the 'user' property in Request
declare global {
    namespace Express {
        interface Request {
            user: User; // This allows access to the authenticated user object in request handlers
            file?: File;
        }
    }
}
