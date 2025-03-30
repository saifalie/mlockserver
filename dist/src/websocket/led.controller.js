import { BadRequestException } from "../errors/bad-request.js";
import { ErrorCode } from "../errors/root.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { StatusCodes } from "http-status-codes";
export class LedController {
    constructor(espClient) {
        this.espClient = espClient;
        this.espClient.on('connected', () => {
            console.log('ESP Client reconnected');
        });
        this.espClient.on('maxReconnectReached', () => {
            console.log('MAX reconnect attempts reached. Manual intervention required.');
        });
    }
    async controllLED(req, res, next) {
        try {
            const { command } = req.body;
            // Validate command
            if (!command || !['ON', 'OFF'].includes(command.toUpperCase())) {
                throw new BadRequestException('Invalid command. Use ON or OFF', ErrorCode.INTERNAL_EXCEPTION);
            }
            // Check connection status before sending
            if (!this.espClient.getConnectionStatus()) {
                console.log('Attempted to send command with no active connection');
                return res.status(StatusCodes.SERVICE_UNAVAILABLE)
                    .json(new ApiResponse(StatusCodes.SERVICE_UNAVAILABLE, null, 'ESP device not connected'));
            }
            const result = await this.espClient.sendCommand(command.toUpperCase());
            return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, result, 'success'));
        }
        catch (error) {
            console.log('LED control error: ', error);
            next(error);
        }
    }
    async checkConnection(req, res, next) {
        try {
            const isConnected = this.espClient.getConnectionStatus();
            return res.status(StatusCodes.OK)
                .json(new ApiResponse(StatusCodes.OK, { connected: isConnected }, 'Connection status retrieved'));
        }
        catch (error) {
            console.log('Connection status check error:', error);
            next(error);
        }
    }
}
//# sourceMappingURL=led.controller.js.map