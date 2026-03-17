import createAxiosInstance from "@/components/axiosInstance";
import type { ICreateCharges, IAdditionalGuestAmount, IBaseGuestAmounts, CreateMappingPayload } from "../types";
import { getRoomRentPrice } from "../api"
const axiosInstance = createAxiosInstance();



export const createMappingService = async (
    propertyId: string,
    data: ICreateCharges,
    ratePlanName: string,
    roomTypeName: string
) => {
    try {
        // Transform the data to match backend expectations
        const payload: CreateMappingPayload = {
            ratePlanCode: data.ratePlanCode,
            ratePlanName: ratePlanName,
            roomTypeCode: data.roomTypeCode,
            roomTypeName: roomTypeName,
            baseByGuestAmounts: data.baseByGuestAmounts.map((item) => ({
                ageQualifyingCode: item.ageQualifyingCode,
                numberOfGuests: item.numberOfGuests,
                amountBeforeTax: item.amountBeforeTax,
            })),
            additionalGuestAmounts: data.additionalGuestAmounts.map((item) => ({
                ageQualifyingCode: item.ageQualifyingCode,
                amount: item.amount,
            })),
            currencyCode: data.currencyCode,
            startDate: data.startDate,
            endDate: data.endDate,
        };

        const response = await axiosInstance.put(
            `/ari/inventory/map/rateplan/${propertyId}`,
            payload
        );

        return response.data;
    } catch (error: any) {
        console.error("Error creating mapping:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to create mapping",
            error: error.message,
        };
    }
};

export const getMappedRatePlansService = async (
    propertyId: string,
    filters: {
        ratePlanCode?: string;
        roomTypeCode?: string;
        startDate?: string;
        endDate?: string;
    },
    page: number = 1 // Add page parameter with default
) => {
    try {
        const response = await axiosInstance.post(
            `/ari/inventory/get-mapped/rateplan?page=${page}`,
            {
                propertyId,
                ...filters,
            }
        );

        return response.data;
    } catch (error: any) {
        console.error("Error fetching mapped rate plans:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to fetch mapped rate plans",
            error: error.message,
        };
    }
};

export const updateMappedPriceService = async (
    chargeId: string,
    baseGuestAmounts: IBaseGuestAmounts[],
    additionalGuestAmounts: IAdditionalGuestAmount[],
) => {
    try {
        const response = await axiosInstance.patch(
            `/ari/inventory/update/price`,
            {
                id: chargeId,
                baseGuestAmounts: baseGuestAmounts,
                additionalGuestAmounts: additionalGuestAmounts,
            }
        );

        return response.data;
    } catch (error: any) {
        console.error("Error updating price:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to update price",
            error: error.message,
        };
    }
};

export const getRoomRentPriceService = (
    propertyId: string,
    invTypeCode: string,
    startDate: Date,
    endDate: Date,
    noOfChildren: number,
    noOfAdults: number,
    noOfRooms: number,
    ratePlanCode: string) => {
    try {
        if (!propertyId) {
            return { success: false, message: 'Property is not chosen' };
        }
        if (!invTypeCode) {
            return { success: false, message: 'Room type is not chosen' };
        }
        if (!startDate) {
            return { success: false, message: 'Start date is not chosen' };
        }
        if (!endDate) {
            return { success: false, message: 'End date is not chosen' };
        }
        if (startDate > endDate) {
            return { success: false, message: 'Start date cannot be after end date' };
        }
        if (noOfAdults < 1) {
            return { success: false, message: 'At least 1 adult is required' };
        }
        if (noOfChildren < 0) {
            return { success: false, message: "Number of children can't be less than 0" };
        }
        if (noOfRooms < 1) {
            return { success: false, message: 'At least 1 room is required' };
        }
        if (!ratePlanCode) {
            return { success: false, message: 'Rate plan is not chosen' };
        }
        return getRoomRentPrice(
            propertyId,
            invTypeCode,
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0],
            noOfChildren.toString(),
            noOfAdults.toString(),
            noOfRooms.toString(),
            ratePlanCode
        );
    } catch (error) {
        return { success: false, message: 'Error occurred while fetching mapped rate plan' };
    }
}