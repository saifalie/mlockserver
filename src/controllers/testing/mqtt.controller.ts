import { Request, Response } from "express";
import { sendCommand } from "../../mqtt/mqttClients.js";
import { StatusCodes } from "http-status-codes";


export const testON = async(req:Request,res:Response)=>{

    console.log('hello from test mqttt');
    await sendCommand('ON')

    res.status(StatusCodes.OK).send('ON send')
    
}
export const testOFF = async(req:Request,res:Response)=>{

    console.log('hello from test mqttt');
    await sendCommand('OFF')

    res.status(StatusCodes.OK).send('OFF send')
    
}