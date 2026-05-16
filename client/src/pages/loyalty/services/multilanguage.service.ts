import {
    upsertLoyaltyConditionTranslation,
    getAllLoyaltyConditionTranslations,
    getLoyaltyConditionTranslation,
    deleteLoyaltyConditionTranslationLocale,
    upsertLoyaltySpecialConditionTranslation,
    getAllLoyaltySpecialConditionTranslations,
    getLoyaltySpecialConditionTranslation,
    deleteLoyaltySpecialConditionTranslationLocale,
} from "../api/multilanguage.api";
import type {
    UpsertLoyaltyConditionTranslationPayload,
    UpsertLoyaltySpecialConditionTranslationPayload,
} from "../interfaces/multilanguage.type";

export async function upsertLoyaltyConditionTranslationService(
    id: string,
    payload: UpsertLoyaltyConditionTranslationPayload
) {
    if (!id) return { success: false, message: "ID is required to upsert translations" };
    if (!payload || Object.keys(payload).length === 0) {
        return { success: false, message: "Translation payload cannot be empty" };
    }
    const result = await upsertLoyaltyConditionTranslation(id, payload);
    return result;
}

export async function getAllLoyaltyConditionTranslationsService(id: string) {
    if (!id) return { success: false, message: "ID is required to fetch translations" };
    return await getAllLoyaltyConditionTranslations(id);
}

export async function getLoyaltyConditionTranslationService(id: string, locale?: string) {
    if (!id) return { success: false, message: "ID is required to fetch translation" };
    return await getLoyaltyConditionTranslation(id, locale);
}

export async function deleteLoyaltyConditionTranslationLocaleService(id: string, locale: string) {
    if (!id || !locale) return { success: false, message: "Both ID and Locale are required" };
    return await deleteLoyaltyConditionTranslationLocale(id, locale);
}

export async function upsertLoyaltySpecialConditionTranslationService(
    id: string,
    payload: UpsertLoyaltySpecialConditionTranslationPayload
) {
    if (!id) return { success: false, message: "ID is required to upsert translations" };
    if (!payload || Object.keys(payload).length === 0) {
        return { success: false, message: "Translation payload cannot be empty" };
    }
    const result = await upsertLoyaltySpecialConditionTranslation(id, payload);
    return result;
}

export async function getAllLoyaltySpecialConditionTranslationsService(id: string) {
    if (!id) return { success: false, message: "ID is required to fetch translations" };
    return await getAllLoyaltySpecialConditionTranslations(id);
}

export async function getLoyaltySpecialConditionTranslationService(id: string, locale?: string) {
    if (!id) return { success: false, message: "ID is required to fetch translation" };
    return await getLoyaltySpecialConditionTranslation(id, locale);
}

export async function deleteLoyaltySpecialConditionTranslationLocaleService(id: string, locale: string) {
    if (!id || !locale) return { success: false, message: "Both ID and Locale are required" };
    return await deleteLoyaltySpecialConditionTranslationLocale(id, locale);
}
