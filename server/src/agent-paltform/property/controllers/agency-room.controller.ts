import { AgentRequest } from "../../utils";
import { errorResponse, toUTC } from "../../../utils";
import { Response } from "express";
import {
    AgenticRoomService
} from "../services";
import { getGeoLocationDetails } from "../../../utils/get-location.utils";

export class AgenticRoomController{
    private agenticRoomService: AgenticRoomService;

    constructor() {
        this.agenticRoomService = new AgenticRoomService();
    }
    public async getAgenticRooms(req: AgentRequest, res: Response): Promise<Response> {
        try {

            const propertyId = req.params.propertyId;
            const agencyId = req.agent?.agencyId;
            if (!propertyId) {
                return res.status(400).json(errorResponse("Property not found", "agent is not assigned or unauthorized"));
            }
            if(!agencyId){
                return res.status(400).json(errorResponse("Agency not found", "agent is not assigned or unauthorized"));
            }

            const { startDate, endDate, guests } = req.body || {};

            if (!startDate || !endDate) {
                return res.status(400).json(errorResponse("Invalid date range", "Start date and end date are required"));
            }
            if (startDate > endDate) {
                return res.status(400).json(errorResponse("Invalid date range", "Start date must be before end date"));
            }
            if (
                !guests ||
                typeof guests.adults !== "number" ||
                typeof guests.children !== "number" ||
                typeof guests.rooms !== "number"
            ) {
                return res.status(400).json(errorResponse("Invalid guests", "guests with adults, children, and rooms are required"));
            }

            const geoDetails = await getGeoLocationDetails(req);
            const countryCode = geoDetails.country;

            const rooms = await this.agenticRoomService.getRoomDetails(
                agencyId,
                propertyId,
                startDate,
                endDate,
                guests,
                countryCode
            );

            return res.status(rooms.success ? 200 : 400).json(rooms);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Internal Server Error", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "An unexpected error occurred"));
        }
    }
}