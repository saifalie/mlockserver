import { sendCommand } from "../../mqtt/mqttClients.js";
import { StatusCodes } from "http-status-codes";
export const testON = async (req, res) => {
    console.log('hello from test mqttt');
    await sendCommand('ON');
    res.status(StatusCodes.OK).send('ON send');
};
export const testOFF = async (req, res) => {
    console.log('hello from test mqttt');
    await sendCommand('OFF');
    res.status(StatusCodes.OK).send('OFF send');
};
//# sourceMappingURL=mqtt.controller.js.map