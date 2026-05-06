// controllers/siteminder.controller.ts

import { Request, Response } from 'express';
import { SiteMinderParsedRequest } from '../types/site-minder.types';
import { SiteMinderRatesService } from '../services/site-minder.rates.service';
import { SiteMinderAvailabilityService } from '../services/site-minder.availibility.service';
import { SiteMinderRoomsRatesService } from '../services/site-minder.rooms-rates.service';
import { SiteMinderXmlParser } from '../utils/xml-parser';

export class SiteMinderController {
    public static async handlePush(req: Request, res: Response) {
        const parsed = (req as any).siteMinderParsed as SiteMinderParsedRequest;

        res.set('Content-Type', 'text/xml; charset=utf-8');

        try {
            // ── Rooms & Rates Pull (SiteMinder fetches your room/rate config) ──
            if (parsed.type === 'roomsRates' && parsed.roomsRatesPayload) {
                const xml = await SiteMinderRoomsRatesService.getRoomsRates({
                    hotelCode: parsed.roomsRatesPayload.hotelCode,
                    echoToken: parsed.roomsRatesPayload.echoToken,
                    version: parsed.roomsRatesPayload.version,
                });
                return res.status(200).send(xml);
            }

            // ── Rates Push ────────────────────────────────────────────────────
            if (parsed.type === 'rates' && parsed.ratesPayload) {
                const result = await SiteMinderRatesService.processRatesUpdate(
                    parsed.ratesPayload
                );

                const xml = SiteMinderXmlParser.buildRatesResponse({
                    echoToken: parsed.ratesPayload.echoToken,
                    timeStamp: new Date().toISOString(),
                    version: parsed.ratesPayload.version,
                    success: result.success,
                    errors: result.errors,
                });

                return res.status(result.success ? 200 : 400).send(xml);
            }

            if (parsed.type === 'availability' && parsed.availPayload) {
                const result = await SiteMinderAvailabilityService.processAvailabilityUpdate(
                    parsed.availPayload
                );

                const xml = SiteMinderXmlParser.buildAvailResponse({
                    echoToken: parsed.availPayload.echoToken,
                    timeStamp: new Date().toISOString(),
                    version: parsed.availPayload.version,
                    success: result.success,
                    errors: result.errors,
                });

                return res.status(result.success ? 200 : 400).send(xml);
            }

            const fault = SiteMinderXmlParser.buildSoapFault(
                'SOAP-ENV:Client',
                'Unknown or unsupported OTA message type'
            );
            return res.status(400).send(fault);

        } catch (error: any) {
            console.error('[SiteMinder] Unhandled error:', error);

            const fault = SiteMinderXmlParser.buildSoapFault(
                'SOAP-ENV:Server',
                error?.message ?? 'Internal server error'
            );
            return res.status(500).send(fault);
        }
    }
}