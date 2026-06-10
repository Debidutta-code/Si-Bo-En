import { Response } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { CustomRequest ,errorResponse} from "../../utils";
import {PropertyTransferService} from "../services"
export class PropertyTransferController {
    private propertyTransferService: PropertyTransferService;

    constructor() {
        this.propertyTransferService = new PropertyTransferService();
    }

    public async initTransferProcessController(req: CustomRequest,res:Response): Promise<Response> {
        try {
            const {propertyCode,newCreationId} = req.body;
            if(!propertyCode || !newCreationId) {
                return res.status(400).json(errorResponse("Property code is required to initiate transfer process"));
            }
            const result = await this.propertyTransferService.initTransferProcess(propertyCode,newCreationId);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to initialize recovery process", error.message));
            }
            return res.status(500).json(errorResponse("Failed to initialize recovery process","unknown error"));
        }
    }
    public async completeTransferProcessController(req: CustomRequest,res:Response): Promise<Response> {
        try {
            const {propertyCode, newCreationId, otp} = req.body;
            if(!propertyCode || !newCreationId || !otp) {
                return res.status(400).json(errorResponse("Property code, new creation ID, and OTP are required to complete recovery process"));
            }
            const result = await this.propertyTransferService.completeTransferProcess({propertyCode, newCreationId, otp}, req.user?.email!);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to complete recovery process", error.message));
            }
            return res.status(500).json(errorResponse("Failed to complete recovery process", "unknown error"));
        }
    }
}
