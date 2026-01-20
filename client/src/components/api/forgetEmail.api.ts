import createAxiosInstance from "../axiosInstance";

const axiosInstance = createAxiosInstance();

// Send OTP to email for password reset
export const sendPasswordResetOTP = async (email: string) => {
    try {
        const response = await axiosInstance.post("/user/forgot-password", { 
            email,
            useLinkMethod: false // Use OTP method
        });
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

// Send password reset link to email
export const sendPasswordResetLink = async (email: string) => {
    try {
        const response = await axiosInstance.post("/user/forgot-password", { 
            email,
            useLinkMethod: true // Use link method
        });
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

// Verify OTP for password reset
export const verifyPasswordResetOTP = async (email: string, otp: string) => {
    try {
        const response = await axiosInstance.post("/user/verify-reset-otp", { email, otp });
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

// Reset password with OTP verification
export const resetPassword = async (email: string, otp: string, newPassword: string) => {
    try {
        const response = await axiosInstance.post("/user/reset-password", {
            email,
            otp,
            newPassword
        });
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

// Verify reset token (for link-based reset)
export const verifyResetToken = async (token: string) => {
    try {
        const response = await axiosInstance.post("/user/verify-reset-token", { token });
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

// Reset password with token (for link-based reset)
export const resetPasswordWithToken = async (token: string, password: string) => {
    try {
        const response = await axiosInstance.post("/user/reset-password-with-token", {
            token,
            password
        });
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
