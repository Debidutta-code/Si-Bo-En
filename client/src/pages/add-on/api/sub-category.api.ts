import createAxiosInstance from "@/components/axiosInstance";
import type { IAddonSubCategoryCreate ,IAddonSubCategoryUpdate} from "../interface";
const axiosInstance = createAxiosInstance();

export const fetchAddonSubCategories = async () => {
    try {
        const response = await axiosInstance.get('/addon/sub-categories');
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
export const createAddonSubCategory = async (subCategoryData: IAddonSubCategoryCreate) => {
    try {
        const response = await axiosInstance.post('/addon/sub-categories', subCategoryData);
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
export const updateSubCategory = async (subCategoryId: string, updateData: IAddonSubCategoryUpdate) => {
    try {
        const response = await axiosInstance.put(`/addon/sub-categories/${subCategoryId}`, updateData);
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
export const deleteSubCategory = async (subCategoryId: string) => {
    try {
        const response = await axiosInstance.delete(`/addon/sub-categories/${subCategoryId}`);
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