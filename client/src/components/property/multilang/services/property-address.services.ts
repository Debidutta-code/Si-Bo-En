import * as api from "../apis/property-address.api";
import type { UpsertPropertyAddressTranslationPayload } from "../interface/property-address.interface";

const validateId = (id: string, entity: string) => {
    if (!id) return { success: false, message: `ID is required for ${entity}` };
    return null;
};

export async function upsertPropertyAddressTranslationService(id: string, payload: UpsertPropertyAddressTranslationPayload) {
    const error = validateId(id, "PropertyAddress");
    if (error) return error;
    if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };
    return await api.upsertPropertyAddressTranslation(id, payload);
}

export async function getPropertyAddressTranslationService(id: string, locale?: string) {
    const error = validateId(id, "PropertyAddress");
    if (error) return error;
    return await api.getPropertyAddressTranslation(id, locale);
}

export async function getAllPropertyAddressTranslationsService(id: string) {
    const error = validateId(id, "PropertyAddress");
    if (error) return error;
    return await api.getAllPropertyAddressTranslations(id);
}

export async function deletePropertyAddressTranslationLocaleService(id: string, locale: string) {
    const error = validateId(id, "PropertyAddress");
    if (error) return error;
    if (!locale) return { success: false, message: 'Locale is required' };
    return await api.deletePropertyAddressTranslationLocale(id, locale);
}
