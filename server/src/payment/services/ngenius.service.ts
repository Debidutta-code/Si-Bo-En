// N-Genius Payment Service with Comprehensive Logging
import axios, { AxiosError } from 'axios';
import { NGeniusConfig } from '../config/ngenius.config';
import {
  NGeniusTokenResponse,
  NGeniusOrderRequest,
  NGeniusOrderResponse,
  NGeniusOrderStatusResponse,
  NGeniusErrorResponse,
  NGeniusRefundResponse,
} from '../types/ngenius.types';
import { prisma } from '../../config/db.config';

export interface NGeniusSecrets {
  baseUrl: string;
  apiKey: string;
  outletId: string;
}

class NGeniusService {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private tokenCache: Map<string, { token: string, expiry: Date }> = new Map();

  /**
   * Get Access Token from N-Genius
   */
  async getAccessToken(config: NGeniusSecrets, propertyId?: string): Promise<any> {
    try {
      console.log("inside getaccess token../..");

      const cacheKey = propertyId || config.apiKey || 'default';
      const cached = this.tokenCache.get(cacheKey);
      if (cached && new Date() < cached.expiry) {
        console.log(`✅ Using cached N-Genius token for ${cacheKey}`);
        return { access_token: cached.token, expires_in: (cached.expiry.getTime() - Date.now()) / 1000 };
      }

      const baseUrl = config.baseUrl;
      const apiKey = config.apiKey;

      const url = `${baseUrl}${NGeniusConfig.endpoints.token}`;

      const response = await axios.post<NGeniusTokenResponse>(
        url,
        {},
        {
          headers: {
            'Content-Type': 'application/vnd.ni-identity.v1+json',
            Accept: 'application/vnd.ni-identity.v1+json',
            Authorization: `Basic ${apiKey}`,
          },
        }
      );

      const expiry = new Date(Date.now() + response.data.expires_in * 1000);
      this.tokenCache.set(cacheKey, { token: response.data.access_token, expiry });

      if (!propertyId) {
        this.accessToken = response.data.access_token;
        this.tokenExpiry = expiry;
      }

      return response.data;
    } catch (error) {
      console.log("error inside the getaccesstoken function", error);
      this.handleError(error, 'Failed to get access token');
      throw error;
    }
  }

  /**
   * Get valid access token (always refresh)
   */
  private async getValidToken(config: NGeniusSecrets, propertyId?: string): Promise<string> {
    const tokenResponse = await this.getAccessToken(config, propertyId);
    return tokenResponse.access_token;
  }

