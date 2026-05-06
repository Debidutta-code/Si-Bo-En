// validations/site-minder-reservation.validation.ts

import { SMReservationPushParams } from "../types";



export class SiteMinderReservationValidation {

    public static validate(params: SMReservationPushParams): string | null {

        // ── Required fields ───────────────────────────────────────────────────
        if (!params.hotelCode) return 'hotelCode is required';
        if (!params.bookingCode) return 'bookingCode is required';
        if (!params.resStatus) return 'resStatus is required';
        if (!['Commit', 'Modify', 'Cancel'].includes(params.resStatus)) {
            return 'resStatus must be Commit, Modify or Cancel';
        }

        // Modify and Cancel require lastModifyDateTime
        if (['Modify', 'Cancel'].includes(params.resStatus) && !params.lastModifyDateTime) {
            return 'lastModifyDateTime is required for Modify and Cancel';
        }

        if (!params.primaryGuest?.firstName) return 'primaryGuest.firstName is required';
        if (!params.primaryGuest?.lastName) return 'primaryGuest.lastName is required';

        // ── BookingCode format — alphanumeric only, no special chars ──────────
        if (!/^[a-zA-Z0-9]+$/.test(params.bookingCode)) {
            return 'bookingCode must contain only alphanumeric characters (no special chars)';
        }

        // ── Room stays ────────────────────────────────────────────────────────
        if (!params.roomStays || params.roomStays.length === 0) {
            return 'At least one roomStay is required';
        }

        for (const [i, rs] of params.roomStays.entries()) {
            if (!rs.roomTypeCode) return `roomStay[${i}]: roomTypeCode is required`;
            if (!rs.ratePlanCode) return `roomStay[${i}]: ratePlanCode is required`;
            if (!rs.checkIn) return `roomStay[${i}]: checkIn is required`;
            if (!rs.checkOut) return `roomStay[${i}]: checkOut is required`;

            const checkIn = new Date(rs.checkIn);
            const checkOut = new Date(rs.checkOut);

            if (isNaN(checkIn.getTime())) return `roomStay[${i}]: invalid checkIn date`;
            if (isNaN(checkOut.getTime())) return `roomStay[${i}]: invalid checkOut date`;

            // SiteMinder rejects same-day bookings
            if (checkOut <= checkIn) {
                return `roomStay[${i}]: checkOut must be at least 1 day after checkIn`;
            }

            // Adult count is mandatory
            const hasAdult = rs.guestCounts.some(gc => gc.ageQualifyingCode === '10' && gc.count > 0);
            if (!hasAdult) return `roomStay[${i}]: at least 1 adult is required`;

            // Rates
            if (!rs.roomRates?.rates || rs.roomRates.rates.length === 0) {
                return `roomStay[${i}]: at least one rate day is required`;
            }

            for (const [j, rate] of rs.roomRates.rates.entries()) {
                if (!rate.effectiveDate) return `roomStay[${i}].rates[${j}]: effectiveDate is required`;
                if (!rate.expireDate) return `roomStay[${i}].rates[${j}]: expireDate is required`;
                if (!rate.currencyCode) return `roomStay[${i}].rates[${j}]: currencyCode is required`;
                if (!rate.amountAfterTax && !rate.amountBeforeTax) {
                    return `roomStay[${i}].rates[${j}]: amountAfterTax or amountBeforeTax is required`;
                }
            }
        }

        // ── Payment method ────────────────────────────────────────────────────
        if (!['PAY_AT_HOTEL', 'PREPAY'].includes(params.paymentMethod)) {
            return 'paymentMethod must be PAY_AT_HOTEL or PREPAY';
        }

        // ── Totals ────────────────────────────────────────────────────────────
        if (!params.totalAmountAfterTax && !params.totalAmountBeforeTax) {
            return 'totalAmountAfterTax or totalAmountBeforeTax is required';
        }

        if (!params.currencyCode) return 'currencyCode is required';

        return null; // valid
    }
}