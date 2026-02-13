// N-Genius Payment Controller with Comprehensive Logging
import { Request, Response, NextFunction } from 'express';
import { ngeniusService } from '../services/ngenius.service';
import { NGeniusOrderRequest } from '../types/ngenius.types';

export class NGeniusController {
  /**
   * Get Access Token
   * POST /api/v1/payment/ngenius/token
   */
  static async getAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    //console.log('\n🔐 ========================================');
    //console.log('📍 ENDPOINT: GET ACCESS TOKEN');
    //console.log('========================================');
    //console.log('⏰ Request Time:', new Date().toISOString());
    //console.log('🌐 Request IP:', req.ip);
    //console.log('🔗 Request URL:', req.originalUrl);
    
    try {
      const tokenResponse = await ngeniusService.getAccessToken();

      //console.log('\n✅ Sending Success Response');
      res.status(200).json({
        success: true,
        message: 'Access token retrieved successfully',
        data: tokenResponse,
      });
    } catch (error) {
      console.error('\n❌ Error in getAccessToken controller');
      console.error('Error:', error);
      next(error);
    }
  }

  /**
   * Create Order
   * POST /api/v1/payment/ngenius/order
   */
  static async createOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    //console.log('\n🛒 ========================================');
    //console.log('📍 ENDPOINT: CREATE ORDER');
    //console.log('========================================');
    //console.log('⏰ Request Time:', new Date().toISOString());
    //console.log('🌐 Request IP:', req.ip);
    //console.log('🔗 Request URL:', req.originalUrl);
    //console.log('🔧 HTTP Method:', req.method);
    //console.log('\n📦 Request Body (Raw):');
    //console.log(JSON.stringify(req.body, null, 2));
    //console.log('\n📋 Request Headers:');
    //console.log(JSON.stringify(req.headers, null, 2));
    
    try {
      const orderData: NGeniusOrderRequest = req.body;

      //console.log('\n🔍 Step 1: Validating Request Body...');
      
      // Validate request body
      if (!orderData.action || !orderData.amount) {
        console.error('❌ Validation Failed: Missing action or amount');
        res.status(400).json({
          success: false,
          message: 'Invalid request. Action and amount are required.',
        });
        return;
      }
      //console.log('✅ Action and Amount present');

      // Validate action
      //console.log('🔍 Validating action:', orderData.action);
      if (!['AUTH', 'SALE', 'PURCHASE'].includes(orderData.action)) {
        console.error('❌ Invalid action:', orderData.action);
        res.status(400).json({
          success: false,
          message: 'Invalid action. Must be AUTH, SALE, or PURCHASE.',
        });
        return;
      }
      //console.log('✅ Action is valid');

      // Validate amount
      //console.log('🔍 Validating amount:', JSON.stringify(orderData.amount, null, 2));
      if (!orderData.amount.currencyCode || !orderData.amount.value) {
        console.error('❌ Invalid amount structure');
        res.status(400).json({
          success: false,
          message: 'Invalid amount. currencyCode and value are required.',
        });
        return;
      }
      //console.log('✅ Amount is valid');

      //console.log('\n🔍 Step 2: Calling N-Genius Service to Create Order...');
      const orderResponse = await ngeniusService.createOrder(orderData);

      console.log('\n✅ Order Created - Extracting Payment URL...');
      const paymentUrl = ngeniusService.getPaymentUrl(orderResponse);
      
      //console.log('\n📄 Preparing Response...');
      const responseData = {
        success: true,
        message: 'Order created successfully',
        data: {
          order: orderResponse,
          paymentUrl: paymentUrl,
          orderReference: orderResponse.reference,
        },
      };

      //console.log('\n✅ Sending Success Response (201 Created)');
      console.log('📦 Response Data:', JSON.stringify(responseData, null, 2));
      
      res.status(201).json(responseData);
    } catch (error) {
      console.error('\n❌ Error in createOrder controller');
      console.error('Error Object:', error);
      
      if (error instanceof Error) {
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
      }
      
      next(error);
    }
  }

  /**
   * Get Order Status
   * GET /api/v1/payment/ngenius/order/:orderReference
   */
  static async getOrderStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    //console.log('\n📊 ========================================');
    //console.log('📍 ENDPOINT: GET ORDER STATUS');
    //console.log('========================================');
    //console.log('⏰ Request Time:', new Date().toISOString());
    //console.log('🌐 Request IP:', req.ip);
    //console.log('🔗 Request URL:', req.originalUrl);
    //console.log('📋 Request Params:', JSON.stringify(req.params, null, 2));
    
    try {
      const { orderReference } = req.params;
      //console.log('🔑 Order Reference:', orderReference);

      if (!orderReference) {
        console.error('❌ Missing orderReference parameter');
        res.status(400).json({
          success: false,
          message: 'Order reference is required',
        });
        return;
      }

      //console.log('\n🔍 Fetching order status from N-Genius...');
      const orderStatus = await ngeniusService.getOrderStatus(orderReference);

      //console.log('\n✅ Sending Success Response');
      res.status(200).json({
        success: true,
        message: 'Order status retrieved successfully',
        data: orderStatus,
      });
    } catch (error) {
      console.error('\n❌ Error in getOrderStatus controller');
      console.error('Error:', error);
      next(error);
    }
  }

  /**
   * Get Payment URL
   * GET /api/v1/payment/ngenius/payment-url/:orderReference
   */
  static async getPaymentUrl(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    //console.log('\n🔗 ========================================');
    //console.log('📍 ENDPOINT: GET PAYMENT URL');
    //console.log('========================================');
    //console.log('⏰ Request Time:', new Date().toISOString());
    //console.log('🌐 Request IP:', req.ip);
    //console.log('🔗 Request URL:', req.originalUrl);
    //console.log('📋 Request Params:', JSON.stringify(req.params, null, 2));
    
    try {
      const { orderReference } = req.params;
      //console.log('🔑 Order Reference:', orderReference);

      if (!orderReference) {
        console.error('❌ Missing orderReference parameter');
        res.status(400).json({
          success: false,
          message: 'Order reference is required',
        });
        return;
      }

      //console.log('\n🔍 Fetching order status...');
      const orderStatus = await ngeniusService.getOrderStatus(orderReference);
      
      //console.log('\n🔍 Extracting payment URL...');
      const paymentUrl = ngeniusService.getPaymentUrl(orderStatus);

      //console.log('\n✅ Sending Success Response');
      res.status(200).json({
        success: true,
        message: 'Payment URL retrieved successfully',
        data: {
          paymentUrl: paymentUrl,
          orderReference: orderStatus.reference,
        },
      });
    } catch (error) {
      console.error('\n❌ Error in getPaymentUrl controller');
      console.error('Error:', error);
      next(error);
    }
  }
}