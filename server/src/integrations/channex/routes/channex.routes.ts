// src/integrations/channex/routes/channex.routes.ts

import { Router } from 'express';
import { ChannexWebhookController } from '../controllers/channex-webhook.controller';

const channexRoute = Router();

channexRoute.post('/webhook', ChannexWebhookController.handleWebhook);

channexRoute.get('/test-connection', ChannexWebhookController.testConnection);
channexRoute.get('/test_connection/', ChannexWebhookController.testConnection);
channexRoute.get('/test_connection', ChannexWebhookController.testConnection);

channexRoute.get('/mapping-details', ChannexWebhookController.getMappingDetails);
channexRoute.get('/mapping_details/', ChannexWebhookController.getMappingDetails);
channexRoute.get('/mapping_details', ChannexWebhookController.getMappingDetails);

channexRoute.post('/ari', ChannexWebhookController.handleAriPush);
channexRoute.post('/changes/', ChannexWebhookController.handleAriPush);
channexRoute.post('/changes', ChannexWebhookController.handleAriPush);

channexRoute.post('/sync', ChannexWebhookController.handleSync);
channexRoute.get('/sync', ChannexWebhookController.handleSync);

channexRoute.post('/activate/', ChannexWebhookController.handleActivate);
channexRoute.post('/activate', ChannexWebhookController.handleActivate);

export default channexRoute;
