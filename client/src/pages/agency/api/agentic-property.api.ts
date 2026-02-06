import createAxiosInstance from "@/components/axiosInstance";
import type { ICAgenticProperty } from "../interfaces";

const axiosInstance = createAxiosInstance();

export const createAgenticProperty=async(agenticPropertyData:ICAgenticProperty)=>{
    try {
        const response = await axiosInstance.post("/agency/agentic-properties", agenticPropertyData);
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

export const getAgenticPropertyById=async(id:string)=>{
    try {
        const response = await axiosInstance.get(`/agency/agentic-properties/${id}`);
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

export const deleteAgenticProperty=async(id:string)=>{
    try {
        const response = await axiosInstance.delete(`/agency/agentic-properties/${id}`);
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


export const getAvailablePropertiesForAgencies=async(agencyId:string)=>{
    try {
        const response = await axiosInstance.get(`/agency/agentic-properties/available/${agencyId}`);
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
export const getReservationsByAgenticPropertyId=async(agencyId:string,propertyId:string)=>{
    try {
        const response = await axiosInstance.get(`/agency/agentic-properties/reservations/${agencyId}/${propertyId}`);
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
}