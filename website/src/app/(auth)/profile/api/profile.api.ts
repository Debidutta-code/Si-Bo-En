import axios from "axios";

const CUSTOMER_BASE = `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer`;
const SPA_BASE = `${process.env.NEXT_PUBLIC_BACKEND_URL}/spa`;

/** Fetch the authenticated customer's profile via cookie */
export const getMyProfileApi = async () => {
    try {
        const response = await axios.get(`${CUSTOMER_BASE}/me`, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        return error?.response?.data ?? { success: false, message: error?.message };
    }
};

/** Fetch available spas for a booking */
export const getAvailableSpasApi = async (bookingCode: string) => {
    try {
        const response = await axios.get(`${SPA_BASE}/available/${bookingCode}`, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        return error?.response?.data ?? { success: false, message: error?.message };
    }
};

/** Mark a spa slot as booked */
export const markSlotAsBookedApi = async (slotId: string, data: { reservationId: string; userName: string }) => {
    try {
        const response = await axios.patch(`${SPA_BASE}/slots/slots/${slotId}/book`, data, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        return error?.response?.data ?? { success: false, message: error?.message };
    }
};

/** Mark a spa slot as available (cancel booking) */
export const markSlotAsAvailableApi = async (slotId: string) => {
    try {
        const response = await axios.patch(`${SPA_BASE}/slots/slots/${slotId}/available`, {}, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        return error?.response?.data ?? { success: false, message: error?.message };
    }
};