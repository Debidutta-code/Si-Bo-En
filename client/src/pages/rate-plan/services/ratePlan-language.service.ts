import {
	upsertRatePlanTranslation,
	getAllRatePlanTranslations,
	getRatePlanTranslation,
	deleteRatePlanTranslationLocale,
} from "../api/ratePlan-language.api";
import type { UpsertRatePlanTranslationPayload } from "../interfaces/ratePlan-language.type";

export async function upsertRatePlanTranslationService(id: string, payload: UpsertRatePlanTranslationPayload) {
	try {
		
		if (!id) return { success: false, message: 'ID is required to upsert translations' };
		if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };
	
		const result = await upsertRatePlanTranslation(id, payload);
		return result;
	} catch (error) {
		return {
			success: false,
			message: 'Failed to upsert translation',
			
		}
	}
}

export async function getAllRatePlanTranslationsService(id: string) {
	try {
		if (!id) return { success: false, message: 'ID is required to fetch translations' };
		const result = await getAllRatePlanTranslations(id);
		return result;
		
	} catch (error) {
		return {
			success: false,
			message: 'Failed to fetch translations',
			
		}
	}
}

export async function getRatePlanTranslationService(id: string, locale?: string) {
	try {
		if (!id) return { success: false, message: 'ID is required to fetch translation' };
		const result = await getRatePlanTranslation(id, locale);
		return result;
	} catch (error) {
		return {
			success: false,
			message: 'Failed to fetch translation',
			
		}
	}
}

export async function deleteRatePlanTranslationLocaleService(id: string, locale: string) {
	try {
		
		if (!id || !locale) return { success: false, message: 'Both ID and Locale are required' };
		const result = await deleteRatePlanTranslationLocale(id, locale);
		return result;
	} catch (error) {
		return {
			success: false,
			message: 'Failed to delete translation',
			
		}
	}
}
