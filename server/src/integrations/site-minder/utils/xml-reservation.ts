// utils/site-minder-reservation-xml.builder.ts

import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { v4 as uuidv4 } from 'uuid';
import { SMReservationPushParams, SMReservationResult } from '../types';

const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
    suppressEmptyNode: false,
    attributeValueProcessor: (_name: string, val: unknown) => String(val),
});

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
    parseAttributeValue: true,
    trimValues: true,
});

export class SiteMinderReservationXmlBuilder {

    public static buildReservationRequest(
        params: SMReservationPushParams,
        username: string,
        password: string
    ): string {
        const echoToken = uuidv4();
        const timeStamp = new Date().toISOString();

        // ── Room Stays ────────────────────────────────────────────────────────
        const roomStayElements = params.roomStays.map((rs) => {
            const roomRatesObj = Array.isArray(rs.roomRates) ? rs.roomRates[0] : rs.roomRates;
            const rates = roomRatesObj?.rates ?? [];

            return {
                RoomTypes: {
                    RoomType: {
                        '@_RoomTypeCode': rs.roomTypeCode,
                        RoomDescription: {
                            '@_Name': rs.roomTypeName,
                        },
                    },
                },
                RatePlans: {
                    RatePlan: {
                        '@_RatePlanCode': rs.ratePlanCode,
                        RatePlanDescription: rs.ratePlanName,
                    },
                },
                RoomRates: {
                    RoomRate: {
                        '@_RoomTypeCode': rs.roomTypeCode,
                        '@_RatePlanCode': rs.ratePlanCode,
                        '@_NumberOfUnits': '1',
                        Rates: {
                            Rate: rates.map((rate: any) => {
                                const hasTax = rate.amountBeforeTax !== undefined
                                    && rate.amountBeforeTax !== rate.amountAfterTax;
                                return {
                                    '@_UnitMultiplier': '1',
                                    '@_RateTimeUnit': 'Day',
                                    '@_EffectiveDate': rate.effectiveDate,
                                    '@_ExpireDate': rate.expireDate,
                                    Base: {
                                        ...(hasTax && { '@_AmountBeforeTax': rate.amountBeforeTax }),
                                        '@_AmountAfterTax': rate.amountAfterTax,
                                        '@_CurrencyCode': rate.currencyCode,
                                    },
                                };
                            }),
                        },
                    },
                },
                GuestCounts: {
                    GuestCount: rs.guestCounts.map((gc: any) => ({
                        '@_AgeQualifyingCode': String(gc.ageQualifyingCode),
                        '@_Count': String(gc.count),
                        ...(gc.age !== undefined && { '@_Age': String(gc.age) }),
                    })),
                },
                TimeSpan: {
                    '@_Start': rs.checkIn,
                    '@_End': rs.checkOut,
                },
                Total: {
                    ...(rs.totalAmountBeforeTax !== rs.totalAmountAfterTax && {
                        '@_AmountBeforeTax': rs.totalAmountBeforeTax,
                    }),
                    '@_AmountAfterTax': rs.totalAmountAfterTax,
                    '@_CurrencyCode': rs.currencyCode,
                },
                BasicPropertyInfo: {
                    '@_HotelCode': params.hotelCode,
                },
                ResGuestRPHs: {
                    ResGuestRPH: { '@_RPH': '1' },
                },
            };
        });

        // ── Guest Profile ─────────────────────────────────────────────────────
        const { primaryGuest } = params;
        const resGuestElement = {
            '@_ResGuestRPH': '1',
            '@_PrimaryIndicator': '1',
            Profiles: {
                ProfileInfo: {
                    Profile: {
                        '@_ProfileType': '1',
                        Customer: {
                            PersonName: {
                                ...(primaryGuest.salutation && { NamePrefix: primaryGuest.salutation }),
                                GivenName: primaryGuest.firstName,
                                Surname: primaryGuest.lastName,
                            },
                            ...(primaryGuest.phone && {
                                Telephone: { '@_PhoneNumber': primaryGuest.phone },
                            }),
                            ...(primaryGuest.email && {
                                Email: primaryGuest.email,
                            }),
                        },
                    },
                },
            },
        };

        // ── ResGlobalInfo Total ───────────────────────────────────────────────
        const resGlobalInfoTotal = {
            '@_CurrencyCode': params.currencyCode,
            ...(params.totalAmountBeforeTax !== params.totalAmountAfterTax && {
                '@_AmountBeforeTax': params.totalAmountBeforeTax,
            }),
            '@_AmountAfterTax': params.totalAmountAfterTax,
            TPA_Extensions: {
                Total: {
                    '@_includesCommission': params.paymentMethod === 'PREPAY' ? 'true' : 'false',
                },
            },
        };

        // ── Full Envelope ─────────────────────────────────────────────────────
        const envelope = {
            'SOAP-ENV:Envelope': {
                '@_xmlns:SOAP-ENV': 'http://schemas.xmlsoap.org/soap/envelope/',
                'SOAP-ENV:Header': {
                    'wsse:Security': {
                        '@_SOAP-ENV:mustUnderstand': '1',
                        '@_xmlns:wsse': 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd',
                        'wsse:UsernameToken': {
                            'wsse:Username': username,
                            'wsse:Password': {
                                '@_Type': 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText',
                                '#text': password,
                            },
                        },
                    },
                },
                'SOAP-ENV:Body': {
                    OTA_HotelResNotifRQ: {
                        '@_xmlns': 'http://www.opentravel.org/OTA/2003/05',
                        '@_ResStatus': params.resStatus,
                        '@_EchoToken': echoToken,
                        '@_TimeStamp': timeStamp,
                        '@_Version': '1.0',
                        POS: {
                            Source: {
                                RequestorID: {
                                    '@_Type': '22',
                                    '@_ID': params.channelCode,
                                },
                                BookingChannel: {
                                    '@_Primary': 'true',
                                    CompanyName: {
                                        '@_Code': params.channelCode,
                                        '#text': params.channelName,
                                    },
                                },
                            },
                        },
                        HotelReservations: {
                            HotelReservation: {
                                '@_CreateDateTime': params.createDateTime,
                                ...(params.lastModifyDateTime && {
                                    '@_LastModifyDateTime': params.lastModifyDateTime,
                                }),
                                UniqueID: {
                                    '@_Type': '14',
                                    '@_ID': params.bookingCode.replace(/-/g, ''),
                                },
                                RoomStays: {
                                    RoomStay: roomStayElements,
                                },
                                ResGuests: {
                                    ResGuest: resGuestElement,
                                },
                                ResGlobalInfo: {
                                    HotelReservationIDs: {
                                        HotelReservationID: {
                                            '@_ResID_Type': '14',
                                            '@_ResID_Value': params.bookingCode.replace(/-/g, ''),
                                        },
                                    },
                                    Total: resGlobalInfoTotal,
                                },
                            },
                        },
                    },
                },
            },
        };

        return `<?xml version="1.0" encoding="UTF-8"?>\n` + builder.build(envelope);
    }

    public static parseReservationResponse(
        rawXml: string,
        bookingCode: string
    ): SMReservationResult {
        try {
            const parsed = parser.parse(rawXml);
            const rs = parsed?.Envelope?.Body?.OTA_HotelResNotifRS;

            if (!rs) {
                const fault = parsed?.Envelope?.Body?.Fault;
                if (fault) {
                    return {
                        success: false,
                        message: fault?.faultstring ?? 'SOAP Fault received',
                    };
                }
                return { success: false, message: 'Invalid response from SiteMinder' };
            }

            if (rs.Success !== undefined) {
                const siteMinderResId =
                    rs?.HotelReservations?.HotelReservation
                        ?.ResGlobalInfo?.HotelReservationIDs
                        ?.HotelReservationID?.['@_ResID_Value'];

                return {
                    success: true,
                    siteMinderResId,
                    message: 'Reservation pushed to SiteMinder successfully',
                };
            }

            const errors = rs?.Errors?.Error;
            const errorText = Array.isArray(errors)
                ? errors.map((e: any) => e['#text'] ?? e).join(', ')
                : errors?.['#text'] ?? errors ?? 'Unknown error';

            return { success: false, message: errorText };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to parse SiteMinder response: ${error?.message}`,
            };
        }
    }
}