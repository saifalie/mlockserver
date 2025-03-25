import { RequestHandler, Router } from "express";
import { ESPWebSocketClient } from "./espClient.js";
import { LedController } from "./led.controller.js";



export const ledRouter = (espClient:ESPWebSocketClient)=>{
    const router = Router()
    const ledController = new LedController(espClient)

    router.post('/led',ledController.controllLED.bind(ledController) as RequestHandler);

    return router
}