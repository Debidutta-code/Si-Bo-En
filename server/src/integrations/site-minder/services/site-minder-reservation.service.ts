// services/site-minder-reservation.service.ts

import axios from 'axios';
import { config } from '../../../config';
import { ICReservationS } from '../../../reservation/types';
import {
    SMDiscount,
    SMGuestCount,
    SMPaymentMethod,
    SMRateDay,
    SMReservationPushParams,
    SMReservationResult,
    SMRoomStay,
    SMService,
} from '../types/site-minder-reservation.types';
import { SiteMinderReservationXmlBuilder } from '../utils/xml-reservation';
import { SiteMinderReservationValidation } from '../validation/reservation-validation';
import { ServiceLogger } from '../../../logs/services/service-log.service';
import { getRatePlanName } from '../../../utils/ratePlan.util';

const logger = new ServiceLogger('SiteMinderReservationService');

// ─── Small helpers ────────────────────────────────────────────────────────────

const isoTimestamp = (): string =>
    new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');

const fmt = (n: number): string => (Math.round(n * 100) / 100).toFixed(2);

function toDateString(date: string | Date): string {
    if (date instanceof Date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(String(date))) return String(date).split('T')[0];
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, '0');
        const d = String(parsed.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    return String(date);
}

function nextDateString(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + 1);
    return toDateString(d);
}

