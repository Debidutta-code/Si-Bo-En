import createAxiosInstance from "@/components/axiosInstance";
import type { UpsertPromoCodeTranslationPayload } from "../interfaces/promo-code-multilang.types";

const axiosInstance = createAxiosInstance();
const BASE_PATH = "/multi-language/promotion";

function buildErrorResponse(error: any) {
    if (error?.response?.data && !error.response.data.success) {
        return error.response.data;
    }
    return { success: false, message: error?.message ?? "Unknown error" };
}

export async function upsertPromoCodeTranslation(promoCodeId: string, payload: UpsertPromoCodeTranslationPayload) {
    try {
        const response = await axiosInstance.put(`${BASE_PATH}/${promoCodeId}`, payload);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}

export async function getAllPromoCodeTranslations(promoCodeId: string) {
    try {
        const response = await axiosInstance.get(`${BASE_PATH}/${promoCodeId}/all`);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}

export async function getPromoCodeTranslation(promoCodeId: string, locale?: string) {
    try {
        const url = locale
            ? `${BASE_PATH}/${promoCodeId}?locale=${encodeURIComponent(locale)}`
            : `${BASE_PATH}/${promoCodeId}`;
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}

export async function deletePromoCodeTranslationLocale(promoCodeId: string, locale: string) {
    try {
        const response = await axiosInstance.delete(`${BASE_PATH}/${promoCodeId}/${locale}`);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}
