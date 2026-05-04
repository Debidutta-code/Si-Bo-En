// utils/siteminder-xml.parser.ts
// Core XML ↔ JSON conversion layer for SiteMinder SOAP messages

import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import {
    SiteMinderParsedRequest,
    SiteMinderSecurityHeader,
    SiteMinderRateAmountNotifRQ,
    SiteMinderRateAmountMessage,
    SiteMinderRate,
    SiteMinderBaseByGuestAmt,
    SiteMinderAdditionalGuestAmount,
    SiteMinderHotelAvailNotifRQ,
    SiteMinderAvailStatusMessage,
    SiteMinderLengthOfStay,
    SiteMinderRestrictionStatus,
    SiteMinderRateAmountNotifRS,
    SiteMinderHotelAvailNotifRS,
} from '../types/site-minder.types';

// ─── XML PARSER CONFIG ────────────────────────────────────────────────────────

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,           // strips SOAP-ENV:, wsse:, etc.
    isArray: (name) => {
        // Force these to always be arrays even if single element
        const alwaysArray = [
            'RateAmountMessage',
            'BaseByGuestAmt',
            'AdditionalGuestAmount',
            'AvailStatusMessage',
            'LengthOfStay',
            'RestrictionStatus',
        ];
        return alwaysArray.includes(name);
    },
    parseAttributeValue: true,
    trimValues: true,
});

const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
    suppressEmptyNode: false,
});

// ─── MAIN PARSER ──────────────────────────────────────────────────────────────

export class SiteMinderXmlParser {

    /**
     * Parse raw SOAP XML body into structured typed object
     */
    public static parseIncoming(rawXml: string): SiteMinderParsedRequest {
        const parsed = parser.parse(rawXml);

        const envelope = parsed?.Envelope;
        if (!envelope) {
            throw new Error('Invalid SOAP envelope: missing Envelope element');
        }

        // ── Security Header ──
        const security = SiteMinderXmlParser.extractSecurity(envelope);

        const body = envelope?.Body;
        if (!body) {
            throw new Error('Invalid SOAP envelope: missing Body element');
        }

        // ── Determine message type ──
        if (body.OTA_HotelRateAmountNotifRQ) {
            const ratesPayload = SiteMinderXmlParser.parseRatesRQ(body.OTA_HotelRateAmountNotifRQ);
            return { type: 'rates', security, ratesPayload };
        }

        if (body.OTA_HotelAvailNotifRQ) {
            const availPayload = SiteMinderXmlParser.parseAvailRQ(body.OTA_HotelAvailNotifRQ);
            return { type: 'availability', security, availPayload };
        }

        throw new Error('Unknown OTA message type in SOAP body');
    }

    // ─── SECURITY HEADER ──────────────────────────────────────────────────────

    private static extractSecurity(envelope: any): SiteMinderSecurityHeader {
        const usernameToken =
            envelope?.Header?.Security?.UsernameToken;

        if (!usernameToken) {
            throw new Error('Missing SOAP Security header or UsernameToken');
        }

        return {
            username: usernameToken?.Username ?? '',
            password: usernameToken?.Password?.['#text'] ?? usernameToken?.Password ?? '',
        };
    }

    // ─── RATES PARSER ─────────────────────────────────────────────────────────

    private static parseRatesRQ(rq: any): SiteMinderRateAmountNotifRQ {
        const hotelCode = rq?.RateAmountMessages?.['@_HotelCode'];
        if (!hotelCode) throw new Error('Missing HotelCode in RateAmountMessages');

        const rawMessages: any[] = rq?.RateAmountMessages?.RateAmountMessage ?? [];

        const rateAmountMessages: SiteMinderRateAmountMessage[] = rawMessages.map((msg: any) => {
            const sac = msg?.StatusApplicationControl;

            const rate = SiteMinderXmlParser.parseRate(msg?.Rates?.Rate);

            return {
                statusApplicationControl: {
                    start: sac?.['@_Start'],
                    end: sac?.['@_End'],
                    invTypeCode: sac?.['@_InvTypeCode'],
                    ratePlanCode: sac?.['@_RatePlanCode'],
                },
                rates: rate,
            };
        });

        // Detect pricing model: OBP has multiple consecutive BaseByGuestAmt with NumberOfGuests 1,2,3...
        const pricingModel = SiteMinderXmlParser.detectPricingModel(rateAmountMessages);

        return {
            echoToken: rq?.['@_EchoToken'] ?? '',
            timeStamp: rq?.['@_TimeStamp'] ?? new Date().toISOString(),
            version: rq?.['@_Version'] ?? '1.0',
            hotelCode,
            rateAmountMessages,
        };
    }

