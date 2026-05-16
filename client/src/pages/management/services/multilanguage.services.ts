import * as api from "../api/multilanguage.api";
import type { 
    UpsertMasterPropertyCategoryTranslationPayload,
    UpsertMasterPropertyTypeTranslationPayload,
    UpsertMasterAmenityTranslationPayload,
    UpsertMasterRoomViewTranslationPayload,
    UpsertMasterIntegrationTranslationPayload,
    UpsertMasterLoyaltyRegistrationFieldTranslationPayload,
    UpsertSpaCategoryTranslationPayload,
    UpsertSpaSubCategoryTranslationPayload
} from "../types/multilanguage.interface";

// Helper for validating id
const validateId = (id: string, entity: string) => {
    if (!id) return { success: false, message: `ID is required for ${entity}` };
    return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// MasterPropertyCategory
// ─────────────────────────────────────────────────────────────────────────────

export async function upsertMasterPropertyCategoryTranslationService(id: string, payload: UpsertMasterPropertyCategoryTranslationPayload) {
    const error = validateId(id, "MasterPropertyCategory");
    if (error) return error;
    if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };
    return await api.upsertMasterPropertyCategoryTranslation(id, payload);
}

export async function getMasterPropertyCategoryTranslationService(id: string, locale?: string) {
    const error = validateId(id, "MasterPropertyCategory");
    if (error) return error;
    return await api.getMasterPropertyCategoryTranslation(id, locale);
}

export async function getAllMasterPropertyCategoryTranslationsService(id: string) {
    const error = validateId(id, "MasterPropertyCategory");
    if (error) return error;
    return await api.getAllMasterPropertyCategoryTranslations(id);
}

export async function deleteMasterPropertyCategoryTranslationLocaleService(id: string, locale: string) {
    const error = validateId(id, "MasterPropertyCategory");
    if (error) return error;
    if (!locale) return { success: false, message: 'Locale is required' };
    return await api.deleteMasterPropertyCategoryTranslationLocale(id, locale);
}

// ─────────────────────────────────────────────────────────────────────────────
// MasterPropertyType
// ─────────────────────────────────────────────────────────────────────────────

export async function upsertMasterPropertyTypeTranslationService(id: string, payload: UpsertMasterPropertyTypeTranslationPayload) {
    const error = validateId(id, "MasterPropertyType");
    if (error) return error;
    if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };
    return await api.upsertMasterPropertyTypeTranslation(id, payload);
}

export async function getMasterPropertyTypeTranslationService(id: string, locale?: string) {
    const error = validateId(id, "MasterPropertyType");
    if (error) return error;
    return await api.getMasterPropertyTypeTranslation(id, locale);
}

export async function getAllMasterPropertyTypeTranslationsService(id: string) {
    const error = validateId(id, "MasterPropertyType");
    if (error) return error;
    return await api.getAllMasterPropertyTypeTranslations(id);
}

export async function deleteMasterPropertyTypeTranslationLocaleService(id: string, locale: string) {
    const error = validateId(id, "MasterPropertyType");
    if (error) return error;
    if (!locale) return { success: false, message: 'Locale is required' };
    return await api.deleteMasterPropertyTypeTranslationLocale(id, locale);
}

// ─────────────────────────────────────────────────────────────────────────────
// MasterAmenity
// ─────────────────────────────────────────────────────────────────────────────

export async function upsertMasterAmenityTranslationService(id: string, payload: UpsertMasterAmenityTranslationPayload) {
    const error = validateId(id, "MasterAmenity");
    if (error) return error;
    if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };
    return await api.upsertMasterAmenityTranslation(id, payload);
}

export async function getMasterAmenityTranslationService(id: string, locale?: string) {
    const error = validateId(id, "MasterAmenity");
    if (error) return error;
    return await api.getMasterAmenityTranslation(id, locale);
}

export async function getAllMasterAmenityTranslationsService(id: string) {
    const error = validateId(id, "MasterAmenity");
    if (error) return error;
    return await api.getAllMasterAmenityTranslations(id);
}

export async function deleteMasterAmenityTranslationLocaleService(id: string, locale: string) {
    const error = validateId(id, "MasterAmenity");
    if (error) return error;
    if (!locale) return { success: false, message: 'Locale is required' };
    return await api.deleteMasterAmenityTranslationLocale(id, locale);
}

// ─────────────────────────────────────────────────────────────────────────────
// MasterRoomView
// ─────────────────────────────────────────────────────────────────────────────

export async function upsertMasterRoomViewTranslationService(id: string, payload: UpsertMasterRoomViewTranslationPayload) {
    const error = validateId(id, "MasterRoomView");
    if (error) return error;
    if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };
    return await api.upsertMasterRoomViewTranslation(id, payload);
}

export async function getMasterRoomViewTranslationService(id: string, locale?: string) {
    const error = validateId(id, "MasterRoomView");
    if (error) return error;
    return await api.getMasterRoomViewTranslation(id, locale);
}

export async function getAllMasterRoomViewTranslationsService(id: string) {
    const error = validateId(id, "MasterRoomView");
    if (error) return error;
    return await api.getAllMasterRoomViewTranslations(id);
}

