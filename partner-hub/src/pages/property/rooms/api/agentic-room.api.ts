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
export const getAgentPricing = async (pricingData: {
    propertyCode: string;
    invTypeCode: string;
    startDate: string;
    endDate: string;
    ratePlanCode: string;
    noOfAdults: number;
    noOfChildren: number;
    noOfRooms: number;
}) => {
    try {
        const response = await axiosInstance.post('/agent-platform/pricing/get-pricing', pricingData);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message || 'Failed to get pricing'
            };
        }
    }
};