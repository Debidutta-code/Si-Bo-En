import axiosInstance from "@/components/axiosInstance";

interface StartStopSellResponse {
    success: boolean;
    message: string;
}

export const useStartStopSellService = async (
    propertyId: string,
    data: any
): Promise<StartStopSellResponse> => {
    try {
        const axios = axiosInstance();
        const response = await axios.patch(`/ari/start-stop-sell/${propertyId}`, {
            ...data,
            action: data.isSellStop ? 'stop' : 'start'
        });
        
        return {
            success: true,
            message: response.data.message || "Operation completed successfully"
        };
    } catch (error: any) {
        console.error("Start/Stop Sell Service Error:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to process start/stop sell"
        };
    }
};