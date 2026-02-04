import { errorResponse } from "../../utils/return";
import { CustomRequest, PropertyCustomRequest } from "../../utils/customRequest";
import { Request, Response } from "express";
import { } from "../types";
import { AgenticPropertyService } from "../services";

export class AgenticPropertyController {
    private agenticPropertyService: AgenticPropertyService;

    constructor() {
        this.agenticPropertyService = new AgenticPropertyService();
    }
    public async createAgenticProperty(req:PropertyCustomRequest,res:Response):Promise<Response>{
        try {
            const {agencyId, propertyId, propertyCode, propertyName, isActive} = req.body;
            if (!agencyId || !propertyId || !propertyCode || !propertyName || isActive === undefined) {
                return res.status(400).json(errorResponse("All fields are required"));
            }
            const result = await this.agenticPropertyService.createAgenticProperty({
                agencyId,
                propertyId,
                propertyCode,
                propertyName,
                isActive
            });
            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("failed to create agentic property", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "failed to create agentic property"));
        }
    }
    public async deleteAgenticProperty(req:CustomRequest,res:Response):Promise<Response>{
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json(errorResponse("id is required"));
            }
            const result = await this.agenticPropertyService.deleteAgenticProperty(id);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("failed to delete agentic property", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "failed to delete agentic property"));
        }
    }
    public async getAgenticPropertyDetails(req:CustomRequest,res:Response):Promise<Response>{
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json(errorResponse("id is required"));
            }
            const result = await this.agenticPropertyService.getAgenticPropertyDetails(id);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("failed to get agentic property details", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "failed to get agentic property details"));
        }
    }
    
    public async getReservationsByAgents(req:PropertyCustomRequest,res:Response):Promise<Response>{
        try {
            const { agencyId, propertyId } = req.params;
            const { page,limit } = req.query;
            if (!agencyId || !propertyId) {
                return res.status(400).json(errorResponse("agencyId and propertyId are required"));
            }
            const pageNum = page ? Number(page) : 1;
            const limitNum = limit ? Number(limit) : 10;
            const result = await this.agenticPropertyService.getReservationsByAgents({agencyId, propertyId, skip: (pageNum - 1) * limitNum, take: limitNum});
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("failed to get reservations by agents", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "failed to get reservations by agents"));
        }
    }
    public async createAvailablePropertiesForAgents(req:CustomRequest,res:Response):Promise<Response>{
        try {
            const { agencyId } = req.params;
            if (!agencyId) {
                return res.status(400).json(errorResponse("agencyId is required"));
            }
            const result = await this.agenticPropertyService.getAvailablePropertiesForAgents(agencyId);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("failed to get available properties", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "failed to get available properties"));
        }
    }
    
    public async getAgenciesByPropertyId(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { propertyId } = req.params;
            if (!propertyId) {
                return res.status(400).json(errorResponse("propertyId is required"));
            }
            const result = await this.agenticPropertyService.getAgenciesByPropertyId(propertyId);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("failed to get agencies by property", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "failed to get agencies by property"));
        }
    }
}
