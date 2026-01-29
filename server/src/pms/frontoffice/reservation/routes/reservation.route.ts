import { protect } from "../../../../middlewares/auth.middleware";
import  { Router } from "express";

import { ReservationController } from "../controllers";
import { attachPropertyDetails } from "../../../../middlewares/property.middleware";


const reservationRoute = Router();
const reservationController = new ReservationController();

reservationRoute.route("/")
    .post(attachPropertyDetails({
        identifierType: "code",
        key: "bookingDetails.propertyCode",
        source: "body"
    }), reservationController.createReservation.bind(reservationController));

// reservationRoute.route("/reservationsForDate/:propertyId")
//     .get(protect, reservationController.getReservationsForADate.bind(reservationController));
reservationRoute.route("/date-range")
.get(protect, reservationController.getReservationsForADate.bind(reservationController));
reservationRoute.route("/arrivals")
.get(protect, reservationController.getArrivalsForADate.bind(reservationController));
reservationRoute.route("/departures")
.get(protect, reservationController.getDeparturesForADate.bind(reservationController));
// reservationRoute.route("/checkins")
// .get(protect, reservationController.getCheckInsForADate.bind(reservationController));
// reservationRoute.route("/checkouts")
// .get(protect, reservationController.getCheckOutsForADate.bind(reservationController));

// reservationRoute.route("/amend/:reservationId")
//     .patch( reservationController.amendReservation.bind(reservationController));
reservationRoute.route("/cancel/:reservationId")
    .put( reservationController.cancelReservation.bind(reservationController));
reservationRoute.route("/available-rooms/:bookingCode")
//     .get(protect, reservationController.getAvailableRoomsForReservation.bind(reservationController));

// // reservationRoute.route("/check-in/:reservationCode")
//     .post(protect, reservationController.checkInReservation.bind(reservationController));
// reservationRoute.route("/check-out/:reservationCode")
//     .post(protect, reservationController.checkOutReservation.bind(reservationController));
reservationRoute.route("/:reservationCode")
    .get( reservationController.getReservationByCode.bind(reservationController));
reservationRoute.route("/update/:reservationCode")
    .patch( reservationController.updateReservation.bind(reservationController));
reservationRoute.route("/no-show/:reservationId")
    .patch( reservationController.noShowReservation.bind(reservationController));
export { reservationRoute };