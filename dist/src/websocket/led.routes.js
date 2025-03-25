import { Router } from "express";
import { LedController } from "./led.controller.js";
export const ledRouter = (espClient) => {
    const router = Router();
    const ledController = new LedController(espClient);
    router.post('/led', ledController.controllLED.bind(ledController));
    return router;
};
//# sourceMappingURL=led.routes.js.map