export async function deleteMasterRoomViewTranslationLocaleService(id: string, locale: string) {
    const error = validateId(id, "MasterRoomView");
    if (error) return error;
    if (!locale) return { success: false, message: 'Locale is required' };
    return await api.deleteMasterRoomViewTranslationLocale(id, locale);
}

// ─────────────────────────────────────────────────────────────────────────────
// MasterIntegration
// ─────────────────────────────────────────────────────────────────────────────

export async function upsertMasterIntegrationTranslationService(id: string, payload: UpsertMasterIntegrationTranslationPayload) {
    const error = validateId(id, "MasterIntegration");
    if (error) return error;
    if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };
    return await api.upsertMasterIntegrationTranslation(id, payload);
}

export async function getMasterIntegrationTranslationService(id: string, locale?: string) {
    const error = validateId(id, "MasterIntegration");
    if (error) return error;
    return await api.getMasterIntegrationTranslation(id, locale);
}

export async function getAllMasterIntegrationTranslationsService(id: string) {
    const error = validateId(id, "MasterIntegration");
    if (error) return error;
    return await api.getAllMasterIntegrationTranslations(id);
}

export async function deleteMasterIntegrationTranslationLocaleService(id: string, locale: string) {
    const error = validateId(id, "MasterIntegration");
    if (error) return error;
    if (!locale) return { success: false, message: 'Locale is required' };
    return await api.deleteMasterIntegrationTranslationLocale(id, locale);
}

// ─────────────────────────────────────────────────────────────────────────────
// MasterLoyaltyRegistrationField
// ─────────────────────────────────────────────────────────────────────────────

export async function upsertMasterLoyaltyRegistrationFieldTranslationService(id: string, payload: UpsertMasterLoyaltyRegistrationFieldTranslationPayload) {
    const error = validateId(id, "MasterLoyaltyRegistrationField");
    if (error) return error;
    if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };
    return await api.upsertMasterLoyaltyRegistrationFieldTranslation(id, payload);
}

export async function getMasterLoyaltyRegistrationFieldTranslationService(id: string, locale?: string) {
    const error = validateId(id, "MasterLoyaltyRegistrationField");
    if (error) return error;
    return await api.getMasterLoyaltyRegistrationFieldTranslation(id, locale);
}

export async function getAllMasterLoyaltyRegistrationFieldTranslationsService(id: string) {
    const error = validateId(id, "MasterLoyaltyRegistrationField");
    if (error) return error;
    return await api.getAllMasterLoyaltyRegistrationFieldTranslations(id);
}

export async function deleteMasterLoyaltyRegistrationFieldTranslationLocaleService(id: string, locale: string) {
    const error = validateId(id, "MasterLoyaltyRegistrationField");
    if (error) return error;
    if (!locale) return { success: false, message: 'Locale is required' };
    return await api.deleteMasterLoyaltyRegistrationFieldTranslationLocale(id, locale);
}

// ─────────────────────────────────────────────────────────────────────────────
// SpaCategory
// ─────────────────────────────────────────────────────────────────────────────

export async function upsertSpaCategoryTranslationService(id: string, payload: UpsertSpaCategoryTranslationPayload) {
    const error = validateId(id, "SpaCategory");
    if (error) return error;
    if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };
    return await api.upsertSpaCategoryTranslation(id, payload);
}

export async function getSpaCategoryTranslationService(id: string, locale?: string) {
    const error = validateId(id, "SpaCategory");
    if (error) return error;
    return await api.getSpaCategoryTranslation(id, locale);
}

export async function getAllSpaCategoryTranslationsService(id: string) {
    const error = validateId(id, "SpaCategory");
    if (error) return error;
    return await api.getAllSpaCategoryTranslations(id);
}

export async function deleteSpaCategoryTranslationLocaleService(id: string, locale: string) {
    const error = validateId(id, "SpaCategory");
    if (error) return error;
    if (!locale) return { success: false, message: 'Locale is required' };
    return await api.deleteSpaCategoryTranslationLocale(id, locale);
}

// ─────────────────────────────────────────────────────────────────────────────
// SpaSubCategory
// ─────────────────────────────────────────────────────────────────────────────

export async function upsertSpaSubCategoryTranslationService(id: string, payload: UpsertSpaSubCategoryTranslationPayload) {
    const error = validateId(id, "SpaSubCategory");
    if (error) return error;
    if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };
    return await api.upsertSpaSubCategoryTranslation(id, payload);
}

export async function getSpaSubCategoryTranslationService(id: string, locale?: string) {
    const error = validateId(id, "SpaSubCategory");
    if (error) return error;
    return await api.getSpaSubCategoryTranslation(id, locale);
}

export async function getAllSpaSubCategoryTranslationsService(id: string) {
    const error = validateId(id, "SpaSubCategory");
    if (error) return error;
    return await api.getAllSpaSubCategoryTranslations(id);
}

export async function deleteSpaSubCategoryTranslationLocaleService(id: string, locale: string) {
    const error = validateId(id, "SpaSubCategory");
    if (error) return error;
    if (!locale) return { success: false, message: 'Locale is required' };
    return await api.deleteSpaSubCategoryTranslationLocale(id, locale);
}
