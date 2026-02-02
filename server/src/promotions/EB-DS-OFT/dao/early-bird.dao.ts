import { prisma } from '../../../config';
import { 
  IEarlyBirdPromotion, 
  IEarlyBirdPromotionUpdate,
  IRoomRatePlanPair 
} from '../interfaces';
import { PromotionType } from '@prisma/client';

export class EarlyBirdPromotionDao {
  /**
   * Create early-bird promotions (one per room-rateplan pair)
   */
  public static async createEarlyBirdPromotions(
    data: IEarlyBirdPromotion,
    roomRatePlans: IRoomRatePlanPair[]
  ): Promise<any[]> {
    try {
      const promotions = await Promise.all(
        roomRatePlans.map((pair) =>
          prisma.promotion.create({
            data: {
              promotionName: data.promotionName,
              propertyId: data.propertyId,
              promotionType: data.promotionType,
              ratePlanId: pair.ratePlanId,
              ratePlanCode: pair.ratePlanCode,
              roomId: pair.roomId || null,
              roomType: pair.roomType || null,
              validFrom: data.validFrom,
              validTo: data.validTo || null,
              DiscountType: data.discountType,
              DiscountValue: data.discountValue,
              currencyCode: data.currencyCode || null,
              monApplicable: data.monApplicable,
              tueApplicable: data.tueApplicable,
              wedApplicable: data.wedApplicable,
              thuApplicable: data.thuApplicable,
              friApplicable: data.friApplicable,
              satApplicable: data.satApplicable,
              sunApplicable: data.sunApplicable,
            },
            include: {
              property: true,
              ratePlan: true,
              room: true,
            },
          })
        )
      );

      return promotions;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create early-bird promotions: ${error.message}`);
      }
      throw new Error('Unknown error occurred while creating early-bird promotions');
    }
  }

  /**
   * Get all early-bird promotions by property
   */
  public static async getEarlyBirdPromotionsByProperty(
    propertyId: string
  ): Promise<any[]> {
    try {
      return await prisma.promotion.findMany({
        where: {
          propertyId,
          promotionType: PromotionType.early_bird,
        },
        include: {
          property: true,
          ratePlan: true,
          room: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch early-bird promotions: ${error.message}`);
      }
      throw new Error('Unknown error occurred while fetching early-bird promotions');
    }
  }

  /**
   * Get early-bird promotion by ID
   */
  public static async getEarlyBirdPromotionById(id: string): Promise<any | null> {
    try {
      return await prisma.promotion.findFirst({
        where: {
          id,
          promotionType: PromotionType.early_bird,
        },
        include: {
          property: true,
          ratePlan: true,
          room: true,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch early-bird promotion: ${error.message}`);
      }
      throw new Error('Unknown error occurred while fetching early-bird promotion');
    }
  }

  /**
   * Update early-bird promotion
   */
  public static async updateEarlyBirdPromotion(
    id: string,
    updateData: IEarlyBirdPromotionUpdate
  ): Promise<any> {
    try {
      const data: any = {};

      if (updateData.promotionName) data.promotionName = updateData.promotionName;
      if (updateData.validFrom) data.validFrom = updateData.validFrom;
      if (updateData.validTo !== undefined) data.validTo = updateData.validTo;
      if (updateData.discountType) data.DiscountType = updateData.discountType;
      if (updateData.discountValue !== undefined) data.DiscountValue = updateData.discountValue;
      if (updateData.currencyCode !== undefined) data.currencyCode = updateData.currencyCode;
      if (updateData.monApplicable !== undefined) data.monApplicable = updateData.monApplicable;
      if (updateData.tueApplicable !== undefined) data.tueApplicable = updateData.tueApplicable;
      if (updateData.wedApplicable !== undefined) data.wedApplicable = updateData.wedApplicable;
      if (updateData.thuApplicable !== undefined) data.thuApplicable = updateData.thuApplicable;
      if (updateData.friApplicable !== undefined) data.friApplicable = updateData.friApplicable;
      if (updateData.satApplicable !== undefined) data.satApplicable = updateData.satApplicable;
      if (updateData.sunApplicable !== undefined) data.sunApplicable = updateData.sunApplicable;
      if (updateData.isActive !== undefined) data.isActive = updateData.isActive;

      return await prisma.promotion.update({
        where: { id },
        data,
        include: {
          property: true,
          ratePlan: true,
          room: true,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update early-bird promotion: ${error.message}`);
      }
      throw new Error('Unknown error occurred while updating early-bird promotion');
    }
  }

  /**
   * Delete early-bird promotion
   */
  public static async deleteEarlyBirdPromotion(id: string): Promise<any> {
    try {
      return await prisma.promotion.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete early-bird promotion: ${error.message}`);
      }
      throw new Error('Unknown error occurred while deleting early-bird promotion');
    }
  }
}