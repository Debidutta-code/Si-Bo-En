import createAxiosInstance from "@/components/axiosInstance";
import type { IAddonVariantCreate,IAddonVariantUpdate} from "../interface"
const axiosInstance = createAxiosInstance();

export const fetchAddonVariants = async () => {
    try {
        const response = await axiosInstance.get('/addon/variants');
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
export const createAddonVariant = async (variantData: IAddonVariantCreate) => {
    try {
        const response = await axiosInstance.post('/addon/variants', variantData);
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
export const updateVariant = async (variantId: string, updateData: IAddonVariantUpdate) => {
    try {
        const response = await axiosInstance.put(`/addon/variants/${variantId}`, updateData);
        return response.data;
    }catch (error: any) {
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
export const deleteVariant = async (variantId: string) => {
    try {
        const response = await axiosInstance.delete(`/addon/variants/${variantId}`);
        return response.data;
    }catch (error: any) {
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