import createAxiosInstance from "@/components/axiosInstance";
import type { ICStartStopSell } from "../types";

const axiosInstance = createAxiosInstance();

export const startStopSellAPI = async (propertyId: string, data: ICStartStopSell) => {
    try {
        const response = await axiosInstance.patch(`/ari/start-stop-sell/${propertyId}`, data);
        return response.data;
    } catch (error: any) {
        if (error.response.data) {
            return error.response.data;
        }
        else {
            return { message: 'An unexpected error occurred', success: false };
        }
    }
}

export const getRoomRentPrice = async (
    propertyId:string,
    invTypeCode:string,
    startDate:string,
    endDate:string,
    noOfChildren:string,
    noOfAdults:string,
    noOfRooms:string,
    ratePlanCode:string) => {
    try {
        const response = await axiosInstance.post(`/ari/price/get-price`, {
            propertyId,
            invTypeCode,
            startDate,
            endDate,
            noOfChildren,
            noOfAdults,
            noOfRooms,
            ratePlanCode,
        });
        return response.data
    } catch (error: any) {
        if (error.response.data) {
            return error.response.data;
        }
        else {
            return { message: 'Failed to get room rent price', success: false };
        }
    }
}