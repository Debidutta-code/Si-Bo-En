// api/inventory.api.ts

import createAxiosInstance from "@/components/axiosInstance";
import type { InventoryAnalysisFilters } from "../interfaces/inventory.interfaces";

export async function getInventoryAnalysis(
  propertyId: string,
  filters: InventoryAnalysisFilters,
) {
  const axiosInstance = createAxiosInstance();
  try {
    // ✅ CLEAN: Send filters in body
    const response = await axiosInstance.post(`/ari/analysis/calendar`, {
      propertyId,
      startDate: filters.startDate,
      endDate: filters.endDate,
      roomTypeCodes: filters.roomTypeCodes || [],
      ratePlanCodes: filters.ratePlanCodes || [],
    });
    return response.data;
  } catch (error: any) {
    if (!error?.response?.data?.success) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
}

export async function getAllRoomTypesWithRatePlans(propertyId: string) {
  const axiosInstance = createAxiosInstance();
  try {
    const response = await axiosInstance.get(
      `/property-management/property/${propertyId}/room/inv-setup`,
    );
    return response.data;
  } catch (error: any) {
    if (!error?.response?.data?.success) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
}

export async function updateRatePlanCharges(payload: {
  propertyCode: string;
  roomTypeCode: string;
  ratePlanCode: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  baseGuestAmounts: Array<{
    numberOfGuests: number;
    ageQualifyingCode: string;
    amountBeforeTax: number;
  }>;
  additionalGuestAmounts?: Array<{
    ageQualifyingCode: string;
    amount: number;
  }>;
}) {
  const axiosInstance = createAxiosInstance();
  try {
    const response = await axiosInstance.post(
      "/ari/inventory/update-or-create/charges",
      payload,
    );
    return response.data;
  } catch (error: any) {
    if (!error?.response?.data?.success) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
}

// ============================================
// BOOKING OFFSET API FUNCTIONS
// ============================================
import type {
  ICBookingOffsetS,
  IUBookingOffsetR,
} from "@/pages/booking-offset/interfaces";

export async function getBookingOffsetsApi(
  propertyId: string,
  ratePlanId: string,
  startDate: string | null,
  endDate: string | null,
) {
  const axiosInstance = createAxiosInstance();
  try {
    const query = new URLSearchParams();
    query.append("ratePlanId", ratePlanId);
    if (startDate) query.append("startDate", startDate);
    if (endDate) query.append("endDate", endDate);
    const response = await axiosInstance.get(
      `/ari/booking-offset/${propertyId}?${query.toString()}`,
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return { success: false, message: error?.message };
  }
}

export async function createBookingOffsetsApi(
  propertyId: string,
  ratePlanId: string,
  startDate: string,
  endDate: string,
  bookingOffsets: ICBookingOffsetS,
) {
  const axiosInstance = createAxiosInstance();
  try {
    const response = await axiosInstance.post(
      `/ari/booking-offset/${propertyId}`,
      { bookingOffsets, ratePlanId, startDate, endDate },
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return { success: false, message: error?.message };
  }
}

export async function updateBookingOffsetsApi(
  propertyId: string,
  ratePlanId: string,
  startDate: string,
  endDate: string,
  bookingOffsets: ICBookingOffsetS,
) {
  const axiosInstance = createAxiosInstance();
  try {
    const response = await axiosInstance.put(
      `/ari/booking-offset/${propertyId}`,
      { bookingOffsets, ratePlanId, startDate, endDate },
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return { success: false, message: error?.message };
  }
}

export async function updateBookingOffsetByIdApi(
  id: string,
  bookingOffsets: IUBookingOffsetR,
) {
  const axiosInstance = createAxiosInstance();
  try {
    const response = await axiosInstance.put(
      `/ari/booking-offset/single/${id}`,
      { id, bookingOffsets },
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return { success: false, message: error?.message };
  }
}

export async function upsertBookingOffsetsApi(
  propertyId: string,
  ratePlanId: string,
  entries: Array<{
    date: string;
    [key: string]: number | string | null | undefined;
  }>,
) {
  const axiosInstance = createAxiosInstance();
  try {
    const response = await axiosInstance.patch(
      `/ari/booking-offset/${propertyId}`,
      { ratePlanId, entries },
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return { success: false, message: error?.message };
  }
}
