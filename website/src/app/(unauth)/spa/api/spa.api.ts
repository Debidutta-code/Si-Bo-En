import axios from "axios";
import {
  ICreateSpaReservationRequest,
  ISpaApiResponse,
  ISpa,
} from "../interface";

const SPA_BASE = `${process.env.NEXT_PUBLIC_BACKEND_URL}/spa`;

export const getSpaByPropertyCodeApi = async (
  propertyCode: string,
): Promise<ISpaApiResponse<ISpa[]>> => {
    try {
        const response = await axios.get(`${SPA_BASE}/property/code/${encodeURIComponent(propertyCode)}`);
        return response.data;
    } catch (error: any) {
        return error?.response?.data ?? { success: false, message: error?.message };
    }
};

export const createSpaReservationApi = async (
  data: ICreateSpaReservationRequest,
): Promise<ISpaApiResponse> => {
    try {
        const response = await axios.post(`${SPA_BASE}/reservation`, data, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        return error?.response?.data ?? { success: false, message: error?.message };
    }
};

/**
 * Cancel entire booking (all slots): pass no spaSlotId
 * Cancel single slot within booking: pass spaSlotId
 */
export const cancelSpaReservationApi = async (
  bookingId: string,
  spaSlotId?: string,
): Promise<ISpaApiResponse> => {
    try {
        const body = spaSlotId ? { spaSlotId } : {};
        const response = await axios.put(
          `${SPA_BASE}/reservation/cancel/${encodeURIComponent(bookingId)}`,
          body,
          { withCredentials: true },
        );
        return response.data;
    } catch (error: any) {
        return error?.response?.data ?? { success: false, message: error?.message };
    }
};