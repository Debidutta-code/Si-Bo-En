import type { CreateRatePlan } from "../interfaces/ratePlan.type";
import createAxiosInstance from "@/components/axiosInstance";


export async function createRatePlan(propertyId:string,payload: CreateRatePlan) {
    const axiosInstance = createAxiosInstance();
    try {
        const response = await axiosInstance.post(`/ari/rate-plan?propertyId=${propertyId}`, payload);
        return response.data;
    } catch (error:any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}


export async function getRatePlans(propertyId:string) {
    const axiosInstance = createAxiosInstance();
    try {
        const response = await axiosInstance.get(`/ari/rate-plan/${propertyId}`);
        return response.data;
    } catch (error:any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}
export async function deleteRatePlan(ratePlanCode:string) {
    const axiosInstance = createAxiosInstance();
    try {
        const response = await axiosInstance.delete(`/ari/rate-plan/${ratePlanCode}`);
        return response.data;
    } catch (error:any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}

export async function updateRatePlan(ratePlanCode:string,payload: Partial<CreateRatePlan>) {
    const axiosInstance = createAxiosInstance();
    try {
        const response = await axiosInstance.patch(`/ari/rate-plan/${ratePlanCode}`, payload);
        return response.data;
    } catch (error:any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}