import { Router } from 'express';
import { getUser, refresthToken, signInWithGoogle, updateFcmToken } from '../controllers/auth/auth.controller.js';
import { errorHandler } from '../utils/error-handler.js';
import auth from '../middlewares/authentication.js';
const authRoutes = Router();
authRoutes.route('/login').post(errorHandler(signInWithGoogle));
authRoutes.route('/refresh-token').post(errorHandler(refresthToken));
authRoutes.route('/me').get(errorHandler(auth), errorHandler(getUser));
authRoutes.route('/fcmToken').put(errorHandler(auth), errorHandler(updateFcmToken));
export default authRoutes;
//# sourceMappingURL=auth.routes.js.map