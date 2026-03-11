import { ICEarlyBirdPromotion, ICEbDsOftc, IEarlyBirdPromotionUpdate } from '../interfaces';
import { EarlyBirdPromotionDao } from '../dao';
import { errorResponse, IApiResponse, successResponse } from '../../../utils';
import { getCurrencyConverter } from '../../../currency-maping/utils';

export class EarlyBirdPromotionService {
  earlyBirdPromotionDao: EarlyBirdPromotionDao;

  constructor() {
    this.earlyBirdPromotionDao = new EarlyBirdPromotionDao();
  }

  public async createEarlyBirdPromotion(
    data: ICEarlyBirdPromotion
  ): Promise<IApiResponse> {
    try {
      const {convert, baseCurrency} = await getCurrencyConverter(data.propertyId, data.currencyCode ? data.currencyCode : "AED");
      const promotions = await this.earlyBirdPromotionDao.createEarlyBirdPromotions(
        {
          ...data,
          currencyCode:data.discountType === "flat" ? baseCurrency : data.currencyCode,
          discountValue:data.discountType === "flat" ? convert(Number(data.discountValue)) : data.discountValue
        },
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
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse(
          'Failed to create early-bird promotion',
          error.message
        );
      }
      return errorResponse(
        'Failed to create early-bird promotion',
        'Unknown error occurred'
      );
    }
  }

  public async getEarlyBirdPromotionsByProperty(propertyId: string): Promise<IApiResponse> {
    try {
      const promotions = await this.earlyBirdPromotionDao.getEarlyBirdPromotionsByProperty(propertyId);

      return successResponse(
        'Early-bird promotions fetched successfully',
        promotions
      );
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse(
          'Failed to fetch early-bird promotions',
          error.message
        );
      }
      return errorResponse(
        'Failed to fetch early-bird promotions',
        'Unknown error occurred'
      );
    }
  }

  public async getEarlyBirdPromotionById(id: string): Promise<IApiResponse> {
    try {
      const promotion = await this.earlyBirdPromotionDao.getEarlyBirdPromotionById(id);

      if (!promotion) {
        return errorResponse('Early-bird promotion not found');
      }

      return successResponse('Early-bird promotion fetched successfully', promotion);
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse(
          'Failed to get early-bird promotion',
          error.message
        );
      }
      return errorResponse(
        'Failed to get early-bird promotion',
        'Unknown error occurred'
      );
    }
  }

  public async updateEarlyBirdPromotion(id: string, updateData: ICEbDsOftc): Promise<IApiResponse> {
    try {
      const existingPromotion = await this.earlyBirdPromotionDao.getEarlyBirdPromotionById(id);
      if (!existingPromotion) {
        return errorResponse('Early-bird promotion not found');
      }
      const {convert, baseCurrency} = await getCurrencyConverter(existingPromotion.propertyId, updateData.currencyCode ? updateData.currencyCode : "AED");

      if (updateData.validFrom && updateData.validTo) {
        if (updateData.validFrom > updateData.validTo) {
          return errorResponse('Valid from date must be before valid to date');
        }
      }

      const updatedPromotion = await this.earlyBirdPromotionDao.updateEarlyBirdPromotion(id, {
        ...updateData,
        currencyCode: updateData.discountType === "flat" ? baseCurrency : updateData.currencyCode,
        discountValue: updateData.discountType === "flat" ? convert(Number(updateData.discountValue)) : updateData.discountValue
      });

      if (updatedPromotion) {
        return successResponse('Early-bird promotion updated successfully', updatedPromotion);
      } else {
        return errorResponse('Failed to update early-bird promotion');
      }
    } catch (error: any) {
      if (error instanceof Error) {
        return errorResponse(
          'Failed to update early-bird promotion',
          error.message
        );
      }
      return errorResponse(
        'Failed to update early-bird promotion',
        'Unknown error occurred'
      );
    }
  }

  public async deleteEarlyBirdPromotion(id: string): Promise<IApiResponse> {
    try {
      const existingPromotion = await this.earlyBirdPromotionDao.getEarlyBirdPromotionById(id);
      if (!existingPromotion) {
        return errorResponse('Early-bird promotion not found');
      }

      const deletedPromotion = await this.earlyBirdPromotionDao.deleteEarlyBirdPromotion(id);

      if (deletedPromotion) {
        return successResponse('Early-bird promotion deleted successfully', deletedPromotion);
      } else {
        return errorResponse('Failed to delete early-bird promotion');
      }
    } catch (error: any) {
      if (error instanceof Error) {
        return errorResponse(
          'Failed to update early-bird promotion',
          error.message
        );
      }
      return errorResponse(
        'Failed to update early-bird promotion',
        'Unknown error occurred'
      );

    }
  }


}