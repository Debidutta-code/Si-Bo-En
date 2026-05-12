import { protect } from "../../middlewares/auth.middleware";
import { Router } from "express";

import { ReservationController } from '../controllers';
import { attachPropertyDetails } from '../../middlewares/property.middleware';

const reservationRoute = Router();
const reservationController = new ReservationController();

reservationRoute.route('/').post(
    attachPropertyDetails({
        identifierType: 'code',
        key: 'propertyCode',
        source: 'body',
    }),
    reservationController.createReservation.bind(reservationController)
);


reservationRoute.route("/date-range")
    .get(protect, reservationController.getAllReservations.bind(reservationController));
reservationRoute.route("/arrivals")
    .get(protect, reservationController.getArrivalsForADate.bind(reservationController));
reservationRoute.route("/departures")
    .get(protect, reservationController.getDeparturesForADate.bind(reservationController));

reservationRoute.route("/cancel/:reservationId")
    .put(reservationController.cancelReservation.bind(reservationController));
reservationRoute.route("/available-rooms/:bookingCode")
reservationRoute.route("/:reservationCode")
    .get(reservationController.getReservationByCode.bind(reservationController));
reservationRoute.route("/update/:reservationCode")
    .patch(reservationController.updateReservation.bind(reservationController));
reservationRoute.route("/no-show/:reservationId")
    .patch(reservationController.noShowReservation.bind(reservationController));
reservationRoute.route("/check-in/:bookingCode")
    .patch(reservationController.checkInReservation.bind(reservationController));
reservationRoute.route("/check-out/:bookingCode")
    .patch(reservationController.checkOutReservation.bind(reservationController));
export { reservationRoute };
