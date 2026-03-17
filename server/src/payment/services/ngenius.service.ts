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
      console.log("inside getaccess token../..");
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

      console.log("response inside the getaccesstoken function", response);

      // Store token and expiry time
      this.accessToken = response.data.access_token;
      console.log("after getting the token response");
      this.tokenExpiry = new Date(
        Date.now() + response.data.expires_in * 1000
      );

      return response.data;
    } catch (error) {
      console.log("error inside the getaccesstoken function", error);
      this.handleError(error, 'Failed to get access token');
      throw error;
    }
  }

  /**
   * Get valid access token (refresh if expired)
   */
  private async getValidToken(): Promise<string> {
    console.log("inside get valid token");
    // if (this.accessToken && this.tokenExpiry) {
    //   const now = new Date();
    //   if (this.tokenExpiry > now) {
    //     return this.accessToken;
    //   }
    // }

    const tokenResponse = await this.getAccessToken();
    console.log("after getting the token response");
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
      console.log(`\n${'='.repeat(60)}`);
      console.log(`💸 [REFUND] PROCESSING N-GENIUS REFUND`);
      console.log(`📋 [REFUND] Order Reference  : ${orderReference}`);
      console.log(`🏪 [REFUND] Outlet ID        : ${outletId ?? '⚠️ (NOT PROVIDED — URL will be malformed!)'}`);
      console.log(`⏰ [REFUND] Timestamp        : ${new Date().toISOString()}`);
      console.log(`${'='.repeat(60)}`);

      // ── Step 1: Fetch order status ──────────────────────────────────────────
      console.log(`\n[REFUND - Step 1] 🔍 Calling getOrderStatus...`);
      console.log(`[REFUND - Step 1]    orderReference : ${orderReference}`);
      console.log(`[REFUND - Step 1]    outletId       : ${outletId ?? '(undefined)'}`);

      const orderStatus = await this.getOrderStatus(orderReference, outletId);

      // Log the entire raw response so we can see whatever N-Genius actually returns
      console.log(`\n[REFUND - Step 1] 📥 Raw order status response:`);
      console.log(JSON.stringify(orderStatus, null, 2));

      // ── Step 2: Inspect top-level order fields ──────────────────────────────
      console.log(`\n[REFUND - Step 2] 🧾 Order top-level fields:`);
      console.log(`    _id              : ${(orderStatus as any)._id ?? '(not present)'}`);
      console.log(`    reference        : ${(orderStatus as any).reference ?? '(not present)'}`);
      console.log(`    action           : ${(orderStatus as any).action ?? '(not present)'}`);
      console.log(`    state (order)    : ${(orderStatus as any).state ?? '(not present)'}`);
      console.log(`    amount.value     : ${orderStatus.amount?.value ?? '(not present)'}`);
      console.log(`    amount.currency  : ${orderStatus.amount?.currencyCode ?? '(not present)'}`);
      console.log(`    outletId         : ${(orderStatus as any).outletId ?? '(not present)'}`);
      console.log(`    _embedded keys   : ${JSON.stringify(Object.keys(orderStatus._embedded ?? {}))}`);
      console.log(`    _links keys      : ${JSON.stringify(Object.keys((orderStatus as any)._links ?? {}))}`);

      // ── Step 3: Inspect payments array ─────────────────────────────────────
      const payments = orderStatus._embedded?.payment;
      console.log(`\n[REFUND - Step 3] 💳 Payments array length: ${payments?.length ?? 0}`);

      if (!payments || payments.length === 0) {
        console.error(`[REFUND - Step 3] ❌ No payment found in _embedded.payment for order: ${orderReference}`);
        console.error(`[REFUND - Step 3]    Full _embedded object:`, JSON.stringify(orderStatus._embedded, null, 2));
        return { success: false, message: 'No payment found for this order' };
      }

      const payment = payments[0];
      console.log(`\n[REFUND - Step 3] 📋 Payment[0] fields:`);
      console.log(`    _id              : ${(payment as any)._id ?? '(not present)'}`);
      console.log(`    state            : ${payment.state ?? '(not present)'}`);
      console.log(`    amount.value     : ${(payment as any).amount?.value ?? '(not present)'}`);
      console.log(`    amount.currency  : ${(payment as any).amount?.currencyCode ?? '(not present)'}`);
      console.log(`    _embedded keys   : ${JSON.stringify(Object.keys(payment._embedded ?? {}))}`);
      console.log(`    _links keys      : ${JSON.stringify(Object.keys((payment as any)._links ?? {}))}`);
      console.log(`    Full payment _links:`, JSON.stringify((payment as any)._links, null, 2));

      // ── Step 4: Inspect captures ────────────────────────────────────────────
      const captures = payment._embedded?.['cnp:capture'];
      console.log(`\n[REFUND - Step 4] 🗂️  cnp:capture array length: ${captures?.length ?? 0}`);
      console.log(`[REFUND - Step 4]    All _embedded keys on payment:`, JSON.stringify(Object.keys(payment._embedded ?? {})));

      if (!captures || captures.length === 0) {
        console.error(`[REFUND - Step 4] ❌ No captures found. Payment state is: ${payment.state}`);
        console.error(`[REFUND - Step 4]    This usually means the payment was NOT captured (e.g., AUTHORISED but not CAPTURED, or PURCHASED via 3DS).`);
        console.error(`[REFUND - Step 4]    Full payment._embedded:`, JSON.stringify(payment._embedded, null, 2));
        return { success: false, message: 'No capture found for this payment (payment may not be in CAPTURED state)' };
      }

      // Log every capture so we see all of them, not just [0]
      captures.forEach((cap: any, idx: number) => {
        console.log(`\n[REFUND - Step 4] 📦 Capture[${idx}]:`);
        console.log(`    _id              : ${cap._id ?? '(not present)'}`);
        console.log(`    state            : ${cap.state ?? '(not present)'}`);
        console.log(`    amount.value     : ${cap.amount?.value ?? '(not present)'}`);
        console.log(`    amount.currency  : ${cap.amount?.currencyCode ?? '(not present)'}`);
        console.log(`    _links keys      : ${JSON.stringify(Object.keys(cap._links ?? {}))}`);
        console.log(`    Full _links      :`, JSON.stringify(cap._links, null, 2));
        console.log(`    cnp:refund href  : ${cap._links?.['cnp:refund']?.href ?? '⚠️ (NOT PRESENT on this capture)'}`);
      });

      // ── Step 5: Extract refund href from capture[0] ─────────────────────────
      const rawCaptureHref = captures[0]._links?.['cnp:refund']?.href;

      console.log(`\n[REFUND - Step 5] 🔗 cnp:refund href from capture[0]: ${rawCaptureHref ?? '(not present)'}`);

      if (!rawCaptureHref) {
        console.error(`[REFUND - Step 5] ❌ cnp:refund href NOT FOUND on capture[0].`);
        console.error(`[REFUND - Step 5]    This is the "href not found" error!`);
        console.error(`[REFUND - Step 5]    capture[0]._links full object:`, JSON.stringify(captures[0]._links, null, 2));
        console.error(`[REFUND - Step 5]    Possible reasons:`);
        console.error(`[REFUND - Step 5]      1. Payment captured < 24hrs ago (N-Genius doesn't expose refund link yet)`);
        console.error(`[REFUND - Step 5]      2. Payment is in wrong state for refund`);
        console.error(`[REFUND - Step 5]      3. API response schema changed or unexpected structure`);
        return { success: false, message: 'Capture refund href not found in order status' };
      }

      console.log(`[REFUND - Step 5] ✅ cnp:refund href found: ${rawCaptureHref}`);
      console.log(`[REFUND - Step 5]    Ends with /refund? ${rawCaptureHref.endsWith('/refund')}`);

      // ── Step 6: 24-hour check ───────────────────────────────────────────────
      if (!rawCaptureHref.endsWith('/refund')) {
        console.warn(`[REFUND - Step 6] ⏳ Refund endpoint NOT yet available (payment < 24hrs old).`);
        console.warn(`[REFUND - Step 6]    Raw href: ${rawCaptureHref}`);
        console.warn(`[REFUND - Step 6]    Expected it to end with '/refund' but it doesn't.`);
        return {
          success: false,
          message: 'Reservation cannot be cancelled within 24 hours of booking. Please try again after 24 hours.',
        };
      }

      const refundUrl = rawCaptureHref;
      console.log(`\n[REFUND - Step 6] ✅ Refund URL confirmed available: ${refundUrl}`);

      // Parse captureRef from the URL for logging/reference purposes
      const refundUrlParts = refundUrl.split('/');
      const capturesIndex = refundUrlParts.indexOf('captures');
      const captureRef = capturesIndex !== -1 ? refundUrlParts[capturesIndex + 1] : 'unknown';

      // ── Step 7: Build refund payload ────────────────────────────────────────
      const orderAmount = orderStatus.amount;
      const refundCurrency = orderAmount.currencyCode;
      const refundAmount = orderAmount.value; // already in minor units (e.g. 100 = 1 AED)

      console.log(`\n[REFUND - Step 7] 📦 Refund payload details:`);
      console.log(`    captureRef       : ${captureRef}`);
      console.log(`    refundUrl        : ${refundUrl}`);
      console.log(`    refundAmount     : ${refundAmount} (minor units) = ${refundAmount / 100} ${refundCurrency}`);
      console.log(`    refundCurrency   : ${refundCurrency}`);
      console.log(`    Body to send     :`, JSON.stringify({ amount: { value: refundAmount, currencyCode: refundCurrency } }));

      // ── Step 8: Call refund API ─────────────────────────────────────────────
      console.log(`\n[REFUND - Step 8] 🚀 Sending refund POST request to N-Genius...`);
      const token = await this.getValidToken();

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

      console.log(`\n[REFUND - Step 8] ✅ REFUND SUCCESSFUL`);
      console.log(`[REFUND - Step 8]    HTTP Status  : ${refundResponse.status} ${refundResponse.statusText}`);
      console.log(`[REFUND - Step 8]    Response data:`, JSON.stringify(refundResponse.data, null, 2));
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
        console.error(`\n[REFUND] ❌ REFUND FAILED — Axios Error:`);
        console.error(`    HTTP Status   : ${error.response?.status} ${error.response?.statusText}`);
        console.error(`    Request URL   : ${error.config?.url}`);
        console.error(`    Request method: ${error.config?.method}`);
        console.error(`    Request body  :`, error.config?.data);
        console.error(`    Response data :`, JSON.stringify(errData, null, 2));
        console.error(`    Axios message : ${error.message}\n`);

        const errMessage = errData?.message || errData?.errors?.[0]?.message || 'Refund API request failed';
        console.error(`[REFUND] ❌ Final error message: ${errMessage}`);
        return { success: false, message: errMessage };
      }
      const msg = error instanceof Error ? error.message : 'Unknown refund error';
      console.error(`[REFUND] ❌ Non-Axios error:`, msg, error);
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