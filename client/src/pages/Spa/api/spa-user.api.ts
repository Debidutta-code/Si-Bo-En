import createAxiosInstance from "@/components/axiosInstance";

const axiosInstance = createAxiosInstance();

export const getSpaUsersForProperty = async (propertyId: string) => {
    try {
        const response = await axiosInstance.get(`/spa/users/property/${propertyId}/users`);
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
};

export const assignSpaToUser = async (spaId: string, userId: string) => {
    try {
        const response = await axiosInstance.post(`/spa/users/assign`, { spaId, userId });
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
};

export const removeUserFromSpa = async (spaId: string, userId: string) => {
    try {
        const response = await axiosInstance.post(`/spa/users/remove`, { spaId, userId });
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
};
