import createAxiosInstance from "@/components/axiosInstance";
import type { UpsertAddonVariantTranslationPayload } from "../interface/multi-lang.interface";

const axiosInstance = createAxiosInstance();
const BASE_PATH = "/multi-language/addon-variant";

export async function upsertAddonVariantTranslation(addonVariantId: string, payload: UpsertAddonVariantTranslationPayload) {
    try {
        const response = await axiosInstance.put(`${BASE_PATH}/${addonVariantId}`, payload);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data && !error.response.data.success) return error.response.data;
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export async function getAllAddonVariantTranslations(addonVariantId: string) {
    try {
        const response = await axiosInstance.get(`${BASE_PATH}/${addonVariantId}/all`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data && !error.response.data.success) return error.response.data;
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export async function getAddonVariantTranslation(addonVariantId: string, locale?: string) {
    try {
        const url = locale ? `${BASE_PATH}/${addonVariantId}?locale=${encodeURIComponent(locale)}` : `${BASE_PATH}/${addonVariantId}`;
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data && !error.response.data.success) return error.response.data;
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export async function deleteAddonVariantTranslationLocale(addonVariantId: string, locale: string) {
    try {
        const response = await axiosInstance.delete(`${BASE_PATH}/${addonVariantId}/${locale}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data && !error.response.data.success) return error.response.data;
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}
