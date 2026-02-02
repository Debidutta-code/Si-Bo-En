import {
  createOfferForTonight,
  getOfferForTonightByProperty,
  getOfferForTonightById,
  updateOfferForTonight,
  deleteOfferForTonight,
  toggleOfferForTonightStatus
} from "../apis";
import type { CreateOfferForTonight, UpdateOfferForTonight } from "../interfaces";

export async function createOfferForTonightService(payload: CreateOfferForTonight) {
  if (!payload.propertyId) {
    return {
      success: false,
      message: "Property ID is required"
    };
  }

  if (!payload.promotionName) {
    return {
      success: false,
      message: "Promotion name is required"
    };
  }

  if (!payload.validFrom) {
    return {
      success: false,
      message: "Valid from date is required"
    };
  }

  if (!payload.roomRatePlans || payload.roomRatePlans.length === 0) {
    return {
      success: false,
      message: "At least one room-rateplan pair is required"
    };
  }

  if (payload.discountValue === undefined || payload.discountValue <= 0) {
    return {
      success: false,
      message: "Discount value must be greater than 0"
    };
  }

  if (payload.discountType === 'percentage' && payload.discountValue > 100) {
    return {
      success: false,
      message: "Percentage discount cannot be more than 100"
    };
  }

  const result = await createOfferForTonight(payload);
  return result;
}

export async function getOfferForTonightByPropertyService(propertyId: string) {
  if (!propertyId) {
    return {
      success: false,
      message: "Property ID is required"
    };
  }

  const result = await getOfferForTonightByProperty(propertyId);
  return result;
}

export async function getOfferForTonightByIdService(promotionId: string) {
  if (!promotionId) {
    return {
      success: false,
      message: "Promotion ID is required"
    };
  }

  const result = await getOfferForTonightById(promotionId);
  return result;
}

export async function updateOfferForTonightService(promotionId: string, payload: UpdateOfferForTonight) {
  if (!promotionId) {
    return {
      success: false,
      message: "Promotion ID is required"
    };
  }

  if (payload.discountValue !== undefined) {
    if (payload.discountValue <= 0) {
      return {
        success: false,
        message: "Discount value must be greater than 0"
      };
    }

    if (payload.discountType === 'percentage' && payload.discountValue > 100) {
      return {
        success: false,
        message: "Percentage discount cannot be more than 100"
      };
    }
  }

  const result = await updateOfferForTonight(promotionId, payload);
  return result;
}

export async function deleteOfferForTonightService(promotionId: string) {
  if (!promotionId) {
    return {
      success: false,
      message: "Promotion ID is required"
    };
  }

  const result = await deleteOfferForTonight(promotionId);
  return result;
}

export async function toggleOfferForTonightStatusService(promotionId: string, isActive: boolean) {
  if (!promotionId) {
    return {
      success: false,
      message: "Promotion ID is required"
    };
  }

  if (typeof isActive !== 'boolean') {
    return {
      success: false,
      message: "isActive must be a boolean value"
    };
  }

  const result = await toggleOfferForTonightStatus(promotionId, isActive);
  return result;
}