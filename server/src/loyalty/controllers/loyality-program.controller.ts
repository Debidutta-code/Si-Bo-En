import { Response } from "express";
import { CustomRequest, errorResponse } from "../../utils";
import {
    LoyalityProgramService,
    AdvanceLoyaltyProgramService
} from "../services";
import {
    ICAdvanceLoyaltyprogram,
    ICloyaltyProgram,
    IUAdvanceLoyaltyprogram,
    IULoyalityProgram
} from "../types";

export class LoyalityProgramController {
    private loyalityProgramService: LoyalityProgramService;

    constructor() {
        this.loyalityProgramService = new LoyalityProgramService();
    }

    public async createLoyaltyProgram(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const data: ICloyaltyProgram = req.body;

            if (!data.loyaltyProgramId) {
                return res.status(400).json(errorResponse("Loyalty program not chosen", "Loyalty Program ID is required"));
            }
            if (!data.logo || data.logo.length === 0) {
                return res.status(400).json(errorResponse("Invalid Field Provided", "Logo is required"));
            }

            const result = await this.loyalityProgramService.createLoyaltyProgram(data);
            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to create loyalty program", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "Failed to create loyalty program"));
        }
    }

    public async getLoyaltyProgram(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { loyaltyProgramId } = req.params;

            if (!loyaltyProgramId) {
                return res.status(400).json(errorResponse("Loyalty program not chosen", "Loyalty Program ID is required"));
            }

            const result = await this.loyalityProgramService.getLoyaltyProgram(loyaltyProgramId);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to retrieve loyalty program", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "Failed to retrieve loyalty program"));
        }
    }

    public async updateLoyaltyProgram(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { loyaltyProgramId } = req.params;
            const data: IULoyalityProgram = req.body;

            if (!loyaltyProgramId) {
                return res.status(400).json(errorResponse("Loyalty program not chosen", "Loyalty Program ID is required"));
            }

            const result = await this.loyalityProgramService.updateLoyaltyProgram(loyaltyProgramId, data);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to update loyalty program", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "Failed to update loyalty program"));
        }
    }

    public async deleteLoyaltyProgram(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { loyaltyProgramId } = req.params;

            if (!loyaltyProgramId) {
                return res.status(400).json(errorResponse("Loyalty program not chosen", "Loyalty Program ID is required"));
            }

            const result = await this.loyalityProgramService.deleteLoyaltyProgram(loyaltyProgramId);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to delete loyalty program", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "Failed to delete loyalty program"));
        }
    }
}

export class AdvanceLoyaltyProgramController {
    private advanceLoyaltyProgramService: AdvanceLoyaltyProgramService;

    constructor() {
        this.advanceLoyaltyProgramService = new AdvanceLoyaltyProgramService();
    }

    public async createAdvanceLoyaltyProgram(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const data: ICAdvanceLoyaltyprogram = req.body;

            if (!data.loyaltyProgramId) {
                return res.status(400).json(errorResponse("Loyalty program not chosen", "Loyalty Program ID is required"));
            }

            const result = await this.advanceLoyaltyProgramService.createAdvanceLoyaltyProgram(data);
            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to create advance loyalty program", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "Failed to create advance loyalty program"));
        }
    }

    public async getAdvanceLoyaltyProgram(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { loyaltyProgramId } = req.params;

            if (!loyaltyProgramId) {
                return res.status(400).json(errorResponse("Loyalty program not chosen", "Loyalty Program ID is required"));
            }

            const result = await this.advanceLoyaltyProgramService.getAdvanceLoyaltyPrograms(loyaltyProgramId);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to retrieve advance loyalty program", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "Failed to retrieve advance loyalty program"));
        }
    }

    public async updateAdvanceLoyaltyProgram(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const data: IUAdvanceLoyaltyprogram = req.body;

            if (!id) {
                return res.status(400).json(errorResponse("Invalid Request", "Advance Loyalty Program ID is required"));
            }

            const result = await this.advanceLoyaltyProgramService.updateAdvaceLoyaltyPrograms(id, data);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to update advance loyalty program", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "Failed to update advance loyalty program"));
        }
    }

    public async deleteAdvanceLoyaltyProgram(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json(errorResponse("Invalid Request", "Advance Loyalty Program ID is required"));
            }

            const result = await this.advanceLoyaltyProgramService.deleteAdvanceLoyaltyPrograms(id);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to delete advance loyalty program", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "Failed to delete advance loyalty program"));
        }
    }
}
