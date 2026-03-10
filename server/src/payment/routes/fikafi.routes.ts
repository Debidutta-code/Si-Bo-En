import { Router } from 'express';
import { FikafiPaymentController } from '../controllers/fikafi.controller';

export const fikafiPaymentRoutes = Router();

// Get Fikafi token for frontend use
fikafiPaymentRoutes.post('/token', FikafiPaymentController.getFikafiToken);

// Main payment routes
fikafiPaymentRoutes.post(
    '/create-payment-link',
    FikafiPaymentController.createPaymentLink
);

fikafiPaymentRoutes.get(
    '/payment-status/:paymentId',
    FikafiPaymentController.getPaymentStatus
);

// Generate payment link from existing reservation
fikafiPaymentRoutes.post(
    '/generate-from-reservation',
    FikafiPaymentController.generateFromReservation
);

fikafiPaymentRoutes.post(
    '/webhook/payment-event',
    FikafiPaymentController.handlePaymentEventWebhook
);

// Take action on failed/expired payment (resend or cancel)
fikafiPaymentRoutes.post(
    '/payment-action',
    FikafiPaymentController.takePaymentAction
);

// Get reservation by booking code
fikafiPaymentRoutes.get(
    '/reservation/:bookingCode',
    FikafiPaymentController.getReservationByCode
);
