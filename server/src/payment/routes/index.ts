// Payment Routes Index
import { Router } from 'express';
import { NGeniusRoutes } from './ngenius.routes';
import { WebhookRoutes } from './webhook.routes';

const router = Router();

// Mount N-Genius routes
router.use('/ngenius', NGeniusRoutes);

// Mount Webhook routes
router.use('/webhook', WebhookRoutes);

export const PaymentRoutes = router;
