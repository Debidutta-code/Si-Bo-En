import createAxiosInstance from "@/components/axiosInstance";
import type { ICLoyaltyField, IULoyaltyField } from "../interfaces";
const axiosInstance = createAxiosInstance();

export const addFields = async (data: ICLoyaltyField) => {
    try {
        const response = await axiosInstance.post("/loyalty/field", data);
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

export const getFields = async (loyaltyProgramId: string) => {
    try {
        const response = await axiosInstance.get(`/loyalty/field/${loyaltyProgramId}`);
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

export const updateField = async (loyaltyProgramId: string, fieldName: string, data: IULoyaltyField) => {
    try {
        const response = await axiosInstance.patch(`/loyalty/field/${loyaltyProgramId}/${fieldName}`, data);
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

export const deleteField = async (loyaltyProgramId: string, fieldName: string) => {
    try {
        const response = await axiosInstance.delete(`/loyalty/field/${loyaltyProgramId}/${fieldName}`);
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

export const updateManyFields = async (loyaltyProgramId: string, fields: IULoyaltyField[]) => {
    try {
        const response = await axiosInstance.patch(`/loyalty/field/update-many/${loyaltyProgramId}`, { fields });
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
