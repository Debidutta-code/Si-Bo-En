import createAxiosInstance from "@/components/axiosInstance";

const axiosInstance = createAxiosInstance();

export const fetchRoomsByPropertyId = async (
    agenticPropertyId: string,
    startDate: string,
    endDate: string,
    guests: {                                    // ← add this param
        adults: number;
        children: number;
        rooms: number;
        roomsArray: { adults: number; children: number; childAges: number[] }[];
    }
) => {
    try {
        const response = await axiosInstance.post(`/agent-platform/rooms/${agenticPropertyId}`, {
            startDate,
            endDate,
            guests,                              // ← was `guests: roomsArray` (broken)
        });
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        }
        return { success: false, message: error?.message };
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