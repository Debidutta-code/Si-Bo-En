// services/inventory.service.ts

import {
  getInventoryAnalysis,
  getAllRoomTypesWithRatePlans,
  updateRatePlanCharges,
  getBookingOffsetsApi,
  createBookingOffsetsApi,
  updateBookingOffsetsApi,
  updateBookingOffsetByIdApi,
  upsertBookingOffsetsApi,
} from "../api/api";
import type { InventoryAnalysisFilters } from "../interfaces/inventory.interfaces";
import type {
  ICBookingOffsetS,
  IUBookingOffsetR,
} from "@/pages/booking-offset/interfaces";

export async function fetchInventoryAnalysisService(
  propertyId: string,
  filters: InventoryAnalysisFilters,
) {
  // Validation
  if (!propertyId) {
    return {
      success: false,
      message: "Property ID is required",
    };
  }

  if (!filters.startDate || !filters.endDate) {
    return {
      success: false,
      message: "Start date and end date are required",
    };
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(filters.startDate) || !dateRegex.test(filters.endDate)) {
    return {
      success: false,
      message: "Dates must be in YYYY-MM-DD format",
    };
  }

  const result = await getInventoryAnalysis(propertyId, filters);
  return result;
}

export async function fetchRoomTypesWithRatePlansService(propertyId: string) {
  if (!propertyId) {
    return {
      success: false,
      message: "Property ID is required",
    };
  }

  const result = await getAllRoomTypesWithRatePlans(propertyId);
  return result;
}
export async function updateRatePlanChargesService(payload: {
  propertyCode: string;
  roomTypeCode: string;
  ratePlanCode: string;
  startDate: string;
  endDate: string;
  baseGuestAmounts: Array<{
    numberOfGuests: number;
    amountBeforeTax: number;
  }>;
  additionalGuestAmounts?: Array<{
    ageQualifyingCode: string;
    amount: number;
  }>;
}) {
  // Validation
  if (!payload.propertyCode) {
    return {
      success: false,
      message: "Property code is required",
    };
  }

  if (!payload.roomTypeCode) {
    return {
      success: false,
      message: "Room type code is required",
    };
  }

  if (!payload.ratePlanCode) {
    return {
      success: false,
      message: "Rate plan code is required",
    };
  }

  if (!payload.startDate || !payload.endDate) {
    return {
      success: false,
      message: "Start date and end date are required",
    };
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(payload.startDate) || !dateRegex.test(payload.endDate)) {
    return {
      success: false,
      message: "Dates must be in YYYY-MM-DD format",
    };
  }

  if (!payload.baseGuestAmounts || payload.baseGuestAmounts.length === 0) {
    return {
      success: false,
      message: "At least one base guest amount is required",
    };
  }

  // Validate base guest amounts
  for (const guest of payload.baseGuestAmounts) {
    if (!guest.numberOfGuests || guest.numberOfGuests < 1) {
      return {
        success: false,
        message: "Number of guests must be at least 1",
      };
    }
    if (guest.amountBeforeTax < 0) {
      return {
        success: false,
        message: "Amount before tax cannot be negative",
      };
    }
  }

  // Validate additional guest amounts if provided
  if (
    payload.additionalGuestAmounts &&
    payload.additionalGuestAmounts.length > 0
  ) {
    for (const charge of payload.additionalGuestAmounts) {
      if (!charge.ageQualifyingCode) {
        return {
          success: false,
          message: "Age qualifying code is required for additional charges",
        };
      }
      if (charge.amount < 0) {
        return {
          success: false,
          message: "Additional charge amount cannot be negative",
        };
      }
    }
  }

  const result = await updateRatePlanCharges(payload);
  return result;
}

// ============================================
// BOOKING OFFSET SERVICE FUNCTIONS
// ============================================

export async function fetchBookingOffsetsService(
  propertyId: string,
  ratePlanId: string,
  startDate: string | null,
  endDate: string | null,
) {
  if (!propertyId || !ratePlanId) {
    return {
      success: false,
      message: "Property ID and Rate Plan ID are required",
    };
  }
  return await getBookingOffsetsApi(propertyId, ratePlanId, startDate, endDate);
}

export async function createBookingOffsetsService(
  propertyId: string,
  ratePlanId: string,
  startDate: string,
  endDate: string,
  bookingOffsets: ICBookingOffsetS,
) {
  if (!propertyId || !ratePlanId || !startDate || !endDate || !bookingOffsets) {
    return { success: false, message: "Missing required parameters" };
  }
  return await createBookingOffsetsApi(
    propertyId,
    ratePlanId,
    startDate,
    endDate,
    bookingOffsets,
  );
}

export async function updateBookingOffsetsService(
  propertyId: string,
  ratePlanId: string,
  startDate: string,
  endDate: string,
  bookingOffsets: ICBookingOffsetS,
) {
  if (!propertyId || !ratePlanId || !startDate || !endDate || !bookingOffsets) {
    return { success: false, message: "Missing required parameters" };
  }
  return await updateBookingOffsetsApi(
    propertyId,
    ratePlanId,
    startDate,
    endDate,
    bookingOffsets,
  );
}

export async function updateBookingOffsetByIdService(
  id: string,
  bookingOffsets: IUBookingOffsetR,
) {
  if (!id || !bookingOffsets) {
    return { success: false, message: "Missing required parameters" };
  }
  return await updateBookingOffsetByIdApi(id, bookingOffsets);
}

export async function upsertBookingOffsetsService(
  propertyId: string,
  ratePlanId: string,
  entries: Array<{
    date: string;
    [key: string]: number | string | null | undefined;
  }>,
) {
  if (!propertyId || !ratePlanId || !entries || entries.length === 0) {
    return { success: false, message: "Missing required parameters" };
  }
  return await upsertBookingOffsetsApi(propertyId, ratePlanId, entries);
}
