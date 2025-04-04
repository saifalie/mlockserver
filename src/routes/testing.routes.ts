import { Router } from "express";
import {  getRelayStatus, testOFF, testON } from "../controllers/testing/mqtt.controller.js";
import { errorHandler } from "../utils/error-handler.js";



const testingRoutes: Router = Router();


testingRoutes.route('/relay')
  .get(errorHandler(getRelayStatus))          // GET to check status


testingRoutes.route('/relay/on')
  .post(errorHandler(testON));                // Explicit ON endpoint

testingRoutes.route('/relay/off')
  .post(errorHandler(testOFF));   

testingRoutes.route('/ON').post(errorHandler(testON))
testingRoutes.route('/OFF').post(errorHandler(testOFF))




export default testingRoutes