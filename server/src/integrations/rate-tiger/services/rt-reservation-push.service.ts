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
} from '../types';
import { config } from '../../../config';

// ─── Token Cache ──────────────────────────────────────────────────────────────

interface CachedToken {
    token: string;
    expiresAt: Date;
}

let tokenCache: CachedToken | null = null;

// ─── Service ──────────────────────────────────────────────────────────────────

export class RTReservationPushService {

    // ── 1. Auth ───────────────────────────────────────────────────────────────

    private static async getAuthToken(): Promise<string> {
        if (
            tokenCache &&
            tokenCache.expiresAt > new Date(Date.now() + 5 * 60 * 1000)
        ) {
            return tokenCache.token;
        }

        const credentials = Buffer.from(
            `${config.rateTigerUsername}:${config.rateTigerPassword}`
        ).toString('base64');

        const response = await axios.post(
            config.rateTigerAuthUrl,
            {
                'API-Key': config.rateTigerApiKey,
                partner_id: config.rateTigerPartnerId,
            },
            {
                headers: {
                    Authorization: `Basic ${credentials}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            }
        );

        const { access_token, expires_in } = response.data;

        tokenCache = {
            token: access_token,
            expiresAt: new Date(expires_in),
        };

        return access_token;
    }

    // ── 2. Core Push ──────────────────────────────────────────────────────────

    private static async pushToRT(
        payload: RTReservationPayload
    ): Promise<RTReservationResponse> {
        const makeRequest = async (token: string) =>
            axios.post(config.rateTigerReservationUrl, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'API-Key': config.rateTigerApiKey,
                    'Content-Type': 'application/json',
                },
                timeout: 15000,
            });

        try {
            const token = await RTReservationPushService.getAuthToken();
            const response = await makeRequest(token);
            return response.data as RTReservationResponse;
        } catch (error: any) {
            if (error?.response?.status === 401) {
                tokenCache = null;
                const freshToken =
                    await RTReservationPushService.getAuthToken();
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
            return date.toISOString().split('T')[0];
        }
        return date.split('T')[0];
    }

    // ── Commit ────────────────────────────────────────────────────────────────

    public static async pushCommit(
        incomingPayload: IncomingBookingPayload,
        bookingCode: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            const { bookingDetails, guestDetails } = incomingPayload;
            const { finalPrice } = bookingDetails;

            // 1. roomsArray — per room guest breakdown from payload
            const roomsArray = bookingDetails.guests.roomsArray ?? [];
            const numberOfRooms = bookingDetails.numberOfRooms;

            // 2. Rates — baseRate is already per room in dailyBreakdown
            const ratesPerRoom = finalPrice.dailyBreakdown.map((day, index) => ({
                effectiveDate: RTReservationPushService.toDateString(day.date),
                expireDate: finalPrice.dailyBreakdown[index + 1]
                    ? RTReservationPushService.toDateString(
                          finalPrice.dailyBreakdown[index + 1].date
                      )
                    : bookingDetails.endDate,
                currencyCode: day.currencyCode ?? bookingDetails.currency,
                amountAfterTax: day.baseRate.toFixed(2), // baseRate = per room
            }));

            // 3. Financial split per room
            const totalAmountPerRoom = finalPrice.totalAmount / numberOfRooms;
            const totalTaxPerRoom = (finalPrice.totalTax ?? 0) / numberOfRooms;

            // 4. Primary guest only — only one we have contact info for
            const primaryGuest = guestDetails[0];
            const primaryEmail = bookingDetails.email;
            const primaryPhone = bookingDetails.phone;
            const countryCode = incomingPayload.countryCode ?? 'IN';

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
                          phoneNo: primaryPhone ?? '',
                          phoneTechType: '1',
                          locationType: '7',
                      },
                      email: primaryEmail,
                      address: {
                          addressType: '1',
                          addressLine: '',
                          city: '',
                          postalCode: '',
                          state: '',
                          countryCode,
                      },
                  }
                : null;

            // 5. Build one roomStay per room using roomsArray
            // Each room gets its own guest count from roomsArray
            // All rooms reference guestID '1' (primary guest)
            const roomStays = roomsArray.length > 0
                ? roomsArray.map((room, index) => {
                      const guestCount = [
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
                      ];

                      return {
                          roomStayID: (index + 1).toString(),
                          mealPlanIndicator: '0',
                          isGuestPerRoom: '1',
                          guestCount,
                          roomRates: [
                              {
                                  invCode: bookingDetails.roomTypeCode,
                                  ratePlanCode: bookingDetails.ratePlanCode,
                                  numberOfUnits: '1', // 1 unit per roomStay
                                  rates: ratesPerRoom,
                              },
                          ],
                          timeSpan: {
                              start: bookingDetails.startDate,
                              end: bookingDetails.endDate,
                          },
                          totalPrice: {
                              amountAfterTax: totalAmountPerRoom.toFixed(2),
                              taxAmount: totalTaxPerRoom.toFixed(2),
                          },
                          guestIDs: ['1'], // primary guest in all rooms
                          comments: [{ text: '', guestViewable: '1' }],
                          specialRequests: [{ requestCode: '', text: '' }],
                      };
                  })
                : [
                      // Fallback if roomsArray missing — single roomStay with totals
                      {
                          roomStayID: '1',
                          mealPlanIndicator: '0',
                          isGuestPerRoom: '0',
                          guestCount: [
                              ...(bookingDetails.guests.adults > 0
                                  ? [
                                        {
                                            ageQualifyingCode: '10' as const,
                                            count: bookingDetails.guests.adults.toString(),
                                        },
                                    ]
                                  : []),
                              ...(bookingDetails.guests.children > 0
                                  ? [
                                        {
                                            ageQualifyingCode: '8' as const,
                                            count: bookingDetails.guests.children.toString(),
                                        },
                                    ]
                                  : []),
                          ],
                          roomRates: [
                              {
                                  invCode: bookingDetails.roomTypeCode,
                                  ratePlanCode: bookingDetails.ratePlanCode,
                                  numberOfUnits: numberOfRooms.toString(),
                                  rates: ratesPerRoom,
                              },
                          ],
                          timeSpan: {
                              start: bookingDetails.startDate,
                              end: bookingDetails.endDate,
                          },
                          totalPrice: {
                              amountAfterTax: finalPrice.totalAmount.toFixed(2),
                              taxAmount: (finalPrice.totalTax ?? 0).toFixed(2),
                          },
                          guestIDs: ['1'],
                          comments: [{ text: '', guestViewable: '1' }],
                          specialRequests: [{ requestCode: '', text: '' }],
                      },
                  ];

            // 6. Services from addons
            const services: RTService[] = bookingDetails.selectedAddons.map(
                (addon, index) => ({
                    serviceID: (index + 1).toString(),
                    serviceCode: addon.addonCode,
                    units: addon.quantity.toString(),
                    amountBeforeTax: addon.price.toFixed(2),
                    amountAfterTax: addon.totalPrice.toFixed(2),
                    isInclusive: 'false',
                    effectiveDate: RTReservationPushService.toDateString(
                        addon.date
                    ),
                    serviceDescription: addon.addonName,
                })
            );

            // 7. Guarantee from payment method
            const guarantee =
                PAYMENT_TO_GUARANTEE_MAP[
                    bookingDetails.paymentMethod as PaymentMethodType
                ] ?? { guaranteeType: 'None' as const };

            // 8. Build final payload
            const payload: RTCommitModifyPayload = {
                hotelReservation: {
                    hotelCode: bookingDetails.propertyCode,
                    resStatus: 'Commit',
                    createDateTime: new Date().toISOString(),
                    creatorID: config.rateTtigerPartnerName ?? 'REVCHILL',
                    timeStamp: new Date().toISOString(),
                    pos: {
                        channelCode: config.rateTigerPartnerId ?? '',
                        channelName: config.rateTtigerPartnerName ?? 'Revchill',
                    },
                    currency: bookingDetails.currency,
                    uniqueID: {
                        type: '14',
                        idValue: bookingCode,
                    },
                    guarantee,
                    roomStays,
                    guestDetails: primaryRTGuest ? [primaryRTGuest] : [],
                    ...(services.length > 0 && { services }),
                    resGlobalInfo: {
                        hotelReservationIDs: [
                            {
                                resIDType: '14',
                                resIDValue: bookingCode,
                            },
                        ],
                    },
                },
            };

            const response = await RTReservationPushService.pushToRT(payload);
            console.log('RT Commit response:', response);
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
        updatePayload: RTUpdatePayload
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
                          phoneNo:
                              existingReservation.bookingUserPhone ?? '',
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
                          countryCode:
                              existingReservation.countryCode ?? 'IN',
                      },
                  }
                : null;

            // 3. Build roomStays — per room if roomsArray stored, fallback if not
            const roomStays =
                storedRoomsArray.length > 0
                    ? storedRoomsArray.map(
                          (room: { adults: number; children: number }, index: number) => ({
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
                                  taxAmount: (
                                      totalTax / numberOfRooms
                                  ).toFixed(2),
                              },
                              guestIDs: ['1'],
                              comments: [{ text: '', guestViewable: '1' }],
                              specialRequests: [
                                  { requestCode: '', text: '' },
                              ],
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
                              specialRequests: [
                                  { requestCode: '', text: '' },
                              ],
                          },
                      ];

            const payload: RTCommitModifyPayload = {
                hotelReservation: {
                    hotelCode: existingReservation.propertyCode ?? '',
                    resStatus: 'Modify',
                    createDateTime: existingReservation.bookedAt.toISOString(),
                    lastModifiedDateTime: new Date().toISOString(),
                    creatorID: config.rateTtigerPartnerName ?? 'REVCHILL',
                    timeStamp: new Date().toISOString(),
                    pos: {
                        channelCode: config.rateTigerPartnerId ?? '',
                        channelName:
                            config.rateTtigerPartnerName ?? 'Revchill',
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

            const response = await RTReservationPushService.pushToRT(payload);
            console.log('RT Modify response:', response);
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
        existingReservation: ExistingReservation
    ): Promise<{ success: boolean; message: string }> {
        try {
            const payload: RTCancelPayload = {
                hotelReservation: {
                    hotelCode: existingReservation.propertyCode ?? '',
                    resStatus: 'Cancel',
                    createDateTime: existingReservation.bookedAt.toISOString(),
                    lastModifiedDateTime: new Date().toISOString(),
                    creatorID: config.rateTtigerPartnerName ?? 'REVCHILL',
                    timeStamp: new Date().toISOString(),
                    pos: {
                        channelCode: config.rateTigerPartnerId ?? '',
                        channelName:
                            config.rateTtigerPartnerName ?? 'Revchill',
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

            const response = await RTReservationPushService.pushToRT(payload);
            console.log('RT Cancel response:', response);
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