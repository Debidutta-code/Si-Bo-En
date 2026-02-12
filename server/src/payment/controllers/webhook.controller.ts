// N-Genius Webhook Controller
import { Request, Response, NextFunction } from 'express';
import { webhookService } from '../services/webhook.service';
import { NGeniusWebhookPayload } from '../types/webhook.types';

export class WebhookController {
  /**
   * Receive and process N-Genius webhook
   * POST /api/v1/payment/webhook
   * 
   * This endpoint receives webhook notifications from N-Genius Online
   * and processes them according to the event type.
   * 
   * Supports both encrypted and unencrypted payloads.
   */
  static async receiveWebhook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const startTime = Date.now();
      console.log('🔔 Webhook request received at:', new Date().toISOString());

      if (!req.body || Object.keys(req.body).length === 0) {
        res.status(200).json({
          success: false,
          message: 'Empty webhook payload',
        });
        return;
      }

      // Validate webhook request
      if (!webhookService.validateWebhookRequest(req.body, req.headers)) {
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
        // Encrypted payload - decrypt it
        console.log('🔓 Decrypting webhook payload...');

        // For encrypted payloads, the body will be a string
        const encryptedData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

        try {
          payload = webhookService.decryptPayload(encryptedData, secretKey);
          console.log('✅ Payload decrypted successfully');
        } catch (decryptError) {
          console.error('❌ Decryption failed:', decryptError);
          res.status(400).json({
            success: false,
            message: 'Failed to decrypt webhook payload',
          });
          return;
        }
      } else {
        // Unencrypted payload - use as is
        console.log('📄 Processing unencrypted webhook payload');
        payload = req.body as NGeniusWebhookPayload;
      }

      // Process the webhook event (log it)
      webhookService.processWebhookEvent(payload);

      // Calculate processing time
      const processingTime = Date.now() - startTime;
      console.log(`⏱️  Processing time: ${processingTime}ms`);

      // Respond with 200 OK (within 15 seconds as required)
      res.status(200).json({
        success: true,
        message: 'Webhook received and processed successfully',
        eventId: payload.eventId,
        eventName: payload.eventName,
        processingTime: `${processingTime}ms`,
      });
    } catch (error) {
      console.error('❌ Error processing webhook:', error);

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
      console.log('🧪 Test webhook triggered from Postman');

      if (!req.body || Object.keys(req.body).length === 0) {
        res.status(400).json({
          success: false,
          message: 'Request body is empty',
        });
        return;
      }

      // Use payload directly from request body
      const payload = req.body as NGeniusWebhookPayload;

      console.log('📦 Incoming test webhook payload:', payload);

      webhookService.processWebhookEvent(payload);

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
