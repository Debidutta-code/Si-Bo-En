import createAxiosInstance from "@/components/axiosInstance";
import type { ICPropertyLoyaltyConfig } from "../interfaces";
const axiosInstance = createAxiosInstance();

export const createPropertyLoyalityConfig = async (data: ICPropertyLoyaltyConfig) => {
    try {
        const response = await axiosInstance.post("/loyalty/property", data);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
};

export const getLoyalityForProperty = async (propertyId: string) => {
    try {
        const response = await axiosInstance.get(`/loyalty/property/${propertyId}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
};

export const updatePropertyLoyalityConfig = async (propertyLoyalityId: string, isActive: boolean) => {
    try {
        const response = await axiosInstance.patch(`/loyalty/property/config/${propertyLoyalityId}`, { isActive });
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
};

export const deletePropertyLoyalityConfig = async (propertyLoyalityId: string) => {
    try {
        const response = await axiosInstance.delete(`/loyalty/property/config/${propertyLoyalityId}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
};

export const getAllPropertyLoyalityWithLoyality = async (propertyId: string) => {
    try {
        const response = await axiosInstance.get(`/loyalty/property/all/${propertyId}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
};

export const getActiveLoyaltyConfigByPropertyId = async (propertyId: string) => {
    try {
        const response = await axiosInstance.get(`/loyalty/property/active/${propertyId}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
};
