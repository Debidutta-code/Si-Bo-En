import { Response } from 'express';
import { CustomRequest, PropertyCustomRequest } from '../../../utils/customRequest';
import { errorResponse } from '../../../utils/return';
import { OfferForTonightPromotionService } from '../services';

export class OfferForTonightPromotionController {
  /**
   * Create an offer-for-tonight promotion
   */
  public static async createOfferForTonightPromotion(req: PropertyCustomRequest, res: Response) {
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

      // Offer-for-tonight specific validation
      if (!roomRatePlans || roomRatePlans.length === 0) {
        return res.status(400).json(
          errorResponse('At least one room-rateplan pair is required for offer-for-tonight promotion')
        );
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
        promotionType: 'offer_for_tonight' as const,
        discountType,
        discountValue,
        currencyCode,
        validFrom: new Date(validFrom),
        validTo: validTo ? new Date(validTo) : undefined,
        roomRatePlans,
        monApplicable: monApplicable ?? true,
        tueApplicable: tueApplicable ?? true,
        wedApplicable: wedApplicable ?? true,
        thuApplicable: thuApplicable ?? true,
        friApplicable: friApplicable ?? true,
        satApplicable: satApplicable ?? true,
        sunApplicable: sunApplicable ?? true,
          isAutoApplied
      };

      const result = await OfferForTonightPromotionService.createOfferForTonightPromotion(promotionData);
      const status = result.success ? 201 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }

  /**
   * Get all offer-for-tonight promotions by property
   */
  public static async getOfferForTonightPromotionsByProperty(req: PropertyCustomRequest, res: Response) {
    try {
      const propertyId = req.params.propertyId;

      if (!propertyId) {
        return res.status(400).json(errorResponse('Property ID is required'));
      }

      const result = await OfferForTonightPromotionService.getOfferForTonightPromotionsByProperty(propertyId);
      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }

  /**
   * Get offer-for-tonight promotion by ID
   */
  public static async getOfferForTonightPromotionById(req: CustomRequest, res: Response) {
    try {
      const promotionId = req.params.promotionId;

      if (!promotionId) {
        return res.status(400).json(errorResponse('Promotion ID is required'));
      }

      const result = await OfferForTonightPromotionService.getOfferForTonightPromotionById(promotionId);
      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }

  /**
   * Update offer-for-tonight promotion
   */
  public static async updateOfferForTonightPromotion(req: CustomRequest, res: Response) {
    try {
      const promotionId = req.params.promotionId;
      const updateData = req.body;

      if (!promotionId) {
        return res.status(400).json(errorResponse('Promotion ID is required'));
      }

      // Convert date strings to Date objects if present
      if (updateData.validFrom) {
        updateData.validFrom = new Date(updateData.validFrom);
      }
      if (updateData.validTo) {
        updateData.validTo = new Date(updateData.validTo);
      }

      const result = await OfferForTonightPromotionService.updateOfferForTonightPromotion(promotionId, updateData);
      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }

  /**
   * Delete offer-for-tonight promotion
   */
  public static async deleteOfferForTonightPromotion(req: CustomRequest, res: Response) {
    try {
      const promotionId = req.params.promotionId;

      if (!promotionId) {
        return res.status(400).json(errorResponse('Promotion ID is required'));
      }

      const result = await OfferForTonightPromotionService.deleteOfferForTonightPromotion(promotionId);
      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }

  /**
   * Toggle offer-for-tonight promotion status
   */
  public static async toggleOfferForTonightPromotionStatus(req: CustomRequest, res: Response) {
    try {
      const promotionId = req.params.promotionId;
      const { isActive } = req.body;

      if (!promotionId) {
        return res.status(400).json(errorResponse('Promotion ID is required'));
      }

      if (typeof isActive !== 'boolean') {
        return res.status(400).json(errorResponse('isActive must be a boolean value'));
      }

      const result = await OfferForTonightPromotionService.toggleOfferForTonightPromotionStatus(promotionId, isActive);
      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }
}