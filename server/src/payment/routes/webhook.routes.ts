// N-Genius Webhook Routes
import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const router = Router();

// Receive webhook from N-Genius
router.post('/', WebhookController.receiveWebhook);

// Test endpoint (for development/testing)
router.post('/test', WebhookController.testWebhook);

export const WebhookRoutes = router;
