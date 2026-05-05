import {
  getBookingOffsets,
  createBookingOffset,
  updateBookingOffsets,
  deleteBookingOffsets,
  updateBookingOffsetById,
  deleteBookingOffsetById,
} from "../api";
import type { ICBookingOffsetS, IUBookingOffsetR } from "../interfaces";

export const getBookingOffsetsService = async (
  propertyId: string,
  ratePlanId: string | null,
  startDate: string|null  ,
  endDate: string|null,
) => {
  try {
    if (!propertyId ) {
      return {
        success: false,
        message: "Missing required parameters",
      };
    }
    return await getBookingOffsets(propertyId, ratePlanId?ratePlanId:null, startDate?startDate:null, endDate?endDate:null);
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch booking offsets",
    };
  }
};
export const createBookingOffsetService = async (
  propertyId: string,
  ratePlanId: string,
  startDate: string,
  endDate: string,
  bookingOffsets: ICBookingOffsetS,
) => {
  try {
    if (
      !propertyId ||
      !ratePlanId ||
      !startDate ||
      !endDate ||
      !bookingOffsets
    ) {
      return {
        success: false,
        message: "Missing required parameters",
      };
    }
    return await createBookingOffset(
      propertyId,
      ratePlanId,
      startDate,
      endDate,
      bookingOffsets,
    );
  } catch (error) {
    return {
      success: false,
      message: "Failed to create booking offsets",
    };
  }
};
export const updateBookingOffsetsService = async (
  propertyId: string,
  ratePlanId: string,
  startDate: string,
  endDate: string,
  bookingOffsets: ICBookingOffsetS,
) => {
  try {
    if (
      !propertyId ||
      !ratePlanId ||
      !startDate ||
      !endDate ||
      !bookingOffsets
    ) {
      return {
        success: false,
        message: "Missing required parameters",
      };
    }
    return await updateBookingOffsets(
      propertyId,
      ratePlanId,
      startDate,
      endDate,
      bookingOffsets,
    );
  } catch (error) {
    return {
      success: false,
      message: "Failed to update booking offsets",
    };
  }
};
export const deleteBookingOffsetsService = async (
  propertyId: string,
  ratePlanId: string,
  startDate: string,
  endDate: string,
) => {
  try {
    if (!propertyId || !ratePlanId || !startDate || !endDate) {
      return {
        success: false,
        message: "Missing required parameters",
      };
    }
    return await deleteBookingOffsets(
      propertyId,
      ratePlanId,
      startDate,
      endDate,
    );
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete booking offsets",
    };
  }
};
export const updateBookingOffsetByIdService = async (
  id: string,
  bookingOffsets: IUBookingOffsetR,
) => {
  try {
    if (!id || !bookingOffsets) {
      return {
        success: false,
        message: "Missing required parameters",
      };
    }
    return await updateBookingOffsetById(id, bookingOffsets);
  } catch (error) {
    return {
      success: false,
      message: "Failed to update booking offset",
    };
  }
};
export const deleteBookingOffsetByIdService = async (id: string) => {
  try {
    if (!id) {
      return {
        success: false,
        message: "Missing required parameters",
      };
    }
    return await deleteBookingOffsetById(id);
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete booking offset",
    };
  }
};
