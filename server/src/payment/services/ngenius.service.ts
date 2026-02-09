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

class NGeniusService {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  /**
   * Get Access Token from N-Genius
   */
  async getAccessToken(): Promise<NGeniusTokenResponse> {
    console.log('\n========================================');
    console.log('🔑 REQUESTING ACCESS TOKEN');
    console.log('========================================');
    
    try {
      const url = `${NGeniusConfig.baseUrl}${NGeniusConfig.endpoints.token}`;
      
      console.log('📍 Full Request URL:', url);
      console.log('🌐 Base URL:', NGeniusConfig.baseUrl);
      console.log('🔗 Token Endpoint:', NGeniusConfig.endpoints.token);
      console.log('🔐 API Key (first 20 chars):', NGeniusConfig.apiKey?.substring(0, 20) + '...');
      console.log('🔐 API Key Length:', NGeniusConfig.apiKey?.length);
      console.log('🔐 API Key (last 10 chars):', '...' + NGeniusConfig.apiKey?.substring(NGeniusConfig.apiKey.length - 10));
      console.log('🏪 Outlet ID:', NGeniusConfig.outletId);
      console.log('📦 Request Body:', JSON.stringify({ realmName: 'ni' }, null, 2));
      console.log('⏰ Request Time:', new Date().toISOString());

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

      console.log('\n✅ TOKEN REQUEST SUCCESSFUL');
      console.log('📊 Response Status:', response.status);
      console.log('📊 Response Status Text:', response.statusText);
      console.log('🔑 Access Token (first 30 chars):', response.data.access_token?.substring(0, 30) + '...');
      console.log('🔑 Access Token Length:', response.data.access_token?.length);
      console.log('⏰ Expires In:', response.data.expires_in, 'seconds');
      console.log('🔄 Token Type:', response.data.token_type);

      // Store token and expiry time
      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(
        Date.now() + response.data.expires_in * 1000
      );

      console.log('💾 Token Cached Until:', this.tokenExpiry.toISOString());
      console.log('========================================\n');

      return response.data;
    } catch (error) {
      console.error('\n❌ TOKEN REQUEST FAILED');
      console.error('⏰ Error Time:', new Date().toISOString());
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<NGeniusErrorResponse>;
        console.error('📊 Error Status:', axiosError.response?.status);
        console.error('📊 Error Status Text:', axiosError.response?.statusText);
        console.error('📄 Error Response Data:', JSON.stringify(axiosError.response?.data, null, 2));
        console.error('🔍 Error Message:', axiosError.message);
        console.error('🔍 Error Code:', axiosError.code);
      }
      
      this.handleError(error, 'Failed to get access token');
      console.log('========================================\n');
      throw error;
    }
  }

  /**
   * Get valid access token (refresh if expired)
   */
  private async getValidToken(): Promise<string> {
    console.log('\n🔍 Checking Token Validity...');
    console.log('⏰ Current Time:', new Date().toISOString());
    
    if (this.accessToken && this.tokenExpiry) {
      const now = new Date();
      const timeUntilExpiry = this.tokenExpiry.getTime() - now.getTime();
      const minutesUntilExpiry = Math.floor(timeUntilExpiry / 1000 / 60);
      
      console.log('📅 Token Expiry Time:', this.tokenExpiry.toISOString());
      console.log('⏰ Time Until Expiry:', minutesUntilExpiry, 'minutes');
      
      if (this.tokenExpiry > now) {
        console.log('✅ Using Cached Token (valid for', minutesUntilExpiry, 'more minutes)');
        return this.accessToken;
      } else {
        console.log('⚠️ Token Expired - Requesting New Token');
      }
    } else {
      console.log('⚠️ No Cached Token - Requesting New Token');
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
      console.log('🔐 Step 1: Getting Valid Access Token...');
      const token = await this.getValidToken();
      console.log('✅ Token Retrieved Successfully');
      console.log('🔑 Using Token (first 30 chars):', token.substring(0, 30) + '...');

      const url = `${NGeniusConfig.baseUrl}${NGeniusConfig.endpoints.orders}/${NGeniusConfig.outletId}/orders`;

      console.log('\n📍 ORDER CREATION REQUEST DETAILS:');
      console.log('🌐 Base URL:', NGeniusConfig.baseUrl);
      console.log('🔗 Orders Endpoint:', NGeniusConfig.endpoints.orders);
      console.log('🏪 Outlet ID:', NGeniusConfig.outletId);
      console.log('📍 Full URL:', url);
      console.log('🔧 HTTP Method: POST');
      
      console.log('\n📦 Request Body (Order Data):');
      console.log(JSON.stringify(orderData, null, 2));
      
      console.log('\n📋 Request Headers:');
      const headers = {
        'Content-Type': 'application/vnd.ni-payment.v2+json',
        Accept: 'application/vnd.ni-payment.v2+json',
        Authorization: `Bearer ${token.substring(0, 30)}...`,
      };
      console.log(JSON.stringify(headers, null, 2));

      console.log('\n🚀 Sending Request to N-Genius API...');
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

      return response.data;
    } catch (error) {
      console.error('\n❌ ORDER CREATION FAILED');
      console.error('⏰ Error Time:', new Date().toISOString());
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<NGeniusErrorResponse>;
        
        console.error('\n📊 ERROR RESPONSE DETAILS:');
        console.error('Status Code:', axiosError.response?.status);
        console.error('Status Text:', axiosError.response?.statusText);
        console.error('\n📄 Error Response Data:');
        console.error(JSON.stringify(axiosError.response?.data, null, 2));
        
        console.error('\n📋 Error Response Headers:');
        console.error(JSON.stringify(axiosError.response?.headers, null, 2));
        
        console.error('\n🔍 Axios Error Details:');
        console.error('Error Message:', axiosError.message);
        console.error('Error Code:', axiosError.code);
        
        console.error('\n📤 REQUEST THAT FAILED:');
        console.error('URL:', axiosError.config?.url);
        console.error('Method:', axiosError.config?.method);
        console.error('Headers:', JSON.stringify(axiosError.config?.headers, null, 2));
        console.error('Body:', axiosError.config?.data);
        
        // Check for specific error codes
        if (axiosError.response?.status === 403) {
          console.error('\n🚨 403 FORBIDDEN ERROR - POSSIBLE CAUSES:');
          console.error('1. ❌ Incorrect Outlet ID - Verify your outlet ID in N-Genius portal');
          console.error('2. ❌ Outlet not configured for payments - Check outlet settings');
          console.error('3. ❌ API Key doesn\'t have permission for this outlet');
          console.error('4. ❌ Wrong environment (sandbox vs production)');
          console.error('5. ❌ Outlet disabled or suspended');
          console.error('\n🔧 DEBUGGING STEPS:');
          console.error('1. Login to N-Genius portal');
          console.error('2. Verify outlet ID:', NGeniusConfig.outletId);
          console.error('3. Check outlet status and permissions');
          console.error('4. Ensure API key matches the outlet');
          console.error('5. Verify you\'re using correct environment (sandbox/production)');
        }
      }
      
      this.handleError(error, 'Failed to create order');
      console.log('========================================\n');
      throw error;
    }
  }

  /**
   * Get Order Status
   */
  async getOrderStatus(
    orderReference: string
  ): Promise<NGeniusOrderStatusResponse> {
    console.log('\n========================================');
    console.log('📊 FETCHING ORDER STATUS');
    console.log('========================================');
    
    try {
      console.log('🔐 Getting Valid Access Token...');
      const token = await this.getValidToken();
      console.log('✅ Token Retrieved');

      const url = `${NGeniusConfig.baseUrl}${NGeniusConfig.endpoints.orders}/${NGeniusConfig.outletId}/orders/${orderReference}`;

      console.log('\n📍 REQUEST DETAILS:');
      console.log('URL:', url);
      console.log('Order Reference:', orderReference);
      console.log('Outlet ID:', NGeniusConfig.outletId);
      console.log('Method: GET');

      console.log('\n🚀 Fetching order status...');
      const startTime = Date.now();

      const response = await axios.get<NGeniusOrderStatusResponse>(url, {
        headers: {
          Accept: 'application/vnd.ni-payment.v2+json',
          Authorization: `Bearer ${token}`,
        },
      });

      const duration = Date.now() - startTime;

      console.log('\n✅ ORDER STATUS RETRIEVED');
      console.log('⏱️  Response Time:', duration, 'ms');
      console.log('📊 Status:', response.status);
      console.log('\n📄 Order Data:');
      console.log(JSON.stringify(response.data, null, 2));
      console.log('========================================\n');

      return response.data;
    } catch (error) {
      console.error('\n❌ FAILED TO GET ORDER STATUS');
      console.error('Order Reference:', orderReference);
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<NGeniusErrorResponse>;
        console.error('Status:', axiosError.response?.status);
        console.error('Error Data:', JSON.stringify(axiosError.response?.data, null, 2));
      }
      
      this.handleError(error, 'Failed to get order status');
      console.log('========================================\n');
      throw error;
    }
  }

  /**
   * Get Payment Page URL from Order Response
   */
  getPaymentUrl(orderResponse: NGeniusOrderResponse): string {
    console.log('\n🔗 Extracting Payment URL from Order Response');
    const paymentUrl = orderResponse._links.payment.href;
    console.log('Payment URL:', paymentUrl);
    return paymentUrl;
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