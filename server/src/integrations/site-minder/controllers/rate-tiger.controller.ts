// controllers/ratetiger.controller.ts

import { Response } from 'express';
import { RateTigerRequest } from '../../../utils';
import {
    RateTigerAuthRequest,
    RateTigerOTAHotelAvailRQ,
    RateTigerOTAHotelAvailGetRQ,
} from '../types';
import { RateTigerService } from '../services/rate-tiger.service';
import { RateTigerValidation } from '../validations/request.validation';
import { PriceUpdateService } from '../services/price-update.service';
import { config } from '../../../config';
import { decodeBasicAuth } from '../validations/basicauth.utils';

export class RateTigerController {
    public static async authenticate(req: RateTigerRequest, res: Response) {
        try {
            // 1. Decode BasicAuth header (RateTiger sends this)
            const authHeader =
                (req.headers['basicauth'] as string) ??
                (req.headers['authorization'] as string);

            if (!authHeader) {
                return res.status(401).json({
                    status: 'ERROR',
                    message: 'Missing BasicAuth header',
                });
            }

            const credentials = decodeBasicAuth(authHeader);
            if (!credentials) {
                return res.status(401).json({
                    status: 'ERROR',
                    message: 'Invalid BasicAuth format',
                });
            }

            // 2. Validate the username:password against stored credentials
            if (
                credentials.username !== config.rateTigerUsername ||
                credentials.password !== config.rateTigerPassword
            ) {
                return res.status(401).json({
                    status: 'ERROR',
                    message: 'Invalid credentials',
                });
            }

            // 3. Grab API-Key and partner_id from body
            const { 'API-Key': apiKey, partner_id: partnerId } =
                req.body as RateTigerAuthRequest;

            if (!apiKey || !partnerId) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Missing API-Key or partner_id in body',
                });
            }

            // 4. Validate API-Key and partner_id
            if (
                apiKey !== config.rateTigerApiKey ||
                partnerId !== config.rateTigerPartnerId
            ) {
                return res.status(401).json({
                    status: 'ERROR',
                    message: 'Invalid API-Key or partner_id',
                });
            }

            // 5. Generate token and return directly in RT format
            const authResponse = await RateTigerService.generateAuthToken(
                apiKey,
                partnerId
            );
            return res.status(200).json(authResponse);
        } catch (error: any) {
            return res.status(500).json({
                status: 'ERROR',
                message: error?.message || 'Internal server error',
            });
        }
    }

    public static async roomRatePlanPull(req: RateTigerRequest, res: Response) {
        try {
            const validationError =
                RateTigerValidation.validateRoomRatePlanPull(req.body);
            if (validationError) {
                return res
                    .status(400)
                    .json({ success: false, message: validationError });
            }

            const { otaHotelAvailRQ } = req.body as RateTigerOTAHotelAvailRQ;
            const { hotelCode, requestId } = otaHotelAvailRQ;

            const result = await RateTigerService.getRoomTypeRatePlanMapping(
                hotelCode,
                requestId
            );

            const status =
                result.otaHotelAvailRS.success === 'true' ? 200 : 400;
            return res.status(status).json(result);
        } catch (error: any) {
            return res.status(500).json({
                otaHotelAvailRS: {
                    hotelCode: req.body?.otaHotelAvailRQ?.hotelCode ?? '',
                    requestId: req.body?.otaHotelAvailRQ?.requestId ?? '',
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

    public static async inventoryPull(req: RateTigerRequest, res: Response) {
        try {
            const validationError = RateTigerValidation.validateInventoryPull(
                req.body
            );
            if (validationError) {
                return res
                    .status(400)
                    .json({ success: false, message: validationError });
            }

            const { otaHotelAvailGetRQ } =
                req.body as RateTigerOTAHotelAvailGetRQ;
            const { hotelCode, requestId, hotelAvailRequest } =
                otaHotelAvailGetRQ;

            const result = await RateTigerService.getInventoryPull(
                hotelCode,
                requestId,
                hotelAvailRequest
            );

            const status =
                result.otaHotelAvailGetRS.success === 'true' ? 200 : 400;
            return res.status(status).json(result);
        } catch (error: any) {
            return res.status(500).json({
                otaHotelAvailGetRS: {
                    hotelCode: req.body?.otaHotelAvailGetRQ?.hotelCode ?? '',
                    requestId: req.body?.otaHotelAvailGetRQ?.requestId ?? '',
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

    public static async priceUpdate(req: RateTigerRequest, res: Response) {
        try {
            const validationError = RateTigerValidation.validatePriceUpdate(
                req.body
            );
            if (validationError) {
                return res
                    .status(400)
                    .json({ success: false, message: validationError });
            }

            const result = await PriceUpdateService.processPriceUpdate(
                req.body
            );

            const status =
                result.otaRateAmountNotifRS.success === 'true' ? 200 : 400;
            return res.status(status).json(result);
        } catch (error: any) {
            return res.status(500).json({
                otaRateAmountNotifRS: {
                    hotelCode: req.body?.rateAmountMessages?.hotelCode ?? '',
                    requestId: req.body?.rateAmountMessages?.requestId ?? '',
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
