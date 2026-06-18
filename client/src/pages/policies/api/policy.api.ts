import createAxiosInstance from "@/components/axiosInstance";
import type { ICPolicy } from "../interfaces";
const axiosInstance = createAxiosInstance();

const createPolicy = async (policyData: ICPolicy, propertyId: string) => {
    try {
        const response = await axiosInstance.post(`/policy`, { ...policyData, propertyId: propertyId });
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
const getPolicies= async (propertyId: string) => {
    try {
        const response = await axiosInstance.get(`/policy/getPolicyByHotelCode`, {
            params: { propertyId: propertyId }
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
}
const deletePolicyApi = async (policyId: string) => {
    try {
        const response = await axiosInstance.delete(`/policy/${policyId}`);
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
const addPolicyToRatePlan = async (policyId: string, ratePlanId: string) => {
    try {
        const response = await axiosInstance.post(`/policy/addToRatePlan`, { policyId, ratePlanId });
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
const updatePolicyApi = async (policyId: string, data: { policyName?: string; description?: string }) => {
    try {
        const response = await axiosInstance.put(`/policy/${policyId}`, data);
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
const removePolicyFromRatePlansApi = async (policyId: string, ratePlanIds: string[]) => {
    try {
        const response = await axiosInstance.post(`/policy/removefromPolicy`, { policyId, ratePlanIds });
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

export {
    createPolicy,
    getPolicies,
    deletePolicyApi,
    addPolicyToRatePlan,
    updatePolicyApi,
    removePolicyFromRatePlansApi
}