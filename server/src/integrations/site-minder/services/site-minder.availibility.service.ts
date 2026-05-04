// services/siteminder-availability.service.ts

import { SiteMinderDao } from '../dao/site-minder.dao';
import { SiteMinderHotelAvailNotifRQ, SiteMinderProcessResult } from '../types/site-minder.types';

export class SiteMinderAvailabilityService {

    public static async processAvailabilityUpdate(
        payload: SiteMinderHotelAvailNotifRQ
    ): Promise<SiteMinderProcessResult> {
        const { hotelCode, availStatusMessages } = payload;

        try {
            // 1. Validate property
            const propertyExists = await SiteMinderDao.propertyExists(hotelCode);
            if (!propertyExists) {
                return {
                    success: false,
                    errors: [{ type: 3, code: 392, text: `Property ${hotelCode} not found` }],
                };
            }

            for (const message of availStatusMessages) {
                const {
                    start,
                    end,
                    invTypeCode: roomTypeCode,
                    ratePlanCode,
                    bookingLimit,
                    lengthsOfStay,
                    restrictionStatuses,
                } = message;

                // 2. Parse MinLOS / MaxLOS
                let minLos: number | undefined;
                let maxLos: number | undefined;

                if (lengthsOfStay && lengthsOfStay.length > 0) {
                    for (const los of lengthsOfStay) {
                        if (los.minMaxMessageType === 'SetMinLOS') {
                            minLos = parseInt(los.time);
                        }
                        if (los.minMaxMessageType === 'SetMaxLOS') {
                            maxLos = parseInt(los.time);
                        }
                    }
                }

                // 3. Parse restrictions
                let isSaleStopped: boolean | undefined;
                let isClosedToArrival: boolean | undefined;
                let isClosedToDeparture: boolean | undefined;

                if (restrictionStatuses && restrictionStatuses.length > 0) {
                    for (const r of restrictionStatuses) {
                        if (r.restriction === 'Master') {
                            isSaleStopped = r.status === 'Close';
                        }
                        if (r.restriction === 'Arrival') {
                            isClosedToArrival = r.status === 'Close';
                        }
                        if (r.restriction === 'Departure') {
                            isClosedToDeparture = r.status === 'Close';
                        }
                    }
                }

                // 4. Expand date range day by day
                const startDate = new Date(start);
                const endDate = new Date(end);
                const currentDate = new Date(startDate);

                while (currentDate <= endDate) {
                    await SiteMinderDao.upsertInventoryAndRestrictions({
                        propertyCode: hotelCode,
                        roomTypeCode,
                        ratePlanCode: ratePlanCode ?? '',
                        date: new Date(currentDate),
                        bookingLimit,
                        isSaleStopped,
                        isClosedToArrival,
                        isClosedToDeparture,
                    });

                    // 5. Handle MinLOS/MaxLOS if present
                    if ((minLos !== undefined || maxLos !== undefined) && ratePlanCode) {
                        await SiteMinderDao.upsertLengthOfStay({
                            propertyCode: hotelCode,
                            ratePlanCode,
                            date: new Date(currentDate),
                            minLos,
                            maxLos,
                        });
                    }

                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }

            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                errors: [{ type: 3, text: error?.message ?? 'Failed to process availability update' }],
            };
        }
    }
}