import {
    fetchRoomsByPropertyId
} from "../api";
import { getAgentPricing } from "../api/agentic-room.api";

export const fetchRoomsByPropertyIdService = async (
    agenticPropertyId: string,
    startDate: string,
    endDate: string
) => {
    try {
        if (!agenticPropertyId || agenticPropertyId.trim() === "") {
            return { success: false, message: "Property ID is required." };
        }

        if (!startDate || !endDate) {
            return { success: false, message: "Start date and end date are required." };
        }

        // Validate date order
        if (new Date(startDate) > new Date(endDate)) {
            return { success: false, message: "Start date must be before end date." };
        }

        const response = await fetchRoomsByPropertyId(agenticPropertyId, startDate, endDate);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to fetch rooms." };
    }
};
export const getAgentPricingService = async (data: {
    propertyCode: string;
    invTypeCode: string;
    startDate: string;
    endDate: string;
    ratePlanCode: string;
    noOfAdults: number;
    noOfChildren: number;
    noOfRooms: number;
}) => {
    try {
        if (!data.propertyCode || data.propertyCode.trim() === "") {
            return { success: false, message: "Property code is required." };
        }

        if (!data.invTypeCode || data.invTypeCode.trim() === "") {
            return { success: false, message: "Room type code is required." };
        }

        if (!data.ratePlanCode || data.ratePlanCode.trim() === "") {
            return { success: false, message: "Rate plan code is required." };
        }

        if (!data.startDate || !data.endDate) {
            return { success: false, message: "Start date and end date are required." };
        }

        if (new Date(data.startDate) > new Date(data.endDate)) {
            return { success: false, message: "Start date must be before end date." };
        }

        if (data.noOfAdults < 1) {
            return { success: false, message: "At least 1 adult is required." };
        }

        if (data.noOfChildren < 0) {
            return { success: false, message: "Number of children cannot be negative." };
        }

        if (data.noOfRooms < 1) {
            return { success: false, message: "At least 1 room is required." };
        }

        const response = await getAgentPricing(data);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to get pricing." };
    }
};