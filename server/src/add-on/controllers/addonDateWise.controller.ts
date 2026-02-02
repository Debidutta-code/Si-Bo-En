import { Request, Response } from "express";
import { AddonDateWiseService } from "../services";
import { successResponse, errorResponse } from "../../utils/return";
import { ICreateAddonAvailability } from "../interfaces";
import { PropertyCustomRequest } from "../../utils";
export class AddonDateWiseController {
    private addonDateWiseService: AddonDateWiseService;

    constructor() {
        this.addonDateWiseService = new AddonDateWiseService();
    }

    /**
     * Create addon date-wise availability (bulk)
     */
    createAddonDateWise = async (req: Request, res: Response) => {
        try {
            const { addonId, currencyCode, to, isAvailable, price, from } = req.body;
            const addOnArr: ICreateAddonAvailability[] = [];

            // Convert startDate and endDate to Date objects
            const start = new Date(from);
            const end = new Date(to);

            // Generate day-wise entries
            const currentDate = new Date(start);
            while (currentDate <= end) {
                addOnArr.push({
                    addonId: addonId,
                    date: new Date(currentDate),
                    price,
                    currencyCode,
                    isAvailable,
                });

                // Move to next day
                currentDate.setDate(currentDate.getDate() + 1);
            }

            // Create all addon date-wise entries
            const result = await this.addonDateWiseService.createAddonDateWise(addOnArr);

            return res.status(result.success ? 201 : 400).json(result);
        } catch (error: any) {

            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to create addon date-wise availability", error.message));
            }

            return res.status(500).json(errorResponse("Failed to create addon date-wise availability", "Unable to create addon date-wise availability at this moment"));
        }
    };

    /**
     * Get addon date-wise availability by addon ID
     */
    getAddOnDateWiseById = async (req: Request, res: Response) => {
        try {
            const { addonId } = req.params;

            const result = await this.addonDateWiseService.getAddOnDateWiseById(addonId);

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error: any) {

            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to get addon date-wise availability", error.message));
            }

            return res.status(500).json(errorResponse("Failed to get addon date-wise availability", "Unable to get addon date-wise availability at this moment"));
        }
    };
    updateAddonByAddonId = async (req: Request, res: Response) => {
        try {
            const { addonId } = req.params;
            const { price, currencyCode, isAvailable } = req.body;

            const result = await this.addonDateWiseService.updateAddonByAddonId(addonId, {
                price,
                currencyCode,
                isAvailable
            });

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error: any) {

            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to update addon availability", error.message));
            }

            return res.status(500).json(errorResponse("Failed to update addon availability", "Unable to update addon availability at this moment"));
        }
    };
    updateAddonForSingleDate = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { price, currencyCode, isAvailable } = req.body;

            const result = await this.addonDateWiseService.updateAddonForSingleDate(id, {
                price,
                currencyCode,
                isAvailable
            });

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error: any) {
            console.error("Failed to update addon for single date at Controller Layer:", error);

            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to update addon availability", error.message));
            }

            return res.status(500).json(errorResponse("Failed to update addon availability", "Unable to update addon availability at this moment"));
        }
    };

    /**
     * Delete addon by addon ID (bulk delete all dates)
     */
    deleteAddonByAddonId = async (req: Request, res: Response) => {
        try {
            const { addonId } = req.params;

            const result = await this.addonDateWiseService.deleteAddonByAddonId(addonId);

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error: any) {

            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to delete addon availability", error.message));
            }

            return res.status(500).json(errorResponse("Failed to delete addon availability", "Unable to delete addon availability at this moment"));
        }
    };

    deleteAddonForParticularDate = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const result = await this.addonDateWiseService.deleteAddonForParticularDate(id);

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error: any) {

            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to delete addon availability", error.message));
            }

            return res.status(500).json(errorResponse("Failed to delete addon availability", "Unable to delete addon availability at this moment"));
        }
    };

    getAddOnsByDate = async (req: PropertyCustomRequest, res: Response) => {
        try {
            const propertyId = String(req.query.propertyId || '');
            const date = String(req.query.date || '');

            if (!propertyId || !date) {
                return res.status(400).json(errorResponse("Property ID and date are required"));
            }

            const result = await this.addonDateWiseService.getAddonsByDate(propertyId, date);

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error: any) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to get addons for date", error.message));
            }
            return res.status(500).json(errorResponse("Failed to get addons for date", "Unable to fetch addons for date at this moment"));
        }
    };

    /**
     * Get available addons for a property within a date range
     */
    getAvailableAddonsByDateRange = async (req: PropertyCustomRequest, res: Response) => {
        try {
            // Property ID is resolved from propertyCode by the middleware
            const propertyId = req.property?.id;
            const startDate = String(req.query.startDate || '');
            const endDate = String(req.query.endDate || '');

            if (!propertyId) {
                return res.status(400).json(errorResponse("Property not found"));
            }

            if (!startDate || !endDate) {
                return res.status(400).json(errorResponse("Start date and end date are required"));
            }

            const result = await this.addonDateWiseService.getAvailableAddonsByDateRange(
                propertyId,
                startDate,
                endDate
            );

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error: any) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to get available addons", error.message));
            }
            return res.status(500).json(errorResponse("Failed to get available addons", "Unable to fetch available addons at this moment"));
        }
    };
}
