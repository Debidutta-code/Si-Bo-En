// api/inventory.api.ts

import createAxiosInstance from "@/components/axiosInstance";
import type { 
  InventoryAnalysisFilters, 
} from "../interfaces/inventory.interfaces";

export async function getInventoryAnalysis(
  propertyId: string,
  filters: InventoryAnalysisFilters
) {
  const axiosInstance = createAxiosInstance();
  try {
    const params = new URLSearchParams();
    params.append('propertyId', propertyId);
    params.append('startDate', filters.startDate);
    params.append('endDate', filters.endDate);
    
    if (filters.roomTypeCode) {
      params.append('roomTypeCode', filters.roomTypeCode);
    }
    
    const response = await axiosInstance.get(
      `/ari/analysis/calendar?${params.toString()}`
    );
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

export async function getAllRoomTypesWithRatePlans(
  propertyId: string
) {
  const axiosInstance = createAxiosInstance();
  try {
    const response = await axiosInstance.get(
      `/property-management/property/${propertyId}/room/inv-setup`
    );
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


export async function updateRatePlanCharges(payload: {
  propertyCode: string;
  roomTypeCode: string;
  ratePlanCode: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
  baseGuestAmounts: Array<{
    numberOfGuests: number;
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
      '/ari/inventory/update-or-create/charges',
      payload
    );
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