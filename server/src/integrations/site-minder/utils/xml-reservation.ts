// utils/site-minder-reservation-xml.builder.ts

import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { v4 as uuidv4 } from 'uuid';
import {
    SMReservationPushParams,
    SMReservationResult,
    SMService,
    SMDiscount,
} from '../types';

// ─── XML builder / parser instances ──────────────────────────────────────────

const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: false,
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalise any date value to YYYY-MM-DD string.
 */
function toDateString(date: string | Date): string {
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
    return String(date);
}

/**
 * Add one calendar day to a YYYY-MM-DD string.
 * Used to compute ExpireDate (exclusive end) for Rate elements.
 */
function nextDateString(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + 1);
    return toDateString(d);
}

/**
 * Format a number to 2 decimal places string.
 */
function fmt(n: number): string {
    return (Math.round(n * 100) / 100).toFixed(2);
}

// ─── Main builder class ───────────────────────────────────────────────────────

export class SiteMinderReservationXmlBuilder {

    // kept public so service layer can reuse if needed
    public static toDateString = toDateString;

    // ── Build the full SOAP request XML ──────────────────────────────────────

    public static buildReservationRequest(
        params: SMReservationPushParams,
        username: string,
        password: string
    ): string {
        const echoToken = uuidv4();
        const timeStamp = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');

        // ── RoomStay elements ─────────────────────────────────────────────────
        const roomStayElements = params.roomStays.map((rs, index) => {
            const rates = rs.roomRates?.rates ?? [];

            // Only include AmountBeforeTax on Rate/Base when it differs from AfterTax
            const rateElements = rates.map((rate) => {
                const hasTax =
                    rate.amountBeforeTax !== undefined &&
                    rate.amountBeforeTax !== rate.amountAfterTax;
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
            });

            // GuestCounts — include Age for children (AgeQualifyingCode=8) and infants (7)
            const guestCountElements = rs.guestCounts.map((gc) => ({
                '@_AgeQualifyingCode': String(gc.ageQualifyingCode),
                '@_Count': String(gc.count),
                ...(gc.age !== undefined && { '@_Age': String(gc.age) }),
            }));

            // RoomStay Total — only show BeforeTax when it differs from AfterTax
            const roomStayTotalBeforeTax = parseFloat(rs.totalAmountBeforeTax);
            const roomStayTotalAfterTax = parseFloat(rs.totalAmountAfterTax);
            const roomStayHasTax = Math.abs(roomStayTotalAfterTax - roomStayTotalBeforeTax) > 0.001;

            return {
                RoomTypes: {
                    RoomType: {
                        '@_RoomTypeCode': rs.roomTypeCode,
                        RoomDescription: {
                            '@_Name': rs.roomTypeName, // actual room name, not code
                        },
                    },
                },
                RatePlans: {
                    RatePlan: {
                        '@_RatePlanCode': rs.ratePlanCode,
                        RatePlanDescription: rs.ratePlanName, // actual plan name, not code
                    },
                },
                RoomRates: {
                    RoomRate: {
                        '@_RoomTypeCode': rs.roomTypeCode,
                        '@_RatePlanCode': rs.ratePlanCode,
                        '@_NumberOfUnits': '1',
                        Rates: {
                            Rate: rateElements,
                        },
                    },
                },
                GuestCounts: {
                    GuestCount: guestCountElements,
                },
                TimeSpan: {
                    '@_Start': rs.checkIn,
                    '@_End': rs.checkOut,
                },
                Total: {
                    ...(roomStayHasTax && { '@_AmountBeforeTax': rs.totalAmountBeforeTax }),
                    '@_AmountAfterTax': rs.totalAmountAfterTax,
                    '@_CurrencyCode': rs.currencyCode,
                },
                BasicPropertyInfo: {
                    '@_HotelCode': params.hotelCode,
                },
                // Link each room stay to its corresponding ResGuest
                ResGuestRPHs: {
                    ResGuestRPH: { '@_RPH': String(index + 1) },
                },
                // Comments on the RoomStay if provided
                ...(rs.comments && {
                    Comments: {
                        Comment: { Text: rs.comments },
                    },
                }),
                // Special requests if provided
                ...(rs.specialRequests && rs.specialRequests.length > 0 && {
                    SpecialRequests: {
                        SpecialRequest: rs.specialRequests.map((sr) => ({
                            '@_Name': sr.name,
                            Text: sr.text,
                        })),
                    },
                }),
            };
        });

        // ── ResGuest elements (one per room stay) ─────────────────────────────
        const allGuests = params.guestDetails ?? [];
        const { primaryGuest } = params;

        const resGuestElements = params.roomStays.map((_rs, index) => {
            const guest = allGuests[index];
            // Use per-room guest name if populated, otherwise fall back to primary guest
            const firstName =
                guest?.firstName?.trim() ? guest.firstName : primaryGuest.firstName;
            const lastName =
                guest?.lastName?.trim() ? guest.lastName : primaryGuest.lastName;
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
                                    ...(isPrimary &&
                                        primaryGuest.salutation && {
                                            NamePrefix: primaryGuest.salutation,
                                        }),
                                    GivenName: firstName,
                                    Surname: lastName,
                                },
                                // Phone + email only on the primary guest
                                ...(isPrimary &&
                                    primaryGuest.phone && {
                                        Telephone: {
                                            '@_PhoneNumber': primaryGuest.phone,
                                        },
                                    }),
                                ...(isPrimary &&
                                    primaryGuest.email && {
                                        Email: primaryGuest.email,
                                    }),
                            },
                        },
                    },
                },
            };
        });

        // ── Services (all at reservation level — no ServiceRPH link) ──────────
        //
        // Rules per SiteMinder docs:
        //   • @Inclusive must ALWAYS be "true"
        //   • @Quantity must always be "1" (does not affect totals)
        //   • Base = per-unit / per-night amount
        //   • Total = full amount across all nights / units
        //   • payLater services omit <ServiceDetails>/<TimeSpan>
        //   • consecutive-night addons use a date range; single-night uses same Start=End
        //   • ServiceInventoryCode = standardised code (OTHER for generic addons)

        const serviceElements = (params.services ?? []).map((svc: SMService) => {
            const baseAmt = fmt(svc.baseAmount);
            const totalAmt = fmt(svc.totalAmount);
            const currency = svc.currencyCode ?? params.currencyCode;

            return {
                '@_ServiceInventoryCode': svc.inventoryCode,
                '@_Inclusive': 'true',   // always true per SM docs
                '@_Quantity': '1',       // always 1 per SM docs
                Price: {
                    Base: {
                        '@_AmountBeforeTax': baseAmt,
                        '@_AmountAfterTax': baseAmt,
                        '@_CurrencyCode': currency,
                    },
                    Total: {
                        '@_AmountBeforeTax': totalAmt,
                        '@_AmountAfterTax': totalAmt,
                        '@_CurrencyCode': currency,
                    },
                    RateDescription: {
                        Text: svc.name,
                    },
                },
                // payLater services (e.g. tourism charge) have no TimeSpan
                ...(!svc.isPayLater &&
                    svc.startDate && {
                        ServiceDetails: {
                            TimeSpan: {
                                '@_Start': toDateString(svc.startDate),
                                // End = same as Start for single-night; range end for multi
                                '@_End': svc.endDate
                                    ? toDateString(svc.endDate)
                                    : toDateString(svc.startDate),
                            },
                        },
                    }),
            };
        });

        // ── ResGlobalInfo Comments (discounts explanation) ────────────────────
        //
        // Discounts are already baked into amountBeforeTax / totalAmountBeforeTax.
        // We do NOT send them as Services or reduce them separately.
        // We just add a human-readable Comment so the hotel sees why the total is lower.

        const discountComments = (params.discounts ?? [])
            .filter((d: SMDiscount) => d.amount > 0)
            .map((d: SMDiscount) => ({
                Text: `${d.name}: -${fmt(d.amount)} ${d.currencyCode}`,
            }));

        // ── ResGlobalInfo Total ───────────────────────────────────────────────
        //
        // AmountBeforeTax = amountBeforeTax  (rooms + addons - all decrease discounts)
        // AmountAfterTax  = currentChargeableAmount  (beforeTax + tax, no payLater)
        // payLater amounts are separate Services — NOT added here.

        const globalBeforeTax = parseFloat(params.totalAmountBeforeTax ?? '0');
        const globalAfterTax = parseFloat(params.totalAmountAfterTax);
        const globalHasTax = Math.abs(globalAfterTax - globalBeforeTax) > 0.001;

        const resGlobalInfoTotal = {
            '@_CurrencyCode': params.currencyCode,
            ...(globalHasTax && { '@_AmountBeforeTax': fmt(globalBeforeTax) }),
            '@_AmountAfterTax': fmt(globalAfterTax),
            TPA_Extensions: {
                Total: {
                    // false = totals do NOT include agent commission
                    '@_includesCommission': 'false',
                },
            },
        };

        // ── DepositPayments — only for PREPAY (online paid) ───────────────────
        //
        // PAY_AT_HOTEL: omit entirely (no Guarantee, no DepositPayments).
        // PREPAY: send DepositPayments with currentChargeableAmount (= totalAmountAfterTax).
        // We don't have card details (handled by payment gateway), so no PaymentCard.

        const depositPayments =
            params.paymentMethod === 'PREPAY'
                ? {
                      GuaranteePayment: {
                          AmountPercent: {
                              '@_Amount': fmt(globalAfterTax),
                              '@_CurrencyCode': params.currencyCode,
                          },
                      },
                  }
                : null;

        // ── Customer profile in ResGlobalInfo ────────────────────────────────
        const customerProfile = {
            ProfileInfo: {
                Profile: {
                    '@_ProfileType': '1',
                    Customer: {
                        PersonName: {
                            ...(primaryGuest.salutation && {
                                NamePrefix: primaryGuest.salutation,
                            }),
                            GivenName: primaryGuest.firstName,
                            Surname: primaryGuest.lastName,
                        },
                        ...(primaryGuest.phone && {
                            Telephone: { '@_PhoneNumber': primaryGuest.phone },
                        }),
                        ...(primaryGuest.email && { Email: primaryGuest.email }),
                        ...(primaryGuest.address && {
                            Address: {
                                ...(primaryGuest.address.line1 && {
                                    AddressLine: primaryGuest.address.line1,
                                }),
                                ...(primaryGuest.address.city && {
                                    CityName: primaryGuest.address.city,
                                }),
                                ...(primaryGuest.address.postalCode && {
                                    PostalCode: primaryGuest.address.postalCode,
                                }),
                                ...(primaryGuest.address.state && {
                                    StateProv: primaryGuest.address.state,
                                }),
                                ...(primaryGuest.address.country && {
                                    CountryName: primaryGuest.address.country,
                                }),
                            },
                        }),
                    },
                },
            },
        };

        // ── Assemble full envelope ────────────────────────────────────────────

        const envelope = {
            'SOAP-ENV:Envelope': {
                '@_xmlns:SOAP-ENV': 'http://schemas.xmlsoap.org/soap/envelope/',
                'SOAP-ENV:Header': {
                    'wsse:Security': {
                        '@_SOAP-ENV:mustUnderstand': '1',
                        '@_xmlns:wsse':
                            'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd',
                        'wsse:UsernameToken': {
                            'wsse:Username': username,
                            'wsse:Password': {
                                '@_Type':
                                    'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText',
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
                                    // SM requires alphanumeric only — strip hyphens
                                    '@_ID': params.bookingCode.replace(/-/g, ''),
                                },

                                RoomStays: {
                                    RoomStay: roomStayElements,
                                },

                                // Services — only rendered when there are entries
                                ...(serviceElements.length > 0 && {
                                    Services: {
                                        Service: serviceElements,
                                    },
                                }),

                                ResGuests: {
                                    ResGuest: resGuestElements,
                                },

                                ResGlobalInfo: {
                                    HotelReservationIDs: {
                                        HotelReservationID: {
                                            '@_ResID_Type': '14',
                                            '@_ResID_Value': params.bookingCode.replace(/-/g, ''),
                                        },
                                    },

                                    // Discount comments — rendered only when discounts exist
                                    ...(discountComments.length > 0 && {
                                        Comments: {
                                            Comment: discountComments,
                                        },
                                    }),

                                    Total: resGlobalInfoTotal,

                                    // DepositPayments — only for PREPAY
                                    ...(depositPayments && {
                                        DepositPayments: depositPayments,
                                    }),

                                    // Customer profile
                                    Profiles: {
                                        ProfileInfo: customerProfile.ProfileInfo,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        };

        return builder.build(envelope);
    }

    // ── Parse SiteMinder response ─────────────────────────────────────────────

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
                    const faultMsg =
                        fault?.faultstring?.['#text'] ??
                        fault?.faultstring ??
                        'SOAP Fault received';
                    return { success: false, message: String(faultMsg) };
                }
                return {
                    success: false,
                    message: 'Invalid response from SiteMinder',
                };
            }

            if (rs.Success !== undefined) {
                const siteMinderResId =
                    rs?.HotelReservations?.HotelReservation?.ResGlobalInfo
                        ?.HotelReservationIDs?.HotelReservationID?.[
                        '@_ResID_Value'
                    ];
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
                : (extractText(errors) ?? 'Unknown error from SiteMinder');

            return { success: false, message: errorText };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to parse SiteMinder response: ${error?.message}`,
            };
        }
    }
}