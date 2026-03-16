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

class NGeniusService {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  /**
   * Get Access Token from N-Genius
   */
  async getAccessToken(): Promise<NGeniusTokenResponse> {
    try {
      const url = `${NGeniusConfig.baseUrl}${NGeniusConfig.endpoints.token}`;

      const response = await axios.post<NGeniusTokenResponse>(
        `https://api-gateway.ngenius-payments.com/identity/auth/access-token`,
        {},
        {
          headers: {
            'Content-Type': 'application/vnd.ni-identity.v1+json',
            Accept: 'application/vnd.ni-identity.v1+json',
            Authorization: `Basic ${NGeniusConfig.apiKey}`,
          },
        }
      );

      // Store token and expiry time
      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(
        Date.now() + response.data.expires_in * 1000
      );

      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to get access token');
      throw error;
    }
  }

  /**
   * Get valid access token (refresh if expired)
   */
  private async getValidToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry) {
      const now = new Date();
      if (this.tokenExpiry > now) {
        return this.accessToken;
      }
    }

    const tokenResponse = await this.getAccessToken();
    return tokenResponse.access_token;
  }

  /**
   * Create Order in N-Genius
   */
  async createOrder(
    orderData: NGeniusOrderRequest
  ): Promise<NGeniusOrderResponse> {
    console.log('\n========================================');
    console.log('🛒 CREATING N-GENIUS ORDER');
    console.log('========================================');

    try {
      // Get valid access token
      const token = await this.getValidToken();

      // Resolve outletId: use the one from the payload first, then look it up from
      // the DB via propertyCode. outletId is per-property and only stored in DB —
      // there is no valid global/env fallback, so we throw if it cannot be found.
      let targetOutletId = orderData.outletId;

      if (!targetOutletId && orderData.propertyCode) {
        console.log(`[N-Genius] outletId not in payload — looking up from DB for propertyCode: ${orderData.propertyCode}`);
        const property = await prisma.property.findFirst({
          where: { propertyCode: orderData.propertyCode },
        });

        if (!property) {
          throw new Error(`[N-Genius] Property not found for code: ${orderData.propertyCode}`);
        }

        const activeIntegration = await prisma.propertyPaymentIntegration.findFirst({
          where: { propertyId: property.id, isActive: true },
        });

        if (activeIntegration?.outletId) {
          targetOutletId = activeIntegration.outletId;
          console.log(`[N-Genius] ✅ outletId resolved from DB: ${targetOutletId}`);
        } else {
          throw new Error(`[N-Genius] No active payment integration with an outletId found for property: ${property.id} (code: ${orderData.propertyCode}). Please configure the outlet ID in the payment integration settings.`);
        }
      }

      if (!targetOutletId) {
        throw new Error(`[N-Genius] outletId is required but was not provided and could not be resolved. Ensure propertyCode is sent in the request so the outletId can be looked up from the database.`);
      }

      console.log(`[N-Genius] 🏪 Using outletId: ${targetOutletId}`);
      const url = `${NGeniusConfig.baseUrl}${NGeniusConfig.endpoints.orders}/${targetOutletId}/orders`;

      const startTime = Date.now();

      const response = await axios.post<NGeniusOrderResponse>(
        url,
        orderData,
        {
          headers: {
            'Content-Type': 'application/vnd.ni-payment.v2+json',
            Accept: 'application/vnd.ni-payment.v2+json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log('\n✅ ORDER CREATED SUCCESSFULLY');
      console.log('⏱️  Response Time:', duration, 'ms');
      console.log('📊 Response Status:', response.status);
      console.log('📊 Response Status Text:', response.statusText);
      console.log('\n📄 Full Response Data:');
      console.log(JSON.stringify(response.data, null, 2));
      console.log('\n🔑 Order Reference:', response.data.reference);
      console.log('🆔 Order ID:', response.data._id);
      console.log('🏪 Outlet ID:', response.data.outletId);
      console.log('💰 Amount:', response.data.amount.value, response.data.amount.currencyCode);
      console.log('🎬 Action:', response.data.action);
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

            // The order response contains the outletId actually used by N-Genius.
            // Use it to find the matching PropertyPaymentIntegration so we can store
            // propertyPaymentIntegrationId on the Payment — required for refunds later.
            const orderOutletId = response.data.outletId;
            let propertyPaymentIntegrationId: string | null = null;

            if (orderOutletId) {
              const integration = await prisma.propertyPaymentIntegration.findFirst({
                where: {
                  propertyId: property.id,
                  outletId: orderOutletId,
                  isActive: true,
                },
                select: { id: true },
              });
              if (integration) {
                propertyPaymentIntegrationId = integration.id;
                console.log(`✅ Linked PropertyPaymentIntegration: ${integration.id} (outletId: ${orderOutletId})`);
              } else {
                console.warn(`⚠️ No active PropertyPaymentIntegration found for propertyId: ${property.id}, outletId: ${orderOutletId}`);
              }
            } else {
              console.warn(`⚠️ Order response did not include outletId — propertyPaymentIntegrationId will not be set`);
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
              console.log(`✅ N-Genius Payment record created in database:
  - ID: ${payment.id}
  - Status: ${mappedStatus}
  - Amount: ${payment.amount} ${payment.currency}
  - Order Reference: ${response.data.reference}
  - PropertyPaymentIntegrationId: ${propertyPaymentIntegrationId ?? '(not linked)'}`);
            } catch (dbError) {
              console.error(`❌ Failed to create N-Genius payment record in database for order ${response.data.reference}:`, dbError);
            }
          } else {
            console.warn(`⚠️ Property not found for code: ${orderData.propertyCode}`);
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
    orderReference: string,
    outletId?: string
  ): Promise<NGeniusOrderStatusResponse> {
    try {
      console.log(`[DEBUG - N-GENIUS GET STATUS] 🔍 Fetching status for order: ${orderReference}, outletId: ${outletId}`);
      const token = await this.getValidToken();
      const url = `${NGeniusConfig.baseUrl}${NGeniusConfig.endpoints.orders}/${outletId}/orders/${orderReference}`;

      console.log(`[DEBUG - N-GENIUS GET STATUS] 🌐 GET request to: ${url}`);
      const response = await axios.get<NGeniusOrderStatusResponse>(url, {
        headers: {
          Accept: 'application/vnd.ni-payment.v2+json',
          'Content-Type': 'application/vnd.ni-payment.v2+json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(`[DEBUG - N-GENIUS GET STATUS] 📥 Status response received for order: ${orderReference}, State: ${response.data._embedded?.payment?.[0]?.state}`);
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
   * Process a refund for a captured SALE order
   * Fetches order status to extract payment + capture refs, then calls the refund endpoint
   */
  async processRefund(
    orderReference: string,
    outletId?: string
  ): Promise<NGeniusRefundResponse> {
    try {
      console.log(`\n========================================`);
      console.log(`💸 PROCESSING N-GENIUS REFUND`);
      console.log(`📋 Order Reference: ${orderReference}`);
      console.log(`========================================`);

      // Step 1: Get order status to extract payment and capture refs
      console.log(`[DEBUG - N-GENIUS REFUND] 🔍 Step 1: Calling getOrderStatus to check order reference & extract refs for order: ${orderReference}`);
      const orderStatus = await this.getOrderStatus(orderReference, outletId);

      console.log(`[DEBUG - N-GENIUS REFUND] 📄 Order Status data:`, JSON.stringify(orderStatus));

      const payments = orderStatus._embedded?.payment;

      if (!payments || payments.length === 0) {
        console.error(`[DEBUG - N-GENIUS REFUND] ❌ No payment found for this order: ${orderReference}`);
        return { success: false, message: 'No payment found for this order' };
      }

      const payment = payments[0];

      // Step 2: Extract all IDs from the capture href URL
      // URL format: .../outlets/{outletId}/orders/{orderRef}/payments/{paymentRef}/captures/{captureId}
      const captures = payment._embedded?.['cnp:capture'];
      if (!captures || captures.length === 0) {
        return { success: false, message: 'No capture found for this payment (payment may not be in CAPTURED state)' };
      }

      const captureHref = captures[0]._links?.self?.href;
      if (!captureHref) {
        return { success: false, message: 'Capture href not found in order status' };
      }

      // Parse outletId, orderRef, paymentRef, and captureRef from the href URL
      const hrefParts = captureHref.split('/');
      // Expected segments: ...outlets/{outletId}/orders/{orderRef}/payments/{paymentRef}/captures/{captureId}
      const capturesIndex = hrefParts.indexOf('captures');
      const paymentsIndex = hrefParts.indexOf('payments');
      const ordersIndex = hrefParts.indexOf('orders');
      const outletsIndex = hrefParts.indexOf('outlets');

      if (capturesIndex === -1 || paymentsIndex === -1 || ordersIndex === -1 || outletsIndex === -1) {
        return { success: false, message: 'Failed to parse IDs from capture href URL' };
      }

      const parsedOutletId = hrefParts[outletsIndex + 1];
      const parsedOrderRef = hrefParts[ordersIndex + 1];
      const parsedPaymentRef = hrefParts[paymentsIndex + 1];
      const captureRef = hrefParts[capturesIndex + 1];

      if (!parsedOutletId || !parsedOrderRef || !parsedPaymentRef || !captureRef) {
        return { success: false, message: 'One or more IDs could not be parsed from capture href URL' };
      }

      // Step 3: Get refund amount and currency from the capture
      const refundAmount = captures[0].amount.value;
      const refundCurrency = captures[0].amount.currencyCode;

      console.log(`💳 Payment Reference: ${parsedPaymentRef}`);
      console.log(`📦 Capture Reference: ${captureRef}`);
      console.log(`💰 Refund Amount: ${refundAmount} ${refundCurrency}`);

      // Step 4: Call the refund API
      const token = await this.getValidToken();
      const refundUrl = `${NGeniusConfig.baseUrl}${NGeniusConfig.endpoints.orders}/${parsedOutletId}/orders/${parsedOrderRef}/payments/${parsedPaymentRef}/captures/${captureRef}/refund`;

      console.log(`🔗 Refund URL: ${refundUrl}`);

      const refundResponse = await axios.post(
        refundUrl,
        {
          amount: {
            value: refundAmount,
            currencyCode: refundCurrency,
          },
        },
        {
          headers: {
            'Content-Type': 'application/vnd.ni-payment.v2+json',
            Accept: 'application/vnd.ni-payment.v2+json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(`✅ REFUND SUCCESSFUL`);
      console.log(`📊 Refund Response Status: ${refundResponse.status}`);
      console.log(`========================================\n`);

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
        console.error(`\n❌ REFUND FAILED - Full Axios Error Details:`);
        console.error(`- Response Status: ${error.response?.status} ${error.response?.statusText}`);
        console.error(`- Response Data:`, JSON.stringify(errData, null, 2));
        console.error(`- Request URL: ${error.config?.url}`);
        console.error(`- Request Method: ${error.config?.method}`);
        console.error(`- Request Data Context:`, error.config?.data);
        console.error(`- Axios Error Message: ${error.message}\n`);

        const errMessage = errData?.message || errData?.errors?.[0]?.message || 'Refund API request failed';
        console.error(`❌ REFUND FAILED: ${errMessage}`);
        return { success: false, message: errMessage };
      }
      const msg = error instanceof Error ? error.message : 'Unknown refund error';
      console.error(`❌ REFUND ERRORED (Non-Axios):`, msg, error);
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
      // Console logs removed as per request
    } else {
      // Console logs removed as per request
    }
  }
}

export const ngeniusService = new NGeniusService();