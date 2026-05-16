import {
    upsertPromoCodeTranslation,
    getAllPromoCodeTranslations,
    getPromoCodeTranslation,
    deletePromoCodeTranslationLocale,
} from "../api/promo-code-multilang.api";
import type { UpsertPromoCodeTranslationPayload } from "../interfaces/promo-code-multilang.types";

export async function upsertPromoCodeTranslationService(
    id: string,
    payload: UpsertPromoCodeTranslationPayload
) {
    if (!id) return { success: false, message: "ID is required to upsert translations" };
    if (!payload || Object.keys(payload).length === 0) {
        return { success: false, message: "Translation payload cannot be empty" };
    }
    return await upsertPromoCodeTranslation(id, payload);
}

export async function getAllPromoCodeTranslationsService(id: string) {
    if (!id) return { success: false, message: "ID is required to fetch translations" };
    return await getAllPromoCodeTranslations(id);
}

export async function getPromoCodeTranslationService(id: string, locale?: string) {
    if (!id) return { success: false, message: "ID is required to fetch translation" };
    return await getPromoCodeTranslation(id, locale);
}

export async function deletePromoCodeTranslationLocaleService(id: string, locale: string) {
    if (!id || !locale) return { success: false, message: "Both ID and locale are required" };
    return await deletePromoCodeTranslationLocale(id, locale);
}
