import {
  createPropertyLoyalityConfig,
  getLoyalityForProperty,
  updatePropertyLoyalityConfig,
  deletePropertyLoyalityConfig,
  getAllPropertyLoyalityWithLoyality,
  getActiveLoyaltyConfigByPropertyId,
  getPropertiesByLoyaltyProgram,
} from "../api";

import type { ICPropertyLoyaltyConfig } from "../interfaces";

export const createPropertyLoyalityConfigService = async (
  data: ICPropertyLoyaltyConfig,
) => {
  try {
    if (
      !data.creationLoyaltyConfigId ||
      data.creationLoyaltyConfigId.trim() === ""
    ) {
      return {
        success: false,
        message: "Creation Loyalty Config ID is required.",
      };
    }
    if (!data.propertyId || data.propertyId.trim() === "") {
      return { success: false, message: "Property ID is required." };
    }
    if (!data.propertyCode || data.propertyCode.trim() === "") {
      return { success: false, message: "Property Code is required." };
    }
    if (!data.propertyName || data.propertyName.trim() === "") {
      return { success: false, message: "Property Name is required." };
    }
    const response = await createPropertyLoyalityConfig(data);
    return response;
  } catch (error) {
    return {
      success: false,
      message: "Failed to create property loyalty config.",
    };
  }
};

export const getLoyalityForPropertyService = async (propertyId: string) => {
  try {
    if (!propertyId || propertyId.trim() === "") {
      return { success: false, message: "Property ID is required." };
    }
    const response = await getLoyalityForProperty(propertyId);
    return response;
  } catch (error) {
    return {
      success: false,
      message: "Failed to retrieve property loyalty config.",
    };
  }
};

export const updatePropertyLoyalityConfigService = async (
  propertyId: string,
  isActive: boolean,
  loyalityConfigLogo?: string | null,
) => {
  try {
    if (!propertyId || propertyId.trim() === "") {
      return { success: false, message: "Property ID is required." };
    }
    if (typeof isActive !== "boolean") {
      return { success: false, message: "isActive must be a boolean value." };
    }
    const response = await updatePropertyLoyalityConfig(
      propertyId,
      isActive,
      loyalityConfigLogo,
    );
    return response;
  } catch (error) {
    return {
      success: false,
      message: "Failed to update property loyalty config.",
    };
  }
};

export const deletePropertyLoyalityConfigService = async (
  propertyId: string,
) => {
  try {
    if (!propertyId || propertyId.trim() === "") {
      return { success: false, message: "Property ID is required." };
    }
    const response = await deletePropertyLoyalityConfig(propertyId);
    return response;
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete property loyalty config.",
    };
  }
};

export const getAllPropertyLoyalityWithLoyalityService = async (
  propertyId: string,
) => {
  try {
    if (!propertyId || propertyId.trim() === "") {
      return { success: false, message: "Property ID is required." };
    }
    const response = await getAllPropertyLoyalityWithLoyality(propertyId);
    return response;
  } catch (error) {
    return {
      success: false,
      message: "Failed to retrieve all property loyalty configs.",
    };
  }
};

export const getActiveLoyaltyConfigByPropertyIdService = async (
  propertyId: string,
) => {
  try {
    if (!propertyId || propertyId.trim() === "") {
      return { success: false, message: "Property ID is required." };
    }
    const response = await getActiveLoyaltyConfigByPropertyId(propertyId);
    return response;
  } catch (error) {
    return {
      success: false,
      message: "Failed to retrieve active loyalty config.",
    };
  }
};

export const getPropertiesByLoyaltyProgramService = async (
  loyaltyProgramId: string,
) => {
  try {
    if (!loyaltyProgramId || loyaltyProgramId.trim() === "") {
      return { success: false, message: "Loyalty Program ID is required." };
    }
    const response = await getPropertiesByLoyaltyProgram(loyaltyProgramId);
    return response;
  } catch (error) {
    return {
      success: false,
      message: "Failed to retrieve properties by loyalty program.",
    };
  }
};