  /**
   * Create Order in N-Genius
   */
  async createOrder(config: NGeniusSecrets, orderData: NGeniusOrderRequest): Promise<NGeniusOrderResponse> {
    console.log('\n========================================');
    console.log('🛒 CREATING N-GENIUS ORDER');
    console.log('========================================');

    try {
      let targetOutletId = orderData.outletId || config.outletId;
      let baseUrl = config.baseUrl;
      let propertyId: string | undefined;

      if (orderData.propertyCode) {
        const property = await prisma.property.findFirst({
          where: { propertyCode: orderData.propertyCode },
        });
        if (property) propertyId = property.id;
      }

      const token = await this.getValidToken(config, propertyId);

      if (!targetOutletId) {
        throw new Error(`[N-Genius] outletId is required but was not provided and could not be resolved.`);
      }

      const url = `${baseUrl}${NGeniusConfig.endpoints.orders}/${targetOutletId}/orders`;
      const startTime = Date.now();

      const response = await axios.post<NGeniusOrderResponse>(url, orderData, {
        headers: {
          'Content-Type': 'application/vnd.ni-payment.v2+json',
          Accept: 'application/vnd.ni-payment.v2+json',
          Authorization: `Bearer ${token}`,
        },
      });

      const duration = Date.now() - startTime;
      console.log('\n✅ ORDER CREATED SUCCESSFULLY');
      console.log('⏱️  Response Time:', duration, 'ms');
      console.log('🔑 Order Reference:', response.data.reference);
      console.log('🔗 Payment URL:', response.data._links?.payment?.href);
      console.log('========================================\n');

      if (orderData.propertyCode) {
        try {
          const property = await prisma.property.findFirst({
            where: { propertyCode: orderData.propertyCode },
          });

          if (property) {
            const ngeniusState = response.data._embedded?.payment?.[0]?.state || "STARTED";
            const mappedStatus = this.mapNGeniusState(ngeniusState);
            const orderOutletId = response.data.outletId;
            let propertyPaymentIntegrationId: string | null = null;

            if (orderOutletId) {
              const integration = await prisma.propertyPaymentIntegration.findFirst({
                where: {
                  propertyId: property.id,
                  isActive: true,
                  OR: [
                    { outletId: orderOutletId },
                    {
                      propertyPaymentIntegrationSecrets: {
                        some: {
                          value: orderOutletId,
                          RequiredField: {
                            name: {
                              in: ['outletId', 'Outlet ID', 'outlet_id', 'outlet id'],
                              mode: 'insensitive'
                            }
                          }
                        }
                      }
                    }
                  ]
                },
                select: { id: true },
              });
              if (integration) {
                propertyPaymentIntegrationId = integration.id;
              }
            }

            try {
              const payment = await prisma.payment.create({
                data: {
                  amount: orderData.amount.value / 100,
                  currency: "AED",
                  status: mappedStatus as any,
                  paymentMethod: "payment_gateway",
                  propertyId: property.id,
                  reservationId: (orderData.reservationId || null) as any,
                  paymentIntentId: response.data.reference,
                  ...(propertyPaymentIntegrationId && { propertyPaymentIntegrationId }),
                },
              });
              console.log(`✅ Payment record created: ${payment.id}`);
            } catch (dbError) {
              console.error(`❌ Failed to create payment record:`, dbError);
            }
          }
        } catch (dbError) {
          console.error("❌ Failed to store payment record:", dbError);
        }
      }

      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to create order');
      throw error;
    }
  }

