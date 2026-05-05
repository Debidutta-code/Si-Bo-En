import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config';

/**
 * Middleware: resolveRefundStrategy
 *
 * Looks up the PropertyPaymentIntegration for the given orderReference
 * by finding the matching Payment record, then checks `sameDayRefund`.
 *
 * Attaches to req:
 *   - req.refundStrategy: 'same_day' | 'day_after'
 *   - req.resolvedOutletId: string (outlet ID from integration)
 *
 * Expects req.body: { orderReference: string }
 */
export async function resolveRefundStrategy(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { orderReference } = req.body;

    if (!orderReference) {
      res.status(400).json({
        success: false,
        message: 'orderReference is required',
      });
      return;
    }

    // console.log(`\n[REFUND MIDDLEWARE] 🔍 Resolving refund strategy for order: ${orderReference}`);

    // Find the payment record by paymentIntentId (which stores the N-Genius order reference)
    const payment = await prisma.payment.findFirst({
      where: { paymentIntentId: orderReference },
      include: {
        PropertyPaymentIntegration: true,
      },
    });

    if (!payment) {
      console.warn(`[REFUND MIDDLEWARE] ⚠️ No payment record found for orderReference: ${orderReference}`);
      // Default to day_after if no record found (safer — avoids accidental same-day reversal)
      (req as any).refundStrategy = 'day_after';
      (req as any).resolvedOutletId = undefined;
      return next();
    }

    const integration = payment.PropertyPaymentIntegration;

    if (!integration) {
      console.warn(`[REFUND MIDDLEWARE] ⚠️ No PropertyPaymentIntegration linked to payment: ${payment.id}`);
      (req as any).refundStrategy = 'day_after';
      (req as any).resolvedOutletId = undefined;
      return next();
    }

    const strategy = integration.sameDayRefund ? 'same_day' : 'day_after';
    const outletId = integration.outletId;

    // console.log(`[REFUND MIDDLEWARE] ✅ Resolved:`);
    // console.log(`   Payment ID       : ${payment.id}`);
    // console.log(`   Integration ID   : ${integration.id}`);
    // console.log(`   Outlet ID        : ${outletId}`);
    // console.log(`   sameDayRefund    : ${integration.sameDayRefund}`);
    // console.log(`   Strategy         : ${strategy}`);

    (req as any).refundStrategy = strategy;
    (req as any).resolvedOutletId = outletId;

    next();
  } catch (error) {
    console.error(`[REFUND MIDDLEWARE] ❌ Error resolving refund strategy:`, error);
    next(error);
  }
}