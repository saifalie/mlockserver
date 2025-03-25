import { NextFunction, Request, Response } from "express";
import { ESPWebSocketClient } from "./espClient.js";
import { BadRequestException } from "../errors/bad-request.js";
import { ErrorCode } from "../errors/root.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { StatusCodes } from "http-status-codes";


export class LedController{

    constructor(private espClient: ESPWebSocketClient){}

    async controllLED(req:Request,res:Response, next:NextFunction){
        try {

            const {command} = req.body;

            if(!command || !['ON','OFF'].includes(command.toUpperCase())){
                throw new BadRequestException('Invalid command. Use ON or OFF',ErrorCode.INTERNAL_EXCEPTION)
            }

            const result = await this.espClient.sendCommand(command.toUpperCase());
            return  res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK,result,'success'))
            
        } catch (error) {
            next(error)
        }
    }
}