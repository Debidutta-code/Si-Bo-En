// N-Genius Webhook Controller
import { Request, Response, NextFunction } from 'express';
import { webhookService } from '../services/webhook.service';
import { NGeniusWebhookPayload } from '../types/webhook.types';

export class WebhookController {

  static async receiveWebhook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const startTime = Date.now();
      // console.log('🔔 Webhook request received at:', new Date().toISOString());
      // console.log('📦 Raw Webhook Body:', JSON.stringify(req.body, null, 2));
      // console.log('📋 Webhook Headers:', JSON.stringify({
      //   'x-webhook-secret': req.headers['x-webhook-secret'],
      //   'content-type': req.headers['content-type'],
      //   'user-agent': req.headers['user-agent']
      // }, null, 2));

      if (!req.body || Object.keys(req.body).length === 0) {
        console.log('⚠️ Empty webhook payload received');
        res.status(200).json({
          success: false,
          message: 'Empty webhook payload',
        });
        return;
      }

      // Validate webhook request
      if (!webhookService.validateWebhookRequest(req.body, req.headers)) {
        console.log('❌ Invalid webhook payload validation failed');
        res.status(400).json({
          success: false,
          message: 'Invalid webhook payload',
        });
        return;
      }

      let payload: NGeniusWebhookPayload;

      // Check if payload is encrypted
      const secretKey = req.headers['x-webhook-secret'] as string;

      if (secretKey) {
        console.log('🔐 Encrypted payload detected, decrypting...');
        // For encrypted payloads, the body will be a string
        const encryptedData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

        try {
          payload = webhookService.decryptPayload(encryptedData, secretKey);
          // console.log('🔓 Decrypted Webhook Payload:', JSON.stringify(payload, null, 2));
        } catch (decryptError) {
          // console.error('❌ Failed to decrypt webhook payload:', decryptError);
          res.status(400).json({
            success: false,
            message: 'Failed to decrypt webhook payload',
          });
          return;
        }
      } else {
        // console.log('📝 Unencrypted payload received');
        // Unencrypted payload - use as is
        payload = req.body as NGeniusWebhookPayload;
        // console.log('🎯 Webhook Payload:', JSON.stringify(payload, null, 2));
      }

      // Process the webhook event (log it)
      await webhookService.processWebhookEvent(payload);

      // Calculate processing time
      const processingTime = Date.now() - startTime;

      // Respond with 200 OK (within 15 seconds as required)
      res.status(200).json({
        success: true,
        message: 'Webhook received and processed successfully',
        eventId: payload.eventId,
        eventName: payload.eventName,
        processingTime: `${processingTime}ms`,
      });
    } catch (error) {
      // Still respond with 200 to acknowledge receipt
      // (N-Genius doesn't retry, so we should acknowledge even on error)
      res.status(200).json({
        success: false,
        message: 'Webhook acknowledged but processing failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Test endpoint to simulate webhook (for development/testing)
   * POST /api/v1/payment/webhook/test
   */
  static async testWebhook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        res.status(400).json({
          success: false,
          message: 'Request body is empty',
        });
        return;
      }

      // Use payload directly from request body
      const payload = req.body as NGeniusWebhookPayload;

      await webhookService.processWebhookEvent(payload);

      res.status(200).json({
        success: true,
        message: 'Test webhook processed successfully',
        receivedEvent: {
          eventId: payload.eventId,
          eventName: payload.eventName,
          orderReference: payload.order?.reference,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
