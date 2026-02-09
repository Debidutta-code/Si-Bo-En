// N-Genius Payment Routes
import { Router } from 'express';
import { NGeniusController } from '../controllers/ngenius.controller';

const router = Router();

// Get access token
router.post('/token', NGeniusController.getAccessToken);

// Create order
router.post('/order', NGeniusController.createOrder);

// Get order status
router.get('/order/:orderReference', NGeniusController.getOrderStatus);

// Get payment URL
router.get('/payment-url/:orderReference', NGeniusController.getPaymentUrl);

export const NGeniusRoutes = router;
