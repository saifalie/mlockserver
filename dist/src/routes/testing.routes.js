import { Router } from "express";
import { testOFF, testON } from "../controllers/testing/mqtt.controller.js";
import { errorHandler } from "../utils/error-handler.js";
const testingRoutes = Router();
testingRoutes.route('/ON').post(errorHandler(testON));
testingRoutes.route('/OFF').post(errorHandler(testOFF));
export default testingRoutes;
//# sourceMappingURL=testing.routes.js.map