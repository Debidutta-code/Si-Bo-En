import {
    login,
    getMe,
    logout
} from "../api";
import type { IAgentLogin } from "../interface";


export const loginService = async (data: IAgentLogin) => {
    try {
        if (!data.email || data.email.trim() === "") {
            return { success: false, message: "Email is required." };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return { success: false, message: "Invalid email format." };
        }

        if (!data.password || data.password.trim() === "") {
            return { success: false, message: "Password is required." };
        }

        const response = await login(data);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to login." };
    }
};

export const getMeService = async () => {
    try {
        const response = await getMe();
        return response;
    } catch (error) {
        return { success: false, message: "Failed to fetch agent details." };
    }
};

export const logoutService = async () => {
    try {
        const response = await logout();
        return response;
    } catch (error) {
        return { success: false, message: "Failed to logout." };
    }
};
