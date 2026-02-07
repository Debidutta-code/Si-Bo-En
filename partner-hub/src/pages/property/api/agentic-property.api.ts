import createAxiosInstance from "@/components/axiosInstance";

const axiosInstance = createAxiosInstance();

export const fetchProperties = async () => {
    try {
        const response = await axiosInstance.get('/agent-platform/properties');
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


