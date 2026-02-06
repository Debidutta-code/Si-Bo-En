import {
    addRoomsForAgenticProperty,
    createAgenticRoom,
    getRoomsForAgenticProperty,
    removeRoomsFromAgencies,
    updateAgenticRoomAvailability
} from "../api";
import type { ICAgenticRoom } from "../interfaces";

export const addRoomsForAgenticPropertyService = async (agenticPropertyId: string, rooms: ICAgenticRoom[]) => {
    try {
        if (!agenticPropertyId) {
            return {
                success: false,
                message: "Agentic property is required"
            };
        }
        if (!rooms || rooms.length === 0) {
            return {
                success: false,
                message: "At least one room is required"
            };
        }
        const response = await addRoomsForAgenticProperty(agenticPropertyId, rooms);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to add rooms for agentic property, try again later"
        };
    }
};

export const createAgenticRoomService = async (data: ICAgenticRoom) => {
    try {
        if (!data.agenticPropertyId) {
            return {
                success: false,
                message: "Agentic property is not chosen"
            };
        }
        if (!data.roomId) {
            return {
                success: false,
                message: "Room is not selected"
            };
        }
        if (!data.roomType || !data.roomName) {
            return {
                success: false,
                message: "Invalid room details"
            };
        }
        const response = await createAgenticRoom(data);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to create agentic room, try again later"
        };
    }
};

export const getRoomsForAgenticPropertyService = async (agenticPropertyId: string, propertyId: string) => {
    try {
        if (!agenticPropertyId || !propertyId) {
            return {
                success: false,
                message: "Property information is required"
            };
        }
        const response = await getRoomsForAgenticProperty(agenticPropertyId, propertyId);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to retrieve rooms, try again later"
        };
    }
};

export const removeRoomsFromAgenciesService = async (agenticPropertyId: string, agenticRoomId: string) => {
    try {
        if (!agenticPropertyId || !agenticRoomId) {
            return {
                success: false,
                message: "Property and room information is required"
            };
        }
        const response = await removeRoomsFromAgencies(agenticPropertyId, agenticRoomId);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to remove room from agency, try again later"
        };
    }
};

export const updateAgenticRoomAvailabilityService = async (agenticRoomId: string, availability: boolean) => {
    try {
        if (!agenticRoomId) {
            return {
                success: false,
                message: "Room information is required"
            };
        }
        const response = await updateAgenticRoomAvailability(agenticRoomId, availability);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to update room availability, try again later"
        };
    }
};
