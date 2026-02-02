import {
  createMobilePromotion,
  getMobilePromotionByRatePlanId,
  getMobilePromotionsByPropertyId,
  updateMobilePromotion,
  deleteMobilePromotion
} from "../apis";
import type { CreateMobilePromotion, UpdateMobilePromotion } from "../interfaces";

export async function createMobilePromotionService(payload: CreateMobilePromotion) {
  if (!payload.ratePlanId) {
    return {
      success: false,
      message: "Rate Plan ID is required"
    };
  }
  if (!payload.promotionName) {
    return {
      success: false,
      message: "Promotion Name is required"
    };
  }
  if (!payload.discountPercentage || payload.discountPercentage <= 0) {
    return {
      success: false,
      message: "Valid discount percentage is required"
    };
  }
  const result = await createMobilePromotion(payload);
  return result;
}

export async function getMobilePromotionByRatePlanIdService(ratePlanId: string) {
  if (!ratePlanId) {
    return {
      success: false,
      message: "Rate Plan ID is required"
    };
  }
  const result = await getMobilePromotionByRatePlanId(ratePlanId);
  return result;
}

export async function getMobilePromotionsByPropertyIdService(propertyId: string) {
  if (!propertyId) {
    return {
      success: false,
      message: "Property ID is required"
    };
  }
  const result = await getMobilePromotionsByPropertyId(propertyId);
  return result;
}

export async function updateMobilePromotionService(ratePlanId: string, payload: UpdateMobilePromotion) {
  if (!ratePlanId) {
    return {
      success: false,
      message: "Rate Plan ID is required"
    };
  }
  const result = await updateMobilePromotion(ratePlanId, payload);
  return result;
}

export async function deleteMobilePromotionService(ratePlanId: string) {
  if (!ratePlanId) {
    return {
      success: false,
      message: "Rate Plan ID is required"
    };
  }
  const result = await deleteMobilePromotion(ratePlanId);
  return result;
}