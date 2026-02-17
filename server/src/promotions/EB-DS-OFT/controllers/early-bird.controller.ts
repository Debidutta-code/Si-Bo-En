import { Response } from 'express';
import { CustomRequest, PropertyCustomRequest } from '../../../utils/customRequest';
import { errorResponse } from '../../../utils/return';
import { EarlyBirdPromotionService } from '../services';
import { toUTCDate } from '../../../utils';

export class EarlyBirdPromotionController {
  /**
   * Create an early-bird promotion
   */
  public static async createEarlyBirdPromotion(req: PropertyCustomRequest, res: Response) {
    try {
      const { 
        promotionName,
        propertyId,
        discountType,
        discountValue,
        currencyCode,
        validFrom,
        validTo,
        roomRatePlans,
        monApplicable,
        tueApplicable,
        wedApplicable,
        thuApplicable,
        friApplicable,
        satApplicable,
        sunApplicable,
        advanceBookingDays,
        isAutoApplied
      } = req.body;

      // Basic validation
      if (!promotionName || !propertyId || !discountType || discountValue === undefined) {
        return res.status(400).json(
          errorResponse('Promotion name, property ID, discount type, and discount value are required')
        );
      }

      if (!validFrom) {
        return res.status(400).json(errorResponse('Valid from date is required'));
      }

      // Early-bird specific validation
      if (!roomRatePlans || roomRatePlans.length === 0) {
        return res.status(400).json(
          errorResponse('At least one room-rateplan pair is required for early-bird promotion')
        );
      }
      if(!advanceBookingDays){
        errorResponse('Advance booking days is required for early-bird promotion')
      }
      // Validate each room-rateplan pair
      for (const pair of roomRatePlans) {
        if (!pair.ratePlanId || !pair.ratePlanCode) {
          return res.status(400).json(
            errorResponse('Each room-rateplan pair must have ratePlanId and ratePlanCode')
          );
        }
      }

      const promotionData = {
        promotionName,
        propertyId,
        promotionType: 'early_bird' as const,
        discountType,
        discountValue,
        currencyCode,
        validFrom: toUTCDate(validFrom),
        validTo: validTo ? toUTCDate(validTo) : undefined,
        roomRatePlans,
        monApplicable: monApplicable ?? true,
        tueApplicable: tueApplicable ?? true,
        wedApplicable: wedApplicable ?? true,
        thuApplicable: thuApplicable ?? true,
        friApplicable: friApplicable ?? true,
        satApplicable: satApplicable ?? true,
        sunApplicable: sunApplicable ?? true,
        advanceBookingDays,
        isAutoApplied
      };

      const result = await EarlyBirdPromotionService.createEarlyBirdPromotion(promotionData);
      const status = result.success ? 201 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }

  /**
   * Get all early-bird promotions by property
   */
  public static async getEarlyBirdPromotionsByProperty(req: PropertyCustomRequest, res: Response) {
    try {
      const propertyId = req.params.propertyId;

      if (!propertyId) {
        return res.status(400).json(errorResponse('Property ID is required'));
      }

      const result = await EarlyBirdPromotionService.getEarlyBirdPromotionsByProperty(propertyId);
      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }

  /**
   * Get early-bird promotion by ID
   */
  public static async getEarlyBirdPromotionById(req: CustomRequest, res: Response) {
    try {
      const promotionId = req.params.promotionId;

      if (!promotionId) {
        return res.status(400).json(errorResponse('Promotion ID is required'));
      }

      const result = await EarlyBirdPromotionService.getEarlyBirdPromotionById(promotionId);
      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }

  /**
   * Update early-bird promotion
   */
  public static async updateEarlyBirdPromotion(req: CustomRequest, res: Response) {
    try {
      const promotionId = req.params.promotionId;
      const updateData = req.body;

      if (!promotionId) {
        return res.status(400).json(errorResponse('Promotion ID is required'));
      }

      // Convert date strings to Date objects if present
      if (updateData.validFrom) {
        updateData.validFrom = toUTCDate(updateData.validFrom);
      }
      if (updateData.validTo) {
        updateData.validTo = toUTCDate(updateData.validTo);
      }

      const result = await EarlyBirdPromotionService.updateEarlyBirdPromotion(promotionId, updateData);
      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }

  /**
   * Delete early-bird promotion
   */
  public static async deleteEarlyBirdPromotion(req: CustomRequest, res: Response) {
    try {
      const promotionId = req.params.promotionId;

      if (!promotionId) {
        return res.status(400).json(errorResponse('Promotion ID is required'));
      }

      const result = await EarlyBirdPromotionService.deleteEarlyBirdPromotion(promotionId);
      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }

  /**
   * Toggle early-bird promotion status
   */
  public static async toggleEarlyBirdPromotionStatus(req: CustomRequest, res: Response) {
    try {
      const promotionId = req.params.promotionId;
      const { isActive } = req.body;

      if (!promotionId) {
        return res.status(400).json(errorResponse('Promotion ID is required'));
      }

      if (typeof isActive !== 'boolean') {
        return res.status(400).json(errorResponse('isActive must be a boolean value'));
      }

      const result = await EarlyBirdPromotionService.toggleEarlyBirdPromotionStatus(promotionId, isActive);
      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }
}