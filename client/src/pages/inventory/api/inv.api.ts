import createAxiosInstance from "@/components/axiosInstance";
import type { IRoomAvailabilityResponse, SelectedRoom } from "../types"
const axiosInstance = createAxiosInstance();

export const getAllRoomTypesForProperty = async (propertyId: string) => {
    try {
        const response = await axiosInstance.get(`/property-management/property/${propertyId}/room/inv-setup`);
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};

export const addRoomInventory = async (propertyId: string, payload: SelectedRoom) => {
    try {
        const response = await axiosInstance.post(`/ari/inventory/create/${propertyId}`, payload);
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}
export const getRoomAvailability = async (propertyId: string, roomType: string): Promise<IRoomAvailabilityResponse> => {
    try {
        const response = await axiosInstance.get(`/ari/inventory/availability`, {
            params: { propertyId, roomType }
        });
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data;
        }
        return { success: false, message: error?.message, data: [] };
    }
};