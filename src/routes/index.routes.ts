import { Router } from 'express';
import lockerStationRoutes from './lockerStation.routes.js';
import fileRoutes from './file.routes.js';
import authRoutes from './auth.routes.js';
import bookingRoutes from './booking.routes.js';

const rootRouter: Router = Router();

rootRouter.use('/lockerStation', lockerStationRoutes);
rootRouter.use('/file', fileRoutes);
rootRouter.use('/auth', authRoutes);
rootRouter.use('/booking',bookingRoutes)

export default rootRouter;
