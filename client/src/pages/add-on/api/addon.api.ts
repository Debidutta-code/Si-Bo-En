import createAxiosInstance from "@/components/axiosInstance";
import type { IAddonCreate, IAddonUpdate } from "../interface"
import { data } from "react-router-dom";
const axiosInstance = createAxiosInstance();
export const fetchAddOns = async (propertyId: string) => {
    try {
        const response = await axiosInstance.get(`/addon/addons/property/${propertyId}`);
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
export const createAddOn = async (addOnData: IAddonCreate, propertyId: string) => {
    try {
        console.log(data)
        const response = await axiosInstance.post('/addon/addons', { ...addOnData, propertyId: propertyId });
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
export const updateAddOn = async (addOnId: string, updateData: IAddonUpdate) => {
    try {
        const response = await axiosInstance.put(`/addon/addons/${addOnId}`, updateData);
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
export const deleteAddOn = async (addOnId: string) => {
    try {
        const response = await axiosInstance.delete(`/addon/addons/${addOnId}`);
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