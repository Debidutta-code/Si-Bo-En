import AxiosInstance from "@/components/axiosInstance";

const axiosInstance = AxiosInstance()

export const getPropertyDetails = async (propertyId: string) => {
    try {
        const response = await axiosInstance.get(`property-management/property/${propertyId}`)
        return response.data
    } catch (error: any) {
        return error?.response.data
    }
}
export const updatePropertyDetails = async (propertyId: string) => {
    try {
        const response = await axiosInstance.patch(`property-management/property/${propertyId}`)
        return response.data
    } catch (error: any) {
        return error?.response.data
    }
}
export const addPropertyVideo = async (propertyId: string, videoUrl: string, thumbnailUrl: string) => {
    try {
        const response = await axiosInstance.post(`property-management/property/video/property/${propertyId}`, {
            videoUrl,
            thumbnailUrl
        })
        return response.data
    } catch (error: any) {
        return error?.response.data
    }
}
export const deletePropertyVideo = async (propertyId: string) => {
    try {
        const response = await axiosInstance.delete(`property-management/property/video/property/${propertyId}`)
        return response.data
    } catch (error: any) {
        return error?.response.data
    }
}
export const getPropertyVideos = async (propertyId: string) => {
    try {
        const response = await axiosInstance.get(`property-management/property/video/property/${propertyId}`)
        return response.data
    } catch (error: any) {
        return error?.response.data
    }
}
