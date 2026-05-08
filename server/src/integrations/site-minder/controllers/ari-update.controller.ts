// controllers/ari-update.controller.ts

import { Response } from 'express';
import { RateTigerRequest, successResponse } from '../../../utils';
import { RateTigerValidation } from '../validations/request.validation';
import { RateTigerService } from '../services/rate-tiger.service';
import { PricePullService } from '../services/price-pull.service';
import { PriceUpdateService } from '../services/price-update.service';
import { InventoryUpdateService } from '../services/inventory-update.service';
import {
    RateTigerOTAHotelAvailRQ,
    RateTigerOTAHotelAvailGetRQ,
} from '../types';
import { RateTigerOTAHotelRatePlanRQ } from '../types/price-pull.types';
import { RateTigerInventoryUpdateRQ } from '../types/inventory-update.types';
import { ChildAddonsController } from '../../../add-on/controllers';
import { randomUUID } from 'crypto';

export class ARIController {
    public static async handleARI(req: RateTigerRequest, res: Response) {
        try {
            const body = req.body;
            console.log(body);
            // const propertyCode = req.rateTiger?.propertyCode;

            // if (!propertyCode) {++
            //     return res.status(500).json({
            //         success: false,
            //         message:
            //             'Property code could not be resolved. Ensure withHotelCodeConversion wrapper is applied.',
            //     });
            // }
            // if (body.otaHotelAvailRQ) {
            //     const validationError =
            //         RateTigerValidation.validateRoomRatePlanPull(body);
            //     if (validationError) {
            //         return res
            //             .status(400)
            //             .json({ success: false, message: validationError });
            //     }

            //     const { otaHotelAvailRQ } = body as RateTigerOTAHotelAvailRQ;
            //     const result =
            //         await RateTigerService.getRoomTypeRatePlanMapping(
            //             propertyCode,
            //             otaHotelAvailRQ.requestId
            //         );

            //     const status =
            //         result.otaHotelAvailRS.success === 'true' ? 200 : 400;
            //     return res.status(status).json(result);
            // }

            // if (body.otaHotelAvailGetRQ) {
            //     const validationError =
            //         RateTigerValidation.validateInventoryPull(body);
            //     if (validationError) {
            //         return res
            //             .status(400)
            //             .json({ success: false, message: validationError });
            //     }

            //     const { otaHotelAvailGetRQ } =
            //         body as RateTigerOTAHotelAvailGetRQ;
            //     const result = await RateTigerService.getInventoryPull(
            //         propertyCode,
            //         otaHotelAvailGetRQ.requestId,
            //         otaHotelAvailGetRQ.hotelAvailRequest
            //     );

            //     const status =
            //         result.otaHotelAvailGetRS.success === 'true' ? 200 : 400;
            //     return res.status(status).json(result);
            // }

            // if (body.otaHotelRatePlanRQ) {
            //     const validationError =
            //         RateTigerValidation.validatePricePull(body);
            //     if (validationError) {
            //         return res
            //             .status(400)
            //             .json({ success: false, message: validationError });
            //     }

            //     const { otaHotelRatePlanRQ } =
            //         body as RateTigerOTAHotelRatePlanRQ;
            //     const result = await PricePullService.getPricePull(
            //         propertyCode,
            //         otaHotelRatePlanRQ.requestId,
            //         otaHotelRatePlanRQ.ratePlans
            //     );

            //     const status =
            //         result.otaHotelRatePlanRS.success === 'true' ? 200 : 400;
            //     return res.status(status).json(result);
            // }

            // if (body.rateAmountMessages) {
            //     const validationError =
            //         RateTigerValidation.validatePriceUpdate(body);
            //     if (validationError) {
            //         return res
            //             .status(400)
            //             .json({ success: false, message: validationError });
            //     }

            //     // Inject resolved propertyCode so the service works with internal code
            //     body.rateAmountMessages.hotelCode = propertyCode;

            //     const result =
            //         await PriceUpdateService.processPriceUpdate(body);
            //     const status =
            //         result.otaRateAmountNotifRS.success === 'true' ? 200 : 400;
            //     // withHotelCodeConversion will swap propertyCode → rtHotelCode in the response
            //     return res.status(status).json(result);
            // }

            // if (body.otaHotelAvailNotifRQ) {
            //     const validationError =
            //         RateTigerValidation.validateInventoryUpdate(body);
            //     if (validationError) {
            //         return res
            //             .status(400)
            //             .json({ success: false, message: validationError });
            //     }

            //     body.otaHotelAvailNotifRQ.hotelCode = propertyCode;

            //     const result =
            //         await InventoryUpdateService.processInventoryUpdate(
            //             body as RateTigerInventoryUpdateRQ
            //         );
            //     const status =
            //         result.otaHotelAvailNotifRS.success === 'true' ? 200 : 400;
            //     // withHotelCodeConversion will swap propertyCode → rtHotelCode in the response
            //     return res.status(status).json(result);
            // }

            return res
                .status(400)
                .json(
                    successResponse('Ari update recied successfully', {
                        body,
                        id: randomUUID(),
                    })
                );
        } catch (error: any) {
            console.error('ARI Error:', error);
            return res.status(500).json({
                success: 'false',
                timeStamp: new Date().toISOString(),
                error: {
                    type: 'ProcessingError',
                    errorCode: '500',
                    text:
                        error?.message ||
                        'Internal server error during ARI operation',
                },
            });
        }
    }
}
