import { ICEbDsOftc, IOfferForTonightPromotion } from '../interfaces';
import { errorResponse, IApiResponse, successResponse } from '../../../utils';
import { OfferForTonightPromotionDao } from '../dao';
import { getCurrencyConverter } from '../../../currency-maping/utils';

export class OfferForTonightPromotionService {
    offerForTonightPromotionDao: OfferForTonightPromotionDao;

    constructor() {
        this.offerForTonightPromotionDao = new OfferForTonightPromotionDao();
    }

    public async createOfferForTonightPromotion(
        data: IOfferForTonightPromotion
    ): Promise<IApiResponse> {
        try {
            const { convert, baseCurrency } = await getCurrencyConverter(
                data.propertyId,
                data.currencyCode ? data.currencyCode : 'AED'
            );

            const promotions =
                await this.offerForTonightPromotionDao.createOfferForTonightPromotions(
                    {
                        ...data,
                        currencyCode:
                            data.discountType === 'flat'
                                ? baseCurrency
                                : data.currencyCode,
                        discountValue:
                            data.discountType === 'flat'
                                ? convert(Number(data.discountValue))
                                : data.discountValue,
                    },
                    data.roomRatePlans
                );

            if (promotions && promotions.length > 0) {
                return successResponse(
                    `Offer-for-tonight promotion created successfully for ${promotions.length} room-rateplan pair(s)`,
                    promotions
                );
            } else {
                return errorResponse(
                    'Failed to create offer-for-tonight promotion'
                );
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to create offer-for-tonight promotion',
                    error?.message
                );
            }
            return errorResponse(
                'Failed to create offer-for-tonight promotion'
            );
        }
    }

    public async getOfferForTonightPromotionsByProperty(
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const promotions =
                await this.offerForTonightPromotionDao.getOfferForTonightPromotionsByProperty(
                    propertyId
                );

            return successResponse(
                'Offer-for-tonight promotions fetched successfully',
                promotions
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to fetch offer-for-tonight promotions',
                    error?.message
                );
            }
            return errorResponse(
                'Failed to fetch offer-for-tonight promotions'
            );
        }
    }

    public async getOfferForTonightPromotionById(
        id: string
    ): Promise<IApiResponse> {
        try {
            const promotion =
                await this.offerForTonightPromotionDao.getOfferForTonightPromotionById(
                    id
                );

            if (!promotion) {
                return errorResponse('Offer-for-tonight promotion not found');
            }

            return successResponse(
                'Offer-for-tonight promotion fetched successfully',
                promotion
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to fetch offer-for-tonight promotions',
                    error?.message
                );
            }
            return errorResponse(
                'Failed to fetch offer-for-tonight promotions'
            );
        }
    }
    public async updateOfferForTonightPromotion(
        id: string,
        updateData: ICEbDsOftc
    ): Promise<IApiResponse> {
        try {
            const existingPromotion =
                await this.offerForTonightPromotionDao.getOfferForTonightPromotionById(
                    id
                );
            if (!existingPromotion) {
                return errorResponse('Offer-for-tonight promotion not found');
            }
            const { convert, baseCurrency } = await getCurrencyConverter(
                existingPromotion.propertyId,
                updateData.currencyCode ? updateData.currencyCode : 'AED'
            );

            if (updateData.validFrom && updateData.validTo) {
                if (updateData.validFrom > updateData.validTo) {
                    return errorResponse(
                        'Valid from date must be before valid to date'
                    );
                }
            }

            const updatedPromotion =
                await this.offerForTonightPromotionDao.updateOfferForTonightPromotion(
                    id,
                    {
                        ...updateData,
                        currencyCode:
                            updateData.discountType === 'flat'
                                ? baseCurrency
                                : updateData.currencyCode,
                        discountValue:
                            updateData.discountType === 'flat'
                                ? convert(Number(updateData.discountValue))
                                : updateData.discountValue,
                    }
                );

            if (updatedPromotion) {
                return successResponse(
                    'Offer-for-tonight promotion updated successfully',
                    updatedPromotion
                );
            } else {
                return errorResponse(
                    'Failed to update offer-for-tonight promotion'
                );
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to update offer-for-tonight promotion',
                    error?.message
                );
            }
            return errorResponse(
                'Failed to update offer-for-tonight promotion'
            );
        }
    }

    public async deleteOfferForTonightPromotion(
        id: string
    ): Promise<IApiResponse> {
        try {
            const existingPromotion =
                await this.offerForTonightPromotionDao.getOfferForTonightPromotionById(
                    id
                );
            if (!existingPromotion) {
                return errorResponse('Offer-for-tonight promotion not found');
            }

            const deletedPromotion =
                await this.offerForTonightPromotionDao.deleteOfferForTonightPromotion(
                    id
                );

            if (deletedPromotion) {
                return successResponse(
                    'Offer-for-tonight promotion deleted successfully',
                    deletedPromotion
                );
            } else {
                return errorResponse(
                    'Failed to delete offer-for-tonight promotion'
                );
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to delete offer-for-tonight promotion',
                    error?.message
                );
            }
            return errorResponse(
                'Failed to delete offer-for-tonight promotion'
            );
        }
    }
}
