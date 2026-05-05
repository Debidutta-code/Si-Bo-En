import createAxiosInstance from "@/components/axiosInstance";
import type { IAddonAvailabilityUpdate ,IAddonAvailabilityCreate} from "../interface";
const axiosInstance = createAxiosInstance();

export const createAddonAvailability = async (_addOnId: string, availabilityData: IAddonAvailabilityCreate) => {
    try {
        const response = await axiosInstance.post(`/addon/addon-datewise/`, availabilityData);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}

export const fetchAddonAvailabilities = async (addOnId: string) => {
    try {
        const response = await axiosInstance.get(`/addon/addon-datewise/addon/${addOnId}`);
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

export const updateAddonAvailability = async (addOnId: string, availabilityData: IAddonAvailabilityUpdate) => {
    try {
        const response = await axiosInstance.put(`/addon/addon-datewise/${addOnId}`, availabilityData);
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
export const deleteAddonAvailability = async (availabilityId: string) => {
    try {
        const response = await axiosInstance.delete(`/addon/addon-datewise/${availabilityId}`);
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