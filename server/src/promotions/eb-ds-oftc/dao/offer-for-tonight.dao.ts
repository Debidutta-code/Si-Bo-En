import { prisma } from '../../../config';
import { 
  ICEbDsOftc,
  IEbDsOftc,
  IOfferForTonightPromotion,
  IRoomRatePlanPair,
   
} from '../interfaces';

export class OfferForTonightPromotionDao {
  public  async createOfferForTonightPromotions(
    data: IOfferForTonightPromotion,
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
      
      throw new Error('Unknown error occurred while creating offer-for-tonight promotions');
    }
  }

  public  async getOfferForTonightPromotionsByProperty(
    propertyId: string
  ): Promise<IEbDsOftc[]> {
    try {
      return await prisma.promotion.findMany({
        where: {
          propertyId,
          promotionType:"offer_for_tonight"
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
      throw new Error('Unknown error occurred while fetching offer-for-tonight promotions');
    }
  }

  public  async getOfferForTonightPromotionById(id: string): Promise<any | null> {
    try {
      return await prisma.promotion.findFirst({
        where: {
          id,
          promotionType: "offer_for_tonight",
        },
        include: {
          property: true,
          ratePlan: true,
          room: true,
        },
      });
    } catch (error) {
      throw new Error('Unknown error occurred while fetching offer-for-tonight promotion');
    }
  }

  public  async updateOfferForTonightPromotion(
    id: string,
    updateData: ICEbDsOftc
  ): Promise<any> {
    try {
      
      return await prisma.promotion.update({
        where: { id },
        data:{
          ...updateData
        },
        include: {
          property: true,
          ratePlan: true,
          room: true,
        },
      });
    } catch (error) {
      
      throw new Error('Unknown error occurred while updating offer-for-tonight promotion');
    }
  }
  public  async deleteOfferForTonightPromotion(id: string): Promise<any> {
    try {
      return await prisma.promotion.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error('Unknown error occurred while deleting offer-for-tonight promotion');
    }
  }
}