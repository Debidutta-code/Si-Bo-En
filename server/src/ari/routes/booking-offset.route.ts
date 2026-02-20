import { Router } from "express";
import { BookingOffsetController } from "../controllers/booking-offset.controller";
import { protect } from "../../middlewares/auth.middleware";
import { attachPropertyDetails } from "../../middlewares/property.middleware";

const bookingOffsetRouter = Router();
const bookingOffsetController = new BookingOffsetController();

bookingOffsetRouter.route("/:propertyId")
    .post(protect, attachPropertyDetails(
        {
            identifierType:"id",
            key:"propertyId",
            source:"params"
        }
    ), bookingOffsetController.createBookingOffsets.bind(bookingOffsetController))
    .get(protect, attachPropertyDetails(
        {
            identifierType:"id",
            key:"propertyId",
            source:"params"
        }
    ), bookingOffsetController.getBookingOffsets.bind(bookingOffsetController))
    .put(protect, attachPropertyDetails(
        {
            identifierType:"id",
            key:"propertyId",
            source:"params"
        }
    ), bookingOffsetController.updateBookingOffsets.bind(bookingOffsetController))
    .delete(protect, attachPropertyDetails(
        {
            identifierType:"id",
            key:"propertyId",
            source:"params"
        }
    ), bookingOffsetController.deleteBookingOffsets.bind(bookingOffsetController));

bookingOffsetRouter.route("/single/:id")
    .put(protect, bookingOffsetController.updateById.bind(bookingOffsetController))
    .delete(protect, bookingOffsetController.deleteById.bind(bookingOffsetController));

export {bookingOffsetRouter};