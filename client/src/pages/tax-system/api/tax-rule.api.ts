import createAxiosInstance from "@/components/axiosInstance";
import type {ICTaxRule} from "../interface";



const axiosInstance = createAxiosInstance();



export const fetchTaxRulesByPro=async(propertyId:string)=>{
    try {
        const response=await axiosInstance.get(`/tax-system/rules/property/${propertyId}`)
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

export const createTaxRuleApi=async(propertyId:string,data:ICTaxRule)=>{
    try {
        const response=await axiosInstance.post(`/tax-system/rules?propertyId=${propertyId}`,{taxRuleData:{...data,propertyId:propertyId}})   

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
export const updateTaxRuleApi=async(taxRuleId:string,data:ICTaxRule)=>{
    try {
        const response=await axiosInstance.put(`/tax-system/rules/${taxRuleId}`,{...data})   
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
export const deleteTaxRuleApi=async(taxRuleId:string)=>{
    try {
        const response=await axiosInstance.delete(`/tax-system/rules/${taxRuleId}`)
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