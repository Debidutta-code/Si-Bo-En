import createAxiosInstance from "@/components/axiosInstance";
import type { IAgentLogin } from "../interface";

const axiosInstance = createAxiosInstance();

export const login = async (loginData: IAgentLogin) => {
    try {
        const response = await axiosInstance.post('/agent-platform/auth/login', loginData);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
};
export const getMe = async () => {
    try {
        const response = await axiosInstance.get('/agent-platform/auth/me');
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
};

export const logout = async () => {
    try {
        const response = await axiosInstance.post('/agent-platform/auth/logout');
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
};
