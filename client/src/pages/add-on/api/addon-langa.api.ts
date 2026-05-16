import createAxiosInstance from "@/components/axiosInstance";
import type { UpsertAddonTranslationPayload } from "../interface/multi-lang.interface";

const axiosInstance = createAxiosInstance();
const BASE_PATH = "/multi-language/addon";

export async function upsertAddonTranslation(addonId: string, payload: UpsertAddonTranslationPayload) {
    try {
        const response = await axiosInstance.put(`${BASE_PATH}/${addonId}`, payload);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data && !error.response.data.success) return error.response.data;
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export async function getAllAddonTranslations(addonId: string) {
    try {
        const response = await axiosInstance.get(`${BASE_PATH}/${addonId}/all`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data && !error.response.data.success) return error.response.data;
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export async function getAddonTranslation(addonId: string, locale?: string) {
    try {
        const url = locale ? `${BASE_PATH}/${addonId}?locale=${encodeURIComponent(locale)}` : `${BASE_PATH}/${addonId}`;
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data && !error.response.data.success) return error.response.data;
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export async function deleteAddonTranslationLocale(addonId: string, locale: string) {
    try {
        const response = await axiosInstance.delete(`${BASE_PATH}/${addonId}/${locale}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data && !error.response.data.success) return error.response.data;
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}
