import { errorResponse } from "../../utils/return";
import { CustomRequest } from "../../utils/customRequest";
import { Response } from "express";
import { PropertyConfigService } from "../services";
export class PropertyConfigController {
    private propertyConfigService: PropertyConfigService;
    constructor() {
        this.propertyConfigService = new PropertyConfigService();
    }
    public async updatePropertyConfig(req:CustomRequest,res:Response):Promise<Response>{
        try {
            const propertyId=req.params.propertyId;
            if(!propertyId){
                return res.status(400).json(errorResponse("Property Is not selected"))
            }
            const data=req.body.updatedConfig;
            if(!data){
                return res.status(400).json(errorResponse("Updated Data Payload is not there"))
            }
            const serRes=await this.propertyConfigService.updatePropertyConfigService(propertyId,data)
            return res.status(serRes.success?200:400).json(serRes)
        } catch (error) {
            if(error instanceof Error){
                return res.status(500).json(errorResponse("Failed to Update property Config",error.message))
            }
            return res.status(500).json(errorResponse("Internal Server Error"))
        }
    }
    public async getPropertyConfig(req:CustomRequest,res:Response):Promise<Response>{
        try {
            const propertyId=req.params.propertyId;
            if(!propertyId){
                return res.status(400).json(errorResponse("Property Is not selected"))
            }
            const serRes=await this.propertyConfigService.getPropertyConfig(propertyId)
            return res.status(serRes.success?200:400).json(serRes)
        } catch (error) {
            if(error instanceof Error){
                return res.status(500).json(errorResponse("Failed to Update property Config",error.message))
            }
            return res.status(500).json(errorResponse("Internal Server Error"))
        }
    }
}