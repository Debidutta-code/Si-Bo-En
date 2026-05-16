import createAxiosInstance from "@/components/axiosInstance";
import type {
    UpsertPromoCodeTranslationPayload,
} from "../interfaces/promo-code-multilang.types";

const axiosInstance = createAxiosInstance();
const PROMO_CODE_MULTI_LANG_BASE = "/multi-language/promocode";

function buildErrorResponse(error: any) {
    if (error?.response?.data && !error.response.data.success) {
        return error.response.data;
    }
    return { success: false, message: error?.message ?? "Unknown error" };
}

export const upsertPromoCodeTranslation = async (
    promoCodeId: string,
    payload: UpsertPromoCodeTranslationPayload
) => {
    try {
        const response = await axiosInstance.put(`${PROMO_CODE_MULTI_LANG_BASE}/${promoCodeId}`, payload);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
};

export const getAllPromoCodeTranslations = async (promoCodeId: string) => {
    try {
        const response = await axiosInstance.get(`${PROMO_CODE_MULTI_LANG_BASE}/${promoCodeId}/all`);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
};

export const getPromoCodeTranslation = async (promoCodeId: string, locale?: string) => {
    try {
        const url = locale
            ? `${PROMO_CODE_MULTI_LANG_BASE}/${promoCodeId}?locale=${encodeURIComponent(locale)}`
            : `${PROMO_CODE_MULTI_LANG_BASE}/${promoCodeId}`;
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
};

export const deletePromoCodeTranslationLocale = async (promoCodeId: string, locale: string) => {
    try {
        const response = await axiosInstance.delete(`${PROMO_CODE_MULTI_LANG_BASE}/${promoCodeId}/${locale}`);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
};
