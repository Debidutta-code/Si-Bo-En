import { SiteMinderDao } from '../dao/site-minder.dao';
import { SiteMinderHotelAvailNotifRQ, SiteMinderProcessResult } from '../types/site-minder.types';
import { ServiceLogger, LogBuilder } from '../../../logs/services/service-log.service';

const logger = new ServiceLogger('SiteMinderARI');

export class SiteMinderAvailabilityService {

    public static async processAvailabilityUpdate(
        payload: SiteMinderHotelAvailNotifRQ,
        rawXml: string,
        log: LogBuilder
    ): Promise<SiteMinderProcessResult> {
        const { hotelCode, availStatusMessages } = payload;

        try {
            // ── Repo: getProperty ─────────────────────────────────────────────
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
                    errors: [{ type: 3, code: 392, text: `Property ${hotelCode} not found` }],
                };
            }

            log.pushMessage(`Property found: ${property.propertyCode}`, 'info');
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

                let minLos: number | undefined;
                let maxLos: number | undefined;

                if (lengthsOfStay && lengthsOfStay.length > 0) {
                    for (const los of lengthsOfStay) {
                        if (los.minMaxMessageType === 'SetMinLOS') minLos = parseInt(los.time) || 1;
                        if (los.minMaxMessageType === 'SetMaxLOS') maxLos = los.time ? parseInt(los.time) : 0;
                    }
                }

                let isSaleStopped: boolean | undefined;
                let isClosedToArrival: boolean | undefined;
                let isClosedToDeparture: boolean | undefined;

                if (restrictionStatuses && restrictionStatuses.length > 0) {
                    for (const r of restrictionStatuses) {
                        if (!r.restriction || r.restriction === 'Master') isSaleStopped = r.status === 'Close';
                        if (r.restriction === 'Arrival') isClosedToArrival = r.status === 'Close';
                        if (r.restriction === 'Departure') isClosedToDeparture = r.status === 'Close';
                    }
                }

                log.pushMessage(
                    `Upserting availability: roomType=${roomTypeCode} ratePlan=${ratePlanCode ?? 'N/A'} ${start} → ${end}`,
                    'info',
                    { roomTypeCode, ratePlanCode, start, end, bookingLimit, isSaleStopped, isClosedToArrival, isClosedToDeparture, minLos, maxLos }
                );

                const startDate = new Date(start);
                const endDate = new Date(end);
                const currentDate = new Date(startDate);

                // ── Repo: upsertInventoryAndRestrictions (per day) ────────────
                while (currentDate <= endDate) {
                    const t1 = Date.now();
                    const upsertInput = {
                        propertyCode, roomTypeCode,
                        ratePlanCode: ratePlanCode ?? '',
                        date: new Date(currentDate),
                        bookingLimit, isSaleStopped, isClosedToArrival, isClosedToDeparture,
                    };
                    try {
                        await SiteMinderDao.upsertInventoryAndRestrictions(upsertInput);
                        log.addRepoCall({
                            repoName: 'SiteMinderDao',
                            method: 'upsertInventoryAndRestrictions',
                            input: upsertInput,
                            response: { upserted: true },
                            success: true,
                            durationMs: Date.now() - t1,
                        });
                    } catch (err: any) {
                        log.addRepoCall({
                            repoName: 'SiteMinderDao',
                            method: 'upsertInventoryAndRestrictions',
                            input: upsertInput,
                            success: false,
                            durationMs: Date.now() - t1,
                            error: { message: err?.message },
                        });
                        throw err;
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                // ── Repo: upsertLengthOfStay ──────────────────────────────────
                if ((minLos !== undefined || maxLos !== undefined) && ratePlanCode) {
                    const t2 = Date.now();
                    const losInput = { propertyCode, ratePlanCode, startDate, endDate, minLos, maxLos };
                    try {
                        await SiteMinderDao.upsertLengthOfStay(losInput);
                        log.addRepoCall({
                            repoName: 'SiteMinderDao',
                            method: 'upsertLengthOfStay',
                            input: losInput,
                            response: { upserted: true },
                            success: true,
                            durationMs: Date.now() - t2,
                        });
                    } catch (err: any) {
                        log.addRepoCall({
                            repoName: 'SiteMinderDao',
                            method: 'upsertLengthOfStay',
                            input: losInput,
                            success: false,
                            durationMs: Date.now() - t2,
                            error: { message: err?.message },
                        });
                        throw err;
                    }
                }
            }

            return { success: true };

        } catch (error: any) {
            log.setError(error);
            return {
                success: false,
                errors: [{ type: 3, text: error?.message ?? 'Failed to process availability update' }],
            };
        }
    }
}