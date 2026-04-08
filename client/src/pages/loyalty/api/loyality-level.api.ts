import createAxiosInstance from "@/components/axiosInstance";
import type { ICLoyalityLevels } from "../interfaces";

const axiosInstance = createAxiosInstance();

export const getLoyalityLevels = async (programId: string) => {
    try {
        const response = await axiosInstance.get(`/loyalty/level/${programId}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return { success: false, message: error?.message };
        }
    }
};

export const createLoyalityLevel = async (data: ICLoyalityLevels) => {
    try {
        const response = await axiosInstance.post("/loyalty/level", data);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return { success: false, message: error?.message };
        }
    }
};

export const updateLoyalityLevel = async (id: string, data: ICLoyalityLevels) => {
    try {
        const response = await axiosInstance.put(`/loyalty/level/${id}`, data);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return { success: false, message: error?.message };
        }
    }
};

export const deleteLoyalityLevel = async (id: string) => {
    try {
        const response = await axiosInstance.delete(`/loyalty/level/${id}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return { success: false, message: error?.message };
        }
    }
};
