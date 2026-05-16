import { 
    upsertPromotionTranslation, 
    getAllPromotionTranslations, 
    deletePromotionTranslationLocale 
} from "../api/promotion.api";
import type { UpsertPromotionTranslationPayload } from "../types/promotion.type";

export async function upsertPromotionTranslationService(id: string, payload: UpsertPromotionTranslationPayload) {
    if (!id) return { success: false, message: "ID is required" };
    if (!payload || Object.keys(payload).length === 0) return { success: false, message: "Payload cannot be empty" };
    return await upsertPromotionTranslation(id, payload);
}

export async function getAllPromotionTranslationsService(id: string) {
    if (!id) return { success: false, message: "ID is required" };
    return await getAllPromotionTranslations(id);
}

export async function deletePromotionTranslationLocaleService(id: string, locale: string) {
    if (!id || !locale) return { success: false, message: "Both ID and Locale are required" };
    return await deletePromotionTranslationLocale(id, locale);
}
