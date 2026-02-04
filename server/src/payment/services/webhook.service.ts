// N-Genius Webhook Service
import * as crypto from 'crypto';
import { NGeniusWebhookPayload } from '../types/webhook.types';

class WebhookService {
  /**
   * Decrypt encrypted webhook payload
   * Algorithm: AES-256-CBC with PKCS5 Padding
   * 
   * @param encryptedData - Base64 encoded encrypted data (IV prepended)
   * @param secretKey - 32-character ASCII secret key
   * @returns Decrypted JSON object
   */
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
      console.error('Error decrypting webhook payload:', error);
      throw new Error('Failed to decrypt webhook payload');
    }
  }

  /**
   * Process webhook event (currently just logs the event)
   * 
   * @param payload - Webhook payload
   */
  processWebhookEvent(payload: NGeniusWebhookPayload): void {
    console.log('========================================');
    console.log('📥 N-Genius Webhook Event Received');
    console.log('========================================');
    console.log('Event ID:', payload.eventId);
    console.log('Event Name:', payload.eventName);
    console.log('Outlet ID:', payload.outletId);
    console.log('Order Reference:', payload.order.reference);
    console.log('Order ID:', payload.order._id);
    console.log('Order Action:', payload.order.action);
    console.log('Amount:', `${payload.order.amount.value} ${payload.order.amount.currencyCode}`);
    
    // Log payment details if available
    if (payload.order._embedded?.payment && payload.order._embedded.payment.length > 0) {
      const payment = payload.order._embedded.payment[0];
      console.log('Payment State:', payment.state);
      console.log('Payment Reference:', payment.reference);
      
      if (payment.paymentMethod) {
        console.log('Payment Method:', payment.paymentMethod.name);
        console.log('Card PAN:', payment.paymentMethod.pan);
      }
      
      if (payment.authResponse) {
        console.log('Auth Code:', payment.authResponse.authorizationCode);
        console.log('Auth Result:', payment.authResponse.resultMessage);
      }
    }
    
    console.log('========================================');
    console.log('✅ Webhook Event Logged Successfully');
    console.log('========================================');
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
      console.error('Webhook validation failed: Empty body');
      return false;
    }

    // If encrypted, ensure secret header is present
    if (headers['x-webhook-secret']) {
      console.log('🔒 Encrypted webhook detected');
      return true;
    }

    // If not encrypted, check if it's a valid JSON payload
    if (typeof body === 'object' && body.eventId && body.eventName && body.order) {
      console.log('📄 Unencrypted webhook detected');
      return true;
    }

    console.error('Webhook validation failed: Invalid payload structure');
    return false;
  }
}

export const webhookService = new WebhookService();
