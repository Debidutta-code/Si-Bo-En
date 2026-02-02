import {
    createPropertyLoyalityConfig,
    getLoyalityForProperty,
    updatePropertyLoyalityConfig,
    deletePropertyLoyalityConfig,
    getAllPropertyLoyalityWithLoyality,
    getActiveLoyaltyConfigByPropertyId,
    getPropertiesByLoyaltyProgram
} from "../api";

import type { ICPropertyLoyaltyConfig } from "../interfaces";

export const createPropertyLoyalityConfigService = async (data: ICPropertyLoyaltyConfig) => {
    try {
        if (!data.creationLoyaltyConfigId || data.creationLoyaltyConfigId.trim() === "") {
            return { success: false, message: "Creation Loyalty Config ID is required." };
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
        return { success: false, message: "Failed to create property loyalty config." };
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
        return { success: false, message: "Failed to retrieve property loyalty config." };
    }
};

export const updatePropertyLoyalityConfigService = async (propertyLoyalityId: string, isActive: boolean) => {
    try {
        if (!propertyLoyalityId || propertyLoyalityId.trim() === "") {
            return { success: false, message: "Property Loyalty Config ID is required." };
        }
        if (typeof isActive !== "boolean") {
            return { success: false, message: "Active status is required." };
        }
        const response = await updatePropertyLoyalityConfig(propertyLoyalityId, isActive);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to update property loyalty config." };
    }
};

export const deletePropertyLoyalityConfigService = async (propertyLoyalityId: string) => {
    try {
        if (!propertyLoyalityId || propertyLoyalityId.trim() === "") {
            return { success: false, message: "Property Loyalty Config ID is required." };
        }
        const response = await deletePropertyLoyalityConfig(propertyLoyalityId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to delete property loyalty config." };
    }
};

export const getAllPropertyLoyalityWithLoyalityService = async (propertyId: string) => {
    try {
        if (!propertyId || propertyId.trim() === "") {
            return { success: false, message: "Property ID is required." };
        }
        const response = await getAllPropertyLoyalityWithLoyality(propertyId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to retrieve all property loyalty configs." };
    }
};

export const getActiveLoyaltyConfigByPropertyIdService = async (propertyId: string) => {
    try {
        if (!propertyId || propertyId.trim() === "") {
            return { success: false, message: "Property ID is required." };
        }
        const response = await getActiveLoyaltyConfigByPropertyId(propertyId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to retrieve active loyalty config." };
    }
};

export const getPropertiesByLoyaltyProgramService = async (loyaltyProgramId: string) => {
    try {
        if (!loyaltyProgramId || loyaltyProgramId.trim() === "") {
            return { success: false, message: "Loyalty Program ID is required." };
        }
        const response = await getPropertiesByLoyaltyProgram(loyaltyProgramId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to retrieve properties by loyalty program." };
    }
};
