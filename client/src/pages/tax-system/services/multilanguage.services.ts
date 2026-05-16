import {
    upsertTaxRuleTranslation,
    getAllTaxRuleTranslations,
    getTaxRuleTranslation,
    deleteTaxRuleTranslationLocale,
    upsertTaxGroupTranslation,
    getAllTaxGroupTranslations,
    getTaxGroupTranslation,
    deleteTaxGroupTranslationLocale,
    upsertTouristTaxTranslation,
    getAllTouristTaxTranslations,
    getTouristTaxTranslation,
    deleteTouristTaxTranslationLocale,
} from "../api/multilanguage.api";
import type {
    UpsertTaxRuleTranslationPayload,
    UpsertTaxGroupTranslationPayload,
    UpsertTouristTaxTranslationPayload,
} from "../interface/multilanguage.interface";

export async function upsertTaxRuleTranslationService(
    id: string,
    payload: UpsertTaxRuleTranslationPayload
) {
    if (!id) return { success: false, message: "ID is required to upsert translations" };
    if (!payload || Object.keys(payload).length === 0) {
        return { success: false, message: "Translation payload cannot be empty" };
    }
    return await upsertTaxRuleTranslation(id, payload);
}

export async function getAllTaxRuleTranslationsService(id: string) {
    if (!id) return { success: false, message: "ID is required to fetch translations" };
    return await getAllTaxRuleTranslations(id);
}

export async function getTaxRuleTranslationService(id: string, locale?: string) {
    if (!id) return { success: false, message: "ID is required to fetch translation" };
    return await getTaxRuleTranslation(id, locale);
}

export async function deleteTaxRuleTranslationLocaleService(id: string, locale: string) {
    if (!id || !locale) return { success: false, message: "Both ID and Locale are required" };
    return await deleteTaxRuleTranslationLocale(id, locale);
}

export async function upsertTaxGroupTranslationService(
    id: string,
    payload: UpsertTaxGroupTranslationPayload
) {
    if (!id) return { success: false, message: "ID is required to upsert translations" };
    if (!payload || Object.keys(payload).length === 0) {
        return { success: false, message: "Translation payload cannot be empty" };
    }
    return await upsertTaxGroupTranslation(id, payload);
}

export async function getAllTaxGroupTranslationsService(id: string) {
    if (!id) return { success: false, message: "ID is required to fetch translations" };
    return await getAllTaxGroupTranslations(id);
}

export async function getTaxGroupTranslationService(id: string, locale?: string) {
    if (!id) return { success: false, message: "ID is required to fetch translation" };
    return await getTaxGroupTranslation(id, locale);
}

export async function deleteTaxGroupTranslationLocaleService(id: string, locale: string) {
    if (!id || !locale) return { success: false, message: "Both ID and Locale are required" };
    return await deleteTaxGroupTranslationLocale(id, locale);
}

export async function upsertTouristTaxTranslationService(
    id: string,
    payload: UpsertTouristTaxTranslationPayload
) {
    if (!id) return { success: false, message: "ID is required to upsert translations" };
    if (!payload || Object.keys(payload).length === 0) {
        return { success: false, message: "Translation payload cannot be empty" };
    }
    return await upsertTouristTaxTranslation(id, payload);
}

export async function getAllTouristTaxTranslationsService(id: string) {
    if (!id) return { success: false, message: "ID is required to fetch translations" };
    return await getAllTouristTaxTranslations(id);
}

export async function getTouristTaxTranslationService(id: string, locale?: string) {
    if (!id) return { success: false, message: "ID is required to fetch translation" };
    return await getTouristTaxTranslation(id, locale);
}

export async function deleteTouristTaxTranslationLocaleService(id: string, locale: string) {
    if (!id || !locale) return { success: false, message: "Both ID and Locale are required" };
    return await deleteTouristTaxTranslationLocale(id, locale);
}