    private static parseRate(rate: any): SiteMinderRate {
        if (!rate) return { baseByGuestAmts: [] };

        // BaseByGuestAmts
        const rawBase: any[] = rate?.BaseByGuestAmts?.BaseByGuestAmt ?? [];
        const baseByGuestAmts: SiteMinderBaseByGuestAmt[] = rawBase.map((b: any) => ({
            amountAfterTax: parseFloat(b?.['@_AmountAfterTax'] ?? 0),
            currencyCode: b?.['@_CurrencyCode'],
            numberOfGuests: b?.['@_NumberOfGuests'] !== undefined
                ? parseInt(b['@_NumberOfGuests'])
                : undefined,
            ageQualifyingCode: b?.['@_AgeQualifyingCode'],
        }));

        // AdditionalGuestAmounts
        const rawAdditional: any[] = rate?.AdditionalGuestAmounts?.AdditionalGuestAmount ?? [];
        const additionalGuestAmounts: SiteMinderAdditionalGuestAmount[] = rawAdditional.map((a: any) => ({
            ageQualifyingCode: a?.['@_AgeQualifyingCode'] ?? '',
            amount: parseFloat(a?.['@_Amount'] ?? 0),
            currencyCode: a?.['@_CurrencyCode'],
        }));

        return {
            baseByGuestAmts,
            additionalGuestAmounts: additionalGuestAmounts.length > 0 ? additionalGuestAmounts : undefined,
            rateDescription: rate?.RateDescription?.Text
                ? { text: rate.RateDescription.Text }
                : undefined,
        };
    }

    private static detectPricingModel(messages: SiteMinderRateAmountMessage[]): 'PDP' | 'OBP' {
        for (const msg of messages) {
            const baseAmts = msg.rates.baseByGuestAmts;
            if (baseAmts.length >= 2) {
                // OBP: consecutive NumberOfGuests starting from 1
                const hasConsecutive =
                    baseAmts[0]?.numberOfGuests === 1 &&
                    baseAmts[1]?.numberOfGuests === 2;
                if (hasConsecutive) return 'OBP';
            }
        }
        return 'PDP';
    }


    private static parseAvailRQ(rq: any): SiteMinderHotelAvailNotifRQ {
        const hotelCode = rq?.AvailStatusMessages?.['@_HotelCode'];
        if (!hotelCode) throw new Error('Missing HotelCode in AvailStatusMessages');

        const rawMessages: any[] = rq?.AvailStatusMessages?.AvailStatusMessage ?? [];

        const availStatusMessages: SiteMinderAvailStatusMessage[] = rawMessages.map((msg: any) => {
            const sac = msg?.StatusApplicationControl;

            // LengthsOfStay
            const rawLos: any[] = msg?.LengthsOfStay?.LengthOfStay ?? [];
            const lengthsOfStay: SiteMinderLengthOfStay[] = rawLos.map((l: any) => ({
                time: l?.['@_Time'] ?? '',
                timeUnit: l?.['@_TimeUnit'] ?? 'Day',
                minMaxMessageType: l?.['@_MinMaxMessageType'],
            }));

            // RestrictionStatus
            const rawRestrictions: any[] = Array.isArray(msg?.RestrictionStatus)
                ? msg.RestrictionStatus
                : msg?.RestrictionStatus ? [msg.RestrictionStatus] : [];

            const restrictionStatuses: SiteMinderRestrictionStatus[] = rawRestrictions.map((r: any) => ({
                status: r?.['@_Status'],
                restriction: r?.['@_Restriction'],
            }));

            return {
                start: sac?.['@_Start'],
                end: sac?.['@_End'],
                invTypeCode: sac?.['@_InvTypeCode'],
                ratePlanCode: sac?.['@_RatePlanCode'],
                bookingLimit: msg?.['@_BookingLimit'] !== undefined
                    ? parseInt(msg['@_BookingLimit'])
                    : undefined,
                lengthsOfStay: lengthsOfStay.length > 0 ? lengthsOfStay : undefined,
                restrictionStatuses: restrictionStatuses.length > 0 ? restrictionStatuses : undefined,
            };
        });

        return {
            echoToken: rq?.['@_EchoToken'] ?? '',
            timeStamp: rq?.['@_TimeStamp'] ?? new Date().toISOString(),
            version: rq?.['@_Version'] ?? '1.0',
            hotelCode,
            availStatusMessages,
        };
    }

