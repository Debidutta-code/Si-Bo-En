import createAxiosInstance from "@/components/axiosInstance";
import type {IPropertyAddress} from "../../types/types"


export const getPropertyAddress=async(propertyId:string)=>{
    const axiosInstance=createAxiosInstance()
    try {
        const response=await axiosInstance.get(`/property-management/property/${propertyId}/address`)
        return response.data
    } catch (error:any) {
        return error?.response.data
    }
}
export const createPropertyAddress=async(propertyId:string,payload:IPropertyAddress)=>{
    const axiosInstance=createAxiosInstance()
    try {
        const response=await axiosInstance.post(`/property-management/property/${propertyId}/address`,payload)
        return response.data
    } catch (error:any) {
        return error?.response.data
    }
}
export const updatePropertyAddress=async(propertyId:string,payload:IPropertyAddress)=>{
    const axiosInstance=createAxiosInstance()
    try {
        const response=await axiosInstance.patch(`/property-management/property/${propertyId}/address`,payload)
        return response.data
    } catch (error:any) {
        return error?.response.data
    }
}