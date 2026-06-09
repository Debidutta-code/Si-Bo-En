import { SiteMinderDao } from '../dao/site-minder.dao';
import { SiteMinderHotelAvailNotifRQ, SiteMinderProcessResult } from '../types/site-minder.types';
import { ServiceLogger, LogBuilder } from '../../../logs/services/service-log.service';
import { siteMinderQueue } from '../../../queue/site-minder.queus';

const logger = new ServiceLogger('SiteMinderARI');

export class SiteMinderAvailabilityService {

    public static async processAvailabilityUpdate(
        payload: SiteMinderHotelAvailNotifRQ,
        rawXml: string,
        log: LogBuilder
    ): Promise<SiteMinderProcessResult> {
        const { hotelCode, availStatusMessages } = payload;

        try {
            let property: any;
            const t0 = Date.now();
            try {
                property = await SiteMinderDao.getProperty(hotelCode);
                log.addRepoCall({
                    repoName: 'SiteMinderDao',
                    method: 'getProperty',
                    input: { hotelCode },
                    response: property ?? null,
                    success: !!property,
                    durationMs: Date.now() - t0,
                });
            } catch (err: any) {
                log.addRepoCall({
                    repoName: 'SiteMinderDao',
                    method: 'getProperty',
                    input: { hotelCode },
                    success: false,
                    durationMs: Date.now() - t0,
                    error: { message: err?.message },
                });
                throw err;
            }

            if (!property) {
                log.pushMessage(`Property ${hotelCode} not found`, 'error');
                return {
                    success: false,
                    errors: [{ type: 6, code: 392, text: `Hotel not found for HotelCode=${hotelCode}` }],
                };
            }

            log.pushMessage(`Property found: ${property.propertyCode}`, 'info');
            const { propertyCode } = property;

            for (const message of availStatusMessages) {
                const {
                    invTypeCode: roomTypeCode,
                    ratePlanCode,
                } = message;

                const exists = await SiteMinderDao.ratePlanExists(ratePlanCode, propertyCode);
                if (!exists) {
                    log.pushMessage(`Rate plan ${ratePlanCode} not found`, 'error');
                    return {
                        success: false,
                        errors: [{ type: 12, code: 249, text: 'Rate code not found for this hotel' }],
                    };
                }

                const roomExists = await SiteMinderDao.roomTypeExists(roomTypeCode, propertyCode);
                if (!roomExists) {
                    log.pushMessage(`Room type ${roomTypeCode} not found`, 'error');
                    return {
                        success: false,
                        errors: [{ type: 12, code: 402, text: 'Room type code not found for this hotel' }],
                    };
                }
            }

            // ── Enqueue Availability Jobs in Background ──────────────────────
            await siteMinderQueue.enqueueAvailabilityMessages({
                hotelCode,
                propertyCode,
                echoToken: payload.echoToken,
                availStatusMessages: availStatusMessages.map((m) => ({
                    start: m.start,
                    end: m.end,
                    invTypeCode: m.invTypeCode,
                    ratePlanCode: m.ratePlanCode,
                    bookingLimit: m.bookingLimit,
                    lengthsOfStay: m.lengthsOfStay,
                    restrictionStatuses: m.restrictionStatuses,
                })),
            });

            log.pushMessage('Availability accepted and enqueued successfully', 'info');
            return { success: true };

        } catch (error: any) {
            log.setError(error);
            return {
                success: false,
                errors: [{ type: 6, code: 392, text: error.message || 'Internal error' }],
            };
        }
    }
}