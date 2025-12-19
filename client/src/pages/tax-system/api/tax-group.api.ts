import createAxiosInstance from "@/components/axiosInstance";
import type {ICTaxGroup,IUTaxGroup} from "../interface";


const axiosInstance = createAxiosInstance();

export const createTaxGroup = async (propertyId: string, taxGroupData: ICTaxGroup) => {
    try {
        const response = await axiosInstance.post(`/tax-system/groups?propertyId=${propertyId}`, {...taxGroupData, propertyId});
        return response.data;
    }catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}
export const getTaxGroupsByPropertyId = async (propertyId: string) => {
    try {
        const response = await axiosInstance.get(`/tax-system/groups/property/${propertyId}`);
        return response.data;
    }catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}
export const updateTaxGroup = async (taxGroupId: string, taxGroupData: IUTaxGroup) => {
    try {
        const response = await axiosInstance.put(`/tax-system/groups/${taxGroupId}`, taxGroupData);
        return response.data;
    }catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}
export const deleteTaxGroup = async (taxGroupId: string) => {
    try {
        const response = await axiosInstance.delete(`/tax-system/groups/${taxGroupId}`);    
        return response.data;
    }catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}
export const addRulesToTaxGroup = async (taxGroupId: string, ruleIds: string[]) => {
    try {
        const response = await axiosInstance.post(`/tax-system/groups/${taxGroupId}/add-rules`, { ruleIds });
        return response.data;
    }catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}
export const removeRulesFromTaxGroup = async (taxGroupId: string, ruleIds: string[]) => {
    try {
        const response = await axiosInstance.post(`/tax-system/groups/${taxGroupId}/remove-rules`, { ruleIds });
        return response.data;
    }catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}
export const addRatePlanToTaxGroup = async (taxGroupId: string, ratePlanCode:string) => {
    try {
        const response = await axiosInstance.put(`/ari/rate-plan/add/tax`, { taxGroupId, ratePlanCode });
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
}
export const removeRatePlanFromTaxGroup = async (taxGroupId: string, ratePlanCode:string) => {
    try {
        const response = await axiosInstance.put(`/ari/rate-plan/remove/tax`, { taxGroupId, ratePlanCode });
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
}