import { Router } from 'express';
import { attachPropertyDetails } from '../../../middlewares/property.middleware';
import { ReservationController } from '../../../reservation/controllers/reservation.controller';
import { otaProtect } from '../../../middlewares/ota-user.middleware';

const ReservationRouter = Router();
const reservationController = new ReservationController();

ReservationRouter.route('/').post(
    attachPropertyDetails({
        identifierType: 'code',
        key: 'propertyCode',
        source: 'body',
    }),
    otaProtect,
    reservationController.createOtaReservation.bind(reservationController)
)
    .get(reservationController.getReservationByGuestId.bind(reservationController));;
export { ReservationRouter };
