import { Router } from 'express';
import { signInWithGoogle } from '../controllers/auth/auth.controller.js';
import { errorHanlder } from '../utils/error-handler.js';
const authRoutes = Router();
authRoutes.route('/login').post(errorHanlder(signInWithGoogle));
export default authRoutes;
//# sourceMappingURL=auth.routes.js.map