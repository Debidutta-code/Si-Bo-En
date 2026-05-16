import {
    upsertAddonTranslation,
    getAllAddonTranslations,
    getAddonTranslation,
    deleteAddonTranslationLocale,
} from "../api/addon-langa.api";

import {
    upsertAddonCategoryTranslation,
    getAllAddonCategoryTranslations,
    getAddonCategoryTranslation,
    deleteAddonCategoryTranslationLocale,
} from "../api/category-lang.api";

import {
    upsertAddonSubCategoryTranslation,
    getAllAddonSubCategoryTranslations,
    getAddonSubCategoryTranslation,
    deleteAddonSubCategoryTranslationLocale,
} from "../api/sub-cate-lang.api";

import {
    upsertAddonVariantTranslation,
    getAllAddonVariantTranslations,
    getAddonVariantTranslation,
    deleteAddonVariantTranslationLocale,
} from "../api/variant-lang.api";

import type {
    UpsertAddonTranslationPayload,
    UpsertAddonCategoryTranslationPayload,
    UpsertAddonSubCategoryTranslationPayload,
    UpsertAddonVariantTranslationPayload,
} from "../interface/multi-lang.interface";

// Addon
export async function upsertAddonTranslationService(id: string, payload: UpsertAddonTranslationPayload) {
    if (!id) return { success: false, message: 'ID is required to upsert translations' };
    if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };
    return await upsertAddonTranslation(id, payload);
}

export async function getAllAddonTranslationsService(id: string) {
    if (!id) return { success: false, message: 'ID is required to fetch translations' };
    return await getAllAddonTranslations(id);
}

export async function getAddonTranslationService(id: string, locale?: string) {
    if (!id) return { success: false, message: 'ID is required to fetch translation' };
    return await getAddonTranslation(id, locale);
}

export async function deleteAddonTranslationLocaleService(id: string, locale: string) {
    if (!id || !locale) return { success: false, message: 'Both ID and Locale are required' };
    return await deleteAddonTranslationLocale(id, locale);
}

// Category
export async function upsertAddonCategoryTranslationService(id: string, payload: UpsertAddonCategoryTranslationPayload) {
    if (!id) return { success: false, message: 'ID is required to upsert translations' };
    if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };
    return await upsertAddonCategoryTranslation(id, payload);
}

export async function getAllAddonCategoryTranslationsService(id: string) {
    if (!id) return { success: false, message: 'ID is required to fetch translations' };
    return await getAllAddonCategoryTranslations(id);
}

export async function getAddonCategoryTranslationService(id: string, locale?: string) {
    if (!id) return { success: false, message: 'ID is required to fetch translation' };
    return await getAddonCategoryTranslation(id, locale);
}

export async function deleteAddonCategoryTranslationLocaleService(id: string, locale: string) {
    if (!id || !locale) return { success: false, message: 'Both ID and Locale are required' };
    return await deleteAddonCategoryTranslationLocale(id, locale);
}

// Sub-category
export async function upsertAddonSubCategoryTranslationService(id: string, payload: UpsertAddonSubCategoryTranslationPayload) {
    if (!id) return { success: false, message: 'ID is required to upsert translations' };
    if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };
    return await upsertAddonSubCategoryTranslation(id, payload);
}

export async function getAllAddonSubCategoryTranslationsService(id: string) {
    if (!id) return { success: false, message: 'ID is required to fetch translations' };
    return await getAllAddonSubCategoryTranslations(id);
}

export async function getAddonSubCategoryTranslationService(id: string, locale?: string) {
    if (!id) return { success: false, message: 'ID is required to fetch translation' };
    return await getAddonSubCategoryTranslation(id, locale);
}

export async function deleteAddonSubCategoryTranslationLocaleService(id: string, locale: string) {
    if (!id || !locale) return { success: false, message: 'Both ID and Locale are required' };
    return await deleteAddonSubCategoryTranslationLocale(id, locale);
}

// Variant
export async function upsertAddonVariantTranslationService(id: string, payload: UpsertAddonVariantTranslationPayload) {
    if (!id) return { success: false, message: 'ID is required to upsert translations' };
    if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };
    return await upsertAddonVariantTranslation(id, payload);
}

export async function getAllAddonVariantTranslationsService(id: string) {
    if (!id) return { success: false, message: 'ID is required to fetch translations' };
    return await getAllAddonVariantTranslations(id);
}

export async function getAddonVariantTranslationService(id: string, locale?: string) {
    if (!id) return { success: false, message: 'ID is required to fetch translation' };
    return await getAddonVariantTranslation(id, locale);
}

export async function deleteAddonVariantTranslationLocaleService(id: string, locale: string) {
    if (!id || !locale) return { success: false, message: 'Both ID and Locale are required' };
    return await deleteAddonVariantTranslationLocale(id, locale);
}
