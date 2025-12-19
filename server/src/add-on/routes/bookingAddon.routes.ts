import { Router } from "express";
import { BookingAddonController } from "../controllers";

const router = Router();
const bookingAddonController = new BookingAddonController();

/**
 * @route   POST /api/addon/booking-addons
 * @desc    Create a booking addon
 * @access  Private
 */
router.post(
    "/",
    // validateRequest(validateCreateBookingAddon),
    bookingAddonController.createBookingAddon
);

/**
 * @route   PUT /api/addon/booking-addons/:bookingAddonId
 * @desc    Update booking addon
 * @access  Private
 */
router.put(
    "/:bookingAddonId",
    // validateRequest(validateUpdateBookingAddon),
    bookingAddonController.updateBookingAddon
);

/**
 * @route   DELETE /api/addon/booking-addons/:bookingAddonId
 * @desc    Delete booking addon
 * @access  Private
 */
router.delete(
    "/:bookingAddonId",
    bookingAddonController.deleteBookingAddon
);


export { router as BookingAddonRoutes };
