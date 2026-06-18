// controllers/ari-update.controller.ts

import { Response } from 'express';
import { RateTigerRequest } from '../../../utils';
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
import { ServiceLogger } from '../../../logs/services/service-log.service';

const logger = new ServiceLogger('RateTigerARI');

export class ARIController {
    public static async handleARI(req: RateTigerRequest, res: Response) {
        const body = req.body;
        const propertyCode = req.rateTiger?.propertyCode;

        let method = 'unknown';
        let requestId = '';
        if (body.otaHotelAvailRQ) {
            method = 'roomRatePlanPull';
            requestId = body.otaHotelAvailRQ.requestId ?? '';
        } else if (body.otaHotelAvailGetRQ) {
            method = 'inventoryPull';
            requestId = body.otaHotelAvailGetRQ.requestId ?? '';
        } else if (body.otaHotelRatePlanRQ) {
            method = 'pricePull';
            requestId = body.otaHotelRatePlanRQ.requestId ?? '';
        } else if (body.rateAmountMessages) {
            method = 'priceUpdate';
            requestId = body.rateAmountMessages.requestId ?? '';
        } else if (body.otaHotelAvailNotifRQ) {
            method = 'inventoryUpdate';
            requestId = body.otaHotelAvailNotifRQ.requestId ?? '';
        }

        const log = logger.start(method, requestId);
        log.setIncoming(body);

        try {
            if (!propertyCode) {
                log.pushMessage('Property code could not be resolved', 'error');
                const response = {
                    success: false,
                    message: 'Property code could not be resolved. Ensure withHotelCodeConversion wrapper is applied.',
                };
                log.setServiceResponse(response);
                log.save();
                return res.status(500).json(response);
            }

            if (body.otaHotelAvailRQ) {
                const validationError = RateTigerValidation.validateRoomRatePlanPull(body);
                if (validationError) {
                    log.pushMessage(`Validation error: ${validationError}`, 'error');
                    const response = { success: false, message: validationError };
                    log.setServiceResponse(response);
                    log.save();
                    return res.status(400).json(response);
                }

                const { otaHotelAvailRQ } = body as RateTigerOTAHotelAvailRQ;
                const result = await RateTigerService.getRoomTypeRatePlanMapping(
                    propertyCode,
                    otaHotelAvailRQ.requestId,
                    log
                );

                const status = result.otaHotelAvailRS.success === 'true' ? 200 : 400;
                log.setServiceResponse({ success: result.otaHotelAvailRS.success === 'true', message: 'Room rate plan pull response' });
                log.save();
                return res.status(status).json(result);
            }

            if (body.otaHotelAvailGetRQ) {
                const validationError = RateTigerValidation.validateInventoryPull(body);
                if (validationError) {
                    log.pushMessage(`Validation error: ${validationError}`, 'error');
                    const response = { success: false, message: validationError };
                    log.setServiceResponse(response);
                    log.save();
                    return res.status(400).json(response);
                }

                const { otaHotelAvailGetRQ } = body as RateTigerOTAHotelAvailGetRQ;
                const result = await RateTigerService.getInventoryPull(
                    propertyCode,
                    otaHotelAvailGetRQ.requestId,
                    otaHotelAvailGetRQ.hotelAvailRequest,
                    log
                );

                const status = result.otaHotelAvailGetRS.success === 'true' ? 200 : 400;
                log.setServiceResponse({ success: result.otaHotelAvailGetRS.success === 'true', message: 'Inventory pull response' });
                log.save();
                return res.status(status).json(result);
            }

            if (body.otaHotelRatePlanRQ) {
                const validationError = RateTigerValidation.validatePricePull(body);
                if (validationError) {
                    log.pushMessage(`Validation error: ${validationError}`, 'error');
                    const response = { success: false, message: validationError };
                    log.setServiceResponse(response);
                    log.save();
                    return res.status(400).json(response);
                }

                const { otaHotelRatePlanRQ } = body as RateTigerOTAHotelRatePlanRQ;
                const result = await PricePullService.getPricePull(
                    propertyCode,
                    otaHotelRatePlanRQ.requestId,
                    otaHotelRatePlanRQ.ratePlans,
                    log
                );

                const status = result.otaHotelRatePlanRS.success === 'true' ? 200 : 400;
                log.setServiceResponse({ success: result.otaHotelRatePlanRS.success === 'true', message: 'Price pull response' });
                log.save();
                return res.status(status).json(result);
            }

            if (body.rateAmountMessages) {
                const validationError = RateTigerValidation.validatePriceUpdate(body);
                if (validationError) {
                    log.pushMessage(`Validation error: ${validationError}`, 'error');
                    const response = { success: false, message: validationError };
                    log.setServiceResponse(response);
                    log.save();
                    return res.status(400).json(response);
                }

                // Inject resolved propertyCode so the service works with internal code
                body.rateAmountMessages.hotelCode = propertyCode;

                const result = await PriceUpdateService.processPriceUpdate(body, log);
                const status = result.otaRateAmountNotifRS.success === 'true' ? 200 : 400;
                log.setServiceResponse({ success: result.otaRateAmountNotifRS.success === 'true', message: 'Price update response' });
                log.save();
                return res.status(status).json(result);
            }

            if (body.otaHotelAvailNotifRQ) {
                const validationError = RateTigerValidation.validateInventoryUpdate(body);
                if (validationError) {
                    log.pushMessage(`Validation error: ${validationError}`, 'error');
                    const response = { success: false, message: validationError };
                    log.setServiceResponse(response);
                    log.save();
                    return res.status(400).json(response);
                }

                body.otaHotelAvailNotifRQ.hotelCode = propertyCode;

                const result = await InventoryUpdateService.processInventoryUpdate(
                    body as RateTigerInventoryUpdateRQ,
                    log
                );
                const status = result.otaHotelAvailNotifRS.success === 'true' ? 200 : 400;
                log.setServiceResponse({ success: result.otaHotelAvailNotifRS.success === 'true', message: 'Inventory update response' });
                log.save();
                return res.status(status).json(result);
            }

            log.pushMessage('Unknown ARI message type', 'error');
            const unknownResponse = { success: false, message: 'Unknown ARI message type' };
            log.setServiceResponse(unknownResponse);
            log.save();
            return res.status(400).json(unknownResponse);

        } catch (error: any) {
            console.error('ARI Error:', error);
            log.setError(error);
            log.save();
            return res.status(500).json({
                otaHotelAvailNotifRS: {
                    success: 'false',
                    timeStamp: new Date().toISOString(),
                    error: {
                        type: 'ProcessingError',
                        errorCode: '500',
                        text: error?.message || 'Internal server error during ARI operation',
                    },
                },
            } as any);
        }
    }
}
