// controllers/siteminder.controller.ts

import { Request, Response } from 'express';
import { SiteMinderParsedRequest } from '../types/site-minder.types';
import { SiteMinderRatesService } from '../services/site-minder.rates.service';
import { SiteMinderAvailabilityService } from '../services/site-minder.availibility.service';
import { SiteMinderRoomsRatesService } from '../services/site-minder.rooms-rates.service';
import { SiteMinderXmlParser } from '../utils/xml-parser';
import { ServiceLogger, LogBuilder } from '../../../logs/services/service-log.service';

const logger = new ServiceLogger('SiteMinderARI');

export class SiteMinderController {
    public static async handlePush(req: Request, res: Response) {
        console.log("request from siteminder", req)
        console.log("request body from siteminder", req.body)
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
            // ── Rooms & Rates Pull ────────────────────────────────────────────
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
                const result = await SiteMinderRatesService.processRatesUpdate(
                    parsed.ratesPayload, rawXml, log
                );

                const xml = SiteMinderXmlParser.buildRatesResponse({
                    echoToken: parsed.ratesPayload.echoToken,
                    timeStamp: isoWithoutMs(),
                    version: parsed.ratesPayload.version,
                    success: result.success,
                    errors: result.errors,
                });

                log.pushMessage(result.success ? 'Rates update succeeded' : 'Rates update failed', result.success ? 'info' : 'error')
                    .setMeta({ result, responseXml: xml })
                    .save();

                return res.status(200).send(xml);
            }

            // ── Availability Push ─────────────────────────────────────────────
            if (parsed.type === 'availability' && parsed.availPayload) {
                const result = await SiteMinderAvailabilityService.processAvailabilityUpdate(
                    parsed.availPayload, rawXml, log
                );

                const xml = SiteMinderXmlParser.buildAvailResponse({
                    echoToken: parsed.availPayload.echoToken,
                    timeStamp: isoWithoutMs(),
                    version: parsed.availPayload.version,
                    success: result.success,
                    errors: result.errors,
                });

                log.pushMessage(result.success ? 'Availability update succeeded' : 'Availability update failed', result.success ? 'info' : 'error')
                    .setMeta({ result, responseXml: xml })
                    .save();

                return res.status(200).send(xml);
            }

            // ── Unknown type ──────────────────────────────────────────────────
            const xml = SiteMinderXmlParser.buildGenericError(
                'roomsRates',
                '',
                'Unknown or unsupported OTA message type'
            );
            log.pushMessage('Unknown or unsupported OTA message type', 'error')
                .setMeta({ responseXml: xml })
                .save();
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
            log.setError(error)
                .setMeta({ responseXml: xml })
                .save();
            return res.status(200).send(xml);
        }
    }
}