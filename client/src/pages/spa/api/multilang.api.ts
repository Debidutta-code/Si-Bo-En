import createAxiosInstance from "@/components/axiosInstance";
import type { UpsertSpaTranslationPayload } from "../interfaces/multilang.type";

const axiosInstance = createAxiosInstance();
const BASE_PATH = "/multi-language/spa";

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
// Spa Translation
// ─────────────────────────────────────────────────────────────────────────────

export const upsertSpaTranslation = (id: string, payload: UpsertSpaTranslationPayload) => 
    handleRequest(axiosInstance.put(`${BASE_PATH}/${id}`, payload));

export const getSpaTranslation = (id: string, locale?: string) => 
    handleRequest(axiosInstance.get(`${BASE_PATH}/${id}${locale ? `?locale=${locale}` : ''}`));

export const getAllSpaTranslations = (id: string) => 
    handleRequest(axiosInstance.get(`${BASE_PATH}/${id}/all`));

export const deleteSpaTranslationLocale = (id: string, locale: string) => 
    handleRequest(axiosInstance.delete(`${BASE_PATH}/${id}/${locale}`));
