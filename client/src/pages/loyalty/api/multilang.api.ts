import createAxiosInstance from "@/components/axiosInstance";
import type { 
    UpsertLoyaltyConditionsTranslationPayload,
    UpsertLoyaltySpecialConditionTranslationPayload
} from "../interfaces/multilang.type";

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
// Loyalty Conditions
// ─────────────────────────────────────────────────────────────────────────────
const COND_PATH = "/multi-language/loyalty-condition";

export const upsertLoyaltyConditionsTranslation = (id: string, payload: UpsertLoyaltyConditionsTranslationPayload) => 
    handleRequest(axiosInstance.put(`${COND_PATH}/${id}`, payload));

export const getLoyaltyConditionsTranslation = (id: string, locale?: string) => 
    handleRequest(axiosInstance.get(`${COND_PATH}/${id}${locale ? `?locale=${locale}` : ''}`));

export const getAllLoyaltyConditionsTranslations = (id: string) => 
    handleRequest(axiosInstance.get(`${COND_PATH}/${id}/all`));

export const deleteLoyaltyConditionsTranslationLocale = (id: string, locale: string) => 
    handleRequest(axiosInstance.delete(`${COND_PATH}/${id}/${locale}`));

// ─────────────────────────────────────────────────────────────────────────────
// Loyalty Special Conditions
// ─────────────────────────────────────────────────────────────────────────────
const SPECIAL_COND_PATH = "/multi-language/loyalty-special-condition";

export const upsertLoyaltySpecialConditionTranslation = (id: string, payload: UpsertLoyaltySpecialConditionTranslationPayload) => 
    handleRequest(axiosInstance.put(`${SPECIAL_COND_PATH}/${id}`, payload));

export const getLoyaltySpecialConditionTranslation = (id: string, locale?: string) => 
    handleRequest(axiosInstance.get(`${SPECIAL_COND_PATH}/${id}${locale ? `?locale=${locale}` : ''}`));

export const getAllLoyaltySpecialConditionTranslations = (id: string) => 
    handleRequest(axiosInstance.get(`${SPECIAL_COND_PATH}/${id}/all`));

export const deleteLoyaltySpecialConditionTranslationLocale = (id: string, locale: string) => 
    handleRequest(axiosInstance.delete(`${SPECIAL_COND_PATH}/${id}/${locale}`));
