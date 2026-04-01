// N-Genius Payment Controller with Comprehensive Logging
import { Request, Response, NextFunction } from 'express';
import { ngeniusService, NGeniusSecrets } from '../services/ngenius.service';
import { NGeniusOrderRequest } from '../types/ngenius.types';
import { PaymentConfigResolver } from '../utils/config-resolver';
import { prisma } from '../../config';

export class NGeniusController {
  private static async resolveNGeniusConfig(propertyId?: string, propertyCode?: string): Promise<NGeniusSecrets> {
    let config;
    if (propertyId) {
      config = await PaymentConfigResolver.resolveConfig(propertyId, 'N-Genius');
    } else if (propertyCode) {
      config = await PaymentConfigResolver.resolveConfigByPropertyCode(propertyCode, 'N-Genius');
    }

    if (!config) {
      throw new Error('N-Genius configuration not found or not active for this property.');
    }

    const secrets = config.secrets;
    return {
      baseUrl: config.baseUrl,
      apiKey: secrets['API Key'] || secrets['apiKey'] || secrets['api_key'] || '',
      outletId: secrets['Outlet ID'] || secrets['outletId'] || secrets['outlet_id'] || secrets['outlet id'] || ''
    };
  }

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
      const { propertyId, propertyCode } = req.query;
      const config = await NGeniusController.resolveNGeniusConfig(propertyId as string, propertyCode as string);

      const tokenResponse = await ngeniusService.getAccessToken(config, propertyId as string);
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

      // Resolve propertyId from propertyCode if needed for config resolution
      let propertyId: string | undefined;
      if (orderData.propertyCode) {
        const property = await prisma.property.findFirst({
            where: { propertyCode: orderData.propertyCode },
            select: { id: true }
        });
        if (property) propertyId = property.id;
      }

      const config = await NGeniusController.resolveNGeniusConfig(propertyId, orderData.propertyCode);

      const orderResponse = await ngeniusService.createOrder(config, orderData);
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
      const { propertyId, propertyCode } = req.query;

      if (!orderReference) {
        res.status(400).json({ success: false, message: 'Order reference is required' });
        return;
      }

      const config = await NGeniusController.resolveNGeniusConfig(propertyId as string, propertyCode as string);
      const orderStatus = await ngeniusService.getOrderStatus(config, orderReference, undefined, propertyId as string);

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
      const { propertyId, propertyCode } = req.query;

      if (!orderReference) {
        res.status(400).json({ success: false, message: 'Order reference is required' });
        return;
      }

      const config = await NGeniusController.resolveNGeniusConfig(propertyId as string, propertyCode as string);
      const orderStatus = await ngeniusService.getOrderStatus(config, orderReference, undefined, propertyId as string);
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
   *   - req.resolvedPropertyId: string (added for dynamic config)
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
      const resolvedPropertyId: string | undefined = (req as any).resolvedPropertyId;

      console.log(`\n[REFUND CONTROLLER] 💡 Strategy: ${refundStrategy}`);
      console.log(`[REFUND CONTROLLER] 📋 Order Reference: ${orderReference}`);
      console.log(`[REFUND CONTROLLER] 🏪 Outlet ID: ${resolvedOutletId ?? '(not resolved)'}`);

      if (!orderReference) {
        res.status(400).json({ success: false, message: 'orderReference is required' });
        return;
      }

      if (!resolvedPropertyId) {
          res.status(400).json({ success: false, message: 'propertyId could not be resolved from orderReference.' });
          return;
      }

      const config = await NGeniusController.resolveNGeniusConfig(resolvedPropertyId);
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
        refundResult = await ngeniusService.processSameDayRefund(config, orderReference, resolvedOutletId);
      } else {
        console.log(`[REFUND CONTROLLER] 🕐 Routing to DAY-AFTER refund (standard refund API)`);
        refundResult = await ngeniusService.processRefund(config, orderReference, resolvedOutletId);
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
