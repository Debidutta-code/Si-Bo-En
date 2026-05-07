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
import { ServiceLogger } from '../../../logs/services/service-log.service';

const logger = new ServiceLogger('SiteMinderReservationService');

export class SiteMinderReservationService {

    private static async pushToSiteMinder(
        xml: string,
        bookingCode: string,
        smEndpoint: string
    ): Promise<SMReservationResult> {
        try {
            const response = await axios.post(smEndpoint, xml, {
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    SOAPAction: '',
                },
                timeout: 60000,
            });
            return SiteMinderReservationXmlBuilder.parseReservationResponse(response.data, bookingCode);
        } catch (error: any) {
            if (error?.response?.data) {
                return SiteMinderReservationXmlBuilder.parseReservationResponse(error.response.data, bookingCode);
            }
            return { success: false, message: `SiteMinder push failed: ${error?.message ?? 'Unknown error'}` };
        }
    }

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

    private static buildRoomStays(
        payload: ICReservationPayload,
        siteMinderHotelCode: string
    ): SMRoomStay[] {
        const { finalPrice } = payload;
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

            const allRoomsTotal = finalPrice.dailyPriceBrakeDown.reduce(
                (s: number, d: any) => s + (d.totalAmount ?? d.baseChargesAmount ?? 0), 0
            );
            const thisRoomTotal = breakdown.reduce(
                (s: number, d: any) => s + (d.totalAmount ?? d.baseChargesAmount ?? 0), 0
            );

            const roomShare = allRoomsTotal > 0 ? thisRoomTotal / allRoomsTotal : 1;
            const roomTaxShare = roomShare * (finalPrice.taxedAmount ?? 0);

            const numberOfNights = breakdown.length;
            const taxPerNight = numberOfNights > 0
                ? Math.round((roomTaxShare / numberOfNights) * 100) / 100
                : 0;

            // ✅ NO addon, NO tourist fee — those go to Services only

            return breakdown.map((day: any) => {
                const base = day.totalAmount ?? day.baseChargesAmount ?? 0;
                const afterTax = Math.round((base + taxPerNight) * 100) / 100;

                const effectiveDate = SiteMinderReservationService.toDateString(day.date);
                const nextDay = new Date(day.date);
                nextDay.setDate(nextDay.getDate() + 1);
                const expireDate = SiteMinderReservationService.toDateString(nextDay);

                return {
                    effectiveDate,
                    expireDate,
                    ...(taxPerNight > 0 && { amountBeforeTax: base.toFixed(2) }),
                    amountAfterTax: afterTax.toFixed(2),
                    currencyCode: day.currencyCode ?? payload.currencyCode,
                };
            });
        };

        const buildGuestCounts = (room: { adults: number; children: number }): SMGuestCount[] => {
            const counts: SMGuestCount[] = [];
            if (room.adults > 0) counts.push({ ageQualifyingCode: '10', count: room.adults });
            if (room.children > 0) counts.push({ ageQualifyingCode: '8', count: room.children });
            return counts;
        };

        const getRoomTotal = (roomNumber: number) => {
            const breakdown = finalPrice.dailyPriceBrakeDown.filter(
                (day: any) => String(day.roomNumber) === String(roomNumber)
            );
            const src = breakdown.length > 0 ? breakdown : finalPrice.dailyPriceBrakeDown;

            const allRoomsTotal = finalPrice.dailyPriceBrakeDown.reduce(
                (s: number, d: any) => s + (d.totalAmount ?? d.baseChargesAmount ?? 0), 0
            );
            const beforeTax = src.reduce(
                (s: number, d: any) => s + (d.totalAmount ?? d.baseChargesAmount ?? 0), 0
            );

            const roomShare = allRoomsTotal > 0 ? beforeTax / allRoomsTotal : 1;
            const roomTax = roomShare * (finalPrice.taxedAmount ?? 0);

            // ✅ room + tax only, NO addon, NO tourist fee
            const afterTax = Math.round((beforeTax + roomTax) * 100) / 100;

            return {
                beforeTax: Math.round(beforeTax * 100) / 100,
                afterTax,
            };
        };

        if (roomsArray.length > 0) {
            return roomsArray.map((room: any, index: number) => {
                const roomNumber = index + 1;
                const totals = getRoomTotal(roomNumber);
                return {
                    roomTypeCode: payload.roomTypeCode,
                    roomTypeName: payload.roomTypeCode,
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
        const totalBefore = finalPrice.dailyPriceBrakeDown.reduce(
            (s: number, d: any) => s + (d.totalAmount ?? d.baseChargesAmount ?? d.baseRate ?? 0), 0
        );
        const totalAfter = Math.round((totalBefore + (finalPrice.taxedAmount ?? 0)) * 100) / 100;

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
            totalAmountBeforeTax: (Math.round(totalBefore * 100) / 100).toFixed(2),
            totalAmountAfterTax: totalAfter.toFixed(2),
            currencyCode: payload.currencyCode,
        }];
    }

    // ─── Helper to build totals for params ───────────────────────────────────
    private static buildTotals(payload: ICReservationPayload): {
        totalBeforeTax: string;
        totalAfterTax: string;
    } {
        const totalBeforeTax = payload.finalPrice.dailyPriceBrakeDown.reduce(
            (s: number, d: any) => s + (d.totalAmount ?? d.baseChargesAmount ?? d.baseRate ?? 0), 0
        );

        // ✅ Use totalAmount = room + tax + addon + tourist fee (full grand total)
        const totalAfterTax = payload.finalPrice.totalAmount
            ?? (totalBeforeTax + (payload.finalPrice.taxedAmount ?? 0));

        return {
            totalBeforeTax: (Math.round(totalBeforeTax * 100) / 100).toFixed(2),
            totalAfterTax: (Math.round(totalAfterTax * 100) / 100).toFixed(2),
        };
    }

    // ─── Helper to extract payLater promotions (tourist fee etc.) ────────────
   private static getPayLaterServices(payload: ICReservationPayload): any[] {
    const promotions = payload.finalPrice?.promotionBrakeDown ?? [];
    return promotions
        .filter((p: any) => p.restrictionType === 'payLater')
        .map((p: any) => ({
            name: p.name,                 
            amount: p.discountAmount,      
            totalAmount: p.discountAmount, 
            currencyCode: p.currencyCode ?? payload.currencyCode,
        }));
}

    // ─── PUBLIC: Commit ───────────────────────────────────────────────────────
    public static async pushCommit(
        payload: ICReservationPayload,
        bookingCode: string,
        siteMinderHotelCode: string,
        channelCode: string,
        channelName: string,
        smEndpoint: string
    ): Promise<SMReservationResult> {
        try {
            const guestDetails = payload.guestDetails?.[0];
            const paymentMethod: SMPaymentMethod =
                payload.paymentMethod === 'pay_at_hotel' ? 'PAY_AT_HOTEL' : 'PREPAY';

            const { totalBeforeTax, totalAfterTax } = SiteMinderReservationService.buildTotals(payload);

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
                totalAmountBeforeTax: totalBeforeTax,
                totalAmountAfterTax: totalAfterTax,
                // ✅ addons + tourist fee (payLater) both go to Services
                addonBrakeDown: payload.finalPrice?.addonBrakeDown ?? [],
                payLaterBrakeDown: SiteMinderReservationService.getPayLaterServices(payload),
                guestDetails: payload.guestDetails,
            };

            const validationError = SiteMinderReservationValidation.validate(params);
            if (validationError) return { success: false, message: validationError };

            const xml = SiteMinderReservationXmlBuilder.buildReservationRequest(
                params,
                config.siteMinderReservationUserName!,
                config.siteMinderReservationPassword!
            );

            const log = logger.start('pushCommit');
            log.setIncoming({ bookingCode, hotelCode: siteMinderHotelCode, params, xml });

            let result: SMReservationResult;
            try {
                result = await SiteMinderReservationService.pushToSiteMinder(xml, bookingCode, smEndpoint);
            } catch (err) {
                log.setError(err).save();
                throw err;
            }

            log
                .pushMessage(result.success ? 'SM commit succeeded' : 'SM commit failed', result.success ? 'info' : 'error')
                .setMeta({ smResponse: result })
                .save();

            return result;
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
        channelName: string,
        smEndpoint: string
    ): Promise<SMReservationResult> {
        try {
            const guestDetails = payload.guestDetails?.[0];
            const paymentMethod: SMPaymentMethod =
                payload.paymentMethod === 'pay_at_hotel' ? 'PAY_AT_HOTEL' : 'PREPAY';

            const { totalBeforeTax, totalAfterTax } = SiteMinderReservationService.buildTotals(payload);

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
                totalAmountBeforeTax: totalBeforeTax,
                totalAmountAfterTax: totalAfterTax,
                addonBrakeDown: payload.finalPrice?.addonBrakeDown ?? [],
                payLaterBrakeDown: SiteMinderReservationService.getPayLaterServices(payload),
            };

            const validationError = SiteMinderReservationValidation.validate(params);
            if (validationError) return { success: false, message: validationError };

            const xml = SiteMinderReservationXmlBuilder.buildReservationRequest(
                params,
                config.siteMinderReservationUserName!,
                config.siteMinderReservationPassword!
            );

            const log = logger.start('pushModify');
            log.setIncoming({ bookingCode, hotelCode: siteMinderHotelCode, params, xml });

            let result: SMReservationResult;
            try {
                result = await SiteMinderReservationService.pushToSiteMinder(xml, bookingCode, smEndpoint);
            } catch (err) {
                log.setError(err).save();
                throw err;
            }

            log
                .pushMessage(result.success ? 'SM modify succeeded' : 'SM modify failed', result.success ? 'info' : 'error')
                .setMeta({ smResponse: result })
                .save();

            return result;
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
        channelName: string,
        smEndpoint: string
    ): Promise<SMReservationResult> {
        try {
            const guestDetails = payload.guestDetails?.[0];
            const paymentMethod: SMPaymentMethod =
                payload.paymentMethod === 'pay_at_hotel' ? 'PAY_AT_HOTEL' : 'PREPAY';

            const { totalBeforeTax, totalAfterTax } = SiteMinderReservationService.buildTotals(payload);

            const params: SMReservationPushParams = {
                hotelCode: siteMinderHotelCode,
                bookingCode,
                resStatus: 'Cancel',
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
                totalAmountBeforeTax: totalBeforeTax,
                totalAmountAfterTax: totalAfterTax,
                addonBrakeDown: payload.finalPrice?.addonBrakeDown ?? [],
                payLaterBrakeDown: SiteMinderReservationService.getPayLaterServices(payload),
            };

            const validationError = SiteMinderReservationValidation.validate(params);
            if (validationError) return { success: false, message: validationError };

            const xml = SiteMinderReservationXmlBuilder.buildReservationRequest(
                params,
                config.siteMinderReservationUserName!,
                config.siteMinderReservationPassword!
            );

            const log = logger.start('pushCancel');
            log.setIncoming({ bookingCode, hotelCode: siteMinderHotelCode, params, xml });

            let result: SMReservationResult;
            try {
                result = await SiteMinderReservationService.pushToSiteMinder(xml, bookingCode, smEndpoint);
            } catch (err) {
                log.setError(err).save();
                throw err;
            }

            log
                .pushMessage(result.success ? 'SM cancel succeeded' : 'SM cancel failed', result.success ? 'info' : 'error')
                .setMeta({ smResponse: result })
                .save();

            return result;
        } catch (error: any) {
            return { success: false, message: error?.message ?? 'Unknown error in pushCancel' };
        }
    }
}