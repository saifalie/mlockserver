import { Router } from 'express';
import { checkStationSaved, createRating, getAllLockerStations, getLockerStationById, getLockerStationNearMe, getSavedStations, toggleSaveStation } from '../controllers/lockers/lockerStation.controller.js';
import { errorHandler } from '../utils/error-handler.js';
import auth from '../middlewares/authentication.js';
const lockerStationRoutes = Router();
lockerStationRoutes.route('/').get(errorHandler(auth), errorHandler(getAllLockerStations));
lockerStationRoutes.route('/nearMe').get(errorHandler(auth), errorHandler(getLockerStationNearMe));
lockerStationRoutes.route('/saved').get(errorHandler(auth), errorHandler(getSavedStations));
lockerStationRoutes.route('/create-rating-review').post(errorHandler(auth), errorHandler(createRating));
lockerStationRoutes.route('/:lockerStationId').get(errorHandler(auth), errorHandler(getLockerStationById));
lockerStationRoutes.route('/:lockerStationId/save').put(errorHandler(auth), errorHandler(toggleSaveStation));
lockerStationRoutes.route('/:lockerStationId/saved-status').get(errorHandler(auth), errorHandler(checkStationSaved));
export default lockerStationRoutes;
//# sourceMappingURL=lockerStation.routes.js.map