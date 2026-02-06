import {
    createCondition,
    updateCondition,
    deleteCondition,
    getConditionsByProgramId,
    createSpecialCondition,
    updateSpecialCondition,
    deleteSpecialCondition,
    getSpecialConditionsByProgramId
} from "../api";

import type { ICLoyalityCondition, IULoyalityCondition, ICLoyalitySpecialCondition, IULoyalitySpecialCondition } from "../interfaces";

// ===== Loyalty Condition Services =====
export const createConditionService = async (data: ICLoyalityCondition) => {
    try {
        if (!data.loyaltyProgramId || data.loyaltyProgramId.trim() === "") {
            return { success: false, message: "Loyalty Program ID is required." };
        }
        if (!data.text || data.text.trim() === "") {
            return { success: false, message: "Condition text is required." };
        }
        if (!data.language || data.language.trim() === "") {
            return { success: false, message: "Language is required." };
        }
        const response = await createCondition(data);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to create condition." };
    }
};

export const updateConditionService = async (id: string, data: IULoyalityCondition) => {
    try {
        if (!id || id.trim() === "") {
            return { success: false, message: "Condition ID is required." };
        }
        if (!data.text || data.text.trim() === "") {
            return { success: false, message: "Condition text is required." };
        }
        if (!data.language || data.language.trim() === "") {
            return { success: false, message: "Language is required." };
        }
        if (typeof data.isActive !== "boolean") {
            return { success: false, message: "Active status is required." };
        }
        const response = await updateCondition(id, data);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to update condition." };
    }
};

export const deleteConditionService = async (id: string) => {
    try {
        if (!id || id.trim() === "") {
            return { success: false, message: "Condition ID is required." };
        }
        const response = await deleteCondition(id);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to delete condition." };
    }
};

export const getConditionsByProgramIdService = async (loyaltyProgramId: string) => {
    try {
        if (!loyaltyProgramId || loyaltyProgramId.trim() === "") {
            return { success: false, message: "Loyalty Program ID is required." };
        }
        const response = await getConditionsByProgramId(loyaltyProgramId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to retrieve conditions." };
    }
};

// ===== Loyalty Special Condition Services =====
export const createSpecialConditionService = async (data: ICLoyalitySpecialCondition) => {
    try {
        if (!data.loyaltyProgramId || data.loyaltyProgramId.trim() === "") {
            return { success: false, message: "Loyalty Program ID is required." };
        }
        if (!data.title || data.title.trim() === "") {
            return { success: false, message: "Title is required." };
        }
        if (!data.language || data.language.trim() === "") {
            return { success: false, message: "Language is required." };
        }
        const response = await createSpecialCondition(data);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to create special condition." };
    }
};

export const updateSpecialConditionService = async (id: string, data: IULoyalitySpecialCondition) => {
    try {
        if (!id || id.trim() === "") {
            return { success: false, message: "Special Condition ID is required." };
        }
        if (!data.title || data.title.trim() === "") {
            return { success: false, message: "Title is required." };
        }
        if (!data.language || data.language.trim() === "") {
            return { success: false, message: "Language is required." };
        }
        if (typeof data.isActive !== "boolean") {
            return { success: false, message: "Active status is required." };
        }
        const response = await updateSpecialCondition(id, data);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to update special condition." };
    }
};

export const deleteSpecialConditionService = async (id: string) => {
    try {
        if (!id || id.trim() === "") {
            return { success: false, message: "Special Condition ID is required." };
        }
        const response = await deleteSpecialCondition(id);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to delete special condition." };
    }
};

export const getSpecialConditionsByProgramIdService = async (loyaltyProgramId: string) => {
    try {
        if (!loyaltyProgramId || loyaltyProgramId.trim() === "") {
            return { success: false, message: "Loyalty Program ID is required." };
        }
        const response = await getSpecialConditionsByProgramId(loyaltyProgramId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to retrieve special conditions." };
    }
};
