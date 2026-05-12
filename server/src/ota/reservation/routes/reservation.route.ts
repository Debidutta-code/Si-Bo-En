import { Router } from 'express';
import { attachPropertyDetails } from '../../../middlewares/property.middleware';
import { ReservationController } from '../../../reservation/controllers/reservation.controller';

const ReservationRouter = Router();
const reservationController = new ReservationController();

ReservationRouter.route('/').post(
    attachPropertyDetails({
        identifierType: 'code',
        key: 'propertyCode',
        source: 'body',
    }),
    reservationController.createOtaReservation.bind(reservationController)
)
    .get(reservationController.getReservationByGuestId.bind(reservationController));;
export { ReservationRouter };
