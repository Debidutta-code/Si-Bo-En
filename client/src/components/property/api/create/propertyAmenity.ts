import createAxiosInstance from "@/components/axiosInstance";

export const getPropertyAmenity=async(propertyId:string) =>{
    const axiosInstance=createAxiosInstance()
    try {
        const response=await axiosInstance.get(`/property-management/property/${propertyId}/amenity`)
        return response.data
    } catch (error:any) {
        return error?.response.data
    }
}
export const setPropertyAmenity=async(propertyId:string,amenities:any) =>{
    const axiosInstance=createAxiosInstance()
    try {
        const response=await axiosInstance.post(`/property-management/property/${propertyId}/amenity`,{amenities:amenities})
        return response.data
    } catch (error:any) {
        return error?.response.data
    }
}
export const updatePropertyAmenity=async(propertyId:string,amenities:any) =>{
    const axiosInstance=createAxiosInstance()
    try {
        const response=await axiosInstance.patch(`/property-management/property/${propertyId}/amenity`,{amenities:amenities})
        return response.data
    } catch (error:any) {
        return error?.response.data
    }
}
export const getAmenities=async(type:string="property") =>{
    const axiosInstance=createAxiosInstance()
    try {
        const response=await axiosInstance.get(`/property-management/property/management/amenity/get?type=${type}`)
        return response.data
    } catch (error:any) {
        return error?.response.data
    }
}
