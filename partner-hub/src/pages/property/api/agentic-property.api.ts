import createAxiosInstance from "@/components/axiosInstance";

const axiosInstance = createAxiosInstance();

export const fetchProperties = async (location?: string) => {
    try {
        const params = location ? { location } : {};
        const response = await axiosInstance.get('/agent-platform/properties', { params });
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return { success: false, message: error?.message };
        }
    }
};


