import { PromotionType } from '@prisma/client';
import { IEarlyBirdPromotion, IEarlyBirdPromotionUpdate } from '../interfaces';
import { EarlyBirdPromotionDao } from '../dao';
import { errorResponse, successResponse } from '../../../utils';

export class EarlyBirdPromotionService {
  /**
   * Create early-bird promotion(s)
   */
  public static async createEarlyBirdPromotion(
    data: IEarlyBirdPromotion
  ) {
    try {
      // Validate that promotionType is early_bird
      if (data.promotionType !== PromotionType.early_bird) {
        return errorResponse('Invalid promotion type for early-bird promotion');
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

      // Validate date range
      if (data.validTo && data.validFrom > data.validTo) {
        return errorResponse('Valid from date must be before valid to date');
      }

      // Create promotions for each room-rateplan pair
      const promotions = await EarlyBirdPromotionDao.createEarlyBirdPromotions(
        data,
        data.roomRatePlans
      );

      if (promotions && promotions.length > 0) {
        return successResponse(
          `Early-bird promotion created successfully for ${promotions.length} room-rateplan pair(s)`,
          promotions
        );
      } else {
        return errorResponse('Failed to create early-bird promotion');
      }
    } catch (error: any) {
      return errorResponse(
        'Failed to create early-bird promotion',
        error?.message
      );
    }
  }

  /**
   * Get all early-bird promotions by property
   */
  public static async getEarlyBirdPromotionsByProperty(propertyId: string) {
    try {
      const promotions = await EarlyBirdPromotionDao.getEarlyBirdPromotionsByProperty(propertyId);

      return successResponse(
        'Early-bird promotions fetched successfully',
        promotions
      );
    } catch (error: any) {
      return errorResponse(
        'Failed to fetch early-bird promotions',
        error?.message
      );
    }
  }

  /**
   * Get early-bird promotion by ID
   */
  public static async getEarlyBirdPromotionById(id: string) {
    try {
      const promotion = await EarlyBirdPromotionDao.getEarlyBirdPromotionById(id);

      if (!promotion) {
        return errorResponse('Early-bird promotion not found');
      }

      return successResponse('Early-bird promotion fetched successfully', promotion);
    } catch (error: any) {
      return errorResponse(
        'Failed to fetch early-bird promotion',
        error?.message
      );
    }
  }

  /**
   * Update early-bird promotion
   */
  public static async updateEarlyBirdPromotion(id: string, updateData: IEarlyBirdPromotionUpdate) {
    try {
      const existingPromotion = await EarlyBirdPromotionDao.getEarlyBirdPromotionById(id);
      if (!existingPromotion) {
        return errorResponse('Early-bird promotion not found');
      }

      if (updateData.validFrom && updateData.validTo) {
        if (updateData.validFrom > updateData.validTo) {
          return errorResponse('Valid from date must be before valid to date');
        }
      }

      const updatedPromotion = await EarlyBirdPromotionDao.updateEarlyBirdPromotion(id, updateData);

      if (updatedPromotion) {
        return successResponse('Early-bird promotion updated successfully', updatedPromotion);
      } else {
        return errorResponse('Failed to update early-bird promotion');
      }
    } catch (error: any) {
      return errorResponse(
        'Failed to update early-bird promotion',
        error?.message
      );
    }
  }

  /**
   * Delete early-bird promotion
   */
  public static async deleteEarlyBirdPromotion(id: string) {
    try {
      const existingPromotion = await EarlyBirdPromotionDao.getEarlyBirdPromotionById(id);
      if (!existingPromotion) {
        return errorResponse('Early-bird promotion not found');
      }

      const deletedPromotion = await EarlyBirdPromotionDao.deleteEarlyBirdPromotion(id);

      if (deletedPromotion) {
        return successResponse('Early-bird promotion deleted successfully', deletedPromotion);
      } else {
        return errorResponse('Failed to delete early-bird promotion');
      }
    } catch (error: any) {
      return errorResponse(
        'Failed to delete early-bird promotion',
        error?.message
      );
    }
  }

  /**
   * Toggle early-bird promotion status
   */
  public static async toggleEarlyBirdPromotionStatus(id: string, isActive: boolean) {
    try {
      const existingPromotion = await EarlyBirdPromotionDao.getEarlyBirdPromotionById(id);
      if (!existingPromotion) {
        return errorResponse('Early-bird promotion not found');
      }

      const updatedPromotion = await EarlyBirdPromotionDao.updateEarlyBirdPromotion(id, { isActive });

      if (updatedPromotion) {
        return successResponse(
          `Early-bird promotion ${isActive ? 'activated' : 'deactivated'} successfully`,
          updatedPromotion
        );
      } else {
        return errorResponse('Failed to update early-bird promotion status');
      }
    } catch (error: any) {
      return errorResponse(
        'Failed to update early-bird promotion status',
        error?.message
      );
    }
  }
}