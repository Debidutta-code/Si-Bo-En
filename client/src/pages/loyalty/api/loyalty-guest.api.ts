import createAxiosInstance from "@/components/axiosInstance";
const axiosInstance = createAxiosInstance();



export const deleteLoyaltyGuest = async (loyaltyGuestId: string) => {
    try {
        const response = await axiosInstance.delete(`/loyalty/guest/${loyaltyGuestId}`);
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

export const getLoyaltyGuestsForProperty = async (propertyId: string, skip: number = 0, take: number = 10) => {
    try {
        const response = await axiosInstance.get(`/loyalty/guest/property/${propertyId}`, {
            params: { skip, take }
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

export const getLoyaltyGuestsForCreation = async (creationLoyaltyId: string, skip: number = 0, take: number = 10) => {
    try {
        const response = await axiosInstance.get(`/loyalty/guest/creation/${creationLoyaltyId}`, {
            params: { skip, take }
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
