import createAxiosInstance from "@/components/axiosInstance";
import type { ICompleteRecoveryProcess, IInitRecoveryProcess } from "../types";
const axios = createAxiosInstance();

export const initTransferProcessApi = async (payload: IInitRecoveryProcess) => {
    try {
        const response = await axios.post(`/property-management/transfer/init`, payload);
        return response.data
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

export const completeTransferProcessApi = async (payload: ICompleteRecoveryProcess) => {
    try {
        const response = await axios.post(`/property-management/transfer/complete`, payload);
        return response.data
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
