import createAxiosInstance from "@/components/axiosInstance";
import type { CreateDeviceSpecificPromotion, UpdateDeviceSpecificPromotion } from "../interfaces";

const axiosInstance = createAxiosInstance();

export async function createDeviceSpecificPromotion(payload: CreateDeviceSpecificPromotion) {
    try {
        const response = await axiosInstance.post(`/promotions/device-specific`, payload);
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
}

export async function getDeviceSpecificPromotionById(promotionId: string) {
    try {
        const response = await axiosInstance.get(`/promotions/device-specific/${promotionId}`);
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
}

export async function getDeviceSpecificPromotionsByProperty(propertyId: string) {
    try {
        const response = await axiosInstance.get(`/promotions/device-specific/property/${propertyId}`);
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
}

export async function updateDeviceSpecificPromotion(promotionId: string, payload: UpdateDeviceSpecificPromotion) {
    try {
        const response = await axiosInstance.patch(`/promotions/device-specific/${promotionId}`, payload);
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
}

export async function deleteDeviceSpecificPromotion(promotionId: string) {
    try {
        const response = await axiosInstance.delete(`/promotions/device-specific/${promotionId}`);
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
}

export async function toggleDeviceSpecificPromotionStatus(promotionId: string, isActive: boolean) {
    try {
        const response = await axiosInstance.patch(`/promotions/device-specific/${promotionId}/toggle-status`, { isActive });
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
}