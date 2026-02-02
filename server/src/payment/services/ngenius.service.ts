// N-Genius Payment Service
import axios, { AxiosError } from 'axios';
import { NGeniusConfig } from '../config/ngenius.config';
import {
  NGeniusTokenResponse,
  NGeniusOrderRequest,
  NGeniusOrderResponse,
  NGeniusOrderStatusResponse,
  NGeniusErrorResponse,
} from '../types/ngenius.types';

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
        url,
        { realmName: 'ni' },
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
    // Check if token exists and is not expired
    if (
      this.accessToken &&
      this.tokenExpiry &&
      this.tokenExpiry > new Date()
    ) {
      return this.accessToken;
    }

    // Get new token
    const tokenResponse = await this.getAccessToken();
    return tokenResponse.access_token;
  }

  /**
   * Create Order in N-Genius
   */
  async createOrder(
    orderData: NGeniusOrderRequest
  ): Promise<NGeniusOrderResponse> {
    try {
      // Get valid access token
      const token = await this.getValidToken();

      const url = `${NGeniusConfig.baseUrl}${NGeniusConfig.endpoints.orders}/${NGeniusConfig.outletId}/orders`;

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
      // Get valid access token
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
   * Handle API Errors
   */
  private handleError(error: unknown, context: string): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<NGeniusErrorResponse>;
      console.error(`${context}:`, {
        status: axiosError.response?.status,
        message: axiosError.response?.data?.message || axiosError.message,
        errors: axiosError.response?.data?.errors,
      });
    } else {
      console.error(`${context}:`, error);
    }
  }
}

export const ngeniusService = new NGeniusService();
