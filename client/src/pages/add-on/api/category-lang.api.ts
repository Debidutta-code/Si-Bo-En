import createAxiosInstance from "@/components/axiosInstance";
import type { UpsertAddonCategoryTranslationPayload } from "../interface/multi-lang.interface";

const axiosInstance = createAxiosInstance();
const BASE_PATH = "/multi-language/addon-category";

export async function upsertAddonCategoryTranslation(addonCategoryId: string, payload: UpsertAddonCategoryTranslationPayload) {
    try {
        const response = await axiosInstance.put(`${BASE_PATH}/${addonCategoryId}`, payload);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data && !error.response.data.success) return error.response.data;
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export async function getAllAddonCategoryTranslations(addonCategoryId: string) {
    try {
        const response = await axiosInstance.get(`${BASE_PATH}/${addonCategoryId}/all`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data && !error.response.data.success) return error.response.data;
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export async function getAddonCategoryTranslation(addonCategoryId: string, locale?: string) {
    try {
        const url = locale ? `${BASE_PATH}/${addonCategoryId}?locale=${encodeURIComponent(locale)}` : `${BASE_PATH}/${addonCategoryId}`;
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data && !error.response.data.success) return error.response.data;
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export async function deleteAddonCategoryTranslationLocale(addonCategoryId: string, locale: string) {
    try {
        const response = await axiosInstance.delete(`${BASE_PATH}/${addonCategoryId}/${locale}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data && !error.response.data.success) return error.response.data;
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}
