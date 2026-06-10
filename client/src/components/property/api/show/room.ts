import AxiosInstance from "@/components/axiosInstance";
import type {IRoomDetails} from "../../create/types/types"
export const updateRoom = async (propertyId: string,roomId:string,payload:IRoomDetails) => {
    const axiosInstance = AxiosInstance()
    try {
        const response = await axiosInstance.patch(`property-management/property/${propertyId}/room/${roomId}`,payload)
        return response.data
    } catch (error: any) {
        return error?.response.data
    }
}
export const deleteRoom = async (propertyId: string,roomId:string) => {
    const axiosInstance = AxiosInstance()
    try {
        const response = await axiosInstance.delete(`property-management/property/${propertyId}/room/${roomId}`)
        return response.data
    } catch (error: any) {
        return error?.response.data
    }
}
export const createRoom=async(propertyId:string,roomDetails:IRoomDetails)=>{
    const axiosInstance = AxiosInstance()
    try {
        const response=await axiosInstance.post(`/property-management/property/${propertyId}/room`,roomDetails);
        return response.data
    } catch (error:any) {
        return error?.response?.data
    }
}

export const updateRoomAmenity = async (propertyId: string,roomId:string,amenities:any) => {
    const axiosInstance = AxiosInstance()
    try {
        const response = await axiosInstance.patch(`property-management/property/${propertyId}/room/aminity/${roomId}`,{amenities:amenities})
        return response.data
    } catch (error: any) {
        return error?.response.data
    }
}
export const createRoomAmenity=async(propertyId:string,roomId:string,amenity:any)=>{
    const axiosInstance=AxiosInstance()
    try {
        const response=await axiosInstance.post(`/property-management/property/${propertyId}/room/aminity/${roomId}`,{amenities:amenity})
        return response.data
    } catch (error:any) {
        return error?.response.data
    }
}

export const addVideoToRoom = async (roomId: string, videoUrl: string, thumbnailUrl: string) => {
    const axiosInstance = AxiosInstance()
    try {
        const response = await axiosInstance.post(`/property-management/property/video/room/${roomId}`, {
            videoUrl,
            thumbnailUrl
        })
        return response.data
    } catch (error: any) {
        return error?.response.data
    }
}
export const deleteRoomVideo = async (roomId: string) => {
    const axiosInstance = AxiosInstance()
    try {
        const response = await axiosInstance.delete(`/property-management/property/video/room/${roomId}`)
        return response.data
    } catch (error: any) {
        return error?.response.data
    }
}

export const getRoomVideos = async (roomId: string) => {
    const axiosInstance = AxiosInstance()
    try {
        const response = await axiosInstance.get(`/property-management/property/video/room/${roomId}`)
        return response.data
    } catch (error: any) {
        return error?.response.data
    }
}
export const recoveryRoom=async(propertyId:string,roomId:string)=>{
    const axiosInstance=AxiosInstance()
    try {
        const response=await axiosInstance.post(`/property-management/property/${propertyId}/room/${roomId}`)
        return response.data
    } catch (error:any) {
        return error?.response.data
    }
}