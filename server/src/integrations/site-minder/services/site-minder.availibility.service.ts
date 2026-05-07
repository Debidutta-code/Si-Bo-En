import { SiteMinderDao } from '../dao/site-minder.dao';
import { SiteMinderHotelAvailNotifRQ, SiteMinderProcessResult } from '../types/site-minder.types';

export class SiteMinderAvailabilityService {

    public static async processAvailabilityUpdate(
        payload: SiteMinderHotelAvailNotifRQ
    ): Promise<SiteMinderProcessResult> {
        const { hotelCode, availStatusMessages } = payload;

        try {
            const property = await SiteMinderDao.getProperty(hotelCode);
            if (!property) {
                return {
                    success: false,
                    errors: [{ type: 3, code: 392, text: `Property ${hotelCode} not found` }],
                };
            }

            const { propertyCode } = property;

            for (const message of availStatusMessages) {
                const {
                    start, end,
                    invTypeCode: roomTypeCode,
                    ratePlanCode,
                    bookingLimit,
                    lengthsOfStay,
                    restrictionStatuses,
                } = message;

                // ── MinLOS / MaxLOS ───────────────────────────────────────────
                let minLos: number | undefined;
                let maxLos: number | undefined;

                if (lengthsOfStay && lengthsOfStay.length > 0) {
                    for (const los of lengthsOfStay) {
                        if (los.minMaxMessageType === 'SetMinLOS') {
                            minLos = parseInt(los.time) || 1;
                        }
                        if (los.minMaxMessageType === 'SetMaxLOS') {
                            maxLos = los.time ? parseInt(los.time) : 0;
                        }
                    }
                }

                // ── Restrictions ──────────────────────────────────────────────
                let isSaleStopped: boolean | undefined;
                let isClosedToArrival: boolean | undefined;
                let isClosedToDeparture: boolean | undefined;

                if (restrictionStatuses && restrictionStatuses.length > 0) {
                    for (const r of restrictionStatuses) {
                        if (!r.restriction || r.restriction === 'Master') {
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

                // ── Expand date range ─────────────────────────────────────────
                const startDate = new Date(start);
                const endDate = new Date(end);
                const currentDate = new Date(startDate);

                while (currentDate <= endDate) {
                    await SiteMinderDao.upsertInventoryAndRestrictions({
                        propertyCode,
                        roomTypeCode,
                        ratePlanCode: ratePlanCode ?? '',
                        date: new Date(currentDate),
                        bookingLimit,
                        isSaleStopped,
                        isClosedToArrival,
                        isClosedToDeparture,
                    });
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                if ((minLos !== undefined || maxLos !== undefined) && ratePlanCode) {
                    await SiteMinderDao.upsertLengthOfStay({
                        propertyCode,
                        ratePlanCode,
                        startDate,
                        endDate,
                        minLos,
                        maxLos,
                    });
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