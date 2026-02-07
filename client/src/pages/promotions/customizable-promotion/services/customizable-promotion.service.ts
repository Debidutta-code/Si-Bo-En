import {
  createCustomizableDeal,
  getCustomizableDealsByProperty,
  getCustomizableDealById,
  updateCustomizableDeal,
  deleteCustomizableDeal
} from "../apis";
import type { CreateCustomizableDeal, UpdateCustomizableDeal } from "../interfaces";

export async function createCustomizableDealService(payload: CreateCustomizableDeal, propertyId: string) {
  if (!propertyId) {
    return {
      success: false,
      message: "Property ID is required"
    };
  }

  if (!payload.discountType) {
    return {
      success: false,
      message: "Discount type is required"
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

  if (!payload.applicableRoomTypes || payload.applicableRoomTypes.length === 0) {
    return {
      success: false,
      message: "At least one room type must be selected"
    };
  }

  if (!payload.applicableRatePlans || payload.applicableRatePlans.length === 0) {
    return {
      success: false,
      message: "At least one rate plan must be selected"
    };
  }

  const result = await createCustomizableDeal(payload, propertyId);
  return result;
}

export async function getCustomizableDealsByPropertyService(propertyId: string) {
  if (!propertyId) {
    return {
      success: false,
      message: "Property ID is required"
    };
  }

  const result = await getCustomizableDealsByProperty(propertyId);
  return result;
}

export async function getCustomizableDealByIdService(dealId: string) {
  if (!dealId) {
    return {
      success: false,
      message: "Deal ID is required"
    };
  }

  const result = await getCustomizableDealById(dealId);
  return result;
}

export async function updateCustomizableDealService(dealId: string, payload: UpdateCustomizableDeal, propertyId: string) {
  if (!dealId) {
    return {
      success: false,
      message: "Deal ID is required"
    };
  }

  if (!propertyId) {
    return {
      success: false,
      message: "Property ID is required"
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

  if (payload.applicableRoomTypes !== undefined && payload.applicableRoomTypes.length === 0) {
    return {
      success: false,
      message: "At least one room type must be selected"
    };
  }

  if (payload.applicableRatePlans !== undefined && payload.applicableRatePlans.length === 0) {
    return {
      success: false,
      message: "At least one rate plan must be selected"
    };
  }

  const result = await updateCustomizableDeal(dealId, payload, propertyId);
  return result;
}

export async function deleteCustomizableDealService(dealId: string, propertyId: string) {
  if (!dealId) {
    return {
      success: false,
      message: "Deal ID is required"
    };
  }

  if (!propertyId) {
    return {
      success: false,
      message: "Property ID is required"
    };
  }

  const result = await deleteCustomizableDeal(dealId, propertyId);
  return result;
}