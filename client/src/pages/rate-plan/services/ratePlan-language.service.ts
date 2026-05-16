import {
	upsertRatePlanTranslation,
	getAllRatePlanTranslations,
	getRatePlanTranslation,
	deleteRatePlanTranslationLocale,
} from "../api/ratePlan-language.api";
import type { UpsertRatePlanTranslationPayload } from "../interfaces/ratePlan-language.type";

export async function upsertRatePlanTranslationService(id: string, payload: UpsertRatePlanTranslationPayload) {
	if (!id) return { success: false, message: 'ID is required to upsert translations' };
	if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };

	const result = await upsertRatePlanTranslation(id, payload);
	return result;
}

export async function getAllRatePlanTranslationsService(id: string) {
	if (!id) return { success: false, message: 'ID is required to fetch translations' };
	const result = await getAllRatePlanTranslations(id);
	return result;
}

export async function getRatePlanTranslationService(id: string, locale?: string) {
	if (!id) return { success: false, message: 'ID is required to fetch translation' };
	const result = await getRatePlanTranslation(id, locale);
	return result;
}

export async function deleteRatePlanTranslationLocaleService(id: string, locale: string) {
	if (!id || !locale) return { success: false, message: 'Both ID and Locale are required' };
	const result = await deleteRatePlanTranslationLocale(id, locale);
	return result;
}
