import { Response } from "express";
import { CustomRequest, errorResponse } from "../../utils";
import { PropertyLoyalityService } from "../services";
import { ICPropertyLoyaltyConfig } from "../types/property-loyality.types";

export class PropertyLoyalityController {
    private propertyLoyalityService: PropertyLoyalityService;

    constructor() {
        this.propertyLoyalityService = new PropertyLoyalityService();
    }

    public async createPropertyLoyalityConfig(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const data: ICPropertyLoyaltyConfig = req.body;

            if (!data.propertyId) {
                return res.status(400).json(errorResponse("Property not chosen", "Property ID is required"));
            }
            if (!data.propertyCode) {
                return res.status(400).json(errorResponse("Invalid Field Provided", "Property Code is required"));
            }
            if (!data.propertyName) {
                return res.status(400).json(errorResponse("Invalid Field Provided", "Property Name is required"));
            }

            const result = await this.propertyLoyalityService.createPropertyLoyalityConfig(data);
            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to create property loyalty config", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "Failed to create property loyalty config"));
        }
    }

    public async getLoyalityForProperty(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { propertyId } = req.params;

            if (!propertyId) {
                return res.status(400).json(errorResponse("Property not chosen", "Property ID is required"));
            }

            const result = await this.propertyLoyalityService.getLoyalityForProperty(propertyId);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to retrieve property loyalty config", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "Failed to retrieve property loyalty config"));
        }
    }

    public async updatePropertyLoyalityConfig(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { propertyId } = req.params;
            const { isActive,discountPercentage,loyalityConfigLogo } = req.body;

            if (!propertyId) {
                return res.status(400).json(errorResponse("Property is not selected", "Property ID is required"));
            }
            if (typeof isActive !== 'boolean') {
                return res.status(400).json(errorResponse("Invalid Field Provided", "isActive field is required and must be a boolean"));
            }

            const result = await this.propertyLoyalityService.updatePropertyLoyalityConfig(propertyId, isActive,discountPercentage,loyalityConfigLogo);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to update property loyalty config", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "Failed to update property loyalty config"));
        }
    }

    public async deletePropertyLoyalityConfig(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { propertyId } = req.params;

            if (!propertyId) {
                return res.status(400).json(errorResponse("Invalid Request", "Property Loyalty Config ID is required"));
            }

            const result = await this.propertyLoyalityService.deletePropertyLoyalityConfig(propertyId);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to delete property loyalty config", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "Failed to delete property loyalty config"));
        }
    }

    public async getAllPropertyLoyalityWithLoyality(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { propertyId } = req.params;

            if (!propertyId) {
                return res.status(400).json(errorResponse("Property not chosen", "Property ID is required"));
            }

            const result = await this.propertyLoyalityService.getAllPropertyLoyalityWithLoyality(propertyId);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to retrieve property loyalty configs", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "Failed to retrieve property loyalty configs"));
        }
    }

    public async getActiveLoyaltyConfigByPropertyId(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { propertyId } = req.params;

            if (!propertyId) {
                return res.status(400).json(errorResponse("Property not chosen", "Property ID is required"));
            }

            const result = await this.propertyLoyalityService.getActiveLoyaltyConfigByPropertyId(propertyId);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to retrieve active loyalty config", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "Failed to retrieve active loyalty config"));
        }
    }

}