import { Response } from "express";
import { errorResponse } from "../../../utils/return";
import { AgentRequest } from "../../utils";
import { AgentPricingService } from "../services";
import { toUTC } from "../../../utils";

export class AgentPricingController {
    private pricingService: AgentPricingService;

    constructor() {
        this.pricingService = new AgentPricingService();
    }

    public async getAgentPricing(req: AgentRequest, res: Response): Promise<Response> {
        try {
            const agentId = req.agent?.id;
            const agencyId = req.agent?.agencyId;

            if (!agentId || !agencyId) {
                return res.status(401).json(
                    errorResponse("Unauthorized", "Agent not authenticated")
                );
            }

            const {
                propertyCode,
                invTypeCode,
                startDate,
                endDate,
                ratePlanCode,
                noOfAdults,
                noOfChildren,
                noOfRooms
            } = req.body;

            // Validate required fields
            if (!propertyCode) {
                return res.status(400).json(errorResponse('Property code is required'));
            }
            if (!invTypeCode) {
                return res.status(400).json(errorResponse('Room type code is required'));
            }
            if (!ratePlanCode) {
                return res.status(400).json(errorResponse('Rate plan code is required'));
            }
            if (!startDate) {
                return res.status(400).json(errorResponse('Start date is required'));
            }
            if (!endDate) {
                return res.status(400).json(errorResponse('End date is required'));
            }

            // Convert and validate guest counts
            const adults = Number(noOfAdults) || 0;
            const children = Number(noOfChildren) || 0;
            const rooms = Number(noOfRooms) || 1;

            if (adults < 1) {
                return res.status(400).json(errorResponse('At least 1 adult is required'));
            }
            if (children < 0) {
                return res.status(400).json(errorResponse("Number of children can't be negative"));
            }
            if (rooms < 1) {
                return res.status(400).json(errorResponse('At least 1 room is required'));
            }

            const result = await this.pricingService.getAgentPricing(
                {
                    propertyCode,
                    invTypeCode,
                    startDate: toUTC(startDate),
                    endDate: toUTC(endDate),
                    ratePlanCode,
                    noOfAdults: adults,
                    noOfChildren: children,
                    noOfRooms: rooms
                },
                agencyId
            );

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(
                    errorResponse("Failed to calculate pricing", error.message)
                );
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
}