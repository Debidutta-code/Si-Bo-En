// src/integrations/channex/services/channex-ari-push.service.ts

import axios from 'axios';
import { ChannexDynamicConfig, ChannexAvailabilityPayload, ChannexRestrictionsPayload } from '../types/channex.types';
import { ChannexDao } from '../dao/channex.dao';
import { ServiceLogger } from '../../../logs/services/service-log.service';

const logger = new ServiceLogger('ChannexAriPushService');

export class ChannexAriPushService {
    /**
     * Map Date/String helper
     */
    private static toDateString(date: Date): string {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    /**
     * Push availability updates for a room type and date range
     */
    public static async pushAvailability(
        propertyCode: string,
        roomTypeCode: string,
        startDate: Date,
        endDate: Date,
        config: ChannexDynamicConfig
    ): Promise<{ success: boolean; message: string }> {
        const log = logger.start('pushAvailability');
        try {
            const inventories = await ChannexDao.getDailyInventory(propertyCode, roomTypeCode, startDate, endDate);

            if (inventories.length === 0) {
                return { success: true, message: 'No inventory data to push' };
            }

            const values = inventories.map(inv => ({
                property_id: config.propertyId,
                room_type_id: roomTypeCode, // Configured to match Channex room_type_id
                date: ChannexAriPushService.toDateString(inv.date),
                availability: inv.availability,
            }));

            const payload: ChannexAvailabilityPayload = { values };
            log.setIncoming({ propertyCode, roomTypeCode, startDate, endDate, payload });

            const response = await axios.post(`${config.baseUrl}/api/v1/availability`, payload, {
                headers: {
                    'user-api-key': config.apiKey,
                    'Content-Type': 'application/json',
                },
                timeout: 15000,
            });

            log.pushMessage('Channex availability push succeeded', 'info')
               .setMeta({ channexResponse: response.data })
               .save();

            return { success: true, message: 'Availability pushed to Channex successfully' };
        } catch (error: any) {
            const errorMsg = error?.response?.data || error.message;
            log.setError(error).setMeta({ errorDetail: errorMsg }).save();
            return {
                success: false,
                message: `Channex availability push failed: ${JSON.stringify(errorMsg)}`,
            };
        }
    }

    /**
     * Push rates and restrictions updates for a room type, rate plan and date range
     */
    public static async pushRestrictions(
        propertyCode: string,
        roomTypeCode: string,
        ratePlanCode: string,
        startDate: Date,
        endDate: Date,
        config: ChannexDynamicConfig
    ): Promise<{ success: boolean; message: string }> {
        const log = logger.start('pushRestrictions');
        try {
            const charges = await ChannexDao.getDailyCharges(propertyCode, roomTypeCode, ratePlanCode, startDate, endDate);

            if (charges.length === 0) {
                return { success: true, message: 'No charges data to push' };
            }

            const values = charges.map(charge => ({
                property_id: config.propertyId,
                rate_plan_id: ratePlanCode, // Configured to match Channex rate_plan_id
                date: ChannexAriPushService.toDateString(charge.date),
                ...(charge.amountBeforeTax !== undefined && { rate: charge.amountBeforeTax.toFixed(2) }),
                stop_sell: charge.isSaleStopped,
                closed_to_arrival: charge.isClosedToArrival,
                closed_to_departure: charge.isClosedToDeparture,
            }));

            const payload: ChannexRestrictionsPayload = { values };
            log.setIncoming({ propertyCode, roomTypeCode, ratePlanCode, startDate, endDate, payload });

            const response = await axios.post(`${config.baseUrl}/api/v1/restrictions`, payload, {
                headers: {
                    'user-api-key': config.apiKey,
                    'Content-Type': 'application/json',
                },
                timeout: 15000,
            });

            log.pushMessage('Channex restrictions push succeeded', 'info')
               .setMeta({ channexResponse: response.data })
               .save();

            return { success: true, message: 'Restrictions pushed to Channex successfully' };
        } catch (error: any) {
            const errorMsg = error?.response?.data || error.message;
            log.setError(error).setMeta({ errorDetail: errorMsg }).save();
            return {
                success: false,
                message: `Channex restrictions push failed: ${JSON.stringify(errorMsg)}`,
            };
        }
    }
}
