import createAxiosInstance from "@/components/axiosInstance";
import type { UpsertRatePlanTranslationPayload } from "../interfaces/ratePlan-language.type";

const axiosInstance = createAxiosInstance();
const BASE_PATH = "/multi-language/rate-plan";

export async function upsertRatePlanTranslation(ratePlanId: string, payload: UpsertRatePlanTranslationPayload) {
	try {
		const response = await axiosInstance.put(`${BASE_PATH}/${ratePlanId}`, payload);
		return response.data;
	} catch (error: any) {
		if (error?.response?.data && !error.response.data.success) {
			return error.response.data;
		}
		return { success: false, message: error?.message ?? 'Unknown error' };
	}
}

export async function getAllRatePlanTranslations(ratePlanId: string) {
	try {
		const response = await axiosInstance.get(`${BASE_PATH}/${ratePlanId}/all`);
		return response.data;
	} catch (error: any) {
		if (error?.response?.data && !error.response.data.success) {
			return error.response.data;
		}
		return { success: false, message: error?.message ?? 'Unknown error' };
	}
}

export async function getRatePlanTranslation(ratePlanId: string, locale?: string) {
	try {
		const url = locale ? `${BASE_PATH}/${ratePlanId}?locale=${encodeURIComponent(locale)}` : `${BASE_PATH}/${ratePlanId}`;
		const response = await axiosInstance.get(url);
		return response.data;
	} catch (error: any) {
		if (error?.response?.data && !error.response.data.success) {
			return error.response.data;
		}
		return { success: false, message: error?.message ?? 'Unknown error' };
	}
}

export async function deleteRatePlanTranslationLocale(ratePlanId: string, locale: string) {
	try {
		const response = await axiosInstance.delete(`${BASE_PATH}/${ratePlanId}/${locale}`);
		return response.data;
	} catch (error: any) {
		if (error?.response?.data && !error.response.data.success) {
			return error.response.data;
		}
		return { success: false, message: error?.message ?? 'Unknown error' };
	}
}
