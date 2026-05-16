import * as api from "../apis/property.api";
import type { UpsertPropertyTranslationPayload } from "../interface/property.interface";

const validateId = (id: string, entity: string) => {
    if (!id) return { success: false, message: `ID is required for ${entity}` };
    return null;
};

export async function upsertPropertyTranslationService(id: string, payload: UpsertPropertyTranslationPayload) {
    const error = validateId(id, "Property");
    if (error) return error;
    if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };
    return await api.upsertPropertyTranslation(id, payload);
}

export async function getPropertyTranslationService(id: string, locale?: string) {
    const error = validateId(id, "Property");
    if (error) return error;
    return await api.getPropertyTranslation(id, locale);
}

export async function getAllPropertyTranslationsService(id: string) {
    const error = validateId(id, "Property");
    if (error) return error;
    return await api.getAllPropertyTranslations(id);
}

export async function deletePropertyTranslationLocaleService(id: string, locale: string) {
    const error = validateId(id, "Property");
    if (error) return error;
    if (!locale) return { success: false, message: 'Locale is required' };
    return await api.deletePropertyTranslationLocale(id, locale);
}
