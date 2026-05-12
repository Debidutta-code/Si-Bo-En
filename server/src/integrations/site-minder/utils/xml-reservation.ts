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
    unpairedTags: [],
    processEntities: false,
    suppressBooleanAttributes: false,
});

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
    parseAttributeValue: true,
    trimValues: true,
});

export class SiteMinderReservationXmlBuilder {

    public static toDateString(date: string | Date): string {
        if (date instanceof Date) {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        if (/^\d{4}-\d{2}-\d{2}/.test(date)) return date.split('T')[0];
        const parsed = new Date(date);
        if (!isNaN(parsed.getTime())) {
            const y = parsed.getFullYear();
            const m = String(parsed.getMonth() + 1).padStart(2, '0');
            const d = String(parsed.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        return date;
    }

    public static buildReservationRequest(
        params: SMReservationPushParams,
        username: string,
        password: string
    ): string {
        const echoToken = uuidv4();
        const timeStamp = new Date().toISOString();

        // ── Room Stays ────────────────────────────────────────────────────────
        const roomStayElements = params.roomStays.map((rs, index) => {
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
                    // ✅ each room points to its own guest RPH
                    ResGuestRPH: { '@_RPH': String(index + 1) },
                },
            };
        });

        // ── Guest Profiles ────────────────────────────────────────────────────
        const { primaryGuest } = params;
        const allGuests = params.guestDetails ?? [];

        const resGuestElements = params.roomStays.map((_rs, index) => {
            const guest = allGuests[index];
            // ✅ use guest name if filled, else fall back to primary guest name
            const firstName = guest?.firstName?.trim() ? guest.firstName : primaryGuest.firstName;
            const lastName = guest?.lastName?.trim() ? guest.lastName : primaryGuest.lastName;
            const isPrimary = index === 0;

            return {
                '@_ResGuestRPH': String(index + 1),
                '@_PrimaryIndicator': isPrimary ? '1' : '0',
                Profiles: {
                    ProfileInfo: {
                        Profile: {
                            '@_ProfileType': '1',
                            Customer: {
                                PersonName: {
                                    ...(isPrimary && primaryGuest.salutation && {
                                        NamePrefix: primaryGuest.salutation,
                                    }),
                                    GivenName: firstName,
                                    Surname: lastName,
                                },
                                // ✅ phone and email only on primary guest
                                ...(isPrimary && primaryGuest.phone && {
                                    Telephone: { '@_PhoneNumber': primaryGuest.phone },
                                }),
                                ...(isPrimary && primaryGuest.email && {
                                    Email: primaryGuest.email,
                                }),
                            },
                        },
                    },
                },
            };
        });

        // ── Services (Addons + PayLater e.g. Tourist fee) ─────────────────────
        const addonBrakeDown = params.addonBrakeDown ?? [];
        const payLaterBrakeDown = params.payLaterBrakeDown ?? [];

        const buildServiceElement = (item: any, isPayLater: boolean) => ({
            '@_ServiceInventoryCode': item.name,
            '@_Inclusive': isPayLater ? 'false' : 'true',
            ...(!isPayLater && { '@_Quantity': String(item.quantity ?? 1) }),
            Price: {
                Base: {
                    '@_AmountBeforeTax': Number(item.amount).toFixed(2),
                    '@_AmountAfterTax': Number(item.amount).toFixed(2),
                    '@_CurrencyCode': item.currencyCode ?? params.currencyCode,
                },
                Total: {
                    '@_AmountBeforeTax': Number(item.totalAmount).toFixed(2),
                    '@_AmountAfterTax': Number(item.totalAmount).toFixed(2),
                    '@_CurrencyCode': item.currencyCode ?? params.currencyCode,
                },
                RateDescription: {
                    Text: item.name,
                },
            },
            ...(!isPayLater && {
                ServiceDetails: {
                    TimeSpan: {
                        '@_Start': SiteMinderReservationXmlBuilder.toDateString(item.date),
                        '@_End': SiteMinderReservationXmlBuilder.toDateString(item.date),
                    },
                },
            }),
        });

        const allServiceElements = [
            ...addonBrakeDown.map((a: any) => buildServiceElement(a, false)),
            ...payLaterBrakeDown.map((p: any) => buildServiceElement(p, true)),
        ];

        const serviceElements = allServiceElements.length > 0 ? allServiceElements : null;

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
                                    // ✅ now an array, one per room
                                    ResGuest: resGuestElements,
                                },
                                ...(serviceElements && {
                                    Services: {
                                        Service: serviceElements,
                                    },
                                }),
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
                    const faultMsg = fault?.faultstring?.['#text']
                        ?? fault?.faultstring
                        ?? 'SOAP Fault received';
                    return { success: false, message: faultMsg };
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
            const extractText = (e: any): string => {
                if (typeof e === 'string') return e;
                if (typeof e === 'number') return String(e);
                return e?.['#text'] ?? e?.['_'] ?? JSON.stringify(e);
            };

            const errorText = Array.isArray(errors)
                ? errors.map(extractText).join(', ')
                : extractText(errors) ?? 'Unknown error from SiteMinder';

            return { success: false, message: errorText };

        } catch (error: any) {
            return {
                success: false,
                message: `Failed to parse SiteMinder response: ${error?.message}`,
            };
        }
    }
}