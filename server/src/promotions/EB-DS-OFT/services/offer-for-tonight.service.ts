import { PromotionType } from '@prisma/client';
import { IOfferForTonightPromotion, IOfferForTonightPromotionUpdate } from '../interfaces';
import { errorResponse, successResponse } from '../../../utils';
import { OfferForTonightPromotionDao } from '../dao';

export class OfferForTonightPromotionService {
  /**
   * Create offer-for-tonight promotion(s)
   */
  public static async createOfferForTonightPromotion(
    data: IOfferForTonightPromotion
  ) {
    try {
      // Validate that promotionType is offer_for_tonight
      if (data.promotionType !== PromotionType.offer_for_tonight) {
        return errorResponse('Invalid promotion type for offer-for-tonight promotion');
      }

      // Validate room-rateplan pairs
      if (!data.roomRatePlans || data.roomRatePlans.length === 0) {
        return errorResponse('At least one room-rateplan pair is required');
      }

      // Validate each room-rateplan pair
      for (const pair of data.roomRatePlans) {
        if (!pair.ratePlanId || !pair.ratePlanCode) {
          return errorResponse('Each room-rateplan pair must have ratePlanId and ratePlanCode');
        }
      }

      // Create promotions for each room-rateplan pair
      const promotions = await OfferForTonightPromotionDao.createOfferForTonightPromotions(
        data,
        data.roomRatePlans
      );

      if (promotions && promotions.length > 0) {
        return successResponse(
          `Offer-for-tonight promotion created successfully for ${promotions.length} room-rateplan pair(s)`,
          promotions
        );
      } else {
        return errorResponse('Failed to create offer-for-tonight promotion');
      }
    } catch (error: any) {
      return errorResponse(
        'Failed to create offer-for-tonight promotion',
        error?.message
      );
    }
  }

  /**
   * Get all offer-for-tonight promotions by property
   */
  public static async getOfferForTonightPromotionsByProperty(propertyId: string) {
    try {
      const promotions = await OfferForTonightPromotionDao.getOfferForTonightPromotionsByProperty(propertyId);

      return successResponse(
        'Offer-for-tonight promotions fetched successfully',
        promotions
      );
    } catch (error: any) {
      return errorResponse(
        'Failed to fetch offer-for-tonight promotions',
        error?.message
      );
    }
  }

  /**
   * Get offer-for-tonight promotion by ID
   */
  public static async getOfferForTonightPromotionById(id: string) {
    try {
      const promotion = await OfferForTonightPromotionDao.getOfferForTonightPromotionById(id);

      if (!promotion) {
        return errorResponse('Offer-for-tonight promotion not found');
      }

      return successResponse('Offer-for-tonight promotion fetched successfully', promotion);
    } catch (error: any) {
      return errorResponse(
        'Failed to fetch offer-for-tonight promotion',
        error?.message
      );
    }
  }

  /**
   * Update offer-for-tonight promotion
   */
  public static async updateOfferForTonightPromotion(id: string, updateData: IOfferForTonightPromotionUpdate) {
    try {
      const existingPromotion = await OfferForTonightPromotionDao.getOfferForTonightPromotionById(id);
      if (!existingPromotion) {
        return errorResponse('Offer-for-tonight promotion not found');
      }

      if (updateData.validFrom && updateData.validTo) {
        if (updateData.validFrom > updateData.validTo) {
          return errorResponse('Valid from date must be before valid to date');
        }
      }

      const updatedPromotion = await OfferForTonightPromotionDao.updateOfferForTonightPromotion(id, updateData);

      if (updatedPromotion) {
        return successResponse('Offer-for-tonight promotion updated successfully', updatedPromotion);
      } else {
        return errorResponse('Failed to update offer-for-tonight promotion');
      }
    } catch (error: any) {
      return errorResponse(
        'Failed to update offer-for-tonight promotion',
        error?.message
      );
    }
  }

  /**
   * Delete offer-for-tonight promotion
   */
  public static async deleteOfferForTonightPromotion(id: string) {
    try {
      const existingPromotion = await OfferForTonightPromotionDao.getOfferForTonightPromotionById(id);
      if (!existingPromotion) {
        return errorResponse('Offer-for-tonight promotion not found');
      }

      const deletedPromotion = await OfferForTonightPromotionDao.deleteOfferForTonightPromotion(id);

      if (deletedPromotion) {
        return successResponse('Offer-for-tonight promotion deleted successfully', deletedPromotion);
      } else {
        return errorResponse('Failed to delete offer-for-tonight promotion');
      }
    } catch (error: any) {
      return errorResponse(
        'Failed to delete offer-for-tonight promotion',
        error?.message
      );
    }
  }

  /**
   * Toggle offer-for-tonight promotion status
   */
  public static async toggleOfferForTonightPromotionStatus(id: string, isActive: boolean) {
    try {
      const existingPromotion = await OfferForTonightPromotionDao.getOfferForTonightPromotionById(id);
      if (!existingPromotion) {
        return errorResponse('Offer-for-tonight promotion not found');
      }

      const updatedPromotion = await OfferForTonightPromotionDao.updateOfferForTonightPromotion(id, { isActive });

      if (updatedPromotion) {
        return successResponse(
          `Offer-for-tonight promotion ${isActive ? 'activated' : 'deactivated'} successfully`,
          updatedPromotion
        );
      } else {
        return errorResponse('Failed to update offer-for-tonight promotion status');
      }
    } catch (error: any) {
      return errorResponse(
        'Failed to update offer-for-tonight promotion status',
        error?.message
      );
    }
  }
}