import createAxiosInstance from "@/components/axiosInstance";
import type {IAccess} from "../types/type"
export const getAllAccess = async () => {
    try {
        const axiosInstance = createAxiosInstance();
        const response = await axiosInstance.get(`/access/get-all`);
        return response.data
    } catch (error: any) {
        return error?.response?.data
    }
}
export const createNewRole=async(payload:IAccess)=>{
    try {
        const axiosInstance = createAxiosInstance();
        const response = await axiosInstance.post(`/access/createNewRole`,{data:payload});
        return response.data
    } catch (error: any) {
        return error?.response?.data
    }
}
export const modifyStaff=async(payload:IAccess)=>{
    try {
        const axiosInstance = createAxiosInstance();
        const response = await axiosInstance.put(`/access/modify/${payload.role}`,{data:payload});
        return response.data
    } catch (error: any) {
        return error?.response?.data
    }
}
export const getAccessByRole=async(payload:IAccess)=>{
    try {
        const axiosInstance = createAxiosInstance();
        const response = await axiosInstance.get(`/access/get/${payload.role}`);
        return response.data
    } catch (error: any) {
        return error?.response?.data
    }
}
export const getAllRoles=async()=>{
    try {
        const axiosInstance = createAxiosInstance();
        const response = await axiosInstance.get(`/access/get-all-roles`);
        // console.log(response)
        return response.data
    } catch (error: any) {
        return error?.response?.data
    }
}
export const deleteRole=async(role:string)=>{
    try {
        const axiosInstance = createAxiosInstance();
        const response = await axiosInstance.delete(`/access/delete/${role}`);
        return response.data
    } catch (error: any) {
        return error?.response?.data
    }

}