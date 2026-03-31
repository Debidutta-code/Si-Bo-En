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
      console.log("📥 [BACKEND DEBUG] Received N-Genius order payload:", JSON.stringify(orderData, null, 2));

      if (!orderData.action || !orderData.amount) {
        res.status(400).json({ success: false, message: 'Invalid request. Action and amount are required.' });
        return;
      }

      if (!['AUTH', 'SALE', 'PURCHASE'].includes(orderData.action)) {
        res.status(400).json({ success: false, message: 'Invalid action. Must be AUTH, SALE, or PURCHASE.' });
        return;
      }

      if (!orderData.amount.currencyCode || !orderData.amount.value) {
        res.status(400).json({ success: false, message: 'Invalid amount. currencyCode and value are required.' });
        return;
      }

      const orderResponse = await ngeniusService.createOrder(orderData);
      const paymentUrl = ngeniusService.getPaymentUrl(orderResponse);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          order: orderResponse,
          paymentUrl: paymentUrl,
          orderReference: orderResponse.reference,
        },
      });
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
      const { propertyId } = req.query;

      if (!orderReference) {
        res.status(400).json({ success: false, message: 'Order reference is required' });
        return;
      }

      const orderStatus = await ngeniusService.getOrderStatus(orderReference, undefined, propertyId as string);

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
      const { propertyId } = req.query;

      if (!orderReference) {
        res.status(400).json({ success: false, message: 'Order reference is required' });
        return;
      }

      const orderStatus = await ngeniusService.getOrderStatus(orderReference, undefined, propertyId as string);
      const paymentUrl = ngeniusService.getPaymentUrl(orderStatus);

      res.status(200).json({
        success: true,
        message: 'Payment URL retrieved successfully',
        data: { paymentUrl, orderReference: orderStatus.reference },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process Refund — routes to same-day or day-after based on DB flag
   * POST /api/v1/payment/ngenius/refund
   *
   * Middleware `resolveRefundStrategy` must run before this and attaches:
   *   - req.refundStrategy: 'same_day' | 'day_after'
   *   - req.resolvedOutletId: string
   */
  static async processRefund(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { orderReference } = req.body;
      const refundStrategy: 'same_day' | 'day_after' = (req as any).refundStrategy ?? 'day_after';
      const resolvedOutletId: string | undefined = (req as any).resolvedOutletId;

      console.log(`\n[REFUND CONTROLLER] 💡 Strategy: ${refundStrategy}`);
      console.log(`[REFUND CONTROLLER] 📋 Order Reference: ${orderReference}`);
      console.log(`[REFUND CONTROLLER] 🏪 Outlet ID: ${resolvedOutletId ?? '(not resolved)'}`);

      if (!orderReference) {
        res.status(400).json({ success: false, message: 'orderReference is required' });
        return;
      }

      let refundResult;

      if (refundStrategy === 'same_day') {
        if (!resolvedOutletId) {
          res.status(400).json({
            success: false,
            message: 'outletId is required for same-day refund but could not be resolved from the database.',
          });
          return;
        }

        console.log(`[REFUND CONTROLLER] ⚡ Routing to SAME-DAY refund (cancel capture + reverse auth)`);
        refundResult = await ngeniusService.processSameDayRefund(orderReference, resolvedOutletId);
      } else {
        console.log(`[REFUND CONTROLLER] 🕐 Routing to DAY-AFTER refund (standard refund API)`);
        refundResult = await ngeniusService.processRefund(orderReference, resolvedOutletId);
      }

      res.status(refundResult.success ? 200 : 422).json({
        success: refundResult.success,
        message: refundResult.message,
        data: refundResult.success
          ? { refundReference: refundResult.refundReference, strategy: refundStrategy, ...refundResult.data }
          : undefined,
      });
    } catch (error) {
      next(error);
    }
  }
}