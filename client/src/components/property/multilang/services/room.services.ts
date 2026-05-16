import * as api from "../apis/room.api";
import type { UpsertRoomTranslationPayload } from "../interface/room.interface";

// Helper for validating id
const validateId = (id: string, entity: string) => {
    if (!id) return { success: false, message: `ID is required for ${entity}` };
    return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Room Translation
// ─────────────────────────────────────────────────────────────────────────────

export async function upsertRoomTranslationService(id: string, payload: UpsertRoomTranslationPayload) {
    const error = validateId(id, "Room");
    if (error) return error;
    if (!payload || Object.keys(payload).length === 0) return { success: false, message: 'Translation payload cannot be empty' };
    return await api.upsertRoomTranslation(id, payload);
}

export async function getRoomTranslationService(id: string, locale?: string) {
    const error = validateId(id, "Room");
    if (error) return error;
    return await api.getRoomTranslation(id, locale);
}

export async function getAllRoomTranslationsService(id: string) {
    const error = validateId(id, "Room");
    if (error) return error;
    return await api.getAllRoomTranslations(id);
}

export async function deleteRoomTranslationLocaleService(id: string, locale: string) {
    const error = validateId(id, "Room");
    if (error) return error;
    if (!locale) return { success: false, message: 'Locale is required' };
    return await api.deleteRoomTranslationLocale(id, locale);
}
