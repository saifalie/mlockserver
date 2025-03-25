import { Router } from 'express';
import { getAllLockerStations, getLockerStationById, getLockerStationNearMe } from '../controllers/lockers/lockerStation.controller.js';
import { errorHanlder } from '../utils/error-handler.js';
const lockerStationRoutes = Router();
lockerStationRoutes.route('/').get(errorHanlder(getAllLockerStations));
lockerStationRoutes.route('/nearMe').get(errorHanlder(getLockerStationNearMe));
lockerStationRoutes.route('/:lockerStationId').get(errorHanlder(getLockerStationById));
export default lockerStationRoutes;
//# sourceMappingURL=lockerStation.routes.js.map