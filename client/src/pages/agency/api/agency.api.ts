import createAxiosInstance from "@/components/axiosInstance";
import type { ICAgency } from "../interfaces";
const axiosInstance = createAxiosInstance();

export const getAgencies = async (page: number, limit: number) => {
    try {
        const response = await axiosInstance.get("/agency", {
            params: { page, limit }
        });
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};

export const createAgency = async (data: ICAgency) => {
    try {
        const response = await axiosInstance.post("/agency", data);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};
export const getAgencyById = async (agencyId: string) => {
    try {
        const response = await axiosInstance.get(`/agency/${agencyId}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};
export const updateAgency = async (agencyId: string, data: ICAgency) => {
    try {
        const response = await axiosInstance.put(`/agency/${agencyId}`, data);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};
export const deleteAgency = async (agencyId: string) => {
    try {
        const response = await axiosInstance.delete(`/agency/${agencyId}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};

export const getReservationsForAgency = async (agencyId: string,page: number=1,limit: number=10) => {
    try {
        const response = await axiosInstance.get("/agency/reservations", {
            params: { agencyId, page, limit }
        });
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};
