import { protect } from "../../middlewares/auth.middleware";
import {SpaDateController,SpaSlotController} from "../controller";
import { Router } from "express";

const spaSlotRouter = Router();
const spaDateController = new SpaDateController();
const spaSlotController = new SpaSlotController();

// Spa Dates
spaSlotRouter.route("/dates/:id")
    .post(protect, spaDateController.createSpaDate.bind(spaDateController))
    .delete(protect, spaDateController.deleteSpaDate.bind(spaDateController));
spaSlotRouter.route("/dates/range/:id").post(protect, spaDateController.getSpaForDateRange.bind(spaDateController));

// Spa Slots
spaSlotRouter.route("/slots/:id")
    .post(protect, spaSlotController.createSlots.bind(spaSlotController))
    .delete(protect, spaSlotController.deleteSpaSlot.bind(spaSlotController));

// Slot Availability / Booking
spaSlotRouter.route("/slots/:id/book").patch(spaSlotController.markSlotAsBooked.bind(spaSlotController));
spaSlotRouter.route("/slots/:id/available").patch(spaSlotController.markSlotAsAvailable.bind(spaSlotController));
spaSlotRouter.route("/slots/:id/completed").patch(protect, spaSlotController.markSlotAsCompleted.bind(spaSlotController));

export { spaSlotRouter };