import { Router } from 'express';
import { partnerProtected } from '../../middleware';
import { AgentBookingController } from '../controllers';

const agentBookingRouter = Router();
const bookingController = new AgentBookingController();

agentBookingRouter
    .route('/')
    .get(
        partnerProtected,
        bookingController.getAgentBookings.bind(bookingController)
    );

// Get a specific booking by booking code
agentBookingRouter
    .route('/:bookingCode')
    .get(
        partnerProtected,
        bookingController.getAgentBookingByCode.bind(bookingController)
    );

// Cancel a booking
agentBookingRouter
    .route('/cancel/:reservationId')
    .put(
        partnerProtected,
        bookingController.cancelAgentBooking.bind(bookingController)
    );

export { agentBookingRouter };
