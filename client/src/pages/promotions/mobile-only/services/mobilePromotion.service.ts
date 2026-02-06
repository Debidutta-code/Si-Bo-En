import {
  createDeviceSpecificPromotion,
  getDeviceSpecificPromotionById,
  getDeviceSpecificPromotionsByProperty,
  updateDeviceSpecificPromotion,
  deleteDeviceSpecificPromotion,
  toggleDeviceSpecificPromotionStatus
} from "../apis";
import type { CreateDeviceSpecificPromotion, UpdateDeviceSpecificPromotion } from "../interfaces";

export async function createDeviceSpecificPromotionService(payload: CreateDeviceSpecificPromotion) {
  // Validation
  if (!payload.propertyId) {
    return {
      success: false,
      message: "Property ID is required"
    };
  }
  
  if (!payload.ratePlanId || !payload.ratePlanCode) {
    return {
      success: false,
      message: "Rate Plan is required"
    };
  }
  
  if (!payload.promotionName) {
    return {
      success: false,
      message: "Promotion Name is required"
    };
  }
  
  if (!payload.deviceType || payload.deviceType.length === 0) {
    return {
      success: false,
      message: "At least one device type is required"
    };
  }
  
  if (!payload.discountType) {
    return {
      success: false,
      message: "Discount type is required"
    };
  }
  
  if (!payload.discountValue || payload.discountValue <= 0) {
    return {
      success: false,
      message: "Valid discount value is required"
    };
  }
  
  if (payload.discountType === 'percentage' && payload.discountValue > 100) {
    return {
      success: false,
      message: "Percentage discount cannot exceed 100%"
    };
  }
  
  if (payload.discountType === 'flat' && !payload.currencyCode) {
    return {
      success: false,
      message: "Currency code is required for flat discount"
    };
  }
  
  if (!payload.validFrom) {
    return {
      success: false,
      message: "Start date is required"
    };
  }
  
  // Check if at least one day is selected
  const hasAtLeastOneDay = [
    payload.monApplicable,
    payload.tueApplicable,
    payload.wedApplicable,
    payload.thuApplicable,
    payload.friApplicable,
    payload.satApplicable,
    payload.sunApplicable
  ].some(day => day === true);
  
  if (!hasAtLeastOneDay) {
    return {
      success: false,
      message: "At least one day must be selected"
    };
  }
  
  const result = await createDeviceSpecificPromotion(payload);
  return result;
}

export async function getDeviceSpecificPromotionByIdService(promotionId: string) {
  if (!promotionId) {
    return {
      success: false,
      message: "Promotion ID is required"
    };
  }
  const result = await getDeviceSpecificPromotionById(promotionId);
  return result;
}

export async function getDeviceSpecificPromotionsByPropertyService(propertyId: string) {
  if (!propertyId) {
    return {
      success: false,
      message: "Property ID is required"
    };
  }
  const result = await getDeviceSpecificPromotionsByProperty(propertyId);
  return result;
}

export async function updateDeviceSpecificPromotionService(promotionId: string, payload: UpdateDeviceSpecificPromotion) {
  if (!promotionId) {
    return {
      success: false,
      message: "Promotion ID is required"
    };
  }
  
  if (payload.discountType === 'percentage' && payload.discountValue && payload.discountValue > 100) {
    return {
      success: false,
      message: "Percentage discount cannot exceed 100%"
    };
  }
  
  if (payload.discountType === 'flat' && payload.discountValue && !payload.currencyCode) {
    return {
      success: false,
      message: "Currency code is required for flat discount"
    };
  }
  
  const result = await updateDeviceSpecificPromotion(promotionId, payload);
  return result;
}

export async function deleteDeviceSpecificPromotionService(promotionId: string) {
  if (!promotionId) {
    return {
      success: false,
      message: "Promotion ID is required"
    };
  }
  const result = await deleteDeviceSpecificPromotion(promotionId);
  return result;
}

export async function toggleDeviceSpecificPromotionStatusService(promotionId: string, isActive: boolean) {
  if (!promotionId) {
    return {
      success: false,
      message: "Promotion ID is required"
    };
  }
  const result = await toggleDeviceSpecificPromotionStatus(promotionId, isActive);
  return result;
}