import createAxiosInstance from "@/components/axiosInstance";
import type { ICloyaltyProgram, IULoyalityProgram, ICAdvanceLoyaltyprogram, IUAdvanceLoyaltyprogram } from "../interfaces";
const axiosInstance = createAxiosInstance();

// ===== Basic Loyalty Program APIs =====
export const createLoyaltyProgram = async (data: ICloyaltyProgram) => {
    try {
        const response = await axiosInstance.post("/loyalty/program", data);
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

export const getLoyaltyProgram = async (loyaltyProgramId: string) => {
    try {
        const response = await axiosInstance.get(`/loyalty/program/${loyaltyProgramId}`);
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

export const updateLoyaltyProgram = async (loyaltyProgramId: string, data: IULoyalityProgram) => {
    try {
        const response = await axiosInstance.patch(`/loyalty/program/${loyaltyProgramId}`, data);
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

export const deleteLoyaltyProgram = async (loyaltyProgramId: string) => {
    try {
        const response = await axiosInstance.delete(`/loyalty/program/${loyaltyProgramId}`);
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

// ===== Advance Loyalty Program APIs =====
export const createAdvanceLoyaltyProgram = async (data: ICAdvanceLoyaltyprogram) => {
    try {
        const response = await axiosInstance.post("/loyalty/program/advance", data);
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

export const getAdvanceLoyaltyProgram = async (loyaltyProgramId: string) => {
    try {
        const response = await axiosInstance.get(`/loyalty/program/advance/${loyaltyProgramId}`);
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

export const updateAdvanceLoyaltyProgram = async (id: string, data: IUAdvanceLoyaltyprogram) => {
    try {
        const response = await axiosInstance.patch(`/loyalty/program/advance/update/${id}`, data);
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

export const getLoyaltyProgramByCreationId = async (creationId: string) => {
    try {
        const response = await axiosInstance.get(`/loyalty/program/creation/${creationId}`);
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

export const deleteAdvanceLoyaltyProgram = async (id: string) => {
    try {
        const response = await axiosInstance.delete(`/loyalty/program/advance/delete/${id}`);
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
