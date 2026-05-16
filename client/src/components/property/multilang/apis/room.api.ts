import createAxiosInstance from "@/components/axiosInstance";
import type { UpsertRoomTranslationPayload } from "../interface/room.interface";

const axiosInstance = createAxiosInstance();
const BASE_PATH = "/multi-language/room";

// --- Helper for generic API calls ---
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

// ─────────────────────────────────────────────────────────────────────────────
// Room Translation
// ─────────────────────────────────────────────────────────────────────────────

export const upsertRoomTranslation = (id: string, payload: UpsertRoomTranslationPayload) => 
    handleRequest(axiosInstance.put(`${BASE_PATH}/${id}`, payload));

export const getRoomTranslation = (id: string, locale?: string) => 
    handleRequest(axiosInstance.get(`${BASE_PATH}/${id}${locale ? `?locale=${locale}` : ''}`));

export const getAllRoomTranslations = (id: string) => 
    handleRequest(axiosInstance.get(`${BASE_PATH}/${id}/all`));

export const deleteRoomTranslationLocale = (id: string, locale: string) => 
    handleRequest(axiosInstance.delete(`${BASE_PATH}/${id}/${locale}`));
