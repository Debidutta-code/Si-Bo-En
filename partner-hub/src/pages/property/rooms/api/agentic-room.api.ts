import createAxiosInstance from "@/components/axiosInstance";

const axiosInstance = createAxiosInstance();

export const fetchRoomsByPropertyId = async (
    agenticPropertyId: string,
    startDate: string,
    endDate: string
) => {
    try {
        const response = await axiosInstance.get(`/agent-platform/rooms/${agenticPropertyId}`, {
            params: {
                startDate,
                endDate
            }
        });
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