export class SiteMinderReservationService {
    private static async pushToSiteMinder(
        xml: string,
        bookingCode: string,
        smEndpoint: string
    ): Promise<SMReservationResult> {
        try {
            console.log("Reservation url : ", smEndpoint);
            console.log("Reservation xml : ", xml);
            const response = await axios.post(smEndpoint, xml, {
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    SOAPAction: '',
                },
                timeout: 200000,
            });
            const result = SiteMinderReservationXmlBuilder.parseReservationResponse(
                response.data,
                bookingCode
            );
            console.log("Reservation response : ", result);
            return { ...result, rawResponse: response.data };  // ← attach raw
        } catch (error: any) {
            if (error?.response?.data) {
                const result = SiteMinderReservationXmlBuilder.parseReservationResponse(
                    error.response.data,
                    bookingCode
                );
                return { ...result, rawResponse: error.response.data };  // ← attach raw
            }
            return {
                success: false,
                message: `SiteMinder push failed: ${error?.message ?? 'Unknown error'}`,
            };
        }
    }

   

    private static async buildRoomStays(payload: ICReservationS): Promise<SMRoomStay[]> {
        const { finalPrice, currencyCode } = payload;
        const roomsArray = payload?.guests?.roomsArray ?? [];

        const checkIn = toDateString(payload.reservationStartDate);
        const checkOut = toDateString(payload.reservationEndDate);
        const roomDescription = payload.roomDescription ||"";
        const totalDecreaseDiscount =
            (finalPrice.totalPromotionAmount ?? 0) +
            (finalPrice.loyalityDiscount ?? 0) +
            (finalPrice.promoCodeDiscount ?? 0);

        const allRoomsRawTotal = finalPrice.dailyPriceBrakeDown.reduce(
            (s: number, d: any) => s + (d.totalAmount ?? d.baseChargesAmount ?? 0),
            0
        );
        const totalTax = finalPrice.taxedAmount ?? 0;

        const getDaysForRoom = (roomNumber: number) => {
            const days = finalPrice.dailyPriceBrakeDown.filter(
                (d: any) => String(d.roomNumber) === String(roomNumber)
            );
            return days.length > 0 ? days : finalPrice.dailyPriceBrakeDown;
        };

        const buildRates = (roomNumber: number): SMRateDay[] => {
            const days = getDaysForRoom(roomNumber);
            return days.map((day: any) => {
                const rawRate: number = day.totalAmount ?? day.baseChargesAmount ?? 0;
                const discountShare =
                    allRoomsRawTotal > 0
                        ? (rawRate / allRoomsRawTotal) * totalDecreaseDiscount
                        : 0;
                const discountedBase = rawRate - discountShare;
                const taxShare =
                    allRoomsRawTotal > 0
                        ? (rawRate / allRoomsRawTotal) * totalTax
                        : 0;

                const afterTax = discountedBase + taxShare;

                const effectiveDate = toDateString(day.date);
                const expireDate = nextDateString(effectiveDate);

                const hasTax = Math.abs(afterTax - discountedBase) > 0.001;

                return {
                    effectiveDate,
                    expireDate,
                    ...(hasTax && { amountBeforeTax: fmt(discountedBase) }),
                    amountAfterTax: fmt(afterTax),
                    currencyCode: day.currencyCode ?? currencyCode,
                };
            });
        };

        // ── Helper: build RoomStay totals for a room ──────────────────────────
        const buildRoomTotals = (roomNumber: number) => {
            const days = getDaysForRoom(roomNumber);
            const roomRawTotal = days.reduce(
                (s: number, d: any) => s + (d.totalAmount ?? d.baseChargesAmount ?? 0),
                0
            );
            const roomShare = allRoomsRawTotal > 0 ? roomRawTotal / allRoomsRawTotal : 1;

            const roomDiscountShare = totalDecreaseDiscount * roomShare;
            const roomTaxShare = totalTax * roomShare;

            const beforeTax = roomRawTotal - roomDiscountShare;
            const afterTax = beforeTax + roomTaxShare;

            return {
                beforeTax: fmt(beforeTax),
                afterTax: fmt(afterTax),
            };
        };

        // ── Helper: build GuestCounts from room guest distribution ────────────
        const buildGuestCounts = (room: {
            adults: number;
            children: number;
            childAges?: number[];
        }): SMGuestCount[] => {
            const counts: SMGuestCount[] = [];

            if (room.adults > 0) {
                counts.push({ ageQualifyingCode: '10', count: room.adults });
            }

            // Per SM docs: each child needs its own GuestCount entry with @Age
            if (room.children > 0) {
                const ages = room.childAges ?? [];
                if (ages.length === room.children) {
                    // We have individual ages — send one entry per child
                    ages.forEach((age: number) => {
                        counts.push({ ageQualifyingCode: '8', count: 1, age });
                    });
                } else {
                    // No individual ages — send a single combined entry
                    counts.push({ ageQualifyingCode: '8', count: room.children });
                }
            }

            return counts;
        };

        const ratePlanName = await getRatePlanName(payload.ratePlanCode)
        if (roomsArray.length > 0) {
            return roomsArray.map((room: any, index: number) => {
                const roomNumber = index + 1;
                const totals = buildRoomTotals(roomNumber);
                return {
                    roomTypeCode: payload.roomTypeCode,
                    roomTypeName: payload.roomName,
                    roomDescription: payload.roomDescription ||"",
                    ratePlanCode: payload.ratePlanCode,
                    ratePlanName: ratePlanName,
                    roomRates: {
                        roomTypeCode: payload.roomTypeCode,
                        ratePlanCode: payload.ratePlanCode,
                        rates: buildRates(roomNumber),
                    },
                    guestCounts: buildGuestCounts({
                        adults: room.adults,
                        children: room.children ?? 0,
                        childAges: room.childAges ?? [],
                    }),
                    checkIn,
                    checkOut,
                    totalAmountBeforeTax: totals.beforeTax,
                    totalAmountAfterTax: totals.afterTax,
                    currencyCode,
                };
            });
        }

        // ── Single room fallback ──────────────────────────────────────────────
        const totals = buildRoomTotals(1);
        return [
            {
                roomTypeCode: payload.roomTypeCode,
                roomTypeName: payload.roomName,
                ratePlanCode: payload.ratePlanCode,
                ratePlanName: ratePlanName,
                roomDescription,
                roomRates: {
                    roomTypeCode: payload.roomTypeCode,
                    ratePlanCode: payload.ratePlanCode,
                    rates: buildRates(1),
                },
                guestCounts: buildGuestCounts({
                    adults: payload?.guests?.adults ?? 1,
                    children: payload?.guests?.children ?? 0,
                    childAges: [],
                }),
                checkIn,
                checkOut,
                totalAmountBeforeTax: totals.beforeTax,
                totalAmountAfterTax: totals.afterTax,
                currencyCode,
            },
        ];
    }

    
    private static buildServices(payload: ICReservationS): SMService[] {
        const services: SMService[] = [];
        const currencyCode = payload.currencyCode;

        // ── Map addon name → SM inventory code ───────────────────────────────
        const inventoryCodeFor = (name: string): string => {
            const n = name.toLowerCase();
            if (n.includes('extra bed') || n.includes('extrabed')) return 'EXTRA_BED';
            if (n.includes('meal') || n.includes('breakfast') || n.includes('lunch') || n.includes('dinner')) return 'MEAL';
            if (n.includes('parking')) return 'PARKING';
            return 'OTHER';
        };

        // ── Group addon breakdown entries ─────────────────────────────────────
        // Group by addonId, then check if dates are consecutive to merge.
        const addonBrakeDowns: any[] = payload.finalPrice?.addonBrakeDowns ?? [];

        // Group by addonId + name combined.
        // Using addonId alone is NOT enough — the same addonId can have multiple
        // named variants e.g. "Test Addon 2", "Test Addon 2 (Child age 10)",
        // "Test Addon 2 (Child age 7)" all share the same addonId but must be
        // separate Service nodes. Combining addonId + name gives the correct key.
        const addonGroups = new Map<string, any[]>();
        addonBrakeDowns.forEach((addon: any) => {
            const key = `${addon.addonId ?? ''}_${addon.name}`;
            if (!addonGroups.has(key)) addonGroups.set(key, []);
            addonGroups.get(key)!.push(addon);
        });

        addonGroups.forEach((entries) => {
            // Sort by date ascending
            entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            // Merge consecutive date runs
            const runs: { entries: any[]; start: string; end: string }[] = [];
            for (const entry of entries) {
                const dateStr = toDateString(entry.date);
                if (runs.length === 0) {
                    runs.push({ entries: [entry], start: dateStr, end: dateStr });
                    continue;
                }
                const lastRun = runs[runs.length - 1];
                const expected = nextDateString(lastRun.end);
                if (expected === dateStr) {
                    // Consecutive — extend the run
                    lastRun.entries.push(entry);
                    lastRun.end = dateStr;
                } else {
                    // Non-consecutive — start a new run
                    runs.push({ entries: [entry], start: dateStr, end: dateStr });
                }
            }

            // One SMService per run
            runs.forEach((run) => {
                const first = run.entries[0];
                const totalAmt = run.entries.reduce(
                    (s: number, e: any) => s + (e.totalAmount ?? e.amount ?? 0),
                    0
                );
                services.push({
                    inventoryCode: inventoryCodeFor(first.name),
                    name: first.name,
                    baseAmount: first.amount ?? first.unitPrice ?? 0,
                    totalAmount: totalAmt,
                    currencyCode: first.currencyCode ?? currencyCode,
                    isPayLater: false,
                    startDate: run.start,
                    endDate: run.end,
                });
            });
        });

        // ── payLater promotions ───────────────────────────────────────────────
        const promotions: any[] = payload.finalPrice?.promotionBrakeDown ?? [];
        promotions
            .filter((p: any) => p.restrictionType === 'payLater')
            .forEach((p: any) => {
                services.push({
                    inventoryCode: 'OTHER',
                    name: `${p.name} (pay at property)`,
                    baseAmount: p.discountAmount ?? 0,
                    totalAmount: p.discountAmount ?? 0,
                    currencyCode: currencyCode, // always use reservation currency, not promotion currency
                    isPayLater: true,
                    // no startDate / endDate for payLater
                });
            });

        return services;
    }

    // ── Build Discounts ───────────────────────────────────────────────────────
    //
    // Discounts are NOT sent as Services or separate XML fields.
    // They are already baked into amountBeforeTax.
    // We render them as Comments in ResGlobalInfo so the hotel sees the breakdown.

    private static buildDiscounts(payload: ICReservationS): SMDiscount[] {
        const discounts: SMDiscount[] = [];
        const currency = payload.currencyCode;

        // Decrease-type promotions (anything that is NOT payLater)
        // These are already baked into amountBeforeTax — we just comment them.
        const promotions: any[] = payload.finalPrice?.promotionBrakeDown ?? [];
        promotions
            .filter((p: any) => p.restrictionType !== 'payLater')
            .filter((p: any) => (p.discountAmount ?? 0) > 0)
            .forEach((p: any) => {
                discounts.push({
                    name: `${p.name} discount`,
                    amount: p.discountAmount ?? 0,
                    currencyCode: p.currencyCode ?? currency,
                });
            });

        // Loyalty discount
        if ((payload.finalPrice?.loyalityDiscount ?? 0) > 0) {
            discounts.push({
                name: 'Loyalty discount',
                amount: payload.finalPrice.loyalityDiscount,
                currencyCode: currency,
            });
        }

        // Promo code discount
        if ((payload.finalPrice?.promoCodeDiscount ?? 0) > 0) {
            discounts.push({
                name: 'Promo code discount',
                amount: payload.finalPrice.promoCodeDiscount,
                currencyCode: currency,
            });
        }

        return discounts;
    }

    // ── Build ResGlobalInfo totals ────────────────────────────────────────────
    //
    // AmountBeforeTax = finalPrice.amountBeforeTax
    //                 = rooms + addons - all decrease discounts (loyalty, promo, mlos etc.)
    //
    // AmountAfterTax  = finalPrice.currentChargeableAmount
    //                 = amountBeforeTax + tax
    //                 (does NOT include payLater / latterpayableAmount)

    private static buildGlobalTotals(payload: ICReservationS): {
        totalBeforeTax: string;
        totalAfterTax: string;
    } {
        const beforeTax = (payload.finalPrice.amountBeforeTax ?? 0) + (payload.finalPrice.latterpayableAmount ?? 0);
        return {
            totalBeforeTax: fmt(beforeTax),
            totalAfterTax: fmt(payload.finalPrice.totalAmount ?? 0),
        };
    }

    private static async buildParams(
        payload: ICReservationS,
        bookingCode: string,
        resStatus: 'Commit' | 'Modify' | 'Cancel',
        siteMinderHotelCode: string,
        channelCode: string,
        channelName: string,
        createDateTime: string,
        lastModifyDateTime?: string
    ): Promise<SMReservationPushParams> {
        const guestDetails = payload.guestDetails ?? [];
        const primaryGuest = guestDetails[0];

        const paymentMethod: SMPaymentMethod =
            payload.paymentMethod === 'pay_at_hotel' ? 'PAY_AT_HOTEL' : 'PREPAY';

        const { totalBeforeTax, totalAfterTax } =
            SiteMinderReservationService.buildGlobalTotals(payload);

        return {
            hotelCode: siteMinderHotelCode,
            hotelName:payload.hotelName,
            bookingCode,
            resStatus,
            createDateTime,
            ...(lastModifyDateTime && { lastModifyDateTime }),
            channelCode,
            channelName,
            roomStays: await SiteMinderReservationService.buildRoomStays(payload),
            primaryGuest: {
                firstName: primaryGuest?.firstName ?? '',
                lastName: primaryGuest?.lastName ?? '',
                phone: payload.bookingUserPhone,
                email: payload.bookingUserEmail,
            },
            guestDetails,
            currencyCode: payload.currencyCode,
            paymentMethod,
            totalAmountBeforeTax: totalBeforeTax,
            totalAmountAfterTax: totalAfterTax,
            services: SiteMinderReservationService.buildServices(payload),
            discounts: SiteMinderReservationService.buildDiscounts(payload),
        };
    }

    // ── PUBLIC: Commit (new reservation) ─────────────────────────────────────

    public static async pushCommit(
        payload: ICReservationS,
        bookingCode: string,
        siteMinderHotelCode: string,
        channelCode: string,
        channelName: string,
        smEndpoint: string
    ): Promise<SMReservationResult> {
        console.log('payload', JSON.stringify(payload, null, 2));
        try {
            const params = await SiteMinderReservationService.buildParams(
                payload,
                bookingCode,
                'Commit',
                siteMinderHotelCode,
                channelCode,
                channelName,
                isoTimestamp()
                // no lastModifyDateTime for Commit
            );

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
                result = await SiteMinderReservationService.pushToSiteMinder(
                    xml,
                    bookingCode,
                    smEndpoint
                );
            } catch (err) {
                log.setError(err).save();
                throw err;
            }

            log
                .pushMessage(
                    result.success ? 'SM commit succeeded' : 'SM commit failed',
                    result.success ? 'info' : 'error'
                )
                .setMeta({ smResponse: result, rawXmlResponse: result.rawResponse })
                .save();

            return result;
        } catch (error: any) {
            return {
                success: false,
                message: error?.message ?? 'Unknown error in pushCommit',
            };
        }
    }

    // ── PUBLIC: Modify ────────────────────────────────────────────────────────

    public static async pushModify(
        payload: ICReservationS,
        bookingCode: string,
        originalCreateDateTime: string,
        siteMinderHotelCode: string,
        channelCode: string,
        channelName: string,
        smEndpoint: string
    ): Promise<SMReservationResult> {
        try {
            const params = await SiteMinderReservationService.buildParams(
                payload,
                bookingCode,
                'Modify',
                siteMinderHotelCode,
                channelCode,
                channelName,
                originalCreateDateTime,
                isoTimestamp()  // lastModifyDateTime = now
            );

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
                result = await SiteMinderReservationService.pushToSiteMinder(
                    xml,
                    bookingCode,
                    smEndpoint
                );
            } catch (err) {
                log.setError(err).save();
                throw err;
            }

            log
                .pushMessage(
                    result.success ? 'SM modify succeeded' : 'SM modify failed',
                    result.success ? 'info' : 'error'
                )
                .setMeta({ smResponse: result })
                .save();

            return result;
        } catch (error: any) {
            return {
                success: false,
                message: error?.message ?? 'Unknown error in pushModify',
            };
        }
    }

    // ── PUBLIC: Cancel ────────────────────────────────────────────────────────

    public static async pushCancel(
        payload: ICReservationS,
        bookingCode: string,
        originalCreateDateTime: string,
        siteMinderHotelCode: string,
        channelCode: string,
        channelName: string,
        smEndpoint: string
    ): Promise<SMReservationResult> {
        try {
            const params = await SiteMinderReservationService.buildParams(
                payload,
                bookingCode,
                'Cancel',
                siteMinderHotelCode,
                channelCode,
                channelName,
                originalCreateDateTime,
                isoTimestamp() 
            );

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
                result = await SiteMinderReservationService.pushToSiteMinder(
                    xml,
                    bookingCode,
                    smEndpoint
                );
            } catch (err) {
                log.setError(err).save();
                throw err;
            }

            log
                .pushMessage(
                    result.success ? 'SM cancel succeeded' : 'SM cancel failed',
                    result.success ? 'info' : 'error'
                )
                .setMeta({ smResponse: result })
                .save();

            return result;
        } catch (error: any) {
            return {
                success: false,
                message: error?.message ?? 'Unknown error in pushCancel',
            };
        }
    }
}