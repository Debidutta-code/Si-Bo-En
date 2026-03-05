import createAxiosInstance from "@/components/axiosInstance";
import type {
    ICChildAddoon,
    IUpdateChildAddon
} from "../interface/child-addon.type";


const axiosInstance = createAxiosInstance();


export const createChildAddon=async(childAddonData: ICChildAddoon)=>{
    try {
        const response = await axiosInstance.post("/addon/child-addons", childAddonData);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}
export const getAllChildAddons=async(addonId:string)=>{
    try {
        const response = await axiosInstance.get(`/addon/child-addons?addonId=${addonId}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }   
    }
}
export const updateChildAddon=async(childAddonId:string,childAddonData:IUpdateChildAddon)=>{
    try {
        const response = await axiosInstance.put(`/addon/child-addons/${childAddonId}`, childAddonData);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}
export const deleteChildAddon=async(childAddonId:string)=>{
    try {
        const response = await axiosInstance.delete(`/addon/child-addons/${childAddonId}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}
