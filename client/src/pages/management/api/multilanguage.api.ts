import createAxiosInstance from "@/components/axiosInstance";
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

const axiosInstance = createAxiosInstance();

// --- Helper for generic API calls ---
async function handleRequest(request: Promise<any>) {
    try {
        const response = await request;
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response?.data || { success: false, message: "Unknown error occurred" };
        }
        return { success: false, message: error?.message };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MasterPropertyCategory
// ─────────────────────────────────────────────────────────────────────────────
const CAT_PATH = "/multi-language/master-property-category";

export const upsertMasterPropertyCategoryTranslation = (id: string, payload: UpsertMasterPropertyCategoryTranslationPayload) => 
    handleRequest(axiosInstance.put(`${CAT_PATH}/${id}`, payload));

export const getMasterPropertyCategoryTranslation = (id: string, locale?: string) => 
    handleRequest(axiosInstance.get(`${CAT_PATH}/${id}${locale ? `?locale=${locale}` : ''}`));

export const getAllMasterPropertyCategoryTranslations = (id: string) => 
    handleRequest(axiosInstance.get(`${CAT_PATH}/${id}/all`));

export const deleteMasterPropertyCategoryTranslationLocale = (id: string, locale: string) => 
    handleRequest(axiosInstance.delete(`${CAT_PATH}/${id}/${locale}`));

// ─────────────────────────────────────────────────────────────────────────────
// MasterPropertyType
// ─────────────────────────────────────────────────────────────────────────────
const TYPE_PATH = "/multi-language/master-property-type";

export const upsertMasterPropertyTypeTranslation = (id: string, payload: UpsertMasterPropertyTypeTranslationPayload) => 
    handleRequest(axiosInstance.put(`${TYPE_PATH}/${id}`, payload));

export const getMasterPropertyTypeTranslation = (id: string, locale?: string) => 
    handleRequest(axiosInstance.get(`${TYPE_PATH}/${id}${locale ? `?locale=${locale}` : ''}`));

export const getAllMasterPropertyTypeTranslations = (id: string) => 
    handleRequest(axiosInstance.get(`${TYPE_PATH}/${id}/all`));

export const deleteMasterPropertyTypeTranslationLocale = (id: string, locale: string) => 
    handleRequest(axiosInstance.delete(`${TYPE_PATH}/${id}/${locale}`));

// ─────────────────────────────────────────────────────────────────────────────
// MasterAmenity
// ─────────────────────────────────────────────────────────────────────────────
const AMENITY_PATH = "/multi-language/master-amenity";

export const upsertMasterAmenityTranslation = (id: string, payload: UpsertMasterAmenityTranslationPayload) => 
    handleRequest(axiosInstance.put(`${AMENITY_PATH}/${id}`, payload));

export const getMasterAmenityTranslation = (id: string, locale?: string) => 
    handleRequest(axiosInstance.get(`${AMENITY_PATH}/${id}${locale ? `?locale=${locale}` : ''}`));

export const getAllMasterAmenityTranslations = (id: string) => 
    handleRequest(axiosInstance.get(`${AMENITY_PATH}/${id}/all`));

export const deleteMasterAmenityTranslationLocale = (id: string, locale: string) => 
    handleRequest(axiosInstance.delete(`${AMENITY_PATH}/${id}/${locale}`));

// ─────────────────────────────────────────────────────────────────────────────
// MasterRoomView
// ─────────────────────────────────────────────────────────────────────────────
const VIEW_PATH = "/multi-language/master-room-view";

export const upsertMasterRoomViewTranslation = (id: string, payload: UpsertMasterRoomViewTranslationPayload) => 
    handleRequest(axiosInstance.put(`${VIEW_PATH}/${id}`, payload));

export const getMasterRoomViewTranslation = (id: string, locale?: string) => 
    handleRequest(axiosInstance.get(`${VIEW_PATH}/${id}${locale ? `?locale=${locale}` : ''}`));

export const getAllMasterRoomViewTranslations = (id: string) => 
    handleRequest(axiosInstance.get(`${VIEW_PATH}/${id}/all`));

export const deleteMasterRoomViewTranslationLocale = (id: string, locale: string) => 
    handleRequest(axiosInstance.delete(`${VIEW_PATH}/${id}/${locale}`));

// ─────────────────────────────────────────────────────────────────────────────
// MasterIntegration
// ─────────────────────────────────────────────────────────────────────────────
const INTEGRATION_PATH = "/multi-language/master-integration";

export const upsertMasterIntegrationTranslation = (id: string, payload: UpsertMasterIntegrationTranslationPayload) => 
    handleRequest(axiosInstance.put(`${INTEGRATION_PATH}/${id}`, payload));

export const getMasterIntegrationTranslation = (id: string, locale?: string) => 
    handleRequest(axiosInstance.get(`${INTEGRATION_PATH}/${id}${locale ? `?locale=${locale}` : ''}`));

export const getAllMasterIntegrationTranslations = (id: string) => 
    handleRequest(axiosInstance.get(`${INTEGRATION_PATH}/${id}/all`));

export const deleteMasterIntegrationTranslationLocale = (id: string, locale: string) => 
    handleRequest(axiosInstance.delete(`${INTEGRATION_PATH}/${id}/${locale}`));

// ─────────────────────────────────────────────────────────────────────────────
// MasterLoyaltyRegistrationField
// ─────────────────────────────────────────────────────────────────────────────
const LOYALTY_REG_FIELD_PATH = "/multi-language/master-loyalty-registration-field";

export const upsertMasterLoyaltyRegistrationFieldTranslation = (id: string, payload: UpsertMasterLoyaltyRegistrationFieldTranslationPayload) => 
    handleRequest(axiosInstance.put(`${LOYALTY_REG_FIELD_PATH}/${id}`, payload));

export const getMasterLoyaltyRegistrationFieldTranslation = (id: string, locale?: string) => 
    handleRequest(axiosInstance.get(`${LOYALTY_REG_FIELD_PATH}/${id}${locale ? `?locale=${locale}` : ''}`));

export const getAllMasterLoyaltyRegistrationFieldTranslations = (id: string) => 
    handleRequest(axiosInstance.get(`${LOYALTY_REG_FIELD_PATH}/${id}/all`));

export const deleteMasterLoyaltyRegistrationFieldTranslationLocale = (id: string, locale: string) => 
    handleRequest(axiosInstance.delete(`${LOYALTY_REG_FIELD_PATH}/${id}/${locale}`));

// ─────────────────────────────────────────────────────────────────────────────
// SpaCategory
// ─────────────────────────────────────────────────────────────────────────────
const SPA_CAT_PATH = "/multi-language/spa-category";

export const upsertSpaCategoryTranslation = (id: string, payload: UpsertSpaCategoryTranslationPayload) => 
    handleRequest(axiosInstance.put(`${SPA_CAT_PATH}/${id}`, payload));

export const getSpaCategoryTranslation = (id: string, locale?: string) => 
    handleRequest(axiosInstance.get(`${SPA_CAT_PATH}/${id}${locale ? `?locale=${locale}` : ''}`));

export const getAllSpaCategoryTranslations = (id: string) => 
    handleRequest(axiosInstance.get(`${SPA_CAT_PATH}/${id}/all`));

export const deleteSpaCategoryTranslationLocale = (id: string, locale: string) => 
    handleRequest(axiosInstance.delete(`${SPA_CAT_PATH}/${id}/${locale}`));

// ─────────────────────────────────────────────────────────────────────────────
// SpaSubCategory
// ─────────────────────────────────────────────────────────────────────────────
const SPA_SUB_CAT_PATH = "/multi-language/spa-sub-category";

export const upsertSpaSubCategoryTranslation = (id: string, payload: UpsertSpaSubCategoryTranslationPayload) => 
    handleRequest(axiosInstance.put(`${SPA_SUB_CAT_PATH}/${id}`, payload));

export const getSpaSubCategoryTranslation = (id: string, locale?: string) => 
    handleRequest(axiosInstance.get(`${SPA_SUB_CAT_PATH}/${id}${locale ? `?locale=${locale}` : ''}`));

export const getAllSpaSubCategoryTranslations = (id: string) => 
    handleRequest(axiosInstance.get(`${SPA_SUB_CAT_PATH}/${id}/all`));

export const deleteSpaSubCategoryTranslationLocale = (id: string, locale: string) => 
    handleRequest(axiosInstance.delete(`${SPA_SUB_CAT_PATH}/${id}/${locale}`));
