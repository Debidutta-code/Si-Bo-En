import AxiosInstance from "@/components/axiosInstance";
export const getBankDetailsByPropertyId = async (propertyId: string) => {
    try {
        const axiosInstance = AxiosInstance()
        const response = await axiosInstance.get(`property-management/property/${propertyId}/payment-details`)
        return response.data
    } catch (error: any) {
        return error?.response.data

    }
}
export const updateBankDetails = async (propertyId: string) => {
    try {
        const axiosInstance = AxiosInstance()
        const response = await axiosInstance.patch(`property-management/property/${propertyId}/payment-details`, )
        return response.data

    } catch (error: any) {
        return error?.response.data

    }
}
export const updatePaymentMethods = async (propertyId: string) => {
    try {
        const axiosInstance = AxiosInstance()
        const response = await axiosInstance.put(`property-management/property/${propertyId}/payment-details`)
        return response.data

    } catch (error: any) {
        return error?.response.data

    }
}