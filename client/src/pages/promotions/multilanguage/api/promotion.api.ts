import createAxiosInstance from "@/components/axiosInstance";
import type { UpsertPromotionTranslationPayload } from "../types/promotion.type";

const axiosInstance = createAxiosInstance();
const BASE_PATH = "/multi-language/promotion";

export async function upsertPromotionTranslation(id: string, payload: UpsertPromotionTranslationPayload) {
    try {
        const response = await axiosInstance.put(`${BASE_PATH}/${id}`, payload);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) return error.response.data;
        return { success: false, message: error?.message };
    }
}

export async function getAllPromotionTranslations(id: string) {
    try {
        const response = await axiosInstance.get(`${BASE_PATH}/${id}/all`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) return error.response.data;
        return { success: false, message: error?.message };
    }
}

export async function deletePromotionTranslationLocale(id: string, locale: string) {
    try {
        const response = await axiosInstance.delete(`${BASE_PATH}/${id}/${locale}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) return error.response.data;
        return { success: false, message: error?.message };
    }
}
