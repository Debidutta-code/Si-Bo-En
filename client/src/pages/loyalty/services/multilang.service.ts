import * as api from "../api/multilang.api";
import type { 
    UpsertLoyaltyConditionsTranslationPayload,
    UpsertLoyaltySpecialConditionTranslationPayload
} from "../interfaces/multilang.type";

// Helper for validating id
const validateId = (id: string, entity: string) => {
    if (!id) return { success: false, message: `ID is required for ${entity}` };
    return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Loyalty Conditions
// ─────────────────────────────────────────────────────────────────────────────

export async function upsertLoyaltyConditionsTranslationService(id: string, payload: UpsertLoyaltyConditionsTranslationPayload) {
    const error = validateId(id, "LoyaltyCondition");
    if (error) return error;
    if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };
    return await api.upsertLoyaltyConditionsTranslation(id, payload);
}

export async function getLoyaltyConditionsTranslationService(id: string, locale?: string) {
    const error = validateId(id, "LoyaltyCondition");
    if (error) return error;
    return await api.getLoyaltyConditionsTranslation(id, locale);
}

export async function getAllLoyaltyConditionsTranslationsService(id: string) {
    const error = validateId(id, "LoyaltyCondition");
    if (error) return error;
    return await api.getAllLoyaltyConditionsTranslations(id);
}

export async function deleteLoyaltyConditionsTranslationLocaleService(id: string, locale: string) {
    const error = validateId(id, "LoyaltyCondition");
    if (error) return error;
    if (!locale) return { success: false, message: 'Locale is required' };
    return await api.deleteLoyaltyConditionsTranslationLocale(id, locale);
}

// ─────────────────────────────────────────────────────────────────────────────
// Loyalty Special Conditions
// ─────────────────────────────────────────────────────────────────────────────

export async function upsertLoyaltySpecialConditionTranslationService(id: string, payload: UpsertLoyaltySpecialConditionTranslationPayload) {
    const error = validateId(id, "LoyaltySpecialCondition");
    if (error) return error;
    if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };
    return await api.upsertLoyaltySpecialConditionTranslation(id, payload);
}

export async function getLoyaltySpecialConditionTranslationService(id: string, locale?: string) {
    const error = validateId(id, "LoyaltySpecialCondition");
    if (error) return error;
    return await api.getLoyaltySpecialConditionTranslation(id, locale);
}

export async function getAllLoyaltySpecialConditionTranslationsService(id: string) {
    const error = validateId(id, "LoyaltySpecialCondition");
    if (error) return error;
    return await api.getAllLoyaltySpecialConditionTranslations(id);
}

export async function deleteLoyaltySpecialConditionTranslationLocaleService(id: string, locale: string) {
    const error = validateId(id, "LoyaltySpecialCondition");
    if (error) return error;
    if (!locale) return { success: false, message: 'Locale is required' };
    return await api.deleteLoyaltySpecialConditionTranslationLocale(id, locale);
}
