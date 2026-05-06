// services/site-minder-reservation.service.ts
// Pushes reservations TO SiteMinder (Commit, Modify, Cancel)

import axios from 'axios';
import { config } from '../../../config';
import { ICReservationPayload } from '../../../reservation/types';
import {
    SMReservationPushParams,
    SMReservationResult,
    SMRoomStay,
    SMGuestCount,
    SMRateDay,
    SMPaymentMethod,
} from '../types/site-minder-reservation.types';
import { SiteMinderReservationXmlBuilder } from '../utils/xml-reservation';
import { SiteMinderReservationValidation } from '../validation/reservation-validation';

// SiteMinder test endpoint — replace with production during go-live
const SM_ENDPOINT = 'https://tpi-cm-siteconn.preprod.siteminderlabs.com/reservation-gateway/services';

export class SiteMinderReservationService {

    // ─── Core HTTP push ───────────────────────────────────────────────────────

    private static async pushToSiteMinder(
        xml: string,
        bookingCode: string
    ): Promise<SMReservationResult> {
        try {
            const response = await axios.post(SM_ENDPOINT, xml, {
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    SOAPAction: '',
                },
                timeout: 15000,
            });

            return SiteMinderReservationXmlBuilder.parseReservationResponse(
                response.data,
                bookingCode
            );
        } catch (error: any) {
            // Axios error — try to parse the XML error body if present
            if (error?.response?.data) {
                return SiteMinderReservationXmlBuilder.parseReservationResponse(
                    error.response.data,
                    bookingCode
                );
            }
            return {
                success: false,
                message: `SiteMinder push failed: ${error?.message ?? 'Unknown error'}`,
            };
        }
    }

    // ─── Date helper ──────────────────────────────────────────────────────────

    private static toDateString(date: string | Date): string {
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

    // ─── Build room stays from ICReservationPayload ───────────────────────────

    private static buildRoomStays(
        payload: ICReservationPayload,
        siteMinderHotelCode: string
    ): SMRoomStay[] {
        const { finalPrice } = payload;
        const numberOfRooms = payload.numberOfRooms ?? 1;
        const roomsArray = payload?.guests?.roomsArray ?? [];

        const checkIn = SiteMinderReservationService.toDateString(payload.reservationStartDate);
        const checkOut = SiteMinderReservationService.toDateString(payload.reservationEndDate);

        const buildRatesForRoom = (roomNumber: number): SMRateDay[] => {
            const roomBreakdown = finalPrice.dailyPriceBrakeDown.filter(
                (day: any) => String(day.roomNumber) === String(roomNumber)
            );

            const breakdown = roomBreakdown.length > 0
                ? roomBreakdown
                : finalPrice.dailyPriceBrakeDown;

            return breakdown.map((day: any) => {
                const effectiveDate = SiteMinderReservationService.toDateString(day.date);
                const nextDay = new Date(day.date);
                nextDay.setDate(nextDay.getDate() + 1);
                const expireDate = SiteMinderReservationService.toDateString(nextDay);

                const base = day.baseChargesAmount ?? day.baseRate ?? 0;
                const tax = day.totalDailyTaxedAmount ?? 0;

                return {
                    effectiveDate,
                    expireDate,
                    amountBeforeTax: base.toFixed(2),
                    amountAfterTax: (base + tax).toFixed(2),
                    currencyCode: day.currencyCode ?? payload.currencyCode,
                };
            });
        };

        const buildGuestCounts = (room: { adults: number; children: number }): SMGuestCount[] => {
            const counts: SMGuestCount[] = [];
            if (room.adults > 0) {
                counts.push({ ageQualifyingCode: '10', count: room.adults });
            }
            if (room.children > 0) {
                counts.push({ ageQualifyingCode: '8', count: room.children });
            }
            return counts;
        };

        const getRoomTotal = (roomNumber: number) => {
            const breakdown = finalPrice.dailyPriceBrakeDown.filter(
                (day: any) => String(day.roomNumber) === String(roomNumber)
            );
            const src = breakdown.length > 0 ? breakdown : finalPrice.dailyPriceBrakeDown;

            const beforeTax = src.reduce((s: number, d: any) => s + (d.baseChargesAmount ?? d.baseRate ?? 0), 0);
            const tax = src.reduce((s: number, d: any) => s + (d.totalDailyTaxedAmount ?? 0), 0);
            return { beforeTax, afterTax: beforeTax + tax };
        };

        if (roomsArray.length > 0) {
            return roomsArray.map((room: any, index: number) => {
                const roomNumber = index + 1;
                const totals = getRoomTotal(roomNumber);
                return {
                    roomTypeCode: payload.roomTypeCode,
                    roomTypeName: payload.roomTypeCode, // use code as name if name not available
                    ratePlanCode: payload.ratePlanCode,
                    ratePlanName: payload.ratePlanCode,
                    roomRates: {
                        roomTypeCode: payload.roomTypeCode,
                        ratePlanCode: payload.ratePlanCode,
                        rates: buildRatesForRoom(roomNumber),
                    },
                    guestCounts: buildGuestCounts({ adults: room.adults, children: room.children }),
                    checkIn,
                    checkOut,
                    totalAmountBeforeTax: totals.beforeTax.toFixed(2),
                    totalAmountAfterTax: totals.afterTax.toFixed(2),
                    currencyCode: payload.currencyCode,
                };
            });
        }

        // Single room fallback
        const totalBefore = (finalPrice.baseRatePerNight * (finalPrice.dailyPriceBrakeDown.length ?? 1));
        const totalAfter = totalBefore + (finalPrice.taxedAmount ?? 0);

        return [{
            roomTypeCode: payload.roomTypeCode,
            roomTypeName: payload.roomTypeCode,
            ratePlanCode: payload.ratePlanCode,
            ratePlanName: payload.ratePlanCode,
            roomRates: {
                roomTypeCode: payload.roomTypeCode,
                ratePlanCode: payload.ratePlanCode,
                rates: buildRatesForRoom(1),
            },
            guestCounts: buildGuestCounts({
                adults: payload?.guests?.adults ?? 1,
                children: payload?.guests?.children ?? 0,
            }),
            checkIn,
            checkOut,
            totalAmountBeforeTax: totalBefore.toFixed(2),
            totalAmountAfterTax: totalAfter.toFixed(2),
            currencyCode: payload.currencyCode,
        }];
    }

    // ─── PUBLIC: Commit ───────────────────────────────────────────────────────

    public static async pushCommit(
        payload: ICReservationPayload,
        bookingCode: string,
        siteMinderHotelCode: string,
        channelCode: string,
        channelName: string
    ): Promise<SMReservationResult> {
        try {
            const guestDetails = payload.guestDetails?.[0];
            const paymentMethod: SMPaymentMethod =
                payload.paymentMethod === 'pay_at_hotel' ? 'PAY_AT_HOTEL' : 'PREPAY';

            const totalBeforeTax = payload.finalPrice.dailyPriceBrakeDown
                .reduce((s: number, d: any) => s + (d.baseChargesAmount ?? d.baseRate ?? 0), 0);
            const totalAfterTax = totalBeforeTax + (payload.finalPrice.taxedAmount ?? 0);

            const params: SMReservationPushParams = {
                hotelCode: siteMinderHotelCode,
                bookingCode,
                resStatus: 'Commit',
                createDateTime: new Date().toISOString(),
                channelCode,
                channelName,
                roomStays: SiteMinderReservationService.buildRoomStays(payload, siteMinderHotelCode),
                primaryGuest: {
                    firstName: guestDetails?.firstName ?? '',
                    lastName: guestDetails?.lastName ?? '',
                    salutation: guestDetails?.salutation,
                    phone: payload.bookingUserPhone,
                    email: payload.bookingUserEmail,
                },
                currencyCode: payload.currencyCode,
                paymentMethod,
                totalAmountBeforeTax: totalBeforeTax.toFixed(2),
                totalAmountAfterTax: totalAfterTax.toFixed(2),
            };

            // Validate before pushing
            const validationError = SiteMinderReservationValidation.validate(params);
            if (validationError) {
                return { success: false, message: validationError };
            }

            const xml = SiteMinderReservationXmlBuilder.buildReservationRequest(
                params,
                config.siteMinderUsername!,
                config.siteMinderPassword!
            );

            return SiteMinderReservationService.pushToSiteMinder(xml, bookingCode);
        } catch (error: any) {
            return { success: false, message: error?.message ?? 'Unknown error in pushCommit' };
        }
    }

    // ─── PUBLIC: Modify ───────────────────────────────────────────────────────

    public static async pushModify(
        payload: ICReservationPayload,
        bookingCode: string,
        originalCreateDateTime: string,
        siteMinderHotelCode: string,
        channelCode: string,
        channelName: string
    ): Promise<SMReservationResult> {
        try {
            const guestDetails = payload.guestDetails?.[0];
            const paymentMethod: SMPaymentMethod =
                payload.paymentMethod === 'pay_at_hotel' ? 'PAY_AT_HOTEL' : 'PREPAY';

            const totalBeforeTax = payload.finalPrice.dailyPriceBrakeDown
                .reduce((s: number, d: any) => s + (d.baseChargesAmount ?? d.baseRate ?? 0), 0);
            const totalAfterTax = totalBeforeTax + (payload.finalPrice.taxedAmount ?? 0);

            const params: SMReservationPushParams = {
                hotelCode: siteMinderHotelCode,
                bookingCode,
                resStatus: 'Modify',
                createDateTime: originalCreateDateTime,
                lastModifyDateTime: new Date().toISOString(),
                channelCode,
                channelName,
                roomStays: SiteMinderReservationService.buildRoomStays(payload, siteMinderHotelCode),
                primaryGuest: {
                    firstName: guestDetails?.firstName ?? '',
                    lastName: guestDetails?.lastName ?? '',
                    salutation: guestDetails?.salutation,
                    phone: payload.bookingUserPhone,
                    email: payload.bookingUserEmail,
                },
                currencyCode: payload.currencyCode,
                paymentMethod,
                totalAmountBeforeTax: totalBeforeTax.toFixed(2),
                totalAmountAfterTax: totalAfterTax.toFixed(2),
            };

            const validationError = SiteMinderReservationValidation.validate(params);
            if (validationError) {
                return { success: false, message: validationError };
            }

            const xml = SiteMinderReservationXmlBuilder.buildReservationRequest(
                params,
                config.siteMinderUsername!,
                config.siteMinderPassword!
            );

            return SiteMinderReservationService.pushToSiteMinder(xml, bookingCode);
        } catch (error: any) {
            return { success: false, message: error?.message ?? 'Unknown error in pushModify' };
        }
    }

    // ─── PUBLIC: Cancel ───────────────────────────────────────────────────────

    public static async pushCancel(
        payload: ICReservationPayload,
        bookingCode: string,
        originalCreateDateTime: string,
        siteMinderHotelCode: string,
        channelCode: string,
        channelName: string
    ): Promise<SMReservationResult> {
        try {
            const guestDetails = payload.guestDetails?.[0];
            const paymentMethod: SMPaymentMethod =
                payload.paymentMethod === 'pay_at_hotel' ? 'PAY_AT_HOTEL' : 'PREPAY';

            const totalBeforeTax = payload.finalPrice.dailyPriceBrakeDown
                .reduce((s: number, d: any) => s + (d.baseChargesAmount ?? d.baseRate ?? 0), 0);
            const totalAfterTax = totalBeforeTax + (payload.finalPrice.taxedAmount ?? 0);

            const params: SMReservationPushParams = {
                hotelCode: siteMinderHotelCode,
                bookingCode,
                resStatus: 'Cancel',
                createDateTime: originalCreateDateTime,
                lastModifyDateTime: new Date().toISOString(),
                channelCode,
                channelName,
                // Cancel still requires full reservation data per SiteMinder spec
                roomStays: SiteMinderReservationService.buildRoomStays(payload, siteMinderHotelCode),
                primaryGuest: {
                    firstName: guestDetails?.firstName ?? '',
                    lastName: guestDetails?.lastName ?? '',
                    salutation: guestDetails?.salutation,
                    phone: payload.bookingUserPhone,
                    email: payload.bookingUserEmail,
                },
                currencyCode: payload.currencyCode,
                paymentMethod,
                totalAmountBeforeTax: totalBeforeTax.toFixed(2),
                totalAmountAfterTax: totalAfterTax.toFixed(2),
            };

            const validationError = SiteMinderReservationValidation.validate(params);
            if (validationError) {
                return { success: false, message: validationError };
            }

            const xml = SiteMinderReservationXmlBuilder.buildReservationRequest(
                params,
                config.siteMinderUsername!,
                config.siteMinderPassword!
            );

            return SiteMinderReservationService.pushToSiteMinder(xml, bookingCode);
        } catch (error: any) {
            return { success: false, message: error?.message ?? 'Unknown error in pushCancel' };
        }
    }
}