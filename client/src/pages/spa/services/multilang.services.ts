import * as api from "../api/multilang.api";
import type { UpsertSpaTranslationPayload } from "../interfaces/multilang.type";

// Helper for validating id
const validateId = (id: string, entity: string) => {
    if (!id) return { success: false, message: `ID is required for ${entity}` };
    return null;
};

export async function upsertSpaTranslationService(id: string, payload: UpsertSpaTranslationPayload) {
    const error = validateId(id, "Spa");
    if (error) return error;
    if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };
    return await api.upsertSpaTranslation(id, payload);
}

export async function getSpaTranslationService(id: string, locale?: string) {
    const error = validateId(id, "Spa");
    if (error) return error;
    return await api.getSpaTranslation(id, locale);
}

export async function getAllSpaTranslationsService(id: string) {
    const error = validateId(id, "Spa");
    if (error) return error;
    return await api.getAllSpaTranslations(id);
}

export async function deleteSpaTranslationLocaleService(id: string, locale: string) {
    const error = validateId(id, "Spa");
    if (error) return error;
    if (!locale) return { success: false, message: 'Locale is required' };
    return await api.deleteSpaTranslationLocale(id, locale);
}
