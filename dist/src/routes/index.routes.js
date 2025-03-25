import { Router } from 'express';
import lockerStationRoutes from './lockerStation.routes.js';
import fileRoutes from './file.routes.js';
import authRoutes from './auth.routes.js';
const rootRouter = Router();
rootRouter.use('/lockerStation', lockerStationRoutes);
rootRouter.use('/file', fileRoutes);
rootRouter.use('/auth', authRoutes);
export default rootRouter;
//# sourceMappingURL=index.routes.js.map