import createAxiosInstance from "@/components/axiosInstance";
import type { UpsertPropertyAddressTranslationPayload } from "../interface/property-address.interface";

const axiosInstance = createAxiosInstance();
const BASE_PATH = "/multi-language/property-address";

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

export const upsertPropertyAddressTranslation = (id: string, payload: UpsertPropertyAddressTranslationPayload) => 
    handleRequest(axiosInstance.put(`${BASE_PATH}/${id}`, payload));

export const getPropertyAddressTranslation = (id: string, locale?: string) => 
    handleRequest(axiosInstance.get(`${BASE_PATH}/${id}${locale ? `?locale=${locale}` : ''}`));

export const getAllPropertyAddressTranslations = (id: string) => 
    handleRequest(axiosInstance.get(`${BASE_PATH}/${id}/all`));

export const deletePropertyAddressTranslationLocale = (id: string, locale: string) => 
    handleRequest(axiosInstance.delete(`${BASE_PATH}/${id}/${locale}`));
