import createAxiosInstance from "@/components/axiosInstance";
import type {  AgencyApplicationStatus, fAgencyApplicationStatus, ICAgencyApplication } from "../interfaces";


const axiosInstance = createAxiosInstance();


export const agencyApplicationRequest = async(data: ICAgencyApplication) => {
    try {
        const response = await axiosInstance.post("/agency/application", data);
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
export const getAgencyApplications = async (status: fAgencyApplicationStatus, page: number=1, limit: number=10) => {
    try {
        const response = await axiosInstance.get("/agency/application", {
            params: { status, page, limit }
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
export const updateApplicationStatus = async (applicationId: string, status: AgencyApplicationStatus, rejectionReason?: string) => {
    try {
        const response = await axiosInstance.put(`/agency/application/${applicationId}/status`, {
            status,
            rejectionReason
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
export const getAgencyApplicationByName = async (name: string) => {
    try {
        const response = await axiosInstance.get(`/agency/application/name/${name}`);
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