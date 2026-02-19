// controllers/ari.controller.ts

import { Response } from 'express';
import { errorResponse, RateTigerRequest } from '../../../utils';
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
import { RTIntegrationDao } from '../dao/rt-integration.dao';

// controllers/ari.controller.ts

export class ARIController {

    public static async handleARI(req: RateTigerRequest, res: Response) {
        try {
            const body = req.body;

            // ─── Resolve RT hotelCode → internal propertyCode ─────
            const rtHotelCode =
                body.otaHotelAvailRQ?.hotelCode ||
                body.otaHotelAvailGetRQ?.hotelCode ||
                body.otaHotelRatePlanRQ?.hotelCode ||
                body.rateAmountMessages?.hotelCode ||
                body.otaHotelAvailNotifRQ?.hotelCode;

            if (!rtHotelCode) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing hotelCode in request body',
                });
            }

            // Look up internal property code using RT property code
            const propertyInfo = await RTIntegrationDao.getPropertyCodeByRTCode(rtHotelCode);

            if (!propertyInfo) {
                return res.status(404).json({
                    success: false,
                    message: `No property found for RateTiger hotel code: ${rtHotelCode}`,
                });
            }

            const { propertyCode } = propertyInfo;

            // ─── Room/RatePlan Pull ───────────────────────────────
            if (body.otaHotelAvailRQ) {
                const validationError = RateTigerValidation.validateRoomRatePlanPull(body);
                if (validationError) {
                    return res.status(400).json({ success: false, message: validationError });
                }

                const { otaHotelAvailRQ } = body as RateTigerOTAHotelAvailRQ;
                const result = await RateTigerService.getRoomTypeRatePlanMapping(
                    propertyCode, // ✅ internal code
                    otaHotelAvailRQ.requestId
                );

                return res.status(result.success ? 200 : 400).json(result);
            }

            // ─── Inventory Pull ───────────────────────────────────
            if (body.otaHotelAvailGetRQ) {
                const validationError = RateTigerValidation.validateInventoryPull(body);
                if (validationError) {
                    return res.status(400).json({ success: false, message: validationError });
                }

                const { otaHotelAvailGetRQ } = body as RateTigerOTAHotelAvailGetRQ;
                const result = await RateTigerService.getInventoryPull(
                    propertyCode, // ✅ internal code
                    otaHotelAvailGetRQ.requestId,
                    otaHotelAvailGetRQ.hotelAvailRequest
                );

                return res.status(result.success ? 200 : 400).json(result);
            }

            // ─── Price Pull ───────────────────────────────────────
            if (body.otaHotelRatePlanRQ) {
                const validationError = RateTigerValidation.validatePricePull(body);
                if (validationError) {
                    return res.status(400).json({ success: false, message: validationError });
                }

                const { otaHotelRatePlanRQ } = body as RateTigerOTAHotelRatePlanRQ;
                const result = await PricePullService.getPricePull(
                    propertyCode, // ✅ internal code
                    otaHotelRatePlanRQ.requestId,
                    otaHotelRatePlanRQ.ratePlans
                );

                return res.status(result.success ? 200 : 400).json(result);
            }

            // ─── Price Update ─────────────────────────────────────
            if (body.rateAmountMessages) {
                const validationError = RateTigerValidation.validatePriceUpdate(body);
                if (validationError) {
                    return res.status(400).json({ success: false, message: validationError });
                }

                // Inject resolved propertyCode into body before processing
                body.rateAmountMessages.hotelCode = propertyCode; // ✅ override with internal code

                const result = await PriceUpdateService.processPriceUpdate(body);
                return res.status(result.success ? 200 : 400).json(result);
            }

            // ─── Inventory Update ─────────────────────────────────
            if (body.otaHotelAvailNotifRQ) {
                const validationError = RateTigerValidation.validateInventoryUpdate(body);
                if (validationError) {
                    return res.status(400).json({ success: false, message: validationError });
                }

                // Inject resolved propertyCode
                body.otaHotelAvailNotifRQ.hotelCode = propertyCode; // ✅ override with internal code

                const result = await InventoryUpdateService.processInventoryUpdate(
                    body as RateTigerInventoryUpdateRQ
                );
                return res.status(result.success ? 200 : 400).json(result);
            }

            return res.status(400).json({
                success: false,
                message: 'Unknown ARI message type',
            });

        } catch (error: any) {
            console.error('ARI Error:', error);
            return res.status(500).json(
                errorResponse('Internal server error during ARI operation', error?.message)
            );
        }
    }
}
