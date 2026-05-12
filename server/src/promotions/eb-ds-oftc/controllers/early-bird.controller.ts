import { Response } from 'express';
import {
    CustomRequest,
    PropertyCustomRequest,
} from '../../../utils/customRequest';
import { errorResponse } from '../../../utils/return';
import { EarlyBirdPromotionService } from '../services';
import { toUTCDate } from '../../../utils';
import { ICEbDsOftc, PromotionType } from '../interfaces';

export class EarlyBirdPromotionController {
    earlyBirdPromotionService: EarlyBirdPromotionService;

    constructor() {
        this.earlyBirdPromotionService = new EarlyBirdPromotionService();
    }

    public async createEarlyBirdPromotion(
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
                advanceBookingDays,
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
                            'At least one room-rateplan pair is required for early-bird promotion'
                        )
                    );
            }
            if (!advanceBookingDays) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Advance booking days is required for early-bird promotion'
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
            if (validTo && validFrom > validTo) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Valid from date must be before valid to date'
                        )
                    );
            }
            const promotionData = {
                promotionName,
                propertyId,
                discountType,
                promotionType: 'early_bird' as PromotionType,
                discountValue,
                currencyCode,
                validFrom: toUTCDate(validFrom),
                validTo: validTo ? toUTCDate(validTo) : undefined,
                roomRatePlans,
                monApplicable,
                tueApplicable,
                wedApplicable,
                thuApplicable,
                friApplicable,
                satApplicable,
                sunApplicable,
                advanceBookingDays,
                isAutoApplied,
            };

            const result =
                await this.earlyBirdPromotionService.createEarlyBirdPromotion(
                    promotionData
                );
            const status = result.success ? 201 : 400;
            return res.status(status).json(result);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }

    public async getEarlyBirdPromotionsByProperty(
        req: PropertyCustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const propertyId = req.params.propertyId;

            if (!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('Property ID is required'));
            }

            const result =
                await this.earlyBirdPromotionService.getEarlyBirdPromotionsByProperty(
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

    public async getEarlyBirdPromotionById(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const promotionId = req.params.promotionId;

            if (!promotionId) {
                return res
                    .status(400)
                    .json(errorResponse('Promotion ID is required'));
            }

            const result =
                await this.earlyBirdPromotionService.getEarlyBirdPromotionById(
                    promotionId
                );
            const status = result.success ? 200 : 400;
            return res.status(status).json(result);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }

    public async updateEarlyBirdPromotion(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const promotionId = req.params.promotionId;
            const updateData: ICEbDsOftc = req.body;

            if (!promotionId) {
                return res
                    .status(400)
                    .json(errorResponse('Promotion ID is required'));
            }

            if (updateData.validFrom) {
                updateData.validFrom = toUTCDate(updateData.validFrom);
            }
            if (updateData.validTo) {
                updateData.validTo = toUTCDate(updateData.validTo);
            }

            const result =
                await this.earlyBirdPromotionService.updateEarlyBirdPromotion(
                    promotionId,
                    updateData
                );
            const status = result.success ? 200 : 400;
            return res.status(status).json(result);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }

    public async deleteEarlyBirdPromotion(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const promotionId = req.params.promotionId;

            if (!promotionId) {
                return res
                    .status(400)
                    .json(errorResponse('Promotion ID is required'));
            }

            const result =
                await this.earlyBirdPromotionService.deleteEarlyBirdPromotion(
                    promotionId
                );
            const status = result.success ? 200 : 400;
            return res.status(status).json(result);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }
}
