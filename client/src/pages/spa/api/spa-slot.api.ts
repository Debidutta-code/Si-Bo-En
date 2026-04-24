import createAxiosInstance from "@/components/axiosInstance";
import type { ICSpaDatesS, ICSpaSlotS, IgetInDates } from "../interfaces";

const axiosInstance = createAxiosInstance();

// --- Spa Dates API ---

export const createSpaDate = async (spaId: string, dateData: ICSpaDatesS) => {
    try {
        const response = await axiosInstance.post(`/spa/slots/dates/${spaId}`, dateData);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};

export const deleteSpaDate = async (spaId: string) => {
    try {
        const response = await axiosInstance.delete(`/spa/slots/dates/${spaId}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};

export const getSpaForDateRange = async (spaId: string, dateData: IgetInDates) => {
    try {
        // The controller uses POST with startDate and endDate in the body
        const response = await axiosInstance.post(`/spa/slots/dates/range/${spaId}`, dateData);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};


export const createSpaSlots = async (spaDateId: string, slotData: ICSpaSlotS[]) => {
    try {
        const response = await axiosInstance.post(`/spa/slots/slots/${spaDateId}`, slotData);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}

export const deleteSpaSlot = async (slotId: string) => {
    try {
        const response = await axiosInstance.delete(`/spa/slots/slots/${slotId}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}

export const markSlotAsBooked = async (slotId: string, data: { reservationId: string, userName: string }) => {
    try {
        const response = await axiosInstance.patch(`/spa/slots/slots/${slotId}/book`, data);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}

export const markSlotAsAvailable = async (slotId: string) => {
    try {
        const response = await axiosInstance.patch(`/spa/slots/slots/${slotId}/available`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}