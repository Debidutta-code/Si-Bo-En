import {
    upsertPolicyTranslation,
    getAllPolicyTranslations,
    getPolicyTranslation,
    deletePolicyTranslationLocale,
} from "../api/policy-multilang.api";
import type { UpsertPolicyTranslationPayload } from "../interfaces/policy-multilang.interface";

export async function upsertPolicyTranslationService(id: string, payload: UpsertPolicyTranslationPayload) {
    try {
        
        if (!id) return { success: false, message: 'ID is required to upsert translations' };
        if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };
    
        const result = await upsertPolicyTranslation(id, payload);
        return result;
    } catch (error) {
        return{
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred while upserting translation'
        }
    }
}

export async function getAllPolicyTranslationsService(id: string) {
    try {
        
        if (!id) return { success: false, message: 'ID is required to fetch translations' };
        const result = await getAllPolicyTranslations(id);
        return result;
    } catch (error) {
        return{
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred while fetching translations'
        }
    }
}

export async function getPolicyTranslationService(id: string, locale?: string) {
    try {
        if (!id) return { success: false, message: 'ID is required to fetch translation' };
        const result = await getPolicyTranslation(id, locale);
        return result;
    } catch (error) {
        return{
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred while fetching translation'
        }
    }
}

export async function deletePolicyTranslationLocaleService(id: string, locale: string) {
    try {
        if (!id || !locale) return { success: false, message: 'Both ID and Locale are required' };
        const result = await deletePolicyTranslationLocale(id, locale);
        return result;
    } catch (error) {
        return{
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred while deleting translation'
        }
    }
}
