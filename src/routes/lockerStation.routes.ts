import { Router } from 'express';
import { createRating, getAllLockerStations, getLockerStationById, getLockerStationNearMe } from '../controllers/lockers/lockerStation.controller.js';
import { errorHandler } from '../utils/error-handler.js';
import auth from '../middlewares/authentication.js';

const lockerStationRoutes: Router = Router();

lockerStationRoutes.route('/').get(errorHandler(auth),errorHandler(getAllLockerStations));

lockerStationRoutes.route('/nearMe').get(errorHandler(auth),errorHandler(getLockerStationNearMe));
lockerStationRoutes.route('/:lockerStationId').get(errorHandler(getLockerStationById));

lockerStationRoutes.route('/create-rating-review').post(errorHandler(auth),errorHandler(createRating))
export default lockerStationRoutes;
