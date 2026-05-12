// N-Genius Payment Routes
import { Router } from 'express';
import { NGeniusController } from '../controllers/ngenius.controller';
import { resolveRefundStrategy } from '../middlewares/refund-routing.middleware';

const router = Router();

// Get access token
router.post('/token', NGeniusController.getAccessToken);

// Create order
router.post('/order', NGeniusController.createOrder);

// Get order status
router.get('/order/:orderReference', NGeniusController.getOrderStatus);

// Get payment URL
router.get('/payment-url/:orderReference', NGeniusController.getPaymentUrl);

// Process refund — middleware resolves same_day vs day_after from DB, then controller routes accordingly
router.post('/refund', resolveRefundStrategy, NGeniusController.processRefund);

export const NGeniusRoutes = router;
