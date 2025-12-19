import AxiosInstance from "@/components/axiosInstance";
// import { type IPropertyAmenities } from "../types/types"
export const getPropertyAmenity = async (propertyId: string) => {
    try {
        const axiosInstance = AxiosInstance()
        const response = await axiosInstance.get(`property-management/property/${propertyId}/amenity`)
        return response.data
    } catch (error: any) {
        return error?.response?.data

    }
}
// export const updatePropertyAmenity = async (propertyId: string, newAddress: IPropertyAmenities) => {
//     try {
//         const axiosInstance = AxiosInstance()
//         const response = await axiosInstance.patch(`property-management/property/${propertyId}/amenity`, { newAddress })
//         return response.data

//     } catch (error: any) {
//         return error?.response?.data

//     }
// }
export const deletePropertyAmenity = async (propertyId: string) => {
    try {
        const axiosInstance = AxiosInstance()
        const response = await axiosInstance.delete(`property-management/property/${propertyId}/amenity`)
        return response.data

    } catch (error: any) {
        return error?.response?.data

    }
}