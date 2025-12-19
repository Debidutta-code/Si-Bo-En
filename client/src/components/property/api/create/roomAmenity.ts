import createAxiosInstance from "@/components/axiosInstance";


export const getRoomAmenities=async(propertyId:string,roomId:string)=>{
    const axiosInstance=createAxiosInstance()
    try {
        const response=await axiosInstance.get(`/property-management/property/${propertyId}/room/aminity/${roomId}`)
        return response.data
    } catch (error:any) {
        return error?.response?.data
    }
}