import { Response } from "express";
import { CustomRequest ,errorResponse} from "../../utils";
import {
    ChildAddonsService
} from "../services";
import {
    ICChildAddoon,
    IChildAddon,
    IUpdateChildAddon
} from "../interfaces";


export class ChildAddonsController {
    private childAddonsService: ChildAddonsService;

    constructor() {
        this.childAddonsService = new ChildAddonsService();
    }
    public async createChildAddons(req:CustomRequest,res:Response):Promise<Response>{
        try {
            const data: ICChildAddoon = req.body;
            if(data.discountApplicable){
                if(!data.discountType){
                    return res.status(400).json(errorResponse("Discount type is required when discount is applicable"));
                }
                if(data.discountType==="flat"&&!data.currencyCode){
                    return res.status(400).json(errorResponse("Currency code is required when discount type is flat"));
                }
                if(data.discountType==="percentage"&&(!data.discountAmount||data.discountAmount<=0||data.discountAmount>100)){
                    return res.status(400).json(errorResponse("Discount value is required when discount type is percentage and range between 0 to 100"));
                }
            }
            const serRes=await this.childAddonsService.createChildAddon(data);
            return res.status(serRes.success?200:400).json(serRes);
        } catch (error) {
            if(error instanceof Error){
                return res.status(500).json(errorResponse("Failed to create children catalog", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }

    }
    public async getChildAddons(req:CustomRequest,res:Response):Promise<Response>{
        try {
            const addonId=req.query.addonId as string;
            const serRes=await this.childAddonsService.getChildAddons(addonId);
            return res.status(serRes.success?200:400).json(serRes);
        } catch (error) {
            if(error instanceof Error){
                return res.status(500).json(errorResponse("Failed to retrieve children catalog", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
    public async updateChildAddons(req:CustomRequest,res:Response):Promise<Response>{
        try {
            const childAddonId=req.params.childAddonId as string;
            const data:IUpdateChildAddon=req.body;
            if(data.discountApplicable){
                if(!data.discountType){
                    return res.status(400).json(errorResponse("Discount type is required when discount is applicable"));
                }
                if(data.discountType==="flat"&&!data.currencyCode){
                    return res.status(400).json(errorResponse("Currency code is required when discount type is flat"));
                }
                if(data.discountType==="percentage"&&(!data.discountAmount||data.discountAmount<=0||data.discountAmount>100)){
                    return res.status(400).json(errorResponse("Discount value is required when discount type is percentage and range between 0 to 100"));
                }
            }
            const serRes=await this.childAddonsService.updateChildAddon(childAddonId,data);
            return res.status(serRes.success?200:400).json(serRes);
        } catch (error) {
            if(error instanceof Error){
                return res.status(500).json(errorResponse("Failed to update children catalog", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
    public async deleteChildAddon(req:CustomRequest,res:Response):Promise<Response>{
        try {
            const childAddonId=req.params.childAddonId as string;
            const serRes=await this.childAddonsService.deleteChildAddon(childAddonId);
            return res.status(serRes.success?200:400).json(serRes);
        } catch (error) {
            if(error instanceof Error){
                return res.status(500).json(errorResponse("Failed to delete children catalog", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    
    }
}