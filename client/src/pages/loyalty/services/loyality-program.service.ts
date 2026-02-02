import {
    createLoyaltyProgram,
    getLoyaltyProgram,
    updateLoyaltyProgram,
    deleteLoyaltyProgram,
    createAdvanceLoyaltyProgram,
    getAdvanceLoyaltyProgram,
    updateAdvanceLoyaltyProgram,
    deleteAdvanceLoyaltyProgram
} from "../api";

import type { ICloyaltyProgram, IULoyalityProgram, ICAdvanceLoyaltyprogram, IUAdvanceLoyaltyprogram } from "../interfaces";

// ===== Basic Loyalty Program Services =====
export const createLoyaltyProgramService = async (data: ICloyaltyProgram) => {
    try {
        if (!data.loyaltyProgramId || data.loyaltyProgramId.trim() === "") {
            return { success: false, message: "Loyalty Program ID is required." };
        }
        if (!data.logo || data.logo.length === 0) {
            return { success: false, message: "At least one logo is required." };
        }
        const response = await createLoyaltyProgram(data);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to create loyalty program." };
    }
};

export const getLoyaltyProgramService = async (loyaltyProgramId: string) => {
    try {
        if (!loyaltyProgramId || loyaltyProgramId.trim() === "") {
            return { success: false, message: "Loyalty Program ID is required." };
        }
        const response = await getLoyaltyProgram(loyaltyProgramId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to retrieve loyalty program." };
    }
};

export const updateLoyaltyProgramService = async (loyaltyProgramId: string, data: IULoyalityProgram) => {
    try {
        if (!loyaltyProgramId || loyaltyProgramId.trim() === "") {
            return { success: false, message: "Loyalty Program ID is required." };
        }
        if (data.logo && data.logo.length === 0) {
            return { success: false, message: "Logo cannot be empty if provided." };
        }
        const response = await updateLoyaltyProgram(loyaltyProgramId, data);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to update loyalty program." };
    }
};

export const deleteLoyaltyProgramService = async (loyaltyProgramId: string) => {
    try {
        if (!loyaltyProgramId || loyaltyProgramId.trim() === "") {
            return { success: false, message: "Loyalty Program ID is required." };
        }
        const response = await deleteLoyaltyProgram(loyaltyProgramId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to delete loyalty program." };
    }
};

// ===== Advance Loyalty Program Services =====
export const createAdvanceLoyaltyProgramService = async (data: ICAdvanceLoyaltyprogram) => {
    try {
        if (!data.loyaltyProgramId || data.loyaltyProgramId.trim() === "") {
            return { success: false, message: "Loyalty Program ID is required." };
        }
        if (typeof data.activeInCorporateWeb !== "boolean") {
            return { success: false, message: "Active in corporate web status is required." };
        }
        if (typeof data.defaultLoginMode !== "boolean") {
            return { success: false, message: "Default login mode status is required." };
        }
        if (data.roomLimitByBooking && data.roomLimitByBooking < 1) {
            return { success: false, message: "Room limit must be at least 1." };
        }
        const response = await createAdvanceLoyaltyProgram(data);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to create advance loyalty program." };
    }
};

export const getAdvanceLoyaltyProgramService = async (loyaltyProgramId: string) => {
    try {
        if (!loyaltyProgramId || loyaltyProgramId.trim() === "") {
            return { success: false, message: "Loyalty Program ID is required." };
        }
        const response = await getAdvanceLoyaltyProgram(loyaltyProgramId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to retrieve advance loyalty program." };
    }
};

export const updateAdvanceLoyaltyProgramService = async (id: string, data: IUAdvanceLoyaltyprogram) => {
    try {
        if (!id || id.trim() === "") {
            return { success: false, message: "Advance Loyalty Program ID is required." };
        }
        if (data.roomLimitByBooking !== undefined && data.roomLimitByBooking < 1) {
            return { success: false, message: "Room limit must be at least 1." };
        }
        const response = await updateAdvanceLoyaltyProgram(id, data);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to update advance loyalty program." };
    }
};

export const deleteAdvanceLoyaltyProgramService = async (id: string) => {
    try {
        if (!id || id.trim() === "") {
            return { success: false, message: "Advance Loyalty Program ID is required." };
        }
        const response = await deleteAdvanceLoyaltyProgram(id);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to delete advance loyalty program." };
    }
};
