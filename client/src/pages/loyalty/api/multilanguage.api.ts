import createAxiosInstance from "@/components/axiosInstance";
import type {
    UpsertLoyaltyConditionTranslationPayload,
    UpsertLoyaltySpecialConditionTranslationPayload,
} from "../interfaces/multilanguage.type";

const axiosInstance = createAxiosInstance();
const LOYALTY_CONDITION_BASE = "/multi-language/loyalty-condition";
const LOYALTY_SPECIAL_CONDITION_BASE = "/multi-language/loyalty-special-condition";

function buildErrorResponse(error: any) {
    if (error?.response?.data && !error.response.data.success) {
        return error.response.data;
    }
    return { success: false, message: error?.message ?? "Unknown error" };
}

export async function upsertLoyaltyConditionTranslation(
    loyaltyConditionId: string,
    payload: UpsertLoyaltyConditionTranslationPayload
) {
    try {
        const response = await axiosInstance.put(`${LOYALTY_CONDITION_BASE}/${loyaltyConditionId}`, payload);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}

export async function getAllLoyaltyConditionTranslations(loyaltyConditionId: string) {
    try {
        const response = await axiosInstance.get(`${LOYALTY_CONDITION_BASE}/${loyaltyConditionId}/all`);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}

export async function getLoyaltyConditionTranslation(loyaltyConditionId: string, locale?: string) {
    try {
        const url = locale
            ? `${LOYALTY_CONDITION_BASE}/${loyaltyConditionId}?locale=${encodeURIComponent(locale)}`
            : `${LOYALTY_CONDITION_BASE}/${loyaltyConditionId}`;
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}

export async function deleteLoyaltyConditionTranslationLocale(loyaltyConditionId: string, locale: string) {
    try {
        const response = await axiosInstance.delete(`${LOYALTY_CONDITION_BASE}/${loyaltyConditionId}/${locale}`);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}

export async function upsertLoyaltySpecialConditionTranslation(
    loyaltySpecialConditionId: string,
    payload: UpsertLoyaltySpecialConditionTranslationPayload
) {
    try {
        const response = await axiosInstance.put(`${LOYALTY_SPECIAL_CONDITION_BASE}/${loyaltySpecialConditionId}`, payload);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}

export async function getAllLoyaltySpecialConditionTranslations(loyaltySpecialConditionId: string) {
    try {
        const response = await axiosInstance.get(`${LOYALTY_SPECIAL_CONDITION_BASE}/${loyaltySpecialConditionId}/all`);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}

export async function getLoyaltySpecialConditionTranslation(loyaltySpecialConditionId: string, locale?: string) {
    try {
        const url = locale
            ? `${LOYALTY_SPECIAL_CONDITION_BASE}/${loyaltySpecialConditionId}?locale=${encodeURIComponent(locale)}`
            : `${LOYALTY_SPECIAL_CONDITION_BASE}/${loyaltySpecialConditionId}`;
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}

export async function deleteLoyaltySpecialConditionTranslationLocale(loyaltySpecialConditionId: string, locale: string) {
    try {
        const response = await axiosInstance.delete(`${LOYALTY_SPECIAL_CONDITION_BASE}/${loyaltySpecialConditionId}/${locale}`);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}
