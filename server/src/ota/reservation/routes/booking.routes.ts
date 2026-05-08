import { Router } from 'express';
import { otaProtect } from '../../../middlewares/ota-user.middleware';
import { OtaBookingController } from '../controllers';

const ReservationRouter = Router();
const bookingController = new OtaBookingController();

ReservationRouter.route("/")
    .get(otaProtect, bookingController.getUserReservations);

ReservationRouter.route("/:id")
    .put(otaProtect, bookingController.editUserReservation);

export { ReservationRouter };
