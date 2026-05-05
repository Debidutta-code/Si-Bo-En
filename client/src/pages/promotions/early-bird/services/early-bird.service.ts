import {
  createEarlyBirdPromotion,
  getEarlyBirdPromotionsByProperty,
  getEarlyBirdPromotionById,
  updateEarlyBirdPromotion,
  deleteEarlyBirdPromotion,
  toggleEarlyBirdPromotionStatus
} from "../apis";
import type { CreateEarlyBirdPromotion, UpdateEarlyBirdPromotion } from "../interfaces";

export async function createEarlyBirdPromotionService(payload: CreateEarlyBirdPromotion) {
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

  const result = await createEarlyBirdPromotion(payload);
  return result;
}

export async function getEarlyBirdPromotionsByPropertyService(propertyId: string) {
  if (!propertyId) {
    return {
      success: false,
      message: "Property ID is required"
    };
  }

  const result = await getEarlyBirdPromotionsByProperty(propertyId);
  return result;
}

export async function getEarlyBirdPromotionByIdService(promotionId: string) {
  if (!promotionId) {
    return {
      success: false,
      message: "Promotion ID is required"
    };
  }

  const result = await getEarlyBirdPromotionById(promotionId);
  return result;
}

export async function updateEarlyBirdPromotionService(promotionId: string, payload: UpdateEarlyBirdPromotion) {
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

  const result = await updateEarlyBirdPromotion(promotionId, payload);
  return result;
}

export async function deleteEarlyBirdPromotionService(promotionId: string) {
  if (!promotionId) {
    return {
      success: false,
      message: "Promotion ID is required"
    };
  }

  const result = await deleteEarlyBirdPromotion(promotionId);
  return result;
}

export async function toggleEarlyBirdPromotionStatusService(promotionId: string, isActive: boolean) {
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

  const result = await toggleEarlyBirdPromotionStatus(promotionId, isActive);
  return result;
}