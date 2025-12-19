import BookingAddOnRepository from "../repository/bookingAddon.repository";
import AddonRepository from "../repository/addon.repository";
import { IBookingAddon } from "../interfaces";
import { IApiResponse } from "../../utils/return.types";
import { successResponse, errorResponse } from "../../utils/return";

export class BookingAddonService {
    /**
     * Create a booking addon
     */
    async createBookingAddon(bookingAddonData: IBookingAddon): Promise<IApiResponse> {
        try {

            // Check if addon exists
            const addon = await AddonRepository.getAddonById(bookingAddonData.addonId.toString());
            if (!addon) {
                return errorResponse("Addon not found", "Addon not found");
            }

            // Verify total price calculation
            const calculatedTotal = bookingAddonData.unitPrice * bookingAddonData.quantity;
            if (Math.abs(calculatedTotal - bookingAddonData.totalPrice) > 0.01) {
                return errorResponse("Total price does not match unit price × quantity", "Validation Error");
            }

            const bookingAddon = await BookingAddOnRepository.createBookingAddon(
                bookingAddonData.reservationId,
                bookingAddonData.addonId,
                bookingAddonData.name,
                bookingAddonData.unitPrice,
                bookingAddonData.quantity,
                bookingAddonData.totalPrice,
                bookingAddonData.currencyCode || "INR",
                bookingAddonData.specialInstructions || "",
                bookingAddonData.date || new Date()
            );

            return successResponse("Booking addon created successfully", bookingAddon);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to create booking addon", error.message);
            }
            console.error("Failed to create booking addon at Service Layer:", error);
            return errorResponse("Failed to create booking addon", "Unknown error");
        }
    }

    /**
     * Update booking addon
     */
    async updateBookingAddon(
        bookingAddonId: string,
        updateData: Partial<IBookingAddon>
    ): Promise<IApiResponse> {
        try {

            // If both unit price and quantity are being updated, verify total
            if (updateData.unitPrice !== undefined &&
                updateData.quantity !== undefined &&
                updateData.totalPrice !== undefined) {
                const calculatedTotal = updateData.unitPrice * updateData.quantity;
                if (Math.abs(calculatedTotal - updateData.totalPrice) > 0.01) {
                    return errorResponse("Total price does not match unit price × quantity", "Validation Error");
                }
            }

            const updatedBookingAddon = await BookingAddOnRepository.updateBookingAddOnByBookingId(
                bookingAddonId,
                updateData
            );

            if (!updatedBookingAddon) {
                return errorResponse("Booking addon not found", "Not Found");
            }

            return successResponse("Booking addon updated successfully", updatedBookingAddon);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to update booking addon", error.message);
            }
            console.error("Failed to update booking addon at Service Layer:", error);
            return errorResponse("Failed to update booking addon", "Unknown error");
        }
    }

    /**
     * Delete booking addon
     */
    async deleteBookingAddon(bookingAddonId: string): Promise<IApiResponse> {
        try {

            const result = await BookingAddOnRepository.deleteBookingAddOnById(
                bookingAddonId
            );

            if (!result) {
                return errorResponse("Booking addon not found", "Not Found");
            }

            return successResponse("Booking addon deleted successfully", result);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to delete booking addon", error.message);
            }
            console.error("Failed to delete booking addon at Service Layer:", error);
            return errorResponse("Failed to delete booking addon", "Unknown error");
        }
    }

}
