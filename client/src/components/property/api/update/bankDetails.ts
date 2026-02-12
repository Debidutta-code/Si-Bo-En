import createAxiosInstance from "@/components/axiosInstance";
import type { IBankDetails } from "../../types/types";

interface UpdatePaymentMethodPayload {
  payAtHotel: boolean;
  paymentGateway: boolean;
  selectedPaymentIntegration: string | null;
  outletId: string | null;
}

export const updateBankDetails=async(propertyId:string,bankDetails:IBankDetails)=>{
    const axiosInstance=createAxiosInstance()
    try {
        const res=await axiosInstance.patch(`/property-management/property/${propertyId}/payment-details`,bankDetails);
        return res.data
    } catch (error:any) {
        return error?.response.data
    }
}

export const updatePaymentMethod=async(propertyId:string, payload: UpdatePaymentMethodPayload)=>{
    const axiosInstance=createAxiosInstance()
    try {
        const res=await axiosInstance.put(`/property-management/property/${propertyId}/payment-details`,{activatedPaymentMethod:payload})
        return res.data
    } catch (error:any) {
        return error?.response.data
    }
}