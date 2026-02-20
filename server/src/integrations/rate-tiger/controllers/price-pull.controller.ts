// controllers/price-pull.controller.ts

import { Response } from 'express';
import { RateTigerRequest } from '../../../utils';
import { RateTigerOTAHotelRatePlanRQ } from '../types/price-pull.types';
import { PricePullService } from '../services/price-pull.service';
import { RateTigerValidation } from '../validations/request.validation';

export class PricePullController {
    public static async pricePull(req: RateTigerRequest, res: Response) {
        try {
            const validationError = RateTigerValidation.validatePricePull(
                req.body
            );
            if (validationError) {
                return res
                    .status(400)
                    .json({ success: false, message: validationError });
            }

            const { otaHotelRatePlanRQ } =
                req.body as RateTigerOTAHotelRatePlanRQ;
            const { hotelCode, requestId, ratePlans } = otaHotelRatePlanRQ;

            const result = await PricePullService.getPricePull(
                hotelCode,
                requestId,
                ratePlans
            );

            const status =
                result.otaHotelRatePlanRS.success === 'true' ? 200 : 400;
            return res.status(status).json(result);
        } catch (error: any) {
            return res.status(500).json({
                otaHotelRatePlanRS: {
                    hotelCode: req.body?.otaHotelRatePlanRQ?.hotelCode ?? '',
                    requestId: req.body?.otaHotelRatePlanRQ?.requestId ?? '',
                    success: 'false',
                    timeStamp: new Date().toISOString(),
                    error: {
                        type: 'ProcessingError',
                        errorCode: '500',
                        text: error?.message || 'Internal server error',
                    },
                },
            });
        }
    }
}
