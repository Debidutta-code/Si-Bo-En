import { errorResponse } from "../../utils/return";
import { CustomRequest } from "../../utils/customRequest";
import { Request, Response } from "express";
import { } from "../types";
import { AgenticRoomService } from "../services";

export class AgenticRoomController {
    private agenticRoomService: AgenticRoomService;

    constructor() {
        this.agenticRoomService = new AgenticRoomService();
    }

    public async createRoomsForAgent(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { agenticPropertyId, roomId, roomType, roomName, isActive } = req.body;
            if (!agenticPropertyId || !roomId || !roomType || !roomName) {
                return res.status(400).json(errorResponse("All fields are required"));
            }
            const result = await this.agenticRoomService.createAgenticRoom({
                agenticPropertyId,
                roomId,
                roomType,
                roomName,
                isActive
            });
            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("failed to create room", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "failed to create room"));
        }
    }

    public async getRoomsForAgencies(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { agenticPropertyId, propertyId } = req.params;
            if (!agenticPropertyId) {
                return res.status(400).json(errorResponse("agenticPropertyId is required"));
            }
            if (!propertyId) {
                return res.status(400).json(errorResponse("property is not choosen"));
            }
            const result = await this.agenticRoomService.getRoomsForAgencies(agenticPropertyId, propertyId);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("failed to create room", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "failed to create room"));
        }
    }

    public async removeAgenticRoom(req: CustomRequest, res: Response): Promise<Response> {
        try {

            const { agenticPropertyId, agenticRoomId } = req.params;
            if (!agenticPropertyId || !agenticRoomId) {
                return res.status(400).json(errorResponse("agenticPropertyId and agenticRoomId are required"));
            }

            const result = await this.agenticRoomService.removeAgenticRoom(agenticPropertyId, agenticRoomId);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("failed to remove room", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "failed to remove room"));
        }
    }
    public async updateAgenticRoomAvailability(req: CustomRequest, res: Response): Promise<Response> {
        try {

            const { id, isAvailable } = req.body;
            if (!id) {
                return res.status(400).json(errorResponse("id is required"));
            }
            const result = await this.agenticRoomService.updateAgenticRoomAvailability(id, isAvailable);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("failed to update room availability", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "failed to update room availability"));
        }
    }

    public async addRoomsToAgencies(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { agenticPropertyId, roomIds } = req.body;
            if (!agenticPropertyId) {
                return res.status(400).json(errorResponse("Agents property ID is not chosen"));
            }
            if (roomIds.length == 0 || !roomIds) {
                return res.status(400).json(errorResponse("Rooms are not selected are required"));
            }
            const result = await this.agenticRoomService.addRoomsToAgencies(agenticPropertyId, roomIds);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("failed to add rooms agency", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "failed to add rooms agency"));
        }


    }

}
