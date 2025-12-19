import AxiosInstance from "@/components/axiosInstance";
import type {ICreateUser} from "../types/types"
export const getRoles = async () => {
    try {
        const axiosInstance = AxiosInstance()
        const response = await axiosInstance.get(`/access/get-all-roles`)
        return response.data
    } catch (error: any) {
        return error?.response.data

    }
}
export const getUsers = async (page?: number, role?: string) => {
    try {
        const axiosInstance = AxiosInstance();
        const params = new URLSearchParams();
        if (page !== undefined) {
            params.append('page', page.toString());
        }
        if (role !== undefined) {
            params.append('role', role);
        }
        const response = await axiosInstance.get(`/user?${params.toString()}`);
        return response.data;
    } catch (error: any) {
        return error?.response.data;
    }
};
export const deleteUserById = async (userId: string) => {
    const axiosInstance = AxiosInstance();

    try {
        const response = await axiosInstance.delete(`/user/delete/${userId}`);
        return response.data;
    } catch (error: any) {
        return error?.response.data;
    }
}
export const updateUserById = async (userId: string, payload: any) => {
    const axiosInstance = AxiosInstance();

    try {
        const response = await axiosInstance.put(`/user/update/${userId}`, payload);
        return response.data;
    } catch (error: any) {
        return error?.response.data;
    }

}
export const getTypes = async (type: string) => {
    try {
        const axiosInstance = AxiosInstance();
        const response = await axiosInstance.post("/create/getAll", { type: type })
        return response.data
    } catch (error: any) {
        return error?.response?.data
    }
}
export const createUser=async(payload:ICreateUser)=>{
    const axiosInstance=AxiosInstance()
    try {
        const res=await axiosInstance.post("/auth/create-user",payload)
        return res.data
    } catch (error:any) {
        return error?.response?.data
    }
}