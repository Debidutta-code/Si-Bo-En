import createAxiosInstance from "@/components/axiosInstance";
import type { UpsertCreationTranslationPayload } from "../types/creation-lang.types";

const axiosInstance = createAxiosInstance();
const BASE_PATH = "/multi-language/creation";

export async function upsertCreationTranslation(creationId: string, payload: UpsertCreationTranslationPayload) {
	try {
		const response = await axiosInstance.put(`${BASE_PATH}/${creationId}`, payload);
		return response.data;
	} catch (error: any) {
		if (error?.response?.data && !error.response.data.success) {
			return error.response.data;
		}
		return { success: false, message: error?.message ?? 'Unknown error' };
	}
}

export async function getAllCreationTranslations(creationId: string) {
	try {
		const response = await axiosInstance.get(`${BASE_PATH}/${creationId}/all`);
		return response.data;
	} catch (error: any) {
		if (error?.response?.data && !error.response.data.success) {
			return error.response.data;
		}
		return { success: false, message: error?.message ?? 'Unknown error' };
	}
}

export async function getCreationTranslation(creationId: string, locale?: string) {
	try {
		const url = locale ? `${BASE_PATH}/${creationId}?locale=${encodeURIComponent(locale)}` : `${BASE_PATH}/${creationId}`;
		const response = await axiosInstance.get(url);
		return response.data;
	} catch (error: any) {
		if (error?.response?.data && !error.response.data.success) {
			return error.response.data;
		}
		return { success: false, message: error?.message ?? 'Unknown error' };
	}
}

export async function deleteCreationTranslationLocale(creationId: string, locale: string) {
	try {
		const response = await axiosInstance.delete(`${BASE_PATH}/${creationId}/${locale}`);
		return response.data;
	} catch (error: any) {
		if (error?.response?.data && !error.response.data.success) {
			return error.response.data;
		}
		return { success: false, message: error?.message ?? 'Unknown error' };
	}
}
