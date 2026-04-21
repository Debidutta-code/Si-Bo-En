import createAxiosInstance from "@/components/axiosInstance";
import type { ICSpaCatrgory, ICSpaSubCategory, IUSpaSubCategory } from "../types";
const axiosInstance = createAxiosInstance();

export const createSpaCategory = async (data: ICSpaCatrgory) => {
    try {
        const response = await axiosInstance.post("/utils-management/spa/category", data);
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
};
export const getAllSpaCategory = async () => {
    try {
        const response = await axiosInstance.get("/utils-management/spa/category");
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
};
export const updateSpaCategory = async (id: string, data: ICSpaCatrgory) => {
    try {
        const response = await axiosInstance.put(`/utils-management/spa/category/${id}`, data);
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
};
export const deleteSpaCategory = async (id: string) => {
    try {
        const response = await axiosInstance.delete(`/utils-management/spa/category/${id}`);
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
};

export const createSpaSubCategory = async (data: ICSpaSubCategory) => {
    try {
        const response = await axiosInstance.post("/utils-management/spa/sub-category", data);
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
};
export const getAllSpaSubCategories = async (categoryId?: string) => {
    try {
        const response = await axiosInstance.get(`/utils-management/spa/sub-category?categoryId=${categoryId}`);
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
};
export const updateSpaSubCategory = async (id: string, data: IUSpaSubCategory) => {
    try {
        const response = await axiosInstance.put(`/utils-management/spa/sub-category/${id}`, data);
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
};
export const deleteSpaSubCategory = async (id: string) => {
    try {
        const response = await axiosInstance.delete(`/utils-management/spa/sub-category/${id}`);
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
};