  /**
   * Get Order Status
   */
  async getOrderStatus(
    config: NGeniusSecrets,
    orderReference: string,
    outletId?: string,
    propertyId?: string
  ): Promise<NGeniusOrderStatusResponse> {
    try {
      let baseUrl = config.baseUrl;
      const targetOutletId = outletId || config.outletId;

      const token = await this.getValidToken(config, propertyId);
      const url = `${baseUrl}${NGeniusConfig.endpoints.orders}/${targetOutletId}/orders/${orderReference}`;

      const response = await axios.get<NGeniusOrderStatusResponse>(url, {
        headers: {
          Accept: 'application/vnd.ni-payment.v2+json',
          'Content-Type': 'application/vnd.ni-payment.v2+json',
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to get order status');
      throw error;
    }
  }

  /**
   * Get Payment Page URL from Order Response
   */
  getPaymentUrl(orderResponse: NGeniusOrderResponse): string {
    return orderResponse._links.payment.href;
  }

  /**
   * SAME-DAY REFUND: Step 1 — Cancel the Capture (DELETE)
   * Must be done before midnight UAE/Dubai time (settlement).
   * This voids the capture and returns the payment to AUTHORISED state.
   */
  async cancelCapture(
    config: NGeniusSecrets,
    orderReference: string,
    outletId: string
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🚫 [CANCEL CAPTURE] Starting capture cancellation`);
      console.log(`📋 Order Reference : ${orderReference}`);
      console.log(`🏪 Outlet ID       : ${outletId}`);
      console.log(`${'='.repeat(60)}`);

      // Step 1: Fetch order status to get payment + capture references
      console.log(`\n[CANCEL CAPTURE - Step 1] 🔍 Fetching order status...`);
      const orderStatus = await this.getOrderStatus(config, orderReference, outletId);
      console.log(`[CANCEL CAPTURE - Step 1] 📥 Raw order status:`);
      console.log(JSON.stringify(orderStatus, null, 2));

      const payments = orderStatus._embedded?.payment;
      if (!payments || payments.length === 0) {
        return { success: false, message: 'No payment found for this order' };
      }

      const payment = payments[0];
      console.log(`\n[CANCEL CAPTURE - Step 2] 💳 Payment state: ${payment.state}`);

      const captures = payment._embedded?.['cnp:capture'];
      console.log(`[CANCEL CAPTURE - Step 2] 🗂️  Captures found: ${captures?.length ?? 0}`);

      if (!captures || captures.length === 0) {
        console.warn(`[CANCEL CAPTURE - Step 2] ⚠️ No captures found. Payment state: ${payment.state}`);
        return {
          success: false,
          message: `No captures found. Payment is in state: ${payment.state}. Cannot cancel capture.`,
        };
      }

      // Extract the capture's self href for the DELETE request
      const captureSelfHref = (captures[0] as any)._links?.self?.href;
      console.log(`\n[CANCEL CAPTURE - Step 3] 🔗 Capture self href: ${captureSelfHref ?? '(not found)'}`);

      if (!captureSelfHref) {
        console.error(`[CANCEL CAPTURE - Step 3] ❌ capture[0]._links.self.href not found`);
        console.error(`[CANCEL CAPTURE - Step 3]    Full capture[0]._links:`, JSON.stringify((captures[0] as any)._links, null, 2));
        return { success: false, message: 'Capture self href not found — cannot cancel capture' };
      }

      // Step 2: DELETE the capture
      console.log(`\n[CANCEL CAPTURE - Step 4] 🚀 Sending DELETE to cancel capture...`);
      console.log(`   URL: ${captureSelfHref}`);

      const token = await this.getValidToken(config);
      const cancelCaptureResponse = await axios.delete(captureSelfHref, {
        headers: {
          'Content-Type': 'application/vnd.ni-payment.v2+json',
          Accept: 'application/vnd.ni-payment.v2+json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(`\n[CANCEL CAPTURE - Step 4] ✅ Capture cancelled successfully`);
      console.log(`   HTTP Status: ${cancelCaptureResponse.status} ${cancelCaptureResponse.statusText}`);
      console.log(`   Response:`, JSON.stringify(cancelCaptureResponse.data, null, 2));
      console.log(`${'='.repeat(60)}\n`);

      return {
        success: true,
        message: 'Capture cancelled successfully',
        data: cancelCaptureResponse.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errData = error.response?.data as any;
        console.error(`\n[CANCEL CAPTURE] ❌ FAILED`);
        console.error(`   HTTP Status : ${error.response?.status} ${error.response?.statusText}`);
        console.error(`   Response    :`, JSON.stringify(errData, null, 2));
        const errMessage = errData?.message || errData?.errors?.[0]?.message || 'Cancel capture API request failed';
        return { success: false, message: errMessage };
      }
      const msg = error instanceof Error ? error.message : 'Unknown error during cancel capture';
      return { success: false, message: msg };
    }
  }

  /**
   * SAME-DAY REFUND: Step 2 — Reverse the Authorization (PUT)
   * Must be called AFTER cancelCapture succeeds.
   * Payment must have no outstanding captures/refunds (hence cancel first).
   * This permanently cancels the auth and releases funds back to customer.
   */
  async reverseAuthorization(
    config: NGeniusSecrets,
    orderReference: string,
    outletId: string
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`↩️  [REVERSE AUTH] Starting authorization reversal`);
      console.log(`📋 Order Reference : ${orderReference}`);
      console.log(`🏪 Outlet ID       : ${outletId}`);
      console.log(`${'='.repeat(60)}`);

      // Step 1: Fetch fresh order status to get cnp:cancel href
      console.log(`\n[REVERSE AUTH - Step 1] 🔍 Fetching fresh order status...`);
      const orderStatus = await this.getOrderStatus(config, orderReference, outletId);
      console.log(`[REVERSE AUTH - Step 1] 📥 Raw order status:`);
      console.log(JSON.stringify(orderStatus, null, 2));

      const payments = orderStatus._embedded?.payment;
      if (!payments || payments.length === 0) {
        return { success: false, message: 'No payment found for this order' };
      }

      const payment = payments[0];
      console.log(`\n[REVERSE AUTH - Step 2] 💳 Payment state after capture cancel: ${payment.state}`);

      // Extract cnp:cancel href from payment._links
      const cancelHref = (payment as any)._links?.['cnp:cancel']?.href;
      console.log(`\n[REVERSE AUTH - Step 2] 🔗 cnp:cancel href: ${cancelHref ?? '(not found)'}`);

      if (!cancelHref) {
        console.error(`[REVERSE AUTH - Step 2] ❌ cnp:cancel href not found`);
        console.error(`   Full payment._links:`, JSON.stringify((payment as any)._links, null, 2));
        return {
          success: false,
          message: 'Authorization cancel href not found — payment may not be in AUTHORISED state',
        };
      }

      // Step 2: PUT to the cancel endpoint (no body required)
      console.log(`\n[REVERSE AUTH - Step 3] 🚀 Sending PUT to reverse authorization...`);
      console.log(`   URL: ${cancelHref}`);

      const token = await this.getValidToken(config);
      const reverseResponse = await axios.put(
        cancelHref,
        {}, // no body required per N-Genius docs
        {
          headers: {
            'Content-Type': 'application/vnd.ni-payment.v2+json',
            Accept: 'application/vnd.ni-payment.v2+json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(`\n[REVERSE AUTH - Step 3] ✅ Authorization reversed successfully`);
      console.log(`   HTTP Status : ${reverseResponse.status} ${reverseResponse.statusText}`);
      console.log(`   State       : ${reverseResponse.data?.state}`);
      console.log(`   Response    :`, JSON.stringify(reverseResponse.data, null, 2));
      console.log(`${'='.repeat(60)}\n`);

      return {
        success: true,
        message: 'Authorization reversed successfully',
        data: reverseResponse.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errData = error.response?.data as any;
        console.error(`\n[REVERSE AUTH] ❌ FAILED`);
        console.error(`   HTTP Status : ${error.response?.status} ${error.response?.statusText}`);
        console.error(`   Response    :`, JSON.stringify(errData, null, 2));
        const errMessage = errData?.message || errData?.errors?.[0]?.message || 'Authorization reversal API request failed';
        return { success: false, message: errMessage };
      }
      const msg = error instanceof Error ? error.message : 'Unknown error during authorization reversal';
      return { success: false, message: msg };
    }
  }

  /**
   * SAME-DAY REFUND: Full flow
   * 1. Cancel the capture (DELETE)
   * 2. Reverse the authorization (PUT)
   */
  async processSameDayRefund(
    config: NGeniusSecrets,
    orderReference: string,
    outletId: string
  ): Promise<NGeniusRefundResponse> {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`⚡ [SAME-DAY REFUND] Starting same-day refund flow`);
      console.log(`📋 Order Reference : ${orderReference}`);
      console.log(`🏪 Outlet ID       : ${outletId}`);
      console.log(`${'='.repeat(60)}`);

      // Step 1: Cancel the capture
      console.log(`\n[SAME-DAY REFUND] ▶️ Step 1: Cancelling capture...`);
      const cancelResult = await this.cancelCapture(config, orderReference, outletId);

      if (!cancelResult.success) {
        console.error(`[SAME-DAY REFUND] ❌ Cancel capture failed: ${cancelResult.message}`);
        return {
          success: false,
          message: `Same-day refund failed at capture cancellation: ${cancelResult.message}`,
        };
      }

      console.log(`[SAME-DAY REFUND] ✅ Capture cancelled. Proceeding to authorization reversal...`);

      // Step 2: Reverse the authorization
      console.log(`\n[SAME-DAY REFUND] ▶️ Step 2: Reversing authorization...`);
      const reverseResult = await this.reverseAuthorization(config, orderReference, outletId);

      if (!reverseResult.success) {
        console.error(`[SAME-DAY REFUND] ❌ Authorization reversal failed: ${reverseResult.message}`);
        return {
          success: false,
          message: `Same-day refund failed at authorization reversal: ${reverseResult.message}`,
        };
      }

      console.log(`[SAME-DAY REFUND] ✅ Authorization reversed. Same-day refund complete!`);
      console.log(`${'='.repeat(60)}\n`);

      return {
        success: true,
        message: 'Same-day refund processed successfully (capture cancelled + authorization reversed)',
        refundReference: orderReference,
        data: {
          cancelCapture: cancelResult.data,
          reverseAuthorization: reverseResult.data,
        },
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown same-day refund error';
      console.error(`[SAME-DAY REFUND] ❌ Unexpected error:`, msg);
      return { success: false, message: msg };
    }
  }

  /**
   * DAY-AFTER REFUND: Process a refund for a captured SALE order after settlement
   * Fetches order status to extract payment + capture refs, then calls the refund endpoint.
   */
  async processRefund(
    config: NGeniusSecrets,
    orderReference: string,
    outletId?: string
  ): Promise<NGeniusRefundResponse> {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`💸 [REFUND] PROCESSING N-GENIUS DAY-AFTER REFUND`);
      console.log(`📋 Order Reference : ${orderReference}`);
      console.log(`🏪 Outlet ID       : ${outletId ?? '⚠️ (NOT PROVIDED)'}`);
      console.log(`${'='.repeat(60)}`);

      const orderStatus = await this.getOrderStatus(config, orderReference, outletId);
      console.log(`\n[REFUND - Step 1] 📥 Raw order status response:`);
      console.log(JSON.stringify(orderStatus, null, 2));

      const payments = orderStatus._embedded?.payment;
      if (!payments || payments.length === 0) {
        return { success: false, message: 'No payment found for this order' };
      }

      const payment = payments[0];
      const captures = payment._embedded?.['cnp:capture'];

      if (!captures || captures.length === 0) {
        console.error(`[REFUND] ❌ No captures found. Payment state: ${payment.state}`);
        return { success: false, message: 'No capture found for this payment (payment may not be in CAPTURED state)' };
      }

      captures.forEach((cap: any, idx: number) => {
        console.log(`\n[REFUND] 📦 Capture[${idx}]: state=${cap.state}, cnp:refund=${cap._links?.['cnp:refund']?.href ?? '(not present)'}`);
      });

      const rawCaptureHref = captures[0]._links?.['cnp:refund']?.href;

      if (!rawCaptureHref) {
        return { success: false, message: 'Capture refund href not found in order status' };
      }

      if (!rawCaptureHref.endsWith('/refund')) {
        return {
          success: false,
          message: 'Reservation cannot be cancelled within 24 hours of booking. Please try again after 24 hours.',
        };
      }

      const refundUrl = rawCaptureHref;
      const refundUrlParts = refundUrl.split('/');
      const capturesIndex = refundUrlParts.indexOf('captures');
      const captureRef = capturesIndex !== -1 ? refundUrlParts[capturesIndex + 1] : 'unknown';

      const orderAmount = orderStatus.amount;
      const refundCurrency = orderAmount.currencyCode;
      const refundAmount = orderAmount.value;

      console.log(`\n[REFUND] 📦 Sending refund: ${refundAmount} ${refundCurrency} to ${refundUrl}`);

      const token = await this.getValidToken(config);
      const refundResponse = await axios.post(
        refundUrl,
        { amount: { value: refundAmount, currencyCode: refundCurrency } },
        {
          headers: {
            'Content-Type': 'application/vnd.ni-payment.v2+json',
            Accept: 'application/vnd.ni-payment.v2+json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(`\n[REFUND] ✅ REFUND SUCCESSFUL`);
      console.log(`   HTTP Status: ${refundResponse.status}`);
      console.log(`   Response:`, JSON.stringify(refundResponse.data, null, 2));
      console.log(`${'='.repeat(60)}\n`);

      return {
        success: true,
        message: 'Refund processed successfully',
        refundReference: captureRef,
        data: refundResponse.data,
      };
    } catch (error) {
      this.handleError(error, 'Failed to process refund');
      if (axios.isAxiosError(error)) {
        const errData = error.response?.data as any;
        const errMessage = errData?.message || errData?.errors?.[0]?.message || 'Refund API request failed';
        return { success: false, message: errMessage };
      }
      const msg = error instanceof Error ? error.message : 'Unknown refund error';
      return { success: false, message: msg };
    }
  }

  /**
   * Map N-Genius payment state to internal PaymentStatus
   */
  private mapNGeniusState(state: string): string {
    const successStates = ["CAPTURED", "PURCHASED", "AUTHORISED"];
    const failedStates = ["FAILED", "DECLINED", "CANCELLED"];
    const upperState = state.toUpperCase();
    if (successStates.includes(upperState)) return "confirmed";
    if (failedStates.includes(upperState)) return "cancelled";
    return "pending";
  }

  /**
   * Handle API Errors
   */
  private handleError(error: unknown, context: string): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<NGeniusErrorResponse>;
      // logging removed
    }
  }
}

export const ngeniusService = new NGeniusService();
