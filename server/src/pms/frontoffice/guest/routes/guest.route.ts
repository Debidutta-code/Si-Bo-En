// import { protect } from "../../../../middlewares/auth.middleware";
// import { Router } from "express";
// import { GuestController } from "../controllers/guest.controller";

// const guestRouter = Router();

// const guestController = new GuestController();

// guestRouter.route("/").
//     post(protect, guestController.createGuest.bind(guestController));

// guestRouter.route("/find-by-email").get(protect, guestController.findGuestByEmail.bind(guestController));
// guestRouter.route("/reservations")
//     .get(protect, guestController.getTotalReservationsForAGuest.bind(guestController));
// guestRouter.route("/:guestId")
//     .get(protect, guestController.getGuestById.bind(guestController))
//     .put(protect, guestController.updateGuest.bind(guestController))
//     .delete(protect, guestController.deleteGuest.bind(guestController));
// guestRouter.route("/property/:propertyId")
//     .get(protect, guestController.getGuestForProperty.bind(guestController));

// export { guestRouter };