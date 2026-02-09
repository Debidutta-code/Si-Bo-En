import { fetchPaymentDetails, createBooking } from "../apis/bookings.api";
import { ICreateBookingPayload } from "../types/bookings.types";

export const fetchPaymentDetailsService = async (propertyId: string) => {
    try {
        if (!propertyId || propertyId.trim() === "") {
            return { success: false, message: "Property ID is required." };
        }

        const response = await fetchPaymentDetails(propertyId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to fetch payment details." };
    }
};

export const createBookingService = async (bookingData: ICreateBookingPayload) => {
    try {
        // Validate required fields
        if (!bookingData.data?.bookingDetails) {
            return { success: false, message: "Booking details are required." };
        }

        if (!bookingData.data?.guestDetails || bookingData.data.guestDetails.length === 0) {
            return { success: false, message: "At least one guest is required." };
        }

        const { bookingDetails, guestDetails } = bookingData.data;

        // Validate booking details
        if (!bookingDetails.propertyCode) {
            return { success: false, message: "Property code is required." };
        }

        if (!bookingDetails.roomTypeCode) {
            return { success: false, message: "Room type code is required." };
        }

        if (!bookingDetails.ratePlanCode) {
            return { success: false, message: "Rate plan code is required." };
        }

        if (!bookingDetails.startDate || !bookingDetails.endDate) {
            return { success: false, message: "Check-in and check-out dates are required." };
        }

        if (!bookingDetails.email) {
            return { success: false, message: "Guest email is required." };
        }

        if (!bookingDetails.paymentMethod) {
            return { success: false, message: "Payment method is required." };
        }

        // Validate guest details
        const primaryGuest = guestDetails[0];
        if (!primaryGuest.firstName || !primaryGuest.lastName) {
            return { success: false, message: "Primary guest first and last name are required." };
        }

        const response = await createBooking(bookingData);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to create booking." };
    }
};