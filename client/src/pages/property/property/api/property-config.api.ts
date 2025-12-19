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