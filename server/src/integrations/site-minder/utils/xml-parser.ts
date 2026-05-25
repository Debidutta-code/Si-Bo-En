// utils/xml-parser.ts
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
    SiteMinderHotelAvailRQ,
} from '../types/site-minder.types';

// ─── XML PARSER CONFIG ────────────────────────────────────────────────────────

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
    isArray: (name) => {
        const alwaysArray = [
            'RateAmountMessage',
            'BaseByGuestAmt',
            'AdditionalGuestAmount',
            'AvailStatusMessage',
            'LengthOfStay',
            'RestrictionStatus',
            'RoomStay',
        ];
        return alwaysArray.includes(name);
    },
    parseAttributeValue: true,
    trimValues: true,
});

const responseBuilder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: false,
    suppressEmptyNode: true,
});


export class SiteMinderXmlParser {

    public static parseIncoming(rawXml: string): SiteMinderParsedRequest {
        const parsed = parser.parse(rawXml);

        const envelope = parsed?.Envelope;
        if (!envelope) {
            throw new Error('Invalid SOAP envelope: missing Envelope element');
        }

        const security = SiteMinderXmlParser.extractSecurity(envelope);

        const body = envelope?.Body;
        if (!body) {
            throw new Error('Invalid SOAP envelope: missing Body element');
        }

        if (body.OTA_HotelRateAmountNotifRQ) {
            const ratesPayload = SiteMinderXmlParser.parseRatesRQ(body.OTA_HotelRateAmountNotifRQ);
            return { type: 'rates', security, ratesPayload };
        }

        if (body.OTA_HotelAvailNotifRQ) {
            const availPayload = SiteMinderXmlParser.parseAvailRQ(body.OTA_HotelAvailNotifRQ);
            return { type: 'availability', security, availPayload };
        }

        if (body.OTA_HotelAvailRQ) {
            const roomsRatesPayload = SiteMinderXmlParser.parseRoomsRatesRQ(body.OTA_HotelAvailRQ);
            return { type: 'roomsRates', security, roomsRatesPayload };
        }

        throw new Error('Unknown OTA message type in SOAP body');
    }

    // ─── SECURITY HEADER ──────────────────────────────────────────────────────

    private static extractSecurity(envelope: any): SiteMinderSecurityHeader {
        const usernameToken = envelope?.Header?.Security?.UsernameToken;

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

        const rawBase: any[] = rate?.BaseByGuestAmts?.BaseByGuestAmt ?? [];
        const baseByGuestAmts: SiteMinderBaseByGuestAmt[] = rawBase.map((b: any) => ({
            amountAfterTax: parseFloat(b?.['@_AmountAfterTax'] ?? 0),
            currencyCode: b?.['@_CurrencyCode'],
            numberOfGuests: b?.['@_NumberOfGuests'] !== undefined
                ? parseInt(b['@_NumberOfGuests'])
                : undefined,
            ageQualifyingCode: b?.['@_AgeQualifyingCode'],
        }));

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

    // ─── AVAILABILITY PARSER ──────────────────────────────────────────────────

    private static parseAvailRQ(rq: any): SiteMinderHotelAvailNotifRQ {
        const hotelCode = rq?.AvailStatusMessages?.['@_HotelCode'];
        if (!hotelCode) throw new Error('Missing HotelCode in AvailStatusMessages');

        const rawMessages: any[] = rq?.AvailStatusMessages?.AvailStatusMessage ?? [];

        const availStatusMessages: SiteMinderAvailStatusMessage[] = rawMessages.map((msg: any) => {
            const sac = msg?.StatusApplicationControl;

            const rawLos: any[] = msg?.LengthsOfStay?.LengthOfStay ?? [];
            const lengthsOfStay: SiteMinderLengthOfStay[] = rawLos.map((l: any) => ({
                time: l?.['@_Time'] ?? '',
                timeUnit: l?.['@_TimeUnit'] ?? 'Day',
                minMaxMessageType: l?.['@_MinMaxMessageType'],
            }));

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

    // ─── ROOMS & RATES PARSER ─────────────────────────────────────────────────

    private static parseRoomsRatesRQ(rq: any): SiteMinderHotelAvailRQ {
        const hotelCode =
            rq?.AvailRequestSegments?.AvailRequestSegment
                ?.HotelSearchCriteria?.Criterion?.HotelRef?.['@_HotelCode'];

        if (!hotelCode) throw new Error('Missing HotelCode in OTA_HotelAvailRQ');

        return {
            echoToken: rq?.['@_EchoToken'] ?? '',
            timeStamp: rq?.['@_TimeStamp'] ?? new Date().toISOString(),
            version: rq?.['@_Version'] ?? '1.0',
            hotelCode,
        };
    }

    // ─── RESPONSE BUILDERS ────────────────────────────────────────────────────

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
                        '@_Version': '1.0',  // ← fixed: was rs.version
                        ...body,
                    },
                },
            },
        };

        return `<?xml version="1.0" encoding="UTF-8"?>\n` + responseBuilder.build(envelope);  // ← fixed: was builder
    }

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
                        '@_Version': '1.0',  // ← fixed: was 1.0 (number)
                        ...body,
                    },
                },
            },
        };

        return `<?xml version="1.0" encoding="UTF-8"?>\n` + responseBuilder.build(envelope);  // ← fixed: was builder
    }

    public static buildRoomsRatesResponse(params: {
        echoToken: string;
        version: string;
        roomStays: Array<{
            roomTypeCode: string;
            roomTypeName: string;
            maxOccupancy: number;
            ratePlanCode: string;
            ratePlanName: string;
        }>;
        error?: { type: number; code?: number; text: string };
    }): string {
        const { echoToken, roomStays, error } = params;
        const timeStamp = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');
        let body: any;

        if (error) {
            body = {
                Errors: {
                    Error: {
                        '@_Type': error.type,
                        ...(error.code !== undefined && { '@_Code': error.code }),
                        '#text': error.text,
                    },
                },
            };
        } else {
            body = {
                Success: '',
                RoomStays: {
                    RoomStay: roomStays.map(rs => ({
                        RoomTypes: {
                            RoomType: {
                                '@_RoomTypeCode': rs.roomTypeCode,
                                RoomDescription: {
                                    '@_Name': rs.roomTypeName,
                                },
                                Occupancy: {
                                    '@_AgeQualifyingCode': '10',
                                    '@_MaxOccupancy': rs.maxOccupancy,
                                },
                            },
                        },
                        RatePlans: {
                            RatePlan: {
                                '@_RatePlanCode': rs.ratePlanCode,
                                RatePlanDescription: {
                                    '@_Name': rs.ratePlanName,
                                },
                            },
                        },
                    })),
                },
            };
        }

        const envelope = {
            'SOAP-ENV:Envelope': {
                '@_xmlns:SOAP-ENV': 'http://schemas.xmlsoap.org/soap/envelope/',
                'SOAP-ENV:Header': '',
                'SOAP-ENV:Body': {
                    OTA_HotelAvailRS: {
                        '@_xmlns': 'http://www.opentravel.org/OTA/2003/05',
                        '@_EchoToken': echoToken,
                        '@_TimeStamp': timeStamp,
                        '@_Version': '1.0',  // ← fixed: was version (param)
                        ...body,
                    },
                },
            },
        };

        return `<?xml version="1.0" encoding="UTF-8"?>\n` + responseBuilder.build(envelope);  // ← fixed: was builder
    }

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

        return `<?xml version="1.0" encoding="UTF-8"?>` + responseBuilder.build(envelope);
    }
}