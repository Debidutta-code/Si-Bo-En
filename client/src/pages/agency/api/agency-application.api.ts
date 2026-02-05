import createAxiosInstance from "@/components/axiosInstance";
import type {  AgencyApplicationStatus, fAgencyApplicationStatus, ICAgencyApplication } from "../interfaces";


const axiosInstance = createAxiosInstance();


export const agencyApplicationRequest = async(data: ICAgencyApplication) => {
    try {
        const response = await axiosInstance.post("/agency/agency-applications", data);
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
        const response = await axiosInstance.get("/agency/agency-applications", {
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
        const response = await axiosInstance.put(`/agency/agency-applications/${applicationId}/status`, {
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
        const response = await axiosInstance.get(`/agency/agency-applications/name/${name}`);
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