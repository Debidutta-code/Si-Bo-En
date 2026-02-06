import { Response } from "express";
import { CustomRequest, errorResponse } from "../../utils";
import { LoyaltyGuestService } from "../services";
import { ICloyalityGuests } from "../types";

export class LoyaltyGuestController {
    private loyaltyGuestService: LoyaltyGuestService;

    constructor() {
        this.loyaltyGuestService = new LoyaltyGuestService();
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

    /**
     * Register a new loyalty guest from booking engine
     * POST /api/v1/loyalty/guest/register
     */
    public async registerGuestFromBookingEngine(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { email, propertyId, metadata } = req.body;

            // Validation
            if (!email || !propertyId) {
                return res.status(400).json(errorResponse("Invalid Field Provided", "Email and propertyId are required"));
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json(errorResponse("Invalid Email", "Invalid email format"));
            }

            const result = await this.loyaltyGuestService.registerGuestFromBookingEngine({
                email,
                propertyId,
                metadata: metadata || {},
            });

            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("already registered")) {
                    return res.status(409).json(errorResponse("Already Registered", error.message));
                }
                return res.status(500).json(errorResponse("Failed to register guest", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "Failed to register for loyalty program"));
        }
    }

    /**
     * Check if guest is a loyalty member and get discount details
     * POST /api/v1/loyalty/guest/check-discount
     */
    public async checkLoyaltyDiscount(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { email, propertyId } = req.body;

            // Validation
            if (!email || !propertyId) {
                return res.status(400).json(errorResponse("Invalid Request", "Email and propertyId are required"));
            }

            const result = await this.loyaltyGuestService.checkLoyaltyDiscount(email, propertyId);
            return res.status(200).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to check discount", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "Failed to check discount"));
        }
    }

    /**
     * Get loyalty guest by email for a specific property
     * GET /api/v1/loyalty/guest/by-email/:propertyId/:email
     */
    public async getLoyaltyGuestByEmail(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { email, propertyId } = req.params;

            if (!email || !propertyId) {
                return res.status(400).json(errorResponse("Invalid Request", "Email and propertyId are required"));
            }

            const result = await this.loyaltyGuestService.getGuestByEmailAndProperty(email, propertyId);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to fetch guest details", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "Failed to fetch guest details"));
        }
    }
}