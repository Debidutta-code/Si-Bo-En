import createAxiosInstance from "@/components/axiosInstance";
import type {IUPropertyConfig} from "../types";
const axiosInstance=createAxiosInstance();

export const updatePropertyConfig=async(propertyId:string,data:IUPropertyConfig)=>{
    try {
        const response=await axiosInstance.patch(`/property-management/config/${propertyId}`,{updatedConfig:data})
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
export const fetchPropertyConfig=async(propertyId:string)=>{
    try {
        const response=await axiosInstance.get(`/property-management/config/${propertyId}`)
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
export const getAllPartnerIntegrations=async(propertyId:string)=>{
    try {
        const response=await axiosInstance.get(`/property-management/property/integration/property/${propertyId}`)
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

export const createPropertyIntegration=async(data:any)=>{
    try {
        const response=await axiosInstance.post(`/property-management/property/integration`,data)
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

export const updatePropertyIntegrationStatus=async(integrationId:string,isActive:boolean)=>{
    try {
        const response=await axiosInstance.patch(`/property-management/property/integration/${integrationId}`,{isActive})
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

export const deletePropertyIntegration=async(integrationId:string)=>{
    try {
        const response=await axiosInstance.delete(`/property-management/property/integration/${integrationId}`)
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

export const addPropertyIntegrationField=async(integrationId:string,data:any)=>{
    try {
        const response=await axiosInstance.post(`/property-management/property/integration/field/${integrationId}`,data)
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

export const updatePropertyIntegrationField=async(fieldId:string,data:any)=>{
    try {
        const response=await axiosInstance.patch(`/property-management/property/integration/field/${fieldId}`,data)
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

export const deletePropertyIntegrationField=async(fieldId:string)=>{
    try {
        const response=await axiosInstance.delete(`/property-management/property/integration/field/${fieldId}`)
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