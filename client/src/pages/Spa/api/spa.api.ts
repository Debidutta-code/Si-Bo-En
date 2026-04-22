import createAxiosInstance from "@/components/axiosInstance";
import type { ICSpaC, IUSpaR } from "../interfaces";

const axiosInstance = createAxiosInstance();

export const getSpa = async (propertyId: string) => {
    try {
        const response = await axiosInstance.get(`/spa/property/${propertyId}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};
export const createSpa = async (spaData: ICSpaC) => {
    try {
        const response = await axiosInstance.post(`/spa`, spaData);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};
export const updateSpa = async (spaId: string, spaData: IUSpaR) => {
    try {
        const response = await axiosInstance.put(`/spa/${spaId}`, spaData);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};
export const deleteSpa = async (spaId: string) => {
    try {
        const response = await axiosInstance.delete(`/spa/${spaId}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};
