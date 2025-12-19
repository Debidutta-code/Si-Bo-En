import createAxiosInstance from "@/components/axiosInstance";
import type { IBankDetails,PaymentMethods } from "../../types/types";


export const updateBankDetails=async(propertyId:string,bankDetails:IBankDetails)=>{
    const axiosInstance=createAxiosInstance()
    try {
        const res=await axiosInstance.patch(`/property-management/property/${propertyId}/payment-details`,bankDetails);
        return res.data
    } catch (error:any) {
        return error?.response.data
    }
}
export const updatePaymentMethod=async(propertyId:string,bankDetails:PaymentMethods)=>{
    const axiosInstance=createAxiosInstance()
    try {
        const res=await axiosInstance.put(`/property-management/property/${propertyId}/payment-details`,{activatedPaymentMethod:bankDetails})
        return res.data
    } catch (error:any) {
        return error?.response.data
    }
}