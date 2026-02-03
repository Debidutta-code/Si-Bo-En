import { Response } from "express";
import { CustomRequest, errorResponse } from "../../utils";
import { LoyaltyGuestService } from "../services";
import { ICloyalityGuests } from "../types";

export class LoyaltyGuestController {
    private loyaltyGuestService: LoyaltyGuestService;

    constructor() {
        this.loyaltyGuestService = new LoyaltyGuestService();
    }

    public async createLoyaltyGuest(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const data: ICloyalityGuests = req.body;

            if (!data.creationLoyaltyConfigId) {
                return res.status(400).json(errorResponse("Invalid Field Provided", "Creation Loyalty Config ID is required"));
            }
            if (!data.propertyId) {
                return res.status(400).json(errorResponse("Invalid Field Provided", "Property ID is required"));
            }
            if (!data.propertyCode || data.propertyCode.trim() === "") {
                return res.status(400).json(errorResponse("Invalid Field Provided", "Property Code is required"));
            }
            if (!data.guestId) {
                return res.status(400).json(errorResponse("Invalid Field Provided", "Guest ID is required"));
            }

            const result = await this.loyaltyGuestService.createLoyaltyGuest(data);
            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to create loyalty guest", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "Failed to create loyalty guest"));
        }
    }

    public async deleteLoyaltyGuest(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json(errorResponse("Invalid Request", "Loyalty Guest ID is required"));
            }

            const result = await this.loyaltyGuestService.deleteLoyaltyGuest(id);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to delete loyalty guest", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "Failed to delete loyalty guest"));
        }
    }

    public async getLoyaltyGuestsForProperty(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { propertyId } = req.params;
            const skip = parseInt(req.query.skip as string) || 0;
            const take = parseInt(req.query.take as string) || 10;

            if (!propertyId) {
                return res.status(400).json(errorResponse("Invalid Request", "Property ID is required"));
            }

            const result = await this.loyaltyGuestService.createGetLoyalityGuestsForProperty(propertyId, skip, take);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to retrieve loyalty guests for property", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "Failed to retrieve loyalty guests for property"));
        }
    }

    public async getLoyaltyGuestsForCreation(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { creationLoyaltyId } = req.params;
            const skip = parseInt(req.query.skip as string) || 0;
            const take = parseInt(req.query.take as string) || 10;

            if (!creationLoyaltyId) {
                return res.status(400).json(errorResponse("Invalid Request", "Creation Loyalty ID is required"));
            }

            const result = await this.loyaltyGuestService.getLoyalityGuestForcreationLoyality(creationLoyaltyId, skip, take);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to retrieve loyalty guests for creation loyalty", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "Failed to retrieve loyalty guests for creation loyalty"));
        }
    }
}