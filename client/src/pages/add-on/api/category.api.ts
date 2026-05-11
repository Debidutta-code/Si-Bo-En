import createAxiosInstance from "@/components/axiosInstance";
import type { IAddonCategoryCreate,IAddonCategoryUpdate } from "../interface";
const axiosInstance = createAxiosInstance();

export const fetchAddonCategories = async (propertyId: string) => {
    try {
        const response = await axiosInstance.get(`/addon/categories/?id=${propertyId}`);
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
export const createAddonCategory = async (categoryData: IAddonCategoryCreate, propertyId: string) => {
    try {
        const response = await axiosInstance.post(`/addon/categories?id=${propertyId}`, categoryData);
        return response.data;
    }
    catch (error: any) {
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


export const updateCategory = async (categoryId: string, updateData: IAddonCategoryUpdate) => {
    try {
        const response = await axiosInstance.put(`/addon/categories/${categoryId}`, updateData);
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
export const deleteCategory = async (categoryId: string) => {
    try {
        const response = await axiosInstance.delete(`/addon/categories/${categoryId}`);
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