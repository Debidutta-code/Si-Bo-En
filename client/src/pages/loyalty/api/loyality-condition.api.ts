import createAxiosInstance from "@/components/axiosInstance";
import type { ICLoyalityCondition, IULoyalityCondition, ICLoyalitySpecialCondition, IULoyalitySpecialCondition } from "../interfaces";
const axiosInstance = createAxiosInstance();

// ===== Loyalty Condition APIs =====
export const createCondition = async (data: ICLoyalityCondition) => {
    try {
        const response = await axiosInstance.post("/loyalty/condition", data);
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

export const updateCondition = async (id: string, data: IULoyalityCondition) => {
    try {
        const response = await axiosInstance.patch(`/loyalty/condition/${id}`, data);
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

export const deleteCondition = async (id: string) => {
    try {
        const response = await axiosInstance.delete(`/loyalty/condition/${id}`);
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

export const getConditionsByProgramId = async (loyaltyProgramId: string) => {
    try {
        const response = await axiosInstance.get(`/loyalty/condition/program/${loyaltyProgramId}`);
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

// ===== Loyalty Special Condition APIs =====
export const createSpecialCondition = async (data: ICLoyalitySpecialCondition) => {
    try {
        const response = await axiosInstance.post("/loyalty/condition/special", data);
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

export const updateSpecialCondition = async (id: string, data: IULoyalitySpecialCondition) => {
    try {
        const response = await axiosInstance.patch(`/loyalty/condition/special/${id}`, data);
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

export const deleteSpecialCondition = async (id: string) => {
    try {
        const response = await axiosInstance.delete(`/loyalty/condition/special/${id}`);
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

export const getSpecialConditionsByProgramId = async (loyaltyProgramId: string) => {
    try {
        const response = await axiosInstance.get(`/loyalty/condition/special/program/${loyaltyProgramId}`);
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
