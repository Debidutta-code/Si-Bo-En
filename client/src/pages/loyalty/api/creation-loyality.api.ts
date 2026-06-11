import createAxiosInstance from "@/components/axiosInstance";
import type { ICCreationLoyality, IUCreationLoyalty } from "../interfaces";
const axiosInstance = createAxiosInstance();

export const createCreationLoyality = async (data: ICCreationLoyality) => {
    try {
        const response = await axiosInstance.post("/loyalty/creation", data);
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

export const getCreationLoyalityById = async (creationLoyalityId: string) => {
    try {
        const response = await axiosInstance.get(`/loyalty/creation/${creationLoyalityId}`);
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

export const updateCreationLoyality = async (creationLoyalityId: string, data: IUCreationLoyalty) => {
    try {
        const response = await axiosInstance.patch(`/loyalty/creation/${creationLoyalityId}`, data);
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

export const deleteLoyality = async (creationLoyalityId: string) => {
    try {
        const response = await axiosInstance.delete(`/loyalty/creation/${creationLoyalityId}`);
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

export const getLoyalityByCreation = async (creationId: string) => {
    try {
        const response = await axiosInstance.get(`/loyalty/creation/by-creation/${creationId}`);
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

export const getAllCreationLoyalityWithProperty = async (creationId: string) => {
    try {
        const response = await axiosInstance.get(`/loyalty/creation/with-property/${creationId}`);
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

export const getAllProperties=async(creationId:string)=>{
    try {
        const res=await axiosInstance.get(`/loyalty/creation/get-properties?creationId=${creationId}`);
        return res.data;
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
}