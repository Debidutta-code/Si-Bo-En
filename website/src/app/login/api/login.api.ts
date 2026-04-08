import axios from "axios";
import { loginPayload } from "../types";

const BASE = `${process.env.NEXT_PUBLIC_BACKEND_URL}/loyalit-guest`;

export const loginApi = async (body: loginPayload) => {
    try {
        const response = await axios.post(`${BASE}/login`, body,{withCredentials:true});
        return response.data;
    } catch (error: any) {
        return error?.response?.data ?? { success: false, message: error?.message };
    }
};

export const loginWithEmail = async (email: string) => {
    try {
        const response = await axios.post(`${BASE}/login-with-email`, { email });
        return response.data;
    } catch (error: any) {
        return error?.response?.data ?? { success: false, message: error?.message };
    }
};
export const verifyOtpApi = async (email: string, otp: string) => {
    try {
        const response = await axios.post(`${BASE}/verification/verify-otp`, {
            email,
            otp,
            purpose: "login",
        });
        return response.data;
    } catch (error: any) {
        return error?.response?.data ?? { success: false, message: error?.message };
    }
};
export const updatePasswordApi = async (email: string, password: string) => {
    try {
        const response = await axios.patch(`${BASE}/update-password`, {
            email,
            password,
        });
        return response.data;
    } catch (error: any) {
        return error?.response?.data ?? { success: false, message: error?.message };
    }
};