import { Request, Response } from "express";
import { getMQTTClient } from "../../mqtt/mqttClients.js";
import { StatusCodes } from "http-status-codes";

// Initialize MQTT client
const relayClient = getMQTTClient();

export const testON = async (req: Request, res: Response) => {
    try {
        console.log('Attempting to turn relay OPEN');
        // await relayClient.sendCommand("OPEN");
        
        res.status(StatusCodes.OK).json({
            success: true,
            message: "Relay OPEN command sent successfully"
        });
        
    } catch (error) {
        console.error('Relay OPEN error:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to send Relay OPEN command",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

export const testOFF = async (req: Request, res: Response) => {
    try {
        console.log('Attempting to turn relay CLOSE');
        // await relayClient.sendCommand("CLOSE")
        
        res.status(StatusCodes.OK).json({
            success: true,
            message: "Relay CLOSE command sent successfully"
        });
        
    } catch (error) {
        console.error('Relay CLOSE error:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to send Relay CLOSE command",
         error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

// Optional: Add status check endpoint
export const getRelayStatus = async (req: Request, res: Response) => {
    try {
        const status = relayClient.getConnectionStatus();
        
        res.status(StatusCodes.OK).json({
            connected: status,
            message: status 
                ? "Connected to MQTT broker" 
                : "Disconnected from MQTT broker"
        });
        
    } catch (error) {
        console.error('Status check error:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to check connection status"
        });
    }
}