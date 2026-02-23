import createAxiosInstance from "@/components/axiosInstance";

export interface LoyaltyGuestRegisterPayload {
  email: string;
  propertyId: string;
  metadata: Record<string, string>;
}

export const registerLoyaltyGuest = async (
  payload: LoyaltyGuestRegisterPayload,
) => {
  const axiosInstance = createAxiosInstance();

  try {
    const response = await axiosInstance.post(
      "/loyalty/guest/register",
      payload,
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error?.message || "Registration failed",
    };
  }
};
