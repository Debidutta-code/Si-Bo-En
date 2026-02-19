import { prisma } from '../../../config';
import { 
  ICEarlyBirdPromotion, 
  ICEbDsOftc, 
  IEarlyBirdPromotionUpdate,
  IEbDsOftc,
  IRoomRatePlanPair 
} from '../interfaces';

export class EarlyBirdPromotionDao {

  public  async createEarlyBirdPromotions(
    data: ICEarlyBirdPromotion,
    roomRatePlans: IRoomRatePlanPair[]
  ): Promise<IEbDsOftc[]> {
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
              discountType: data.discountType,
              discountValue: data.discountValue,
              currencyCode: data.currencyCode || null,
              monApplicable: data.monApplicable,
              tueApplicable: data.tueApplicable,
              wedApplicable: data.wedApplicable,
              thuApplicable: data.thuApplicable,
              friApplicable: data.friApplicable,
              satApplicable: data.satApplicable,
              sunApplicable: data.sunApplicable,
              advanceBookingDays: data.advanceBookingDays,
              isAutoApplied: data.isAutoApplied,
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
  public  async getEarlyBirdPromotionsByProperty(
    propertyId: string
  ): Promise<IEbDsOftc[]> {
    try {
      return await prisma.promotion.findMany({
        where: {
          propertyId,
          promotionType: "early_bird",
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
     
      throw new Error('Unknown error occurred while fetching early-bird promotions');
    }
  }
  public  async getEarlyBirdPromotionById(id: string): Promise<IEbDsOftc | null> {
    try {
      return await prisma.promotion.findFirst({
        where: {
          id,
        },
        include: {
          property: true,
          ratePlan: true,
          room: true,
        },
      });
    } catch (error) {

      throw new Error('Unknown error occurred while fetching early-bird promotion');
    }
  }

  public async updateEarlyBirdPromotion(
    id: string,
    updateData: ICEbDsOftc
  ): Promise<IEbDsOftc> {
    try {

      return await prisma.promotion.update({
        where: { id },
        data: {
          ...updateData,
        },
        include: {
          property: true,
          ratePlan: true,
          room: true,
        },
      });
    } catch (error) {
      
      throw new Error('Unknown error occurred while updating early-bird promotion');
    }
  }

  public  async deleteEarlyBirdPromotion(id: string): Promise<ICEbDsOftc> {
    try {
      return await prisma.promotion.delete({
        where: { id },
      });
    } catch (error) {
      
      throw new Error('Unknown error occurred while deleting early-bird promotion');
    }
  }
}