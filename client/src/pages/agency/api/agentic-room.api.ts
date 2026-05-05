import createAxiosInstance from "@/components/axiosInstance";
import type { ICAgenticRoom } from "../interfaces";

const axiosInstance = createAxiosInstance();


export const createAgenticRoom=async(agenticRoomData:ICAgenticRoom)=>{
    try {
        const response = await axiosInstance.post("/agency/agentic-rooms", agenticRoomData);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};

export const updateAgenticRoomAvailability=async(agenticRoomId:string, availability:boolean)=>{
    try {
        // Backend expects 'id' and 'isAvailable' in the request body
        const response = await axiosInstance.put(`/agency/agentic-rooms`, { 
            id: agenticRoomId, 
            isAvailable: availability 
        });
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};

export const getRoomsForAgenticProperty=async(agenticPropertyId:string,propertyId:string)=>{
    try {
        const response = await axiosInstance.get(`/agency/agentic-rooms/rooms-for-agency/${agenticPropertyId}/${propertyId}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};
export const removeRoomsFromAgencies=async(agenticPropertyId:string,agenticRoomId:string)=>{
    try {
        const response = await axiosInstance.put(`/agency/agentic-rooms/remove-rooms-for-agency/${agenticPropertyId}/${agenticRoomId}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};
export const addRoomsForAgenticProperty=async(agenticPropertyId:string, rooms:ICAgenticRoom[])=>{
    try {
        // Backend expects roomIds as IRooms[] with id, roomType, roomName
        const roomIds = rooms.map(room => ({
            id: room.roomId,
            roomType: room.roomType,
            roomName: room.roomName
        }));
        const response = await axiosInstance.post(`/agency/agentic-rooms/add-rooms-to-agency`, { 
            agenticPropertyId, 
            roomIds 
        });
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}