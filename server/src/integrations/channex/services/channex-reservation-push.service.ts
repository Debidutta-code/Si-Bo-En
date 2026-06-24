// src/integrations/channex/services/channex-reservation-push.service.ts

import axios from 'axios';
import { ICReservationS } from '../../../reservation/types';
import { ExistingReservation, RTUpdatePayload } from '../../rate-tiger/types';
import { ChannexDynamicConfig } from '../types/channex.types';
import { ServiceLogger } from '../../../logs/services/service-log.service';

const logger = new ServiceLogger('ChannexReservationPushService');

export class ChannexReservationPushService {
    /**
     * Map Date/String helper
     */
    private static toDateString(date: string | Date): string {
        if (date instanceof Date) {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
            return date.split('T')[0];
        }
        const parsed = new Date(date);
        if (!isNaN(parsed.getTime())) {
            const y = parsed.getFullYear();
            const m = String(parsed.getMonth() + 1).padStart(2, '0');
            const d = String(parsed.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        return date;
    }

    /**
     * Helper to build days breakdown for a room
     */
    private static buildDaysForRoom(
        incomingPayload: ICReservationS,
        roomNumber: number
    ): any[] {
        const dailyPriceBrakeDown = incomingPayload.finalPrice?.dailyPriceBrakeDown ?? [];

        // Filter daily breakdown for this specific room number
        const roomBreakdown = dailyPriceBrakeDown.filter(
            (day: any) => String(day.roomNumber) === String(roomNumber)
        );
        const breakdown = roomBreakdown.length > 0 ? roomBreakdown : dailyPriceBrakeDown;

        return breakdown.map((day: any) => ({
            date: ChannexReservationPushService.toDateString(day.date),
            price: (day.totalAmount ?? day.baseChargesAmount ?? (incomingPayload.finalPrice.amountAfterTax / incomingPayload.numberOfRooms / (breakdown.length || 1))).toFixed(2),
            rate_plan_code: incomingPayload.ratePlanCode,
        }));
    }

    /**
     * Helper to build services/addons breakdown
     */
    private static buildServices(incomingPayload: ICReservationS): any[] {
        const addonBrakeDowns = incomingPayload.finalPrice?.addonBrakeDowns ?? [];
        return addonBrakeDowns.map((addon: any, idx: number) => ({
            type: 'Extra',
            total_price: addon.amount?.toFixed(2) || '0.00',
            price_per_unit: addon.pricePerUnit?.toFixed(2) || addon.amount?.toFixed(2) || '0.00',
            price_mode: 'Per stay',
            persons: 0,
            nights: 0,
            name: addon.name || `Extra Service ${idx + 1}`,
            room_index: 0,
        }));
    }

    /**
     * Push commit (new booking)
     * Calls POST /api/v1/channel_webhooks/open_channel/new_booking per Open Channel spec
     */
    public static async pushCommit(
        incomingPayload: ICReservationS,
        countryCode: string,
        bookingCode: string,
        config: ChannexDynamicConfig
    ): Promise<{ success: boolean; message: string }> {
        const log = logger.start('pushCommit');
        try {
            const checkInDate = ChannexReservationPushService.toDateString(incomingPayload.reservationStartDate);
            const checkOutDate = ChannexReservationPushService.toDateString(incomingPayload.reservationEndDate);

            const primaryGuest = incomingPayload.guestDetails?.find(g => g.type === 'adult') || incomingPayload.guestDetails?.[0];
            const firstName = primaryGuest?.firstName ?? 'Guest';
            const lastName = primaryGuest?.lastName ?? 'User';

            // Build rooms array based on guest distribution or default to 1 room
            const roomsArray = incomingPayload.guests?.roomsArray ?? [];
            const bookingRooms = roomsArray.length > 0
                ? roomsArray.map((room, idx) => ({
                    index: idx,
                    room_type_code: incomingPayload.roomTypeCode,
                    occupancy: {
                        adults: room.adults ?? 1,
                        children: room.children ?? 0,
                        infants: 0,
                    },
                    guests: [
                        {
                            name: firstName,
                            surname: lastName,
                        }
                    ],
                    days: ChannexReservationPushService.buildDaysForRoom(incomingPayload, idx + 1),
                    meta: {},
                }))
                : [
                    {
                        index: 0,
                        room_type_code: incomingPayload.roomTypeCode,
                        occupancy: {
                            adults: incomingPayload.guests?.adults ?? 1,
                            children: incomingPayload.guests?.children ?? 0,
                            infants: 0,
                        },
                        guests: [
                            {
                                name: firstName,
                                surname: lastName,
                            }
                        ],
                        days: ChannexReservationPushService.buildDaysForRoom(incomingPayload, 1),
                        meta: {},
                    },
                ];

            // Open Channel API Payload
            const payload: any = {
                booking: {
                    status: 'new',
                    provider_code: 'OpenChannel', // Default test provider code per Channex spec
                    hotel_code: incomingPayload.propertyCode || config.propertyId, // Mapping code (PMS Property Code)
                    ota_name: incomingPayload.bookingSource ?? 'direct',
                    reservation_id: bookingCode,
                    arrival_date: checkInDate,
                    departure_date: checkOutDate,
                    arrival_hour: '14:00',
                    currency: incomingPayload.currencyCode ?? 'AED',
                    payment_collect: 'property',
                    payment_type: 'credit_card',
                    customer: {
                        name: firstName,
                        surname: lastName,
                        mail: incomingPayload.bookingUserEmail,
                        phone: incomingPayload.bookingUserPhone ?? undefined,
                        country: countryCode ?? 'IN',
                    },
                    rooms: bookingRooms,
                    services: ChannexReservationPushService.buildServices(incomingPayload),
                    meta: {},
                },
            };

            log.setIncoming({ bookingCode, propertyId: config.propertyId, payload });

            const targetUrl = `${config.baseUrl}/api/v1/channel_webhooks/open_channel/new_booking`;
            const response = await axios.post(targetUrl, payload, {
                headers: {
                    'api-key': config.apiKey,
                    'Content-Type': 'application/json',
                },
                timeout: 15000,
            });

            log.pushMessage('Channex Open Channel commit succeeded', 'info')
                .setMeta({ channexResponse: response.data })
                .save();

            return { success: true, message: 'Pushed to Channex successfully' };
        } catch (error: any) {
            const errorMsg = error?.response?.data || error.message;
            log.setError(error).setMeta({ errorDetail: errorMsg }).save();
            return {
                success: false,
                message: `Channex commit failed: ${JSON.stringify(errorMsg)}`,
            };
        }
    }

    /**
     * Push modify
     * Calls POST /api/v1/channel_webhooks/open_channel/new_booking with status: modified
     */
    public static async pushModify(
        existingReservation: ExistingReservation,
        updatePayload: RTUpdatePayload,
        config: ChannexDynamicConfig
    ): Promise<{ success: boolean; message: string }> {
        const log = logger.start('pushModify');
        try {
            const bookingCode = existingReservation.bookingCode;
            log.setIncoming({ bookingCode, updatePayload });

            const checkInDate = ChannexReservationPushService.toDateString(updatePayload.checkInDate);
            const checkOutDate = ChannexReservationPushService.toDateString(updatePayload.checkOutDate);

            const primaryGuest = existingReservation.guests?.[0];
            const firstName = primaryGuest?.firstName ?? 'Guest';
            const lastName = primaryGuest?.lastName ?? 'User';

            // Map updated rooms
            const roomsArray = updatePayload.rooms ?? [];
            const bookingRooms = roomsArray.length > 0
                ? roomsArray.map((room: any, idx: number) => ({
                    index: idx,
                    room_type_code: existingReservation.roomTypeCode ?? '',
                    occupancy: {
                        adults: room.adults ?? 1,
                        children: room.children ?? 0,
                        infants: 0,
                    },
                    guests: [
                        {
                            name: firstName,
                            surname: lastName,
                        }
                    ],
                    days: [
                        {
                            date: checkInDate,
                            price: (updatePayload.amount / (updatePayload.requestedRooms ?? 1)).toFixed(2),
                            rate_plan_code: existingReservation.ratePlanCode,
                        }
                    ],
                    meta: {},
                }))
                : [
                    {
                        index: 0,
                        room_type_code: existingReservation.roomTypeCode ?? '',
                        occupancy: {
                            adults: updatePayload.rooms?.reduce((s: number, r: any) => s + r.adults, 0) ?? 1,
                            children: updatePayload.rooms?.reduce((s: number, r: any) => s + r.children, 0) ?? 0,
                            infants: 0,
                        },
                        guests: [
                            {
                                name: firstName,
                                surname: lastName,
                            }
                        ],
                        days: [
                            {
                                date: checkInDate,
                                price: updatePayload.amount.toFixed(2),
                                rate_plan_code: existingReservation.ratePlanCode,
                            }
                        ],
                        meta: {},
                    },
                ];

            // Open Channel API Payload
            const payload: any = {
                booking: {
                    status: 'modified',
                    provider_code: 'OpenChannel',
                    hotel_code: existingReservation.propertyCode || config.propertyId,
                    ota_reservation_code: bookingCode,
                    reservation_id: bookingCode,
                    amount: updatePayload.amount.toFixed(2),
                    currency: existingReservation.currencyCode ?? 'AED',
                    arrival_date: checkInDate,
                    departure_date: checkOutDate,
                    customer: {
                        name: firstName,
                        surname: lastName,
                        mail: existingReservation.bookingUserEmail,
                        phone: existingReservation.bookingUserPhone ?? undefined,
                        country: existingReservation.countryCode ?? 'IN',
                    },
                    rooms: bookingRooms,
                    meta: {},
                },
            };

            const targetUrl = `${config.baseUrl}/api/v1/channel_webhooks/open_channel/new_booking`;
            const response = await axios.post(targetUrl, payload, {
                headers: {
                    'api-key': config.apiKey,
                    'Content-Type': 'application/json',
                },
                timeout: 15000,
            });

            log.pushMessage('Channex Open Channel modify succeeded', 'info')
                .setMeta({ channexResponse: response.data })
                .save();

            return { success: true, message: 'Modified in Channex successfully' };
        } catch (error: any) {
            const errorMsg = error?.response?.data || error.message;
            log.setError(error).setMeta({ errorDetail: errorMsg }).save();
            return {
                success: false,
                message: `Channex modify failed: ${JSON.stringify(errorMsg)}`,
            };
        }
    }

    /**
     * Push cancel
     * Calls POST /api/v1/channel_webhooks/open_channel/new_booking with status: cancelled
     */
    public static async pushCancel(
        existingReservation: ExistingReservation,
        config: ChannexDynamicConfig
    ): Promise<{ success: boolean; message: string }> {
        const log = logger.start('pushCancel');
        try {
            const bookingCode = existingReservation.bookingCode;
            log.setIncoming({ bookingCode });

            const checkInDate = ChannexReservationPushService.toDateString(existingReservation.reservationStartDate);
            const checkOutDate = ChannexReservationPushService.toDateString(existingReservation.reservationEndDate);

            const primaryGuest = existingReservation.guests?.[0];
            const firstName = primaryGuest?.firstName ?? 'Guest';
            const lastName = primaryGuest?.lastName ?? 'User';

            // Open Channel API Payload for Cancellation
            const payload: any = {
                booking: {
                    status: 'cancelled',
                    provider_code: 'OpenChannel',
                    hotel_code: existingReservation.propertyCode || config.propertyId,
                    ota_reservation_code: bookingCode,
                    reservation_id: bookingCode,
                    amount: '0.00',
                    currency: existingReservation.currencyCode ?? 'AED',
                    arrival_date: checkInDate,
                    departure_date: checkOutDate,
                    customer: {
                        name: firstName,
                        surname: lastName,
                        mail: existingReservation.bookingUserEmail,
                    },
                    rooms: [],
                },
            };

            const targetUrl = `${config.baseUrl}/api/v1/channel_webhooks/open_channel/new_booking`;
            const response = await axios.post(targetUrl, payload, {
                headers: {
                    'api-key': config.apiKey,
                    'Content-Type': 'application/json',
                },
                timeout: 15000,
            });

            log.pushMessage('Channex Open Channel cancel succeeded', 'info')
                .setMeta({ channexResponse: response.data })
                .save();

            return { success: true, message: 'Cancelled in Channex successfully' };
        } catch (error: any) {
            const errorMsg = error?.response?.data || error.message;
            log.setError(error).setMeta({ errorDetail: errorMsg }).save();
            return {
                success: false,
                message: `Channex cancel failed: ${JSON.stringify(errorMsg)}`,
            };
        }
    }
}
