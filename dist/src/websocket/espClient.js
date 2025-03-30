import WebSocket from "ws";
import { InternalException } from "../errors/internal-exception.js";
import { ErrorCode } from "../errors/root.js";
import { EventEmitter } from "events";
export class ESPWebSocketClient extends EventEmitter {
    constructor(espAddress, options = {}) {
        super();
        this.ws = null;
        this.espAddress = espAddress;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
        this.reconnectTimeout = options.reconnectTimeout || 5000;
        this.connect();
    }
    connect() {
        try {
            this.ws = new WebSocket(`ws://${this.espAddress}`);
            this.ws.on('open', () => {
                console.log('Conneceted to ESP8266 Websocket');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.emit('connected');
            });
            this.ws.on('close', (code, reason) => {
                console.log(`Disconnected from ESP8266 WebSocket. Code: ${code}, Reason: ${reason}`);
                this.isConnected = false;
                this.handleReconnection();
            });
            this.ws.on('error', (err) => {
                console.error('WebSocket error:', err);
                this.isConnected = false;
                this.handleReconnection();
            });
            this.ws.on('message', (data) => {
                console.log('Received message:', data.toString());
                this.emit('message', data.toString());
            });
        }
        catch (error) {
            console.log('Connection setup error:', error);
            this.handleReconnection();
        }
    }
    handleReconnection() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
                this.connect();
            }, this.reconnectTimeout);
        }
        else {
            console.log('Max reconnection attempts reached. Manual intervention required.');
            this.emit('maxReconnectReached');
        }
    }
    async sendCommand(command) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected || !this.ws) {
                const error = new InternalException('Not connected to ESP8226', ErrorCode.INTERNAL_EXCEPTION, { message: "WebSocket not connected" });
                console.log(error.message);
                return reject(error);
            }
            try {
                this.ws.send(command, (err) => {
                    if (err) {
                        console.log('Failed to send command: ', err);
                        return reject(err);
                    }
                    console.log(`Command ${command} sent successfully`);
                    resolve(`Command ${command} sent successfully`);
                });
            }
            catch (error) {
                console.log(`Unexpected error sending command: ${error}`);
                reject(error);
            }
        });
    }
    getConnectionStatus() {
        return this.isConnected;
    }
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.isConnected = false;
        }
    }
}
//# sourceMappingURL=espClient.js.map