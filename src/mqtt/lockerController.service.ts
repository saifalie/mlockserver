import { InternalException } from "../errors/internal-exception.js";
import { ErrorCode } from "../errors/root.js";
import { getMQTTClient } from "./mqttClients.js";



const relayClient = getMQTTClient();



export class LockerControllerService{


    static determineRelayTopic(lockerNumber:string):string{
        const lockerNum = typeof lockerNumber === 'string' ? parseInt(lockerNumber) : lockerNumber;

        return lockerNum % 2 === 0? "esp8266/relay1" : "esp8266/relay2"
    }


    static async openLocker(lockerNumber: string): Promise<void>{
        try {

            const relayTopic = this.determineRelayTopic(lockerNumber)
            console.log(`Opening locker: ${lockerNumber} using ${relayTopic}`);
            await relayClient.sendCommand(`OPEN`,relayTopic);
        } catch (error) {
            console.error(`Failed to open locker ${lockerNumber}:`, error);
            throw new InternalException(
                `Failed to open locker ${lockerNumber}`, 
                ErrorCode.INTERNAL_EXCEPTION, 
                error
            );
        }
    }

    static async closeLocker(lockerNumber:string):Promise<void>{
        try {
            const relayTopic = this.determineRelayTopic(lockerNumber)
            console.log(`Opening locker: ${lockerNumber} using ${relayTopic}`);

            await relayClient.sendCommand(`CLOSE`,relayTopic)
            
            
        } catch (error) {
            console.error(`Failed to close locker ${lockerNumber}:`, error);
            throw new InternalException(
                `Failed to close locker ${lockerNumber}`, 
                ErrorCode.INTERNAL_EXCEPTION, 
                error
            );
        }
    }

    static getConnectionStatus(): boolean{
        return relayClient.getConnectionStatus();
    }
}