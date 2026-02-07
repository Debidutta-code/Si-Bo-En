import createAxiosInstance from "@/components/axiosInstance";
import { ICreateBookingResponse, ICreateBookingPayload } from "../types/bookings.types";

const axiosInstance = createAxiosInstance();

export const fetchPaymentDetails = async (propertyId: string) => {
    try {
        const response = await axiosInstance.get(
            `/property-management/property/${propertyId}/payment-details`
        );
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message || 'Failed to fetch payment details'
            };
        }
    }
};

export const createBooking = async (bookingData: ICreateBookingPayload) => {
    try {
        const response = await axiosInstance.post<ICreateBookingResponse>(
            '/agent-platform/booking/create',
            bookingData
        );
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message || 'Failed to create booking'
            };
        }
    }
};