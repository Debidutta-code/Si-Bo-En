import createAxiosInstance from "@/components/axiosInstance";


export const addBankDetails=async(propertyId:string,bankDetails:any)=>{
    const axiosInstance=createAxiosInstance()
    try {
        const response=await axiosInstance.post(`/property-management/property/${propertyId}/payment-details`,bankDetails)
        return response.data
    } catch (error:any) {
        return error?.response?.data
    }
}