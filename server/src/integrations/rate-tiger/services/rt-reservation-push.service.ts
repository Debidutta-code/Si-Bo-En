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
import { json } from 'stream/consumers';
import { ICReservationPayload } from '../../../reservation/types';


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
        // console.log('RT Commit payload:', JSON.stringify(payload, null, 2));
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
            // console.log(error);
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

    public static async pushCommit(
        incomingPayload: ICReservationPayload,
        countryCode: string,
        bookingCode: string,
        rtConfig: RTDynamicConfig
    ): Promise<{ success: boolean; message: string }> {
        try {
            const { guestDetails } = incomingPayload;
            const { finalPrice } = incomingPayload;
            // console.log(
            //     'pushCommit incomingPayload:',
            //     JSON.stringify(incomingPayload, null, 2)
            // );
            const roomsArray = incomingPayload?.guests?.roomsArray ?? [];
            const numberOfRooms = incomingPayload.numberOfRooms;

            const roomRatePerRoom = finalPrice.baseRatePerNight; // e.g. 57.2 for type3
            const totalTaxPerRoom =
                (finalPrice.taxedAmount ?? 0) / numberOfRooms;

            // ── Rates: include both amountBeforeTax and amountAfterTax ──
            const ratesPerRoom = finalPrice.dailyPriceBrakeDown.map(day => {
                const effectiveDate = RTReservationPushService.toDateString(
                    day.date
                );
                const effective = new Date(day.date);
                effective.setDate(effective.getDate() + 1);
                const expireDate =
                    RTReservationPushService.toDateString(effective);

                const baseRate = day.baseChargesAmount ?? roomRatePerRoom;
                const dailyTax = incomingPayload.finalPrice.totalTaxAmount ?? 0;
                if (baseRate === 0) {
                    throw new Error(
                        `Day ${day.date} for room  has zero baseRate and zero tax — aborting commit`
                    );
                }
                return {
                    effectiveDate,
                    expireDate,
                    currencyCode: day.currencyCode ?? incomingPayload.currencyCode,
                    amountBeforeTax: baseRate.toFixed(2), // ✅ "200.00"
                    amountAfterTax: (baseRate + dailyTax).toFixed(2), // ✅ "216.00"
                };
            });

            // ── Primary guest ──
            const primaryGuest = guestDetails[0];
            const primaryRTGuest: RTGuestDetail | null = primaryGuest
                ? {
                    guestID: '1',
                    profileType: '1',
                    personName: {
                        salutation: primaryGuest?.salutation ?? '',
                        firstName: primaryGuest.firstName,
                        middleName: '',
                        surName: primaryGuest.lastName,
                    },
                    telePhone: {
                        phoneNo: incomingPayload.bookingUserPhone ?? '',
                        phoneTechType: '1',
                        locationType: '7',
                    },
                    email: incomingPayload.bookingUserEmail,
                    address: {
                        addressType: '1',
                        addressLine: '',
                        city: '',
                        postalCode: '',
                        state: '',
                        countryCode: countryCode ?? 'IN',
                    },
                }
                : null;

            const buildRoomStay = (
                room: { adults: number; children: number },
                index: number
            ) => {
                const roomNumber = (index + 1).toString();

                // ✅ Filter dailyBreakdown for this specific room only
                const roomBreakdown = finalPrice.dailyPriceBrakeDown.filter(
                    (day: any) => String(day.roomNumber) === roomNumber
                );

                // ✅ Fallback: if no roomNumber match, use all entries (single room case)
                const breakdown =
                    roomBreakdown.length > 0
                        ? roomBreakdown
                        : finalPrice.dailyPriceBrakeDown;

                const ratesForThisRoom = breakdown.map((day: any) => {
                    const effectiveDate = RTReservationPushService.toDateString(
                        day.date
                    );
                    const effective = new Date(day.date);
                    effective.setDate(effective.getDate() + 1);
                    const expireDate =
                        RTReservationPushService.toDateString(effective);
                    const baseRate = day.baseRate ?? roomRatePerRoom;
                    const dailyTax = day.totalDailyTaxedAmount ?? totalTaxPerRoom;

                    return {
                        effectiveDate,
                        expireDate,
                        currencyCode:
                            day.currencyCode ?? incomingPayload.currencyCode,
                        amountBeforeTax: baseRate.toFixed(2),
                        amountAfterTax: (baseRate + dailyTax).toFixed(2),
                    };
                });

                const roomBaseTotal = breakdown.reduce(
                    (sum: number, day: any) =>
                        sum + (day.baseRate ?? roomRatePerRoom),
                    0
                );
                const roomTaxTotal = breakdown.reduce(
                    (sum: number, day: any) =>
                        sum + (day.totalDailyTaxedAmount ?? totalTaxPerRoom),
                    0
                );

                return {
                    roomStayID: roomNumber,
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
                            invCode: incomingPayload.roomTypeCode,
                            ratePlanCode: incomingPayload.ratePlanCode,
                            numberOfUnits: '1',
                            rates: ratesForThisRoom,
                        },
                    ],
                    timeSpan: {
                        start: RTReservationPushService.toDateString(
                            incomingPayload.reservationStartDate
                        ),
                        end: RTReservationPushService.toDateString(
                            incomingPayload.reservationEndDate
                        ),
                    },
                    totalPrice: {
                        amountBeforeTax: roomBaseTotal.toFixed(2), // ✅ "200.00"
                        amountAfterTax: (roomBaseTotal + roomTaxTotal).toFixed(
                            2
                        ),
                        taxAmount: roomTaxTotal.toFixed(2),
                    },
                    guestIDs: ['1'],
                    comments: [{ text: '', guestViewable: '1' }],
                    specialRequests: [{ requestCode: '', text: '' }],
                };
            };

            const roomStays =
                roomsArray.length > 0
                    ? roomsArray.map((room: any, index: number) =>
                        buildRoomStay(room, index)
                    )
                    : [
                        // Fallback: no roomsArray — build from guests totals
                        buildRoomStay(
                            {
                                adults: incomingPayload?.guests?.adults || 1,
                                children: incomingPayload?.guests?.children || 0,
                            },
                            0
                        ),
                    ];

            const originalAddons = incomingPayload.selectedAddons ?? [];
            const services: RTService[] = originalAddons
                .filter((addon: any) => addon.addonCode) // skip if no code
                .map((addon: any, index: number) => ({
                    serviceID: (index + 1).toString(),
                    serviceCode: addon.addonCode,
                    units: addon.quantity.toString(),
                    amountBeforeTax: addon.totalPrice.toFixed(2),
                    amountAfterTax: addon.totalPrice.toFixed(2),
                    isInclusive: 'false',
                    effectiveDate: RTReservationPushService.toDateString(
                        addon.date
                    ),
                    serviceDescription: addon.addonName,
                }));

            const guarantee = PAYMENT_TO_GUARANTEE_MAP[
                incomingPayload.paymentMethod as PaymentMethodType
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
                    currency: incomingPayload.currencyCode,
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
            console.log('payload', JSON.stringify(payload, null, 2));

            const response = await RTReservationPushService.pushToRT(
                payload,
                rtConfig
            );
            // console.log(
            //     'RT Commit response:',
            //     JSON.stringify(response, null, 2)
            // );
            return RTReservationPushService.handleRTResponse(response);
        } catch (error: any) {
            // console.log('RT Commit error:', error);
            return {
                success: false,
                message: error?.message ?? 'Unknown error in pushCommit',
            };
        }
    }


    public static async pushModify(
        existingReservation: ExistingReservation,
        updatePayload: RTUpdatePayload,
        rtConfig: RTDynamicConfig // ← ADD
    ): Promise<{ success: boolean; message: string }> {
        try {
            // console.log(
            //     'existingReservation',
            //     JSON.stringify(existingReservation, null, 2)
            // );
            // console.log(
            //     'updatePayload',
            //     JSON.stringify(updatePayload, null, 2)
            // );
            // console.log('rtconfig', JSON.stringify(rtConfig, null, 2));
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
            const numberOfRooms =
                existingReservation.finalPrice?.requestedRooms ?? 1;
            const totalTax = updatePayload.finalPrice?.taxedAmount ?? 0;

            // ✅ Use dailyPriceBrakeDown from updatePayload
            const updateDailyBreakdown =
                updatePayload.finalPrice?.dailyPriceBrakeDown ?? [];

            const uniqueRoomNumbers = [
                ...new Set(
                    updateDailyBreakdown.map((d: any) => String(d.roomNumber))
                ),
            ] as string[];

            const roomNumbers =
                uniqueRoomNumbers.length > 0
                    ? uniqueRoomNumbers
                    : Array.from({ length: numberOfRooms }, (_, i) =>
                        (i + 1).toString()
                    );

            const roomStays = roomNumbers.map(
                (roomNumber: string, index: number) => {
                    const roomBreakdown = updateDailyBreakdown.filter(
                        (d: any) => String(d.roomNumber) === roomNumber
                    );

                    const rates =
                        roomBreakdown.length > 0
                            ? roomBreakdown.map((day: any) => {
                                const effectiveDate =
                                    RTReservationPushService.toDateString(
                                        day.date
                                    );
                                const effective = new Date(day.date);
                                effective.setDate(effective.getDate() + 1);
                                const expireDate =
                                    RTReservationPushService.toDateString(
                                        effective
                                    );
                                const base = day.baseChargesAmount ?? 0;
                                const tax = day.totalDailyTaxedAmount ?? 0;
                                return {
                                    effectiveDate,
                                    expireDate,
                                    currencyCode:
                                        day.currencyCode ??
                                        existingReservation.currencyCode,
                                    amountBeforeTax: base.toFixed(2),
                                    amountAfterTax: (base + tax).toFixed(2),
                                };
                            })
                            : [
                                {
                                    effectiveDate: checkInStr,
                                    expireDate: checkOutStr,
                                    currencyCode:
                                        existingReservation.currencyCode,
                                    amountBeforeTax: (
                                        (updatePayload.amount - totalTax) /
                                        numberOfRooms
                                    ).toFixed(2),
                                    amountAfterTax: (
                                        updatePayload.amount / numberOfRooms
                                    ).toFixed(2),
                                },
                            ];

                    const roomBaseTotal = roomBreakdown.reduce(
                        (sum: number, d: any) =>
                            sum + (d.baseChargesAmount ?? 0),
                        0
                    );
                    const roomTaxTotal = roomBreakdown.reduce(
                        (sum: number, d: any) =>
                            sum + (d.totalDailyTaxedAmount ?? 0),
                        0
                    );
                    const guestDist = roomBreakdown[0]?.guestDistribution ?? {
                        adults: 1,
                        children: 0,
                    };

                    return {
                        roomStayID: (index + 1).toString(),
                        mealPlanIndicator: '0',
                        isGuestPerRoom: '1',
                        guestCount: [
                            ...(guestDist.adults > 0
                                ? [
                                    {
                                        ageQualifyingCode: '10' as const,
                                        count: guestDist.adults.toString(),
                                    },
                                ]
                                : []),
                            ...(guestDist.children > 0
                                ? [
                                    {
                                        ageQualifyingCode: '8' as const,
                                        count: guestDist.children.toString(),
                                    },
                                ]
                                : []),
                        ],
                        roomRates: [
                            {
                                invCode: existingReservation.roomTypeCode ?? '',
                                ratePlanCode:
                                    existingReservation.ratePlanCode ?? '',
                                numberOfUnits: '1',
                                rates,
                            },
                        ],
                        timeSpan: { start: checkInStr, end: checkOutStr },
                        totalPrice: {
                            amountBeforeTax:
                                roomBaseTotal > 0
                                    ? roomBaseTotal.toFixed(2)
                                    : (
                                        (updatePayload.amount - totalTax) /
                                        numberOfRooms
                                    ).toFixed(2),
                            amountAfterTax:
                                roomBaseTotal > 0
                                    ? (roomBaseTotal + roomTaxTotal).toFixed(2)
                                    : (
                                        updatePayload.amount / numberOfRooms
                                    ).toFixed(2),
                            taxAmount:
                                roomTaxTotal > 0
                                    ? roomTaxTotal.toFixed(2)
                                    : (totalTax / numberOfRooms).toFixed(2),
                        },
                        guestIDs: ['1'],
                        comments: [{ text: '', guestViewable: '1' }],
                        specialRequests: [{ requestCode: '', text: '' }],
                    };
                }
            );
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
            // const roomStays =
            //     storedRoomsArray.length > 0
            //         ? storedRoomsArray.map(
            //               (
            //                   room: { adults: number; children: number },
            //                   index: number
            //               ) => ({
            //                   roomStayID: (index + 1).toString(),
            //                   mealPlanIndicator: '0',
            //                   isGuestPerRoom: '1',
            //                   guestCount: [
            //                       ...(room.adults > 0
            //                           ? [
            //                                 {
            //                                     ageQualifyingCode:
            //                                         '10' as const,
            //                                     count: room.adults.toString(),
            //                                 },
            //                             ]
            //                           : []),
            //                       ...(room.children > 0
            //                           ? [
            //                                 {
            //                                     ageQualifyingCode: '8' as const,
            //                                     count: room.children.toString(),
            //                                 },
            //                             ]
            //                           : []),
            //                   ],
            //                   roomRates: [
            //                       {
            //                           invCode:
            //                               existingReservation.roomTypeCode ??
            //                               '',
            //                           ratePlanCode:
            //                               existingReservation.ratePlanCode ??
            //                               '',
            //                           numberOfUnits: '1',
            //                           rates: [
            //                               {
            //                                   effectiveDate: checkInStr,
            //                                   expireDate: checkOutStr,
            //                                   currencyCode:
            //                                       existingReservation.currencyCode,
            //                                   amountAfterTax: (
            //                                       updatePayload.amount /
            //                                       numberOfRooms
            //                                   ).toFixed(2),
            //                               },
            //                           ],
            //                       },
            //                   ],
            //                   timeSpan: {
            //                       start: checkInStr,
            //                       end: checkOutStr,
            //                   },
            //                   totalPrice: {
            //                       amountAfterTax: (
            //                           updatePayload.amount / numberOfRooms
            //                       ).toFixed(2),
            //                       taxAmount: (totalTax / numberOfRooms).toFixed(
            //                           2
            //                       ),
            //                   },
            //                   guestIDs: ['1'],
            //                   comments: [{ text: '', guestViewable: '1' }],
            //                   specialRequests: [{ requestCode: '', text: '' }],
            //               })
            //           )
            //         : [
            //               // Fallback — single roomStay with totals
            //               {
            //                   roomStayID: '1',
            //                   mealPlanIndicator: '0',
            //                   isGuestPerRoom: '0',
            //                   guestCount: [
            //                       {
            //                           ageQualifyingCode: '10' as const,
            //                           count: guests
            //                               .filter(g => g.type === 'adult')
            //                               .length.toString(),
            //                       },
            //                       ...(guests.filter(g => g.type === 'child')
            //                           .length > 0
            //                           ? [
            //                                 {
            //                                     ageQualifyingCode: '8' as const,
            //                                     count: guests
            //                                         .filter(
            //                                             g => g.type === 'child'
            //                                         )
            //                                         .length.toString(),
            //                                 },
            //                             ]
            //                           : []),
            //                   ],
            //                   roomRates: [
            //                       {
            //                           invCode:
            //                               existingReservation.roomTypeCode ??
            //                               '',
            //                           ratePlanCode:
            //                               existingReservation.ratePlanCode ??
            //                               '',
            //                           numberOfUnits: numberOfRooms.toString(),
            //                           rates: [
            //                               {
            //                                   effectiveDate: checkInStr,
            //                                   expireDate: checkOutStr,
            //                                   currencyCode:
            //                                       existingReservation.currencyCode,
            //                                   amountAfterTax:
            //                                       updatePayload.amount.toFixed(
            //                                           2
            //                                       ),
            //                               },
            //                           ],
            //                       },
            //                   ],
            //                   timeSpan: {
            //                       start: checkInStr,
            //                       end: checkOutStr,
            //                   },
            //                   totalPrice: {
            //                       amountAfterTax:
            //                           updatePayload.amount.toFixed(2),
            //                       taxAmount: totalTax.toFixed(2),
            //                   },
            //                   guestIDs: ['1'],
            //                   comments: [{ text: '', guestViewable: '1' }],
            //                   specialRequests: [{ requestCode: '', text: '' }],
            //               },
            //           ];

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
            // console.log(
            //     'RT Modify response:',
            //     JSON.stringify(response, null, 2)
            // );
            return RTReservationPushService.handleRTResponse(response);
        } catch (error: any) {
            // console.log('RT Modify error:', error);
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
            // console.log(
            //     'RT Cancel response:',
            //     JSON.stringify(response, null, 2)
            // );
            return RTReservationPushService.handleRTResponse(response);
        } catch (error: any) {
            //  console.log('RT Cancel error:', error);
            return {
                success: false,
                message: error?.message ?? 'Unknown error in pushCancel',
            };
        }
    }
}
