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
      // Sample webhook payload for testing
      const samplePayload: NGeniusWebhookPayload = {
        outletId: '670bfc06-63d6-472b-af75-ad0207ac44f5',
        eventId: '4120eec7-9dbe-4163-912e-c2f0b459ef2d',
        eventName: 'CAPTURED',
        order: {
          _id: 'urn:order:2fc2d9d9-3b5f-45b2-9c85-9d11a3eb43ce',
          _links: {
            self: {
              href: 'http://transaction-service/transactions/outlets/670bfc06-63d6-472b-af75-ad0207ac44f5/orders/2fc2d9d9-3b5f-45b2-9c85-9d11a3eb43ce',
            },
            'tenant-brand': {
              href: 'http://config-service/config/outlets/670bfc06-63d6-472b-af75-ad0207ac44f5/configs/tenant-brand',
            },
            'merchant-brand': {
              href: 'http://config-service/config/outlets/670bfc06-63d6-472b-af75-ad0207ac44f5/configs/merchant-brand',
            },
          },
          type: 'SINGLE',
          action: 'SALE',
          amount: {
            currencyCode: 'AED',
            value: 50000,
          },
          language: 'en',
          reference: '2fc2d9d9-3b5f-45b2-9c85-9d11a3eb43ce',
          outletId: '670bfc06-63d6-472b-af75-ad0207ac44f5',
          createDateTime: '2025-09-09T09:57:58.251529358Z',
          formattedAmount: 'د.إ.‏ 500.00',
        },
      };

      console.log('🧪 Testing webhook with sample payload...');
      webhookService.processWebhookEvent(samplePayload);

      res.status(200).json({
        success: true,
        message: 'Test webhook processed successfully',
        payload: samplePayload,
      });
    } catch (error) {
      next(error);
    }
  }
}
