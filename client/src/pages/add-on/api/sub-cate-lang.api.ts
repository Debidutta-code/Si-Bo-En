import createAxiosInstance from "@/components/axiosInstance";
import type { UpsertAddonSubCategoryTranslationPayload } from "../interface/multi-lang.interface";

const axiosInstance = createAxiosInstance();
const BASE_PATH = "/multi-language/addon-sub-category";

export async function upsertAddonSubCategoryTranslation(addonSubCategoryId: string, payload: UpsertAddonSubCategoryTranslationPayload) {
    try {
        const response = await axiosInstance.put(`${BASE_PATH}/${addonSubCategoryId}`, payload);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data && !error.response.data.success) return error.response.data;
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export async function getAllAddonSubCategoryTranslations(addonSubCategoryId: string) {
    try {
        const response = await axiosInstance.get(`${BASE_PATH}/${addonSubCategoryId}/all`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data && !error.response.data.success) return error.response.data;
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export async function getAddonSubCategoryTranslation(addonSubCategoryId: string, locale?: string) {
    try {
        const url = locale ? `${BASE_PATH}/${addonSubCategoryId}?locale=${encodeURIComponent(locale)}` : `${BASE_PATH}/${addonSubCategoryId}`;
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data && !error.response.data.success) return error.response.data;
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export async function deleteAddonSubCategoryTranslationLocale(addonSubCategoryId: string, locale: string) {
    try {
        const response = await axiosInstance.delete(`${BASE_PATH}/${addonSubCategoryId}/${locale}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data && !error.response.data.success) return error.response.data;
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}
