import type { CreateRatePlan, RatePlanRule } from "../interfaces/ratePlan.type";
import createAxiosInstance from "@/components/axiosInstance";
const axiosInstance = createAxiosInstance();

export async function createRatePlan(propertyId:string,payload: CreateRatePlan) {
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



export async function createRatePlanRule(payload: Partial<RatePlanRule>) {
    try {
        const response = await axiosInstance.post(`/ari/rate-plan-rule`, payload);
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
}

export async function getRatePlanRule(ratePlanId: string) {
    try {
        const response = await axiosInstance.get(`/ari/rate-plan-rule/${ratePlanId}`);
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
}

export async function updateRatePlanRule(ratePlanId: string, payload: Partial<RatePlanRule>) {
    try {
        const response = await axiosInstance.put(`/ari/rate-plan-rule/${ratePlanId}`, payload);
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
}

export async function deleteRatePlanRule(ratePlanId: string) {
    try {
        const response = await axiosInstance.delete(`/ari/rate-plan-rule/${ratePlanId}`);
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
}
