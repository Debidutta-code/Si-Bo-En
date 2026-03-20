import createAxiosInstance from "@/components/axiosInstance";
import type {ICMasterRoomView} from "../types"
const axiosInstance = createAxiosInstance();


export const getRoomViews = async () => {
    try {
        const response = await axiosInstance.get(`/utils-management/room-view`);
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
export const createRoomView=async (payload: ICMasterRoomView) => {
    try {
        const response = await axiosInstance.post(`/utils-management/room-view`, payload);
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
export const getSpecificRoomView=async (id: string) => {
    try {
        const response = await axiosInstance.get(`/utils-management/room-view/${id}`);
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
export const updateRoomView=async (id: string, payload: ICMasterRoomView) => {
    try {
        const response = await axiosInstance.patch(`/utils-management/room-view/${id}`, payload);
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
export const deleteRoomView=async (id: string) => {
    try {
        const response = await axiosInstance.delete(`/utils-management/room-view/${id}`);
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
