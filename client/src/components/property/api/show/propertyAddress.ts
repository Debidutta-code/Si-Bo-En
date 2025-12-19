import AxiosInstance from "@/components/axiosInstance";
// import { IPropertyAddress } from "../types/types"
export const getPropertyAddress = async (propertyId: string) => {
    try {
        const axiosInstance = AxiosInstance()
        const response = await axiosInstance.get(`property-management/property/${propertyId}/address`)
        return response.data
    } catch (error: any) {
        return error?.response.data

    }
}
// export const updatePropertyAddress = async (propertyId: string, newAddress: IPropertyAddress) => {
//     try {
//         const axiosInstance = AxiosInstance()
//         const response = await axiosInstance.patch(`property-management/property/${propertyId}/address`, { newAddress })
//         return response.data

//     } catch (error: any) {
//         return error?.response.data

//     }
// }
export const deletePropertyAddress = async (propertyId: string) => {
    try {
        const axiosInstance = AxiosInstance()
        const response = await axiosInstance.delete(`property-management/property/${propertyId}/address`)
        return response.data

    } catch (error: any) {
        return error?.response.data

    }
}