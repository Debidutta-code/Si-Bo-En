import { createGeoRatePlan, deleteGeoRatePlan, getGeoRatePlanById, getGeoRatePlans, toggleGeoRatePlanStatus, updateGeoRatePlan } from "../apis";
import type { CreateGeoRatePlan, UpdateGeoRatePlan } from "../interfaces";

export async function createGeoRatePlanService(payload: CreateGeoRatePlan) {
  if (!payload.propertyId) {
    return {
      success: false,
      message: "Property ID is required"
    };
  }

  if (!payload.rooms || payload.rooms.length === 0) {
    return {
      success: false,
      message: "At least one room is required"
    };
  }

  if (!payload.ratePlans || payload.ratePlans.length === 0) {
    return {
      success: false,
      message: "At least one rate plan is required"
    };
  }

  if (!payload.countryCode || payload.countryCode.length === 0) {
    return {
      success: false,
      message: "At least one country code is required"
    };
  }

  // Validate based on restriction type
  if (payload.restrictionType === "restricted") {
    // For restricted, no value or action needed
    payload.restrictionValue = null;
    payload.restrictionTypeAction = null;
    payload.currencyCode = null;
  } else if (payload.restrictionType === "percentage") {
    // For percentage, need value and action, but no currency
    if (!payload.restrictionValue || payload.restrictionValue <= 0) {
      return {
        success: false,
        message: "Restriction value is required for percentage type"
      };
    }
    if (payload.restrictionValue > 100) {
      return {
        success: false,
        message: "Percentage value cannot exceed 100"
      };
    }
    if (!payload.restrictionTypeAction) {
      return {
        success: false,
        message: "Restriction action (increase/decrease) is required"
      };
    }
    payload.currencyCode = null;
  } else if (payload.restrictionType === "fixed") {
    // For fixed, need value, action, and currency
    if (!payload.restrictionValue || payload.restrictionValue <= 0) {
      return {
        success: false,
        message: "Restriction value is required for fixed type"
      };
    }
    if (!payload.restrictionTypeAction) {
      return {
        success: false,
        message: "Restriction action (increase/decrease) is required"
      };
    }
    if (!payload.currencyCode) {
      return {
        success: false,
        message: "Currency code is required for fixed type"
      };
    }
  }

  const result = await createGeoRatePlan(payload);
  return result;
}

export async function fetchGeoRatePlansService(
  propertyId: string,
  filters?: { roomType?: string; ratePlanCode?: string }
) {
  if (!propertyId) {
    return {
      success: false,
      message: "Property ID is required"
    };
  }
  const result = await getGeoRatePlans(propertyId, filters);
  return result;
}

export async function fetchGeoRatePlanByIdService(id: string) {
  if (!id) {
    return {
      success: false,
      message: "Geo Rate Plan ID is required"
    };
  }
  const result = await getGeoRatePlanById(id);
  return result;
}

export async function updateGeoRatePlanService(id: string, payload: UpdateGeoRatePlan) {
  if (!id) {
    return {
      success: false,
      message: "Geo Rate Plan ID is required"
    };
  }

  // Validate based on restriction type if it's being updated
  if (payload.restrictionType) {
    if (payload.restrictionType === "restricted") {
      payload.restrictionValue = null;
      payload.restrictionTypeAction = null;
      payload.currencyCode = null;
    } else if (payload.restrictionType === "percentage") {
      if (payload.restrictionValue !== undefined && payload.restrictionValue !== null) {
        if (payload.restrictionValue <= 0) {
          return {
            success: false,
            message: "Restriction value must be greater than 0"
          };
        }
        if (payload.restrictionValue > 100) {
          return {
            success: false,
            message: "Percentage value cannot exceed 100"
          };
        }
      }
      payload.currencyCode = null;
    } else if (payload.restrictionType === "fixed") {
      if (payload.restrictionValue !== undefined && payload.restrictionValue !== null && payload.restrictionValue <= 0) {
        return {
          success: false,
          message: "Restriction value must be greater than 0"
        };
      }
    }
  }

  const result = await updateGeoRatePlan(id, payload);
  return result;
}

export async function removeGeoRatePlanService(id: string) {
  if (!id) {
    return {
      success: false,
      message: "Geo Rate Plan ID is required"
    };
  }
  const result = await deleteGeoRatePlan(id);
  return result;
}

export async function toggleGeoRatePlanStatusService(id: string, isActive: boolean) {
  if (!id) {
    return {
      success: false,
      message: "Geo Rate Plan ID is required"
    };
  }
  const result = await toggleGeoRatePlanStatus(id, isActive);
  return result;
}