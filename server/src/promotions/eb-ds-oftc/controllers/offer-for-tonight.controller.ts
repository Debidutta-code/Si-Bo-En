import { Response } from 'express';
import {
    CustomRequest,
    PropertyCustomRequest,
} from '../../../utils/customRequest';
import { errorResponse } from '../../../utils/return';
import { OfferForTonightPromotionService } from '../services';
import { PromotionType } from '../interfaces';

export class OfferForTonightPromotionController {
    offerForTonightService: OfferForTonightPromotionService;

    constructor() {
        this.offerForTonightService = new OfferForTonightPromotionService();
    }

    public async createOfferForTonightPromotion(
        req: PropertyCustomRequest,
        res: Response
    ): Promise<Response> {
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
                isAutoApplied,
            } = req.body;
            if (
                !promotionName ||
                !propertyId ||
                !discountType ||
                discountValue === undefined
            ) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Promotion name, property ID, discount type, and discount value are required'
                        )
                    );
            }

            if (!validFrom) {
                return res
                    .status(400)
                    .json(errorResponse('Valid from date is required'));
            }

            if (!roomRatePlans || roomRatePlans.length === 0) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'At least one room-rateplan pair is required for offer-for-tonight promotion'
                        )
                    );
            }
            for (const pair of roomRatePlans) {
                if (!pair.ratePlanId || !pair.ratePlanCode) {
                    return res
                        .status(400)
                        .json(
                            errorResponse(
                                'Each room-rateplan pair must have ratePlanId and ratePlanCode'
                            )
                        );
                }
            }

            const promotionData = {
                promotionName,
                propertyId,
                promotionType: 'offer_for_tonight' as PromotionType,
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
                isAutoApplied,
            };

            const result =
                await this.offerForTonightService.createOfferForTonightPromotion(
                    promotionData
                );
            const status = result.success ? 201 : 400;
            return res.status(status).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Internal server error', error?.message)
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Internal server error', 'Unknown error'));
        }
    }
    public async getOfferForTonightPromotionsByProperty(
        req: PropertyCustomRequest,
        res: Response
    ) {
        try {
            const propertyId = req.params.propertyId;

            if (!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('Property ID is required'));
            }

            const result =
                await this.offerForTonightService.getOfferForTonightPromotionsByProperty(
                    propertyId
                );
            const status = result.success ? 200 : 400;
            return res.status(status).json(result);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }

    public async getOfferForTonightPromotionById(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const promotionId = req.params.promotionId;

            if (!promotionId) {
                return res
                    .status(400)
                    .json(errorResponse('Promotion ID is required'));
            }

            const result =
                await this.offerForTonightService.getOfferForTonightPromotionById(
                    promotionId
                );
            const status = result.success ? 200 : 400;
            return res.status(status).json(result);
        } catch (error: any) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Internal server error', error?.message)
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Internal server error', 'Unknown error'));
        }
    }

    public async updateOfferForTonightPromotion(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const promotionId = req.params.promotionId;
            const updateData = req.body;

            if (!promotionId) {
                return res
                    .status(400)
                    .json(errorResponse('Promotion ID is required'));
            }

            // Convert date strings to Date objects if present
            if (updateData.validFrom) {
                updateData.validFrom = new Date(updateData.validFrom);
            }
            if (updateData.validTo) {
                updateData.validTo = new Date(updateData.validTo);
            }

            const result =
                await this.offerForTonightService.updateOfferForTonightPromotion(
                    promotionId,
                    updateData
                );
            const status = result.success ? 200 : 400;
            return res.status(status).json(result);
        } catch (error: any) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Internal server error', error?.message)
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Internal server error', 'Unknown error'));
        }
    }

    public async deleteOfferForTonightPromotion(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const promotionId = req.params.promotionId;

            if (!promotionId) {
                return res
                    .status(400)
                    .json(errorResponse('Promotion ID is required'));
            }

            const result =
                await this.offerForTonightService.deleteOfferForTonightPromotion(
                    promotionId
                );
            const status = result.success ? 200 : 400;
            return res.status(status).json(result);
        } catch (error: any) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Internal server error', error?.message)
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Internal server error', 'Unknown error'));
        }
    }
}
