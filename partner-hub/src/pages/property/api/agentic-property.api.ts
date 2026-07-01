import createAxiosInstance from "@/components/axiosInstance";

const axiosInstance = createAxiosInstance();

export const fetchProperties = async (location?: string, country?: string) => {
    try {
        const params: { location?: string; country?: string } = {};
        if (location) params.location = location;
        if (country) params.country = country;
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

