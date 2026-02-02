import createAxiosInstance from "@/components/axiosInstance";
import type { CreateMobilePromotion, UpdateMobilePromotion } from "../interfaces";

const axiosInstance = createAxiosInstance()
export async function createMobilePromotion(payload: CreateMobilePromotion) {
    try {
        const response = await axiosInstance.post(`/promotions/mobile-rate`, payload);
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

export async function getMobilePromotionByRatePlanId(ratePlanId: string) {
    try {
        const response = await axiosInstance.get(`/promotions/mobile-rate/${ratePlanId}`);
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

export async function getMobilePromotionsByPropertyId(propertyId: string) {
    try {
        const response = await axiosInstance.get(`/promotions/mobile-rate/property/${propertyId}`);
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

export async function updateMobilePromotion(ratePlanId: string, payload: UpdateMobilePromotion) {
    try {
        const response = await axiosInstance.put(`/promotions/mobile-rate/${ratePlanId}`, payload);
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

export async function deleteMobilePromotion(ratePlanId: string) {
    try {
        const response = await axiosInstance.delete(`/promotions/mobile-rate/${ratePlanId}`);
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