import {
    fetchRoomsByPropertyId
} from "../api";

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
