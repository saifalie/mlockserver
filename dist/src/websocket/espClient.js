import WebSocket from "ws";
import { InternalException } from "../errors/internal-exception.js";
import { ErrorCode } from "../errors/root.js";
export class ESPWebSocketClient {
    constructor(espAddress) {
        this.espAddress = espAddress;
        this.isConnected = false;
        this.connect();
    }
    connect() {
        this.ws = new WebSocket(`ws://${this.espAddress}`);
        this.ws.on('open', () => {
            console.log('Conneceted to ESP8266 Websocket');
            this.isConnected = true;
        });
        this.ws.on('close', () => {
            console.log('Disconnected from ESP8266 Websocket');
            this.isConnected = false;
            // Reconnect after 5 seconds
            setTimeout(() => {
                this.connect();
            }, 5000);
        });
        this.ws.on('error', (err) => {
            console.error('WebSocket error:', err);
            this.isConnected = false;
        });
    }
    async sendCommand(command) {
        if (!this.isConnected) {
            throw new InternalException('Not connected to ESP8226', ErrorCode.INTERNAL_EXCEPTION, { message: "Not connected to ESP8226" });
        }
        return new Promise((resolve, reject) => {
            this.ws.send(command, (err) => {
                if (err)
                    return reject(err);
                resolve(`Command ${command} send successfully`);
            });
        });
    }
}
//# sourceMappingURL=espClient.js.map