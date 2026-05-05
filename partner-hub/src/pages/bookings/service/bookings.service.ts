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
console.log(bookingData);
        if (!bookingData.guestDetails || bookingData.guestDetails.length === 0) {
            return { success: false, message: "At least one guest is required." };
        }

        const { guestDetails } = bookingData;

        // Validate booking details
        if (!bookingData.propertyCode) {
            return { success: false, message: "Property code is required." };
        }

        if (!bookingData.roomTypeCode) {
            return { success: false, message: "Room type code is required." };
        }

        if (!bookingData.ratePlanCode) {
            return { success: false, message: "Rate plan code is required." };
        }

        if (!bookingData.reservationStartDate || !bookingData.reservationEndDate) {
            return { success: false, message: "Check-in and check-out dates are required." };
        }

        if (!bookingData.bookingUserEmail) {
            return { success: false, message: "Guest email is required." };
        }

        if (!bookingData.paymentMethod) {
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