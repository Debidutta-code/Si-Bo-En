import { AgentRequest } from "../../utils";
import { errorResponse } from "../../../utils";
import { Response } from "express";
import {
    AgencyPropertyService
} from "../services";
export class AgenticPropertyController {
    private agencyPropertyService: AgencyPropertyService;

    constructor() {
        this.agencyPropertyService = new AgencyPropertyService();
    }

    public async getProperties(req: AgentRequest, res: Response): Promise<Response> {
        try {
            
            const agencyId = req.agent?.agencyId;
            if (!agencyId) {
                return res.status(400).json(errorResponse("Agency  not found", "agent is not assined or unauthorized"));
            }
            const properties = await this.agencyPropertyService.getAgenticProperties(agencyId);
            
    
            return res.status(properties.success ? 200 : 400).json(properties);
        } catch (error) {
            if(error instanceof Error){
                return res.status(500).json(errorResponse("Internal Server Error", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "An unexpected error occurred"));
        }
    }
    // public async getByAgenticPropertyId(req: AgentRequest, res: Response): Promise<Response> {
    //     try {
    //         const agenticPropertyId = req.params.agenticPropertyId;

    //         if (!agenticPropertyId) {
    //             return res.status(400).json(errorResponse("Property not found", "agent is not assigned or unauthorized"));
    //         }

    //         const property = await this.agencyPropertyService.getAgenticPropertyById(agenticPropertyId);

    //         return res.status(property.success ? 200 : 400).json(property);
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             return res.status(500).json(errorResponse("Internal Server Error", error.message));
    //         }
    //         return res.status(500).json(errorResponse("Internal Server Error", "An unexpected error occurred"));
    //     }
    // }
}
