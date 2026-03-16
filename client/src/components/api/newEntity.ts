import createAxiosInstance from "../axiosInstance";
import type {INewGBP} from "@/pages/property/types/types"
export const createEntity=async(payload:INewGBP)=>{
try {
    const axiosInstance=createAxiosInstance()
    const response=await axiosInstance.post("/create",payload);
    return response.data
} catch (error:any) {
    return error?.response?.data
}
}
export const getAllCustoms=async()=>{
    try {
        const axiosInstance=createAxiosInstance()
        const response=await axiosInstance.get(`/create/getAll?type=custom&&isActive=true`);
        return response.data
    } catch (error:any) {
        return error?.response?.data
    }
}