import {
    createCondition,
    updateCondition,
    deleteCondition,
    getConditionsByProgramId,
    createSpecialCondition,
    updateSpecialCondition,
    deleteSpecialCondition,
    getSpecialConditionsByProgramId,
} from "../api";
import {
    upsertLoyaltyConditionTranslationService,
    upsertLoyaltySpecialConditionTranslationService,
} from "./multilanguage.service";
import type {
    ICLoyalityCondition,
    IULoyalityCondition,
    ICLoyalitySpecialCondition,
    IULoyalitySpecialCondition,
} from "../interfaces";
import type {
    UpsertLoyaltyConditionTranslationPayload,
    UpsertLoyaltySpecialConditionTranslationPayload,
} from "../interfaces/multilanguage.type";

export type ICLoyalityConditionWithTranslations = ICLoyalityCondition & {
    translations?: UpsertLoyaltyConditionTranslationPayload;
};

export type IULoyalityConditionWithTranslations = IULoyalityCondition & {
    translations?: UpsertLoyaltyConditionTranslationPayload;
};

export type ICLoyalitySpecialConditionWithTranslations = ICLoyalitySpecialCondition & {
    translations?: UpsertLoyaltySpecialConditionTranslationPayload;
};

export type IULoyalitySpecialConditionWithTranslations = IULoyalitySpecialCondition & {
    translations?: UpsertLoyaltySpecialConditionTranslationPayload;
};

// ===== Loyalty Condition Services =====
export const createConditionService = async (data: ICLoyalityConditionWithTranslations) => {
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
        const loyaltyConditionId = response?.data?.id ?? response?.data?._id;

        if (
            response?.success &&
            loyaltyConditionId &&
            data.translations &&
            Object.keys(data.translations).length > 0
        ) {
            await upsertLoyaltyConditionTranslationService(loyaltyConditionId, data.translations);
        }

        return response;
    } catch (error) {
        return { success: false, message: "Failed to create condition." };
    }
};

export const updateConditionService = async (id: string, data: IULoyalityConditionWithTranslations) => {
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

        if (
            response?.success &&
            data.translations &&
            Object.keys(data.translations).length > 0
        ) {
            await upsertLoyaltyConditionTranslationService(id, data.translations);
        }

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
export const createSpecialConditionService = async (
    data: ICLoyalitySpecialConditionWithTranslations
) => {
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
        const specialConditionId = response?.data?.id ?? response?.data?._id;

        if (
            response?.success &&
            specialConditionId &&
            data.translations &&
            Object.keys(data.translations).length > 0
        ) {
            await upsertLoyaltySpecialConditionTranslationService(specialConditionId, data.translations);
        }

        return response;
    } catch (error) {
        return { success: false, message: "Failed to create special condition." };
    }
};

export const updateSpecialConditionService = async (
    id: string,
    data: IULoyalitySpecialConditionWithTranslations
) => {
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

        if (
            response?.success &&
            data.translations &&
            Object.keys(data.translations).length > 0
        ) {
            await upsertLoyaltySpecialConditionTranslationService(id, data.translations);
        }

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
