import createAxiosInstance from "@/components/axiosInstance";

const axiosInstance= createAxiosInstance();

export async function getRatePlanRulesByPropertyId(propertyId: string) {
    try {
        const response = await axiosInstance.get(`/promotions/mlos/property/${propertyId}`);
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
}