// controllers/siteminder.controller.ts

import { Request, Response } from 'express';
import { SiteMinderParsedRequest } from '../types/site-minder.types';
import { SiteMinderRoomsRatesService } from '../services/site-minder.rooms-rates.service';
import { SiteMinderXmlParser } from '../utils/xml-parser';
import { SiteMinderDao } from '../dao/site-minder.dao';
import { ServiceLogger } from '../../../logs/services/service-log.service';
import { getCurrencyConverter, getPropertyBaseCurrency } from '../../../currency-maping/utils';
import { CurrencyCode } from '../../../tax-system/interfaces/tourist-tax.type';
import { SiteMinderQueue } from '../../../queue/site-minder.queus';
import { config } from '../../../config';

const logger = new ServiceLogger('SiteMinderARI');

const siteMinderQueue = new SiteMinderQueue({
    host: config.redisHost,
    port: Number(config.redisPort),
    password: config.redisPassword,
    maxRetriesPerRequest: null,
    connectTimeout: 10_000,
    retryStrategy: (times: number) => Math.min(times * 500, 5_000),
});

// ─── Tax helper (same reverseTax from rates service) ─────────────────────────

function reverseTax(
    amountAfterTax: number,
    rules: Array<{ priority: number; type: string; value: number }>,
    options: { skipFixed?: boolean } = {}
): number {
    if (rules.length === 0) return amountAfterTax;
    const grouped = new Map<number, Array<{ type: string; value: number }>>();
    for (const rule of rules) {
        if (!grouped.has(rule.priority)) grouped.set(rule.priority, []);
        grouped.get(rule.priority)!.push(rule);
    }
    const priorities = [...grouped.keys()].sort((a, b) => b - a);
    let amount = amountAfterTax;
    for (const priority of priorities) {
        const group = grouped.get(priority)!;
        let percentageSum = 0;
        let fixedSum = 0;
        for (const rule of group) {
            if (rule.type === 'percentage') percentageSum += rule.value / 100;
            else if (rule.type === 'fixed' && !options.skipFixed) fixedSum += rule.value;
        }
        amount = (amount - fixedSum) / (1 + percentageSum);
    }
    return amount;
}

export class SiteMinderController {

