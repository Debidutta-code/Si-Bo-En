import {
    createCreationLoyality,
    getCreationLoyalityById,
    updateCreationLoyality,
    deleteLoyality,
    getLoyalityByCreation,
    getAllCreationLoyalityWithProperty
} from "../api";

import type { ICCreationLoyality, IUCreationLoyalty } from "../interfaces";

export const createCreationLoyalityService = async (data: ICCreationLoyality) => {
    try {
        if (!data.creationId || data.creationId.trim() === "") {
            return { success: false, message: "Creation ID is required." };
        }
        if (!data.loyaltyDiscountType || data.loyaltyDiscountType.trim() === "") {
            return { success: false, message: "Loyalty Discount Type is required." };
        }
        if (typeof data.discountValue !== "number" || data.discountValue < 0) {
            return { success: false, message: "Discount Value must be a positive number." };
        }
        if (data.loyaltyDiscountType === "percentage" && data.discountValue > 100) {
            return { success: false, message: "Percentage discount cannot exceed 100." };
        }
        const response = await createCreationLoyality(data);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to create creation loyalty." };
    }
};

export const getCreationLoyalityByIdService = async (creationLoyalityId: string) => {
    try {
        if (!creationLoyalityId || creationLoyalityId.trim() === "") {
            return { success: false, message: "Creation Loyalty ID is required." };
        }
        const response = await getCreationLoyalityById(creationLoyalityId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to retrieve creation loyalty." };
    }
};

export const updateCreationLoyalityService = async (creationLoyalityId: string, data: IUCreationLoyalty) => {
    try {
        if (!creationLoyalityId || creationLoyalityId.trim() === "") {
            return { success: false, message: "Creation Loyalty ID is required." };
        }
        if (data.loyaltyDiscountType && data.loyaltyDiscountType.trim() === "") {
            return { success: false, message: "Loyalty Discount Type cannot be empty if provided." };
        }
        if (data.discountValue !== undefined) {
            if (typeof data.discountValue !== "number" || data.discountValue < 0) {
                return { success: false, message: "Discount Value must be a positive number." };
            }
            if (data.loyaltyDiscountType === "percentage" && data.discountValue > 100) {
                return { success: false, message: "Percentage discount cannot exceed 100." };
            }
        }
        const response = await updateCreationLoyality(creationLoyalityId, data);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to update creation loyalty." };
    }
};

export const deleteLoyalityService = async (creationLoyalityId: string) => {
    try {
        if (!creationLoyalityId || creationLoyalityId.trim() === "") {
            return { success: false, message: "Creation Loyalty ID is required." };
        }
        const response = await deleteLoyality(creationLoyalityId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to delete creation loyalty." };
    }
};

export const getLoyalityByCreationService = async (creationId: string) => {
    try {
        if (!creationId || creationId.trim() === "") {
            return { success: false, message: "Creation ID is required." };
        }
        const response = await getLoyalityByCreation(creationId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to retrieve loyalty by creation." };
    }
};

export const getAllCreationLoyalityWithPropertyService = async (creationId: string) => {
    try {
        if (!creationId || creationId.trim() === "") {
            return { success: false, message: "Creation ID is required." };
        }
        const response = await getAllCreationLoyalityWithProperty(creationId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to retrieve creation loyalty with properties." };
    }
};
