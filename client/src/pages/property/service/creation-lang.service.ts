import {
	upsertCreationTranslation,
	getAllCreationTranslations,
	getCreationTranslation,
	deleteCreationTranslationLocale,
} from "../api/creation-lang.api";
import type { UpsertCreationTranslationPayload } from "../types/creation-lang.types";

export async function upsertCreationTranslationService(id: string, payload: UpsertCreationTranslationPayload) {
	if (!id) return { success: false, message: 'ID is required to upsert translations' };
	if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };

	const result = await upsertCreationTranslation(id, payload);
	return result;
}

export async function getAllCreationTranslationsService(id: string) {
	if (!id) return { success: false, message: 'ID is required to fetch translations' };
	const result = await getAllCreationTranslations(id);
	return result;
}

export async function getCreationTranslationService(id: string, locale?: string) {
	if (!id) return { success: false, message: 'ID is required to fetch translation' };
	const result = await getCreationTranslation(id, locale);
	return result;
}

export async function deleteCreationTranslationLocaleService(id: string, locale: string) {
	if (!id || !locale) return { success: false, message: 'Both ID and Locale are required' };
	const result = await deleteCreationTranslationLocale(id, locale);
	return result;
}
