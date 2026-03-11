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
    try {
      const tokenResponse = await ngeniusService.getAccessToken();

      res.status(200).json({
        success: true,
        message: 'Access token retrieved successfully',
        data: tokenResponse,
      });
    } catch (error) {
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
    try {
      const orderData: NGeniusOrderRequest = req.body;

      // Validate request body
      if (!orderData.action || !orderData.amount) {
        res.status(400).json({
          success: false,
          message: 'Invalid request. Action and amount are required.',
        });
        return;
      }

      // Validate action
      if (!['AUTH', 'SALE', 'PURCHASE'].includes(orderData.action)) {
        res.status(400).json({
          success: false,
          message: 'Invalid action. Must be AUTH, SALE, or PURCHASE.',
        });
        return;
      }

      // Validate amount
      if (!orderData.amount.currencyCode || !orderData.amount.value) {
        res.status(400).json({
          success: false,
          message: 'Invalid amount. currencyCode and value are required.',
        });
        return;
      }

      const orderResponse = await ngeniusService.createOrder(orderData);

      console.log('\n✅ Order Created - Extracting Payment URL...');
      const paymentUrl = ngeniusService.getPaymentUrl(orderResponse);

      const responseData = {
        success: true,
        message: 'Order created successfully',
        data: {
          order: orderResponse,
          paymentUrl: paymentUrl,
          orderReference: orderResponse.reference,
        },
      };

      res.status(201).json(responseData);
    } catch (error) {
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
    try {
      const { orderReference } = req.params;

      if (!orderReference) {
        res.status(400).json({
          success: false,
          message: 'Order reference is required',
        });
        return;
      }

      const orderStatus = await ngeniusService.getOrderStatus(orderReference);

      res.status(200).json({
        success: true,
        message: 'Order status retrieved successfully',
        data: orderStatus,
      });
    } catch (error) {
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
    try {
      const { orderReference } = req.params;

      if (!orderReference) {
        res.status(400).json({
          success: false,
          message: 'Order reference is required',
        });
        return;
      }

      const orderStatus = await ngeniusService.getOrderStatus(orderReference);
      const paymentUrl = ngeniusService.getPaymentUrl(orderStatus);

      res.status(200).json({
        success: true,
        message: 'Payment URL retrieved successfully',
        data: {
          paymentUrl: paymentUrl,
          orderReference: orderStatus.reference,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process Refund
   * POST /api/v1/payment/ngenius/refund
   */
  static async processRefund(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { orderReference, outletId } = req.body;

      if (!orderReference) {
        res.status(400).json({
          success: false,
          message: 'orderReference is required',
        });
        return;
      }

      const refundResult = await ngeniusService.processRefund(orderReference);

      res.status(refundResult.success ? 200 : 422).json({
        success: refundResult.success,
        message: refundResult.message,
        data: refundResult.success
          ? { refundReference: refundResult.refundReference, ...refundResult.data }
          : undefined,
      });
    } catch (error) {
      next(error);
    }
  }
}