import createAxiosInstance from "@/components/axiosInstance";
const axiosInstance=createAxiosInstance();
export const getRoomDetails=async(roomId:string,propertyId:string)=>{
    try {
        const response=await axiosInstance.get(`/property-management/property/${propertyId}/room/${roomId}`)
        return response.data
    } catch (error:any) {
        return error?.response.data
    }
}

export const add360ToRoom=async(propertyId:string,roomId:string,view360Link:string)=>{
    try {
        const response=await axiosInstance.put(`/property-management/property/${propertyId}/room/${roomId}`,{view360Link})
        return response.data
    } catch (error:any) {
        return error?.response.data
    }
}