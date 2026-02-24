// N-Genius Payment Service with Comprehensive Logging
import axios, { AxiosError } from 'axios';
import { NGeniusConfig } from '../config/ngenius.config';
import {
  NGeniusTokenResponse,
  NGeniusOrderRequest,
  NGeniusOrderResponse,
  NGeniusOrderStatusResponse,
  NGeniusErrorResponse,
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

      // Use dynamic outlet ID if provided, otherwise fallback to config
      const targetOutletId = orderData.outletId || NGeniusConfig.outletId;
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

            try {
              const payment = await prisma.payment.create({
                data: {
                  amount: orderData.amount.value / 100,
                  currency: "USD",
                  status: mappedStatus as any,
                  paymentMethod: "payment_gateway",
                  propertyId: property.id,
                  reservationId: (orderData.reservationId || null) as any,
                  paymentIntentId: response.data.reference,
                },
              });
              console.log(`✅ N-Genius Payment record created in database:
  - ID: ${payment.id}
  - Status: ${mappedStatus}
  - Amount: ${payment.amount} ${payment.currency}
  - Order Reference: ${response.data.reference}`);
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
    orderReference: string
  ): Promise<NGeniusOrderStatusResponse> {
    try {
      const token = await this.getValidToken();
      const url = `${NGeniusConfig.baseUrl}${NGeniusConfig.endpoints.orders}/${NGeniusConfig.outletId}/orders/${orderReference}`;

      const response = await axios.get<NGeniusOrderStatusResponse>(url, {
        headers: {
          Accept: 'application/vnd.ni-payment.v2+json',
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