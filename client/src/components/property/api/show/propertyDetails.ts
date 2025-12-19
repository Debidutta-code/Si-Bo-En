import AxiosInstance from "@/components/axiosInstance";


export const getPropertyDetails = async (propertyId: string) => {
    const axiosInstance = AxiosInstance()
    try {
        const response = await axiosInstance.get(`property-management/property/${propertyId}`)
        return response.data
    } catch (error: any) {
        return error?.response.data
    }
}
export const updatePropertyDetails = async (propertyId: string) => {
    const axiosInstance = AxiosInstance()
    try {
        const response = await axiosInstance.patch(`property-management/property/${propertyId}`)
        return response.data
    } catch (error: any) {
        return error?.response.data
    }
}
