import createAxiosInstance from "@/components/axiosInstance";
import type { UpsertPolicyTranslationPayload } from "../interfaces/policy-multilang.interface";

const axiosInstance = createAxiosInstance();
const BASE_PATH = "/multi-language/policy";

export async function upsertPolicyTranslation(policyId: string, payload: UpsertPolicyTranslationPayload) {
    try {
        const response = await axiosInstance.put(`${BASE_PATH}/${policyId}`, payload);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data && !error.response.data.success) {
            return error.response.data;
        }
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export async function getAllPolicyTranslations(policyId: string) {
    try {
        const response = await axiosInstance.get(`${BASE_PATH}/${policyId}/all`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data && !error.response.data.success) {
            return error.response.data;
        }
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export async function getPolicyTranslation(policyId: string, locale?: string) {
    try {
        const url = locale ? `${BASE_PATH}/${policyId}?locale=${encodeURIComponent(locale)}` : `${BASE_PATH}/${policyId}`;
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data && !error.response.data.success) {
            return error.response.data;
        }
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}

export async function deletePolicyTranslationLocale(policyId: string, locale: string) {
    try {
        const response = await axiosInstance.delete(`${BASE_PATH}/${policyId}/${locale}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data && !error.response.data.success) {
            return error.response.data;
        }
        return { success: false, message: error?.message ?? 'Unknown error' };
    }
}
