import { Response } from "express";
import { CustomRequest, errorResponse } from "../../utils";
import { LoyalityLevelService } from "../services";
export { LoyalityLevelService } from "../services";
import { ICLoyalityLevels } from "../types";

export class LoyalityLevelController {
    private loyalityLevelService: LoyalityLevelService;

    constructor() {
        this.loyalityLevelService = new LoyalityLevelService();
    }

    public async createLoyalityLevel(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const data: ICLoyalityLevels = req.body;
            if (data.discountPercentage < 0 || data.discountPercentage > 100) {
                return res.status(400).json(errorResponse("Invalid discount percentage", "Discount percentage must be between 0 and 100"));
            }
            const response = await this.loyalityLevelService.createLoyalityLevel(data);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Error occurred while creating loyalty level", error.message));
            }
            return res.status(500).json(errorResponse("Error occurred while creating loyalty level", "Unidentified error"));
        }
    }

    public async getLoyalityLevels(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const propertyConfigId = req.params.propertyConfigId;
            const response = await this.loyalityLevelService.getLoyalityLevelsByPropertyConfigId(propertyConfigId);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Error occurred while fetching loyalty levels", error.message));
            }
            return res.status(500).json(errorResponse("Error occurred while fetching loyalty levels", "Unidentified error"));
        }
    }

    public async updateLoyalityLevel(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const levelId = req.params.propertyConfigId;
            const data: ICLoyalityLevels = req.body;
            if (data.discountPercentage < 0 || data.discountPercentage > 100) {
                return res.status(400).json(errorResponse("Invalid discount percentage", "Discount percentage must be between 0 and 100"));
            }
            const response = await this.loyalityLevelService.updateLoyalityLevel(levelId, data);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Error occurred while updating loyalty level", error.message));
            }
            return res.status(500).json(errorResponse("Error occurred while updating loyalty level", "Unidentified error"));
        }
    }

    public async deleteLoyalityLevel(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const levelId = req.params.propertyConfigId;
            const response = await this.loyalityLevelService.deleteLoyalityLevel(levelId);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Error occurred while deleting loyalty level", error.message));
            }
            return res.status(500).json(errorResponse("Error occurred while deleting loyalty level", "Unidentified error"));
        }
    }
}