    public static async handlePush(req: Request, res: Response) {
        const rawXml = req.body as string;
        const parsed = (req as any).siteMinderParsed as SiteMinderParsedRequest;
        const isoWithoutMs = () => new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');

        const method = parsed.type === 'rates' ? 'ratesUpdate'
            : parsed.type === 'availability' ? 'availabilityUpdate'
                : 'roomsRates';

        const hotelCode = parsed.ratesPayload?.hotelCode
            ?? parsed.availPayload?.hotelCode
            ?? parsed.roomsRatesPayload?.hotelCode;

        const log = logger.start(method);
        log.setIncoming({ type: parsed.type, hotelCode, rawXml, parsed });

        res.set('Content-Type', 'text/xml; charset=utf-8');

        try {

            // ── Rooms & Rates Pull (sync — no queue needed) ───────────────────
            if (parsed.type === 'roomsRates' && parsed.roomsRatesPayload) {
                const xml = await SiteMinderRoomsRatesService.getRoomsRates({
                    hotelCode: parsed.roomsRatesPayload.hotelCode,
                    echoToken: parsed.roomsRatesPayload.echoToken,
                    version: parsed.roomsRatesPayload.version,
                }, log);

                log.pushMessage('Rooms & rates response built', 'info')
                    .setMeta({ responseXml: xml })
                    .save();

                return res.status(200).send(xml);
            }

            // ── Rates Push ────────────────────────────────────────────────────
            if (parsed.type === 'rates' && parsed.ratesPayload) {
                const { ratesPayload } = parsed;

                // 1. Validate property
                const property = await SiteMinderDao.getProperty(ratesPayload.hotelCode);
                if (!property) {
                    const xml = SiteMinderXmlParser.buildRatesResponse({
                        echoToken: ratesPayload.echoToken,
                        timeStamp: isoWithoutMs(),
                        version: ratesPayload.version,
                        success: false,
                        errors: [{ type: 6, code: 392, text: `Hotel not found for HotelCode=${ratesPayload.hotelCode}` }],
                    });
                    log.pushMessage(`Property not found: ${ratesPayload.hotelCode}`, 'error').setMeta({ responseXml: xml }).save();
                    return res.status(200).send(xml);
                }

                // 2. Validate + pre-compute each message (so worker just does the upsert)
                const readyMessages: Array<{
                    start: string;
                    end: string;
                    roomTypeCode: string;
                    ratePlanCode: string;
                    ratePlanName: string;
                    roomTypeName: string;
                    rates: any;
                }> = [];

                for (const message of ratesPayload.rateAmountMessages) {
                    const { statusApplicationControl, rates } = message;
                    const { start, end, invTypeCode: roomTypeCode, ratePlanCode } = statusApplicationControl;

                    if (!ratePlanCode) continue;

                    const ratePlanName = await SiteMinderDao.getRatePlanName(ratePlanCode);
                    if (!ratePlanName) {
                        const xml = SiteMinderXmlParser.buildRatesResponse({
                            echoToken: ratesPayload.echoToken,
                            timeStamp: isoWithoutMs(),
                            version: ratesPayload.version,
                            success: false,
                            errors: [{ type: 12, code: 249, text: 'Rate code not found for this hotel' }],
                        });
                        log.pushMessage(`Rate plan not found: ${ratePlanCode}`, 'error').setMeta({ responseXml: xml }).save();
                        return res.status(200).send(xml);
                    }

                    const roomTypeName = await SiteMinderDao.getRoomTypeName(roomTypeCode, property.propertyCode);
                    if (!roomTypeName) {
                        const xml = SiteMinderXmlParser.buildRatesResponse({
                            echoToken: ratesPayload.echoToken,
                            timeStamp: isoWithoutMs(),
                            version: ratesPayload.version,
                            success: false,
                            errors: [{ type: 12, code: 402, text: 'Room type code not found for this hotel' }],
                        });
                        log.pushMessage(`Room type not found: ${roomTypeCode}`, 'error').setMeta({ responseXml: xml }).save();
                        return res.status(200).send(xml);
                    }

                    const maxOccupancy = await SiteMinderDao.getRoomMaxAdults(roomTypeCode, property.propertyCode);
                    if (!maxOccupancy) {
                        const xml = SiteMinderXmlParser.buildRatesResponse({
                            echoToken: ratesPayload.echoToken,
                            timeStamp: isoWithoutMs(),
                            version: ratesPayload.version,
                            success: false,
                            errors: [{ type: 12, code: 397, text: 'Invalid number of adults' }],
                        });
                        log.pushMessage(`Max occupancy not set for room: ${roomTypeCode}`, 'error').setMeta({ responseXml: xml }).save();
                        return res.status(200).send(xml);
                    }

                    if (rates.baseByGuestAmts.length !== maxOccupancy) {
                        const xml = SiteMinderXmlParser.buildRatesResponse({
                            echoToken: ratesPayload.echoToken,
                            timeStamp: isoWithoutMs(),
                            version: ratesPayload.version,
                            success: false,
                            errors: [{ type: 12, code: 397, text: `Invalid number of adults: expecting ${maxOccupancy}` }],
                        });
                        log.pushMessage(`Adults mismatch: got ${rates.baseByGuestAmts.length}, expected ${maxOccupancy}`, 'error').setMeta({ responseXml: xml }).save();
                        return res.status(200).send(xml);
                    }

                    // Pre-compute currency + tax so worker just calls upsertCharge
                    const taxRules = await SiteMinderDao.getActiveTaxRulesForRatePlan(ratePlanCode, property.propertyCode);
                    const incomingCurrency = rates.baseByGuestAmts.find((b: any) => b.currencyCode)?.currencyCode as CurrencyCode | undefined;
                    const fromCurrency = incomingCurrency ?? await getPropertyBaseCurrency(property.propertyId);
                    const { convert, baseCurrency } = await getCurrencyConverter(property.propertyId, fromCurrency);

                    const finalBaseAmounts = rates.baseByGuestAmts.map((b: any, i: number) => ({
                        numberOfGuests: b.numberOfGuests ?? i + 1,
                        ageQualifyingCode: '10' as const,
                        amountBeforeTax: Number(reverseTax(convert(b.amountAfterTax), taxRules).toFixed(2)),
                    }));

                    const childBaseAmount = rates.additionalGuestAmounts?.find(
                        (a: any) => String(a.ageQualifyingCode) === '8'
                    )?.amount ?? 0;
                    const convertedChildAmount = reverseTax(convert(childBaseAmount), taxRules, { skipFixed: true });
                    const maxChildren = await SiteMinderDao.getRoomMaxChildren(roomTypeCode, property.propertyCode);

                    const childBaseAmounts = (convertedChildAmount > 0 && maxChildren > 0)
                        ? Array.from({ length: maxChildren }, (_, i) => ({
                            numberOfGuests: i + 1,
                            ageQualifyingCode: '8' as const,
                            amountBeforeTax: convertedChildAmount * (i + 1),
                        }))
                        : [];

                    const childAdditionalAmounts = (convertedChildAmount > 0 && maxChildren > 0)
                        ? [{ ageQualifyingCode: '8' as const, amount: convertedChildAmount }]
                        : [];

                    readyMessages.push({
                        start,
                        end,
                        roomTypeCode,
                        ratePlanCode,
                        ratePlanName,
                        roomTypeName,
                        rates: {
                            currencyCode: baseCurrency,
                            baseByGuestAmounts: [...finalBaseAmounts, ...childBaseAmounts],
                            additionalGuestAmounts: childAdditionalAmounts,
                        },
                    });
                }

                // 3. All validated + pre-computed → enqueue per day, fire success immediately
                siteMinderQueue.enqueueRatesMessages({
                    hotelCode: ratesPayload.hotelCode,
                    propertyCode: property.propertyCode,
                    propertyId: property.propertyId,
                    echoToken: ratesPayload.echoToken,
                    rateAmountMessages: readyMessages,
                }).catch(err => {
                    console.error(`❌ Failed to enqueue rates jobs for hotelCode=${ratesPayload.hotelCode}:`, err);
                });

                const xml = SiteMinderXmlParser.buildRatesResponse({
                    echoToken: ratesPayload.echoToken,
                    timeStamp: isoWithoutMs(),
                    version: ratesPayload.version,
                    success: true,
                });
                log.pushMessage('Rates accepted and queued per day', 'info').setMeta({ responseXml: xml }).save();
                return res.status(200).send(xml);
            }

            if (parsed.type === 'availability' && parsed.availPayload) {
                const { availPayload } = parsed;

                // 1. Validate property
                const property = await SiteMinderDao.getProperty(availPayload.hotelCode);
                if (!property) {
                    const xml = SiteMinderXmlParser.buildAvailResponse({
                        echoToken: availPayload.echoToken,
                        timeStamp: isoWithoutMs(),
                        version: availPayload.version,
                        success: false,
                        errors: [{ type: 6, code: 392, text: `Hotel not found for HotelCode=${availPayload.hotelCode}` }],
                    });
                    log.pushMessage(`Property not found: ${availPayload.hotelCode}`, 'error').setMeta({ responseXml: xml }).save();
                    return res.status(200).send(xml);
                }

                // 2. Validate each rate plan + room type
                for (const message of availPayload.availStatusMessages) {
                    const { invTypeCode: roomTypeCode, ratePlanCode } = message;

                    const ratePlanExists = await SiteMinderDao.ratePlanExists(ratePlanCode, property.propertyCode);
                    if (!ratePlanExists) {
                        const xml = SiteMinderXmlParser.buildAvailResponse({
                            echoToken: availPayload.echoToken,
                            timeStamp: isoWithoutMs(),
                            version: availPayload.version,
                            success: false,
                            errors: [{ type: 12, code: 249, text: 'Rate code not found for this hotel' }],
                        });
                        log.pushMessage(`Rate plan not found: ${ratePlanCode}`, 'error').setMeta({ responseXml: xml }).save();
                        return res.status(200).send(xml);
                    }

                    const roomExists = await SiteMinderDao.roomTypeExists(roomTypeCode, property.propertyCode);
                    if (!roomExists) {
                        const xml = SiteMinderXmlParser.buildAvailResponse({
                            echoToken: availPayload.echoToken,
                            timeStamp: isoWithoutMs(),
                            version: availPayload.version,
                            success: false,
                            errors: [{ type: 12, code: 402, text: 'Room type code not found for this hotel' }],
                        });
                        log.pushMessage(`Room type not found: ${roomTypeCode}`, 'error').setMeta({ responseXml: xml }).save();
                        return res.status(200).send(xml);
                    }
                }

                // 3. All validated → enqueue per day, fire success immediately
                siteMinderQueue.enqueueAvailabilityMessages({
                    hotelCode: availPayload.hotelCode,
                    propertyCode: property.propertyCode,
                    echoToken: availPayload.echoToken,
                    availStatusMessages: availPayload.availStatusMessages.map((m: any) => ({
                        start: m.start,
                        end: m.end,
                        invTypeCode: m.invTypeCode,
                        ratePlanCode: m.ratePlanCode,
                        bookingLimit: m.bookingLimit,
                        lengthsOfStay: m.lengthsOfStay,
                        restrictionStatuses: m.restrictionStatuses,
                    })),
                }).catch(err => {
                    console.error(`❌ Failed to enqueue availability jobs for hotelCode=${availPayload.hotelCode}:`, err);
                });

                const xml = SiteMinderXmlParser.buildAvailResponse({
                    echoToken: availPayload.echoToken,
                    timeStamp: isoWithoutMs(),
                    version: availPayload.version,
                    success: true,
                });
                log.pushMessage('Availability accepted and queued per day', 'info').setMeta({ responseXml: xml }).save();
                return res.status(200).send(xml);
            }

            const xml = SiteMinderXmlParser.buildGenericError('roomsRates', '', 'Unknown or unsupported OTA message type');
            log.pushMessage('Unknown or unsupported OTA message type', 'error').setMeta({ responseXml: xml }).save();
            return res.status(200).send(xml);

        } catch (error: any) {
            console.error('[SiteMinder] Unhandled error:', error);
            const typeMap: Record<string, 'avail' | 'rates' | 'roomsRates'> = {
                availability: 'avail',
                rates: 'rates',
                roomsRates: 'roomsRates',
            };
            const echoToken =
                parsed?.availPayload?.echoToken ??
                parsed?.ratesPayload?.echoToken ??
                parsed?.roomsRatesPayload?.echoToken ??
                '';
            const xml = SiteMinderXmlParser.buildGenericError(
                typeMap[parsed?.type ?? 'roomsRates'] ?? 'roomsRates',
                echoToken,
                error?.message ?? 'Internal server error'
            );
            log.setError(error).setMeta({ responseXml: xml }).save();
            return res.status(200).send(xml);
        }
    }
}