    // ─── RESPONSE BUILDERS ────────────────────────────────────────────────────

    /**
     * Build success/error SOAP XML response for OTA_HotelRateAmountNotifRS
     */
    public static buildRatesResponse(rs: SiteMinderRateAmountNotifRS): string {
        const body = rs.success
            ? { Success: '' }
            : {
                Errors: {
                    Error: rs.errors?.map(e => ({
                        '@_Type': e.type,
                        ...(e.code !== undefined && { '@_Code': e.code }),
                        '#text': e.text,
                    })) ?? [],
                },
            };

        const envelope = {
            'SOAP-ENV:Envelope': {
                '@_xmlns:SOAP-ENV': 'http://schemas.xmlsoap.org/soap/envelope/',
                'SOAP-ENV:Header': '',
                'SOAP-ENV:Body': {
                    OTA_HotelRateAmountNotifRS: {
                        '@_xmlns': 'http://www.opentravel.org/OTA/2003/05',
                        '@_EchoToken': rs.echoToken,
                        '@_TimeStamp': rs.timeStamp,
                        '@_Version': rs.version,
                        ...body,
                    },
                },
            },
        };

        return `<?xml version="1.0" encoding="UTF-8"?>\n` + builder.build(envelope);
    }

    /**
     * Build success/error SOAP XML response for OTA_HotelAvailNotifRS
     */
    public static buildAvailResponse(rs: SiteMinderHotelAvailNotifRS): string {
        const body = rs.success
            ? { Success: '' }
            : {
                Errors: {
                    Error: rs.errors?.map(e => ({
                        '@_Type': e.type,
                        ...(e.code !== undefined && { '@_Code': e.code }),
                        '#text': e.text,
                    })) ?? [],
                },
            };

        const envelope = {
            'SOAP-ENV:Envelope': {
                '@_xmlns:SOAP-ENV': 'http://schemas.xmlsoap.org/soap/envelope/',
                'SOAP-ENV:Header': '',
                'SOAP-ENV:Body': {
                    OTA_HotelAvailNotifRS: {
                        '@_xmlns': 'http://www.opentravel.org/OTA/2003/05',
                        '@_EchoToken': rs.echoToken,
                        '@_TimeStamp': rs.timeStamp,
                        '@_Version': rs.version,
                        ...body,
                    },
                },
            },
        };

        return `<?xml version="1.0" encoding="UTF-8"?>\n` + builder.build(envelope);
    }

    /**
     * Build SOAP Fault for authentication errors
     */
    public static buildSoapFault(code: string, message: string): string {
        const envelope = {
            'SOAP-ENV:Envelope': {
                '@_xmlns:SOAP-ENV': 'http://schemas.xmlsoap.org/soap/envelope/',
                'SOAP-ENV:Header': '',
                'SOAP-ENV:Body': {
                    'SOAP-ENV:Fault': {
                        faultcode: code,
                        faultstring: message,
                    },
                },
            },
        };

        return `<?xml version="1.0" encoding="UTF-8"?>\n` + builder.build(envelope);
    }
}