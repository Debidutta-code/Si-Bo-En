import { Router } from 'express';
import { ReservationController } from '../controllers';
import { partnerProtected } from '../../middleware';

const agentReservationRouter = Router();
const reservationController = new ReservationController();

agentReservationRouter.get(
    '/',
    partnerProtected,
    reservationController.getReservations.bind(reservationController)
);

agentReservationRouter.get(
    '/stats',
    partnerProtected,
    reservationController.getReservationStats.bind(reservationController)
);

agentReservationRouter.get(
    '/arrivals',
    partnerProtected,
    reservationController.getUpcomingArrivals.bind(reservationController)
);

agentReservationRouter.get(
    '/departures',
    partnerProtected,
    reservationController.getUpcomingDepartures.bind(reservationController)
);

agentReservationRouter.get(
    '/:reservationId',
    partnerProtected,
    reservationController.getReservationById.bind(reservationController)
);

agentReservationRouter.get(
    '/booking-code/:bookingCode',
    partnerProtected,
    reservationController.getReservationByBookingCode.bind(
        reservationController
    )
);

agentReservationRouter.patch(
    '/:reservationId/cancel',
    partnerProtected,
    reservationController.cancelReservation.bind(reservationController)
);

export { agentReservationRouter };
