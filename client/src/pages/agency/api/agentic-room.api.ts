import createAxiosInstance from "@/components/axiosInstance";
import type { ICAgenticRoom } from "../interfaces";

const axiosInstance = createAxiosInstance();


export const createAgenticRoom=async(agenticRoomData:ICAgenticRoom)=>{
    try {
        const response = await axiosInstance.post("/agentic-room", agenticRoomData);
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
        const response = await axiosInstance.patch(`/agentic-room/${agenticRoomId}/availability`, { availability });
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
        const response = await axiosInstance.get(`/agentic-room/property/${agenticPropertyId}/${propertyId}`);
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
        const response = await axiosInstance.delete(`/agentic-room/${agenticPropertyId}/${agenticRoomId}`);
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
        const response = await axiosInstance.post(`/agentic-room/property/${agenticPropertyId}`, { rooms });
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