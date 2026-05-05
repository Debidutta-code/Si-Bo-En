import {PropertyConfigRepo} from "../repository";
import { IApiResponse } from "../../utils/return.types";
import { successResponse,errorResponse } from "../../utils/return";
import {IUPropertyConfig} from "../types";
export class PropertyConfigService{
    private prppertyConfigRepo:PropertyConfigRepo;
    constructor(){
        this.prppertyConfigRepo=new PropertyConfigRepo();
    }
    public async updatePropertyConfigService(propertyId:string,data:IUPropertyConfig):Promise<IApiResponse>{
        try {
            const daoRes=await this.prppertyConfigRepo.updatePropertyConfig(propertyId,data)
            if(daoRes instanceof Error){
                return errorResponse("Failed to update Property Config",daoRes.message)
            }
            return successResponse("property Config Updated successfully")
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("Failed to update Property Config",error.message)
            }
            return errorResponse("Failed to update Property Config")
        }
    }
    public async getPropertyConfig(propertyId:string):Promise<IApiResponse>{
        try {
            const daoRes=await this.prppertyConfigRepo.getConfigByProperty(propertyId)
            if(daoRes instanceof Error){
                return errorResponse("Failed to fetch Property Config",daoRes.message)
            }
            return successResponse("property Config fetched successfully",daoRes)
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("Failed to fetch Property Config",error.message)
            }
            return errorResponse("Failed to fetch Property Config")
        }
    }

}