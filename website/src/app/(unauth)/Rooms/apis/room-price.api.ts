import {
  IGetPricePayload,
  IGetPriceResponse,
  IAvailableAddonsResponse,
} from "@/src/app/(unauth)/Rooms/types";
import createAxiosInstance from "@/src/components/axiosInstance";

const axiosInstance = createAxiosInstance();

// ─── Fetch available addons ───────────────────────────────────────────────────

export const fetchAvailableAddonsApi = async (
  propertyCode: string,
  startDate: string,
  endDate: string,
  ratePlanCode: string
): Promise<IAvailableAddonsResponse> => {
  try {
    const response = await axiosInstance.get<IAvailableAddonsResponse>(
      `/addon/addon-datewise/available`,
      { params: { propertyCode, startDate, endDate, ratePlanCode } }
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) return error.response.data;
    return {
      success: false,
      message: error?.message ?? "Failed to fetch available addons.",
      data: [],
    };
  }
};

// ─── Fetch room price ─────────────────────────────────────────────────────────

export const fetchRoomPriceApi = async (
  payload: IGetPricePayload,
  loyaltyToggleOn: boolean
): Promise<IGetPriceResponse> => {
  try {
    const response = await axiosInstance.post<IGetPriceResponse>(
      `/booking-engine/pricing/get-price`,
      payload,
      { withCredentials: loyaltyToggleOn }
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) return error.response.data;
    return {
      success: false,
      message: error?.message ?? "Failed to fetch room price.",
      data: null as any,
    };
  }
};