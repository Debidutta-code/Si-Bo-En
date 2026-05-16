import createAxiosInstance from "@/components/axiosInstance";
import type { UpsertPropertyTranslationPayload } from "../interface/property.interface";

const axiosInstance = createAxiosInstance();
const BASE_PATH = "/multi-language/property";

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

export const upsertPropertyTranslation = (id: string, payload: UpsertPropertyTranslationPayload) => 
    handleRequest(axiosInstance.put(`${BASE_PATH}/${id}`, payload));

export const getPropertyTranslation = (id: string, locale?: string) => 
    handleRequest(axiosInstance.get(`${BASE_PATH}/${id}${locale ? `?locale=${locale}` : ''}`));

export const getAllPropertyTranslations = (id: string) => 
    handleRequest(axiosInstance.get(`${BASE_PATH}/${id}/all`));

export const deletePropertyTranslationLocale = (id: string, locale: string) => 
    handleRequest(axiosInstance.delete(`${BASE_PATH}/${id}/${locale}`));
