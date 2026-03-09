// N-Genius Webhook Service
import * as crypto from 'crypto';
import { NGeniusWebhookPayload } from '../types/webhook.types';
import { socketManager } from '../../socket';
import { prisma } from '../../config/db.config';
import {RedisClient} from '../../config';

class WebhookService {

  decryptPayload(encryptedData: string, secretKey: string): NGeniusWebhookPayload {
    try {
      // Validate secret key length (must be exactly 32 characters for AES-256)
      if (secretKey.length !== 32) {
        throw new Error('Secret key must be exactly 32 characters');
      }

      // Step 1: Decode the Base64 string
      const encryptedBuffer = Buffer.from(encryptedData, 'base64');

      // Step 2: Extract the first 16 bytes as IV (Initialization Vector)
      const iv = encryptedBuffer.subarray(0, 16);

      // Step 3: Extract the rest as encrypted data
      const encryptedContent = encryptedBuffer.subarray(16);

      // Step 4: Create decipher with AES-256-CBC
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(secretKey, 'utf8'),
        iv
      );

      // Step 5: Decrypt the data
      let decrypted = decipher.update(encryptedContent);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      // Step 6: Parse the decrypted JSON
      const decryptedText = decrypted.toString('utf8');
      const payload = JSON.parse(decryptedText);

      return payload;
    } catch (error) {
      throw new Error('Failed to decrypt webhook payload');
    }
  }

  /**
   * Process webhook event and emit to Socket.IO
   * 
   * @param payload - Webhook payload
   */
  async processWebhookEvent(payload: NGeniusWebhookPayload): Promise<void> {
    // Extract payment details if available
    let paymentDetails: any = null;
    if (payload.order._embedded?.payment && payload.order._embedded.payment.length > 0) {
      const payment = payload.order._embedded.payment[0];

      paymentDetails = {
        state: payment.state,
        reference: payment.reference,
        paymentMethod: payment.paymentMethod,
        authResponse: payment.authResponse,
      };
    }

    // Determine payment status
    const status = this.determinePaymentStatus(payload.eventName);
    const message = this.getStatusMessage(payload.eventName);

    // Emit to Socket.IO
    const orderReference = payload.order.reference;

    // Store payment result in Redis if terminal (success/failed) (TTL: 10 minutes)
    if (status === 'success' || status === 'failed') {
      const redisKey = `payment:confirmed:${orderReference}`;
      const redisValue = JSON.stringify({
        amount: payload.order.amount?.value,
        status,
        eventName: payload.eventName,
        message,
        confirmedAt: Date.now(),
        paymentDetails: {
          amount: payload.order.amount?.value,
          status,
          ...paymentDetails
        }
      });

      try {
        const client = RedisClient.getInstance();

        await client.set(redisKey, redisValue, { EX: 600 });
        console.log(`✅ Payment result (${status}) stored in Redis for ${orderReference}`);
      } catch (err: any) {
        console.error(`❌ Failed to store payment result in Redis for ${orderReference}`, err);
      }
    }

    socketManager.emitPaymentUpdate(orderReference, {
      orderReference,
      eventName: payload.eventName,
      status,
      message,
      eventId: payload.eventId,
      paymentDetails: {
        amount: payload.order.amount?.value,
        status,
        ...paymentDetails
      },
    });

    // Update database status
    this.updatePaymentDatabase(orderReference, status);
  }

  /**
   * Update payment record in database
   */
  private async updatePaymentDatabase(orderReference: string, status: 'success' | 'failed' | 'pending'): Promise<void> {
    try {
      // Map 'success' to 'confirmed', 'failed' to 'cancelled'
      const dbStatus = status === 'success' ? 'confirmed' : status === 'failed' ? 'cancelled' : 'pending';

      const updateResult = await prisma.payment.updateMany({
        where: { paymentIntentId: orderReference },
        data: { status: dbStatus as any },
      });

      if (updateResult.count > 0) {
        console.log(`✅ Database Payment Update Successful:
  - Order Reference: ${orderReference}
  - Status Updated To: ${dbStatus}
  - Records Affected: ${updateResult.count}`);
      }
    } catch (error) {
      // Error logging removed as per request
    }
  }

  /**
   * Determine payment status from event name
   */
  private determinePaymentStatus(eventName: string): 'success' | 'failed' | 'pending' {
    const successEvents = [
      'AUTHORISED',
      'PURCHASED',
      'CAPTURED',
      'PARTIALLY_CAPTURED',
      'APM_PAYMENT_ACCEPTED',
    ];

    const failedEvents = [
      'DECLINED',
      'AUTHORISATION_FAILED',
      'PURCHASE_DECLINED',
      'PURCHASE_FAILED',
      'CAPTURE_FAILED',
      'REFUND_FAILED',
      'CANCELLED',
    ];

    if (successEvents.includes(eventName)) {
      return 'success';
    } else if (failedEvents.includes(eventName)) {
      return 'failed';
    } else {
      return 'pending';
    }
  }

  /**
   * Get user-friendly status message
   */
  private getStatusMessage(eventName: string): string {
    const messages: Record<string, string> = {
      AUTHORISED: 'Payment authorized successfully',
      PURCHASED: 'Payment completed successfully',
      CAPTURED: 'Payment captured successfully',
      PARTIALLY_CAPTURED: 'Payment partially captured',
      DECLINED: 'Payment was declined',
      AUTHORISATION_FAILED: 'Payment authorization failed',
      PURCHASE_DECLINED: 'Purchase was declined',
      PURCHASE_FAILED: 'Purchase failed',
      CAPTURE_FAILED: 'Payment capture failed',
      CANCELLED: 'Payment was cancelled',
      APM_PAYMENT_ACCEPTED: 'Payment accepted',
      REFUNDED: 'Payment refunded',
      PARTIALLY_REFUNDED: 'Payment partially refunded',
    };

    return messages[eventName] || `Payment ${eventName.toLowerCase()}`;
  }

  /**
   * Validate webhook request
   * 
   * @param body - Request body
   * @param headers - Request headers
   * @returns True if valid, false otherwise
   */
  validateWebhookRequest(body: any, headers: any): boolean {
    // Basic validation - ensure body is not empty
    if (!body) {
      return false;
    }

    // If encrypted, ensure secret header is present
    if (headers['x-webhook-secret']) {
      return true;
    }

    // If not encrypted, check if it's a valid JSON payload
    if (typeof body === 'object' && body.eventId && body.eventName && body.order) {
      return true;
    }

    return false;
  }
}

export const webhookService = new WebhookService();
