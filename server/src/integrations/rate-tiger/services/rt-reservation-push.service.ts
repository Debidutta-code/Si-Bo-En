// services/rt-reservation-push.service.ts

import axios from 'axios';
import {
    RTCommitModifyPayload,
    RTCancelPayload,
    RTReservationPayload,
    RTReservationResponse,
    RTReservationSuccessResponse,
    RTGuestDetail,
    RTService,
    IncomingBookingPayload,
    ExistingReservation,
    RTUpdatePayload,
    PAYMENT_TO_GUARANTEE_MAP,
    PaymentMethodType,
    RTDynamicConfig,
} from '../types';
import { config } from '../../../config';

// ─── Token Cache ──────────────────────────────────────────────────────────────

interface CachedToken {
    token: string;
    expiresAt: Date;
}

const tokenCacheMap = new Map<string, CachedToken>();

// ─── Service ──────────────────────────────────────────────────────────────────

export class RTReservationPushService {
    // ── 1. Auth ───────────────────────────────────────────────────────────────

    private static async getAuthToken(
        rtConfig: RTDynamicConfig
    ): Promise<string> {
        const cached = tokenCacheMap.get(rtConfig.authUrl);
        if (cached && cached.expiresAt > new Date(Date.now() + 5 * 60 * 1000)) {
            return cached.token;
        }
        // console.log("rtConfig",rtConfig)
        const credentials = Buffer.from(
            `${config.rateTigerUsername}:${config.rateTigerPassword}`
        ).toString('base64');

        const response = await axios.post(
            rtConfig.authUrl, // ← DB URL
            {
                'API-Key': config.rateTigerApiKey,
                partner_id: config.rateTigerPartnerId,
            },
            {
                headers: {
                    BasicAuth: `Basic ${credentials}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            }
        );
        // console.log('RT Auth response:', response.data);
        const { access_token, expires_in } = response.data;

        tokenCacheMap.set(rtConfig.authUrl, {
            token: access_token,
            expiresAt: new Date(expires_in),
        });

        return access_token;
    }

    // ── 2. Core Push ──────────────────────────────────────────────────────────

    private static async pushToRT(
        payload: RTReservationPayload,
        rtConfig: RTDynamicConfig
    ): Promise<RTReservationResponse> {
        console.log('RT Commit payload:', JSON.stringify(payload, null, 2));
        const makeRequest = async (token: string) =>
            axios.post(rtConfig.reservationUrl, payload, {
                // ← DB URL
                headers: {
                    Authorization: `Bearer ${token}`,
                    'API-Key': config.rateTigerApiKey,
                    'Content-Type': 'application/json',
                },
                timeout: 15000,
            });

        try {
            const token = await RTReservationPushService.getAuthToken(rtConfig);
            const response = await makeRequest(token);
            return response.data as RTReservationResponse;
        } catch (error: any) {
            if (error?.response?.status === 401) {
                tokenCacheMap.delete(rtConfig.authUrl); // ← clear only this property
                const freshToken =
                    await RTReservationPushService.getAuthToken(rtConfig);
                const response = await makeRequest(freshToken);
                return response.data as RTReservationResponse;
            }
            console.log(error);
            throw new Error(
                `RT push failed: ${error?.response?.data?.error?.text ?? error?.message}`
            );
        }
    }
    // ── 3. Response Handler ───────────────────────────────────────────────────

    private static handleRTResponse(response: RTReservationResponse): {
        success: boolean;
        message: string;
    } {
        if ('status' in response && response.status === 'Error') {
            return {
                success: false,
                message: response.error.text ?? 'RT returned an error',
            };
        }

        if ('hotelReservation' in response) {
            const { success, error } = (
                response as RTReservationSuccessResponse
            ).hotelReservation;

            if (success === 'true') {
                return { success: true, message: 'Pushed to RT successfully' };
            }

            return {
                success: false,
                message: error?.errorCode ?? 'RT push returned success: false',
            };
        }

        return { success: false, message: 'Unknown RT response format' };
    }

    // ── 4. Date Helper ────────────────────────────────────────────────────────

    private static toDateString(date: string | Date): string {
        if (date instanceof Date) {
            // ✅ Use local date parts to avoid UTC shift
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }

        // Already YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
            return date.split('T')[0];
        }

        // Human-readable like "Fri Mar 13 2026"
        const parsed = new Date(date);
        if (!isNaN(parsed.getTime())) {
            // ✅ Use local date parts here too
            const y = parsed.getFullYear();
            const m = String(parsed.getMonth() + 1).padStart(2, '0');
            const d = String(parsed.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }

        return date;
    }
    // ── Commit ────────────────────────────────────────────────────────────────

    public static async pushCommit(
        incomingPayload: IncomingBookingPayload,
        bookingCode: string,
        rtConfig: RTDynamicConfig
    ): Promise<{ success: boolean; message: string }> {
        try {
            const { bookingDetails, guestDetails } = incomingPayload;
            const { finalPrice } = bookingDetails;

            const roomsArray = bookingDetails.guests.roomsArray ?? [];
            const numberOfRooms = bookingDetails.numberOfRooms;

            // ── FIX 1: Use baseRatePerNight (room-only, per room) not totalAmount ──
            // totalAmount includes addons. baseRatePerNight is pure room rate per room.
            const roomRatePerRoom = finalPrice.baseRatePerNight; // e.g. 57.2 for type3
            const totalTaxPerRoom =
                (finalPrice.taxedAmount ?? 0) / numberOfRooms;

            // ── Rates: use baseRate from dailyBreakdown (already per-room) ──
            const ratesPerRoom = finalPrice.dailyBreakdown.map((day, index) => {
                // effectiveDate = this day
                const effectiveDate = RTReservationPushService.toDateString(
                    day.date
                );

                // expireDate = next day (effectiveDate + 1 day)
                const effective = new Date(day.date);
                effective.setDate(effective.getDate() + 1);
                const expireDate =
                    RTReservationPushService.toDateString(effective);

                return {
                    effectiveDate,
                    expireDate, // ✅ always effectiveDate + 1 day
                    currencyCode: day.currencyCode ?? bookingDetails.currency,
                    amountAfterTax: (day.baseRate ?? roomRatePerRoom).toFixed(
                        2
                    ),
                };
            });

            // ── Primary guest ──
            const primaryGuest = guestDetails[0];
            const primaryRTGuest: RTGuestDetail | null = primaryGuest
                ? {
                      guestID: '1',
                      profileType: '1',
                      personName: {
                          salutation: primaryGuest.salutation ?? '',
                          firstName: primaryGuest.firstName,
                          middleName: '',
                          surName: primaryGuest.lastName,
                      },
                      telePhone: {
                          phoneNo: bookingDetails.phone ?? '',
                          phoneTechType: '1',
                          locationType: '7',
                      },
                      email: bookingDetails.email,
                      address: {
                          addressType: '1',
                          addressLine: '',
                          city: '',
                          postalCode: '',
                          state: '',
                          countryCode: incomingPayload.countryCode ?? 'IN',
                      },
                  }
                : null;

            // ── FIX 2: roomStays use per-room rate only (not total/numberOfRooms) ──
            const buildRoomStay = (
                room: { adults: number; children: number },
                index: number
            ) => ({
                roomStayID: (index + 1).toString(),
                mealPlanIndicator: '0',
                isGuestPerRoom: '1',
                guestCount: [
                    ...(room.adults > 0
                        ? [
                              {
                                  ageQualifyingCode: '10' as const,
                                  count: room.adults.toString(),
                              },
                          ]
                        : []),
                    ...(room.children > 0
                        ? [
                              {
                                  ageQualifyingCode: '8' as const,
                                  count: room.children.toString(),
                              },
                          ]
                        : []),
                ],
                roomRates: [
                    {
                        invCode: bookingDetails.roomTypeCode,
                        ratePlanCode: bookingDetails.ratePlanCode,
                        numberOfUnits: '1',
                        rates: ratesPerRoom,
                    },
                ],
                timeSpan: {
                    start: RTReservationPushService.toDateString(
                        bookingDetails.startDate
                    ),
                    end: RTReservationPushService.toDateString(
                        bookingDetails.endDate
                    ),
                },
                totalPrice: {
                    // ✅ Room-only amount per room — no addons included
                    amountAfterTax: (roomRatePerRoom + totalTaxPerRoom).toFixed(
                        2
                    ),
                    taxAmount: totalTaxPerRoom.toFixed(2),
                },
                guestIDs: ['1'],
                comments: [{ text: '', guestViewable: '1' }],
                specialRequests: [{ requestCode: '', text: '' }],
            });

            const roomStays =
                roomsArray.length > 0
                    ? roomsArray.map((room: any, index: number) =>
                          buildRoomStay(room, index)
                      )
                    : [
                          // Fallback: no roomsArray — build from guests totals
                          buildRoomStay(
                              {
                                  adults: bookingDetails.guests.adults,
                                  children: bookingDetails.guests.children,
                              },
                              0
                          ),
                      ];

            // ── FIX 3: services — read addonCode from selectedAddons directly ──
            // normalizePayload rebuilds selectedAddons from addonBrakeDown which loses addonCode.
            // So read from the ORIGINAL bookingDetails.selectedAddons instead.
            const originalAddons = bookingDetails.selectedAddons ?? [];
            const services: RTService[] = originalAddons
                .filter((addon: any) => addon.addonCode) // skip if no code
                .map((addon: any, index: number) => ({
                    serviceID: (index + 1).toString(),
                    serviceCode: addon.addonCode, // ✅ "1479GJ"
                    units: addon.quantity.toString(),
                    amountBeforeTax: addon.price.toFixed(2),
                    amountAfterTax: addon.totalPrice.toFixed(2),
                    isInclusive: 'false',
                    effectiveDate: RTReservationPushService.toDateString(
                        addon.date
                    ),
                    serviceDescription: addon.addonName,
                }));

            const guarantee = PAYMENT_TO_GUARANTEE_MAP[
                bookingDetails.paymentMethod as PaymentMethodType
            ] ?? { guaranteeType: 'None' as const };

            const payload: RTCommitModifyPayload = {
                hotelReservation: {
                    hotelCode: rtConfig.rateTigerPropertyCode,
                    resStatus: 'Commit',
                    createDateTime: new Date().toISOString(),
                    creatorID: config.rateTtigerPartnerName ?? 'REVCHILL',
                    timeStamp: new Date().toISOString(),
                    pos: {
                        channelCode:
                            rtConfig.partnerId ||
                            config.rateTigerPartnerId ||
                            '',
                        channelName:
                            rtConfig.partnerName ||
                            config.rateTtigerPartnerName ||
                            'Revchill',
                    },
                    currency: bookingDetails.currency,
                    uniqueID: { type: '14', idValue: bookingCode },
                    guarantee,
                    roomStays,
                    guestDetails: primaryRTGuest ? [primaryRTGuest] : [],
                    ...(services.length > 0 && { services }),
                    resGlobalInfo: {
                        hotelReservationIDs: [
                            { resIDType: '14', resIDValue: bookingCode },
                        ],
                    },
                },
            };
            console.log('payload', payload);

            const response = await RTReservationPushService.pushToRT(
                payload,
                rtConfig
            );
            console.log(
                'RT Commit response:',
                JSON.stringify(response, null, 2)
            );
            return RTReservationPushService.handleRTResponse(response);
        } catch (error: any) {
            console.log('RT Commit error:', error);
            return {
                success: false,
                message: error?.message ?? 'Unknown error in pushCommit',
            };
        }
    }

    // ── Modify ────────────────────────────────────────────────────────────────

    public static async pushModify(
        existingReservation: ExistingReservation,
        updatePayload: RTUpdatePayload,
        rtConfig: RTDynamicConfig // ← ADD
    ): Promise<{ success: boolean; message: string }> {
        try {
            const guests = Array.isArray(existingReservation.guests)
                ? existingReservation.guests
                : [];

            const checkInStr = RTReservationPushService.toDateString(
                updatePayload.checkInDate
            );
            const checkOutStr = RTReservationPushService.toDateString(
                updatePayload.checkOutDate
            );

            // 1. Try roomsArray from stored finalPrice
            const storedRoomsArray =
                existingReservation.finalPrice?.roomsArray ?? [];
            const numberOfRooms =
                existingReservation.finalPrice?.requestedRooms ?? 1;
            const totalTax = updatePayload.finalPrice?.totalTax ?? 0;

            // 2. Primary guest only
            const primaryGuest = guests[0];
            const primaryRTGuest: RTGuestDetail | null = primaryGuest
                ? {
                      guestID: '1',
                      profileType: '1',
                      personName: {
                          salutation: primaryGuest.salutation ?? '',
                          firstName: primaryGuest.firstName,
                          middleName: '',
                          surName: primaryGuest.lastName,
                      },
                      telePhone: {
                          phoneNo: existingReservation.bookingUserPhone ?? '',
                          phoneTechType: '1',
                          locationType: '7',
                      },
                      email: existingReservation.bookingUserEmail ?? '',
                      address: {
                          addressType: '1',
                          addressLine: '',
                          city: '',
                          postalCode: '',
                          state: '',
                          countryCode: existingReservation.countryCode ?? 'IN',
                      },
                  }
                : null;

            // 3. Build roomStays — per room if roomsArray stored, fallback if not
            const roomStays =
                storedRoomsArray.length > 0
                    ? storedRoomsArray.map(
                          (
                              room: { adults: number; children: number },
                              index: number
                          ) => ({
                              roomStayID: (index + 1).toString(),
                              mealPlanIndicator: '0',
                              isGuestPerRoom: '1',
                              guestCount: [
                                  ...(room.adults > 0
                                      ? [
                                            {
                                                ageQualifyingCode:
                                                    '10' as const,
                                                count: room.adults.toString(),
                                            },
                                        ]
                                      : []),
                                  ...(room.children > 0
                                      ? [
                                            {
                                                ageQualifyingCode: '8' as const,
                                                count: room.children.toString(),
                                            },
                                        ]
                                      : []),
                              ],
                              roomRates: [
                                  {
                                      invCode:
                                          existingReservation.roomTypeCode ??
                                          '',
                                      ratePlanCode:
                                          existingReservation.ratePlanCode ??
                                          '',
                                      numberOfUnits: '1',
                                      rates: [
                                          {
                                              effectiveDate: checkInStr,
                                              expireDate: checkOutStr,
                                              currencyCode:
                                                  existingReservation.currencyCode,
                                              amountAfterTax: (
                                                  updatePayload.amount /
                                                  numberOfRooms
                                              ).toFixed(2),
                                          },
                                      ],
                                  },
                              ],
                              timeSpan: {
                                  start: checkInStr,
                                  end: checkOutStr,
                              },
                              totalPrice: {
                                  amountAfterTax: (
                                      updatePayload.amount / numberOfRooms
                                  ).toFixed(2),
                                  taxAmount: (totalTax / numberOfRooms).toFixed(
                                      2
                                  ),
                              },
                              guestIDs: ['1'],
                              comments: [{ text: '', guestViewable: '1' }],
                              specialRequests: [{ requestCode: '', text: '' }],
                          })
                      )
                    : [
                          // Fallback — single roomStay with totals
                          {
                              roomStayID: '1',
                              mealPlanIndicator: '0',
                              isGuestPerRoom: '0',
                              guestCount: [
                                  {
                                      ageQualifyingCode: '10' as const,
                                      count: guests
                                          .filter(g => g.type === 'adult')
                                          .length.toString(),
                                  },
                                  ...(guests.filter(g => g.type === 'child')
                                      .length > 0
                                      ? [
                                            {
                                                ageQualifyingCode: '8' as const,
                                                count: guests
                                                    .filter(
                                                        g => g.type === 'child'
                                                    )
                                                    .length.toString(),
                                            },
                                        ]
                                      : []),
                              ],
                              roomRates: [
                                  {
                                      invCode:
                                          existingReservation.roomTypeCode ??
                                          '',
                                      ratePlanCode:
                                          existingReservation.ratePlanCode ??
                                          '',
                                      numberOfUnits: numberOfRooms.toString(),
                                      rates: [
                                          {
                                              effectiveDate: checkInStr,
                                              expireDate: checkOutStr,
                                              currencyCode:
                                                  existingReservation.currencyCode,
                                              amountAfterTax:
                                                  updatePayload.amount.toFixed(
                                                      2
                                                  ),
                                          },
                                      ],
                                  },
                              ],
                              timeSpan: {
                                  start: checkInStr,
                                  end: checkOutStr,
                              },
                              totalPrice: {
                                  amountAfterTax:
                                      updatePayload.amount.toFixed(2),
                                  taxAmount: totalTax.toFixed(2),
                              },
                              guestIDs: ['1'],
                              comments: [{ text: '', guestViewable: '1' }],
                              specialRequests: [{ requestCode: '', text: '' }],
                          },
                      ];

            const payload: RTCommitModifyPayload = {
                hotelReservation: {
                    hotelCode: rtConfig.rateTigerPropertyCode,
                    resStatus: 'Modify',
                    createDateTime: existingReservation.bookedAt.toISOString(),
                    lastModifiedDateTime: new Date().toISOString(),
                    creatorID: config.rateTtigerPartnerName ?? 'REVCHILL',
                    timeStamp: new Date().toISOString(),
                    pos: {
                        channelCode:
                            rtConfig.partnerId ||
                            config.rateTigerPartnerId ||
                            '',
                        channelName:
                            rtConfig.partnerName ||
                            config.rateTtigerPartnerName ||
                            'Revchill',
                    },
                    currency: existingReservation.currencyCode,
                    uniqueID: {
                        type: '14',
                        idValue: existingReservation.bookingCode,
                    },
                    roomStays,
                    guestDetails: primaryRTGuest ? [primaryRTGuest] : [],
                    resGlobalInfo: {
                        hotelReservationIDs: [
                            {
                                resIDType: '14',
                                resIDValue: existingReservation.bookingCode,
                            },
                        ],
                    },
                },
            };

            const response = await RTReservationPushService.pushToRT(
                payload,
                rtConfig
            );
            console.log(
                'RT Modify response:',
                JSON.stringify(response, null, 2)
            );
            return RTReservationPushService.handleRTResponse(response);
        } catch (error: any) {
            console.log('RT Modify error:', error);
            return {
                success: false,
                message: error?.message ?? 'Unknown error in pushModify',
            };
        }
    }

    // ── Cancel ────────────────────────────────────────────────────────────────

    public static async pushCancel(
        existingReservation: ExistingReservation,
        rtConfig: RTDynamicConfig // ← ADD
    ): Promise<{ success: boolean; message: string }> {
        try {
            const payload: RTCancelPayload = {
                hotelReservation: {
                    hotelCode: rtConfig.rateTigerPropertyCode,
                    resStatus: 'Cancel',
                    createDateTime: existingReservation.bookedAt.toISOString(),
                    lastModifiedDateTime: new Date().toISOString(),
                    creatorID: config.rateTtigerPartnerName ?? 'REVCHILL',
                    timeStamp: new Date().toISOString(),
                    pos: {
                        channelCode:
                            rtConfig.partnerId ||
                            config.rateTigerPartnerId ||
                            '',
                        channelName:
                            rtConfig.partnerName ||
                            config.rateTtigerPartnerName ||
                            'Revchill',
                    },
                    uniqueID: {
                        type: '14',
                        idValue: existingReservation.bookingCode,
                    },
                    resGlobalInfo: {
                        resIDType: '15',
                        resIDValue: existingReservation.bookingCode,
                    },
                },
            };

            const response = await RTReservationPushService.pushToRT(
                payload,
                rtConfig
            );
            console.log(
                'RT Cancel response:',
                JSON.stringify(response, null, 2)
            );
            return RTReservationPushService.handleRTResponse(response);
        } catch (error: any) {
            console.log('RT Cancel error:', error);
            return {
                success: false,
                message: error?.message ?? 'Unknown error in pushCancel',
            };
        }
    }
}
