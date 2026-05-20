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
        const response = await axios.post(`${SPA_BASE}/reservation`, data);
        return response.data;
    } catch (error: any) {
        return error?.response?.data ?? { success: false, message: error?.message };
    }
};

// export const markSpaSlotAvailableApi = async (
//   reservationId: string,
// ): Promise<ISpaApiResponse> => {
//     try {
//         const response = await axios.patch(`${SPA_BASE}/slots/slots/available`, {
//             reservationId,
//         });
//         return response.data;
//     } catch (error: any) {
//         return error?.response?.data ?? { success: false, message: error?.message };
//     }
// };

export const cancelSpaReservationApi = async (
  bookingId: string,
): Promise<ISpaApiResponse> => {
    try {
        const response = await axios.put(`${SPA_BASE}/reservation/cancel/${encodeURIComponent(bookingId)}`);
        return response.data;
    } catch (error: any) {
        return error?.response?.data ?? { success: false, message: error?.message };
    }
};
