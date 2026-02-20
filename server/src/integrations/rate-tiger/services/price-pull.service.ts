// services/price-pull.service.ts

import {
    RateTigerOTAHotelRatePlanRS,
    RateTigerRatePlanPrice,
    RateTigerRate,
    RateTigerRatePlanRequest,
    PricePullChargeResult,
} from '../types/price-pull.types';
import { PricePullDao } from '../dao';

export class PricePullService {
    public static async getPricePull(
        hotelCode: string,
        requestId: string,
        ratePlanRequests: RateTigerRatePlanRequest[]
    ): Promise<RateTigerOTAHotelRatePlanRS> {
        try {
            const propertyExists = await PricePullDao.propertyExists(hotelCode);
            if (!propertyExists) {
                return {
                    otaHotelRatePlanRS: {
                        requestId,
                        timeStamp: new Date().toISOString(),
                        hotelCode,
                        success: 'false',
                        error: {
                            type: 'ProcessingError',
                            errorCode: '404',
                            text: `Property with code ${hotelCode} not found`,
                        },
                    },
                };
            }

            const ratePlansResponse: RateTigerRatePlanPrice[] = [];

            for (const ratePlanRequest of ratePlanRequests) {
                const startDate = new Date(ratePlanRequest.start);
                const endDate = new Date(ratePlanRequest.end);

                // Fetch all charges for this rate plan and date range
                const charges = await PricePullDao.getChargesForRatePlan(
                    hotelCode,
                    ratePlanRequest.ratePlanCode,
                    startDate,
                    endDate
                );

                if (charges.length === 0) continue;

                // Get currency from first charge
                const currencyCode = charges[0].currencyCode;

                // Group charges by roomTypeCode + consecutive date ranges
                const groupedRates =
                    PricePullService.groupChargesIntoDateRanges(charges);

                const rates: RateTigerRate[] = groupedRates.map(group => ({
                    start: group.start,
                    end: group.end,
                    invTypeCode: group.roomTypeCode,

                    // Base guest amounts (occupancy 1-6 for adults, 1 for child)
                    baseByGuestAmts: group.baseByGuestAmounts.map(bg => ({
                        amountBeforeTax: bg.amountBeforeTax.toFixed(2),
                        ageQualifyingCode: '10', // Adult
                        numberOfGuests: bg.numberOfGuests.toString(),
                    })),

                    // Additional guest amounts (extra adult + extra child)
                    additionalGuestAmts: group.additionalGuestAmounts.map(
                        ag => ({
                            amount: ag.amount.toFixed(2),
                            ageQualifyingCode: ag.ageQualifyingCode,
                        })
                    ),
                }));

                ratePlansResponse.push({
                    ratePlanCode: ratePlanRequest.ratePlanCode,
                    currencyCode: currencyCode,
                    rates,
                });
            }

            return {
                otaHotelRatePlanRS: {
                    requestId,
                    timeStamp: new Date().toISOString(),
                    hotelCode,
                    success: 'true',
                    ratePlans: ratePlansResponse,
                },
            };
        } catch (error: any) {
            return {
                otaHotelRatePlanRS: {
                    requestId,
                    timeStamp: new Date().toISOString(),
                    hotelCode,
                    success: 'false',
                    error: {
                        type: 'ProcessingError',
                        errorCode: '500',
                        text: error?.message || 'Failed to get price pull',
                    },
                },
            };
        }
    }

    // ─── HELPER ──────────────────────────────────────────────────────────────────
    // Groups individual date charges into consecutive date ranges
    private static groupChargesIntoDateRanges(
        charges: PricePullChargeResult[]
    ): Array<{
        start: string;
        end: string;
        roomTypeCode: string;
        baseByGuestAmounts: Array<{
            numberOfGuests: number;
            amountBeforeTax: number;
        }>;
        additionalGuestAmounts: Array<{
            ageQualifyingCode: string;
            amount: number;
        }>;
    }> {
        if (charges.length === 0) return [];

        const groups: Array<{
            start: string;
            end: string;
            roomTypeCode: string;
            baseByGuestAmounts: Array<{
                numberOfGuests: number;
                amountBeforeTax: number;
            }>;
            additionalGuestAmounts: Array<{
                ageQualifyingCode: string;
                amount: number;
            }>;
        }> = [];

        let currentGroup = {
            start: charges[0].date.toISOString().split('T')[0],
            end: charges[0].date.toISOString().split('T')[0],
            roomTypeCode: charges[0].roomTypeCode,
            baseByGuestAmounts: charges[0].baseByGuestAmounts,
            additionalGuestAmounts: charges[0].additionalGuestAmounts,
        };

        for (let i = 1; i < charges.length; i++) {
            const current = charges[i];
            const currentDate = current.date.toISOString().split('T')[0];

            const pricesMatch =
                current.roomTypeCode === currentGroup.roomTypeCode &&
                PricePullService.arePricesEqual(
                    current.baseByGuestAmounts,
                    currentGroup.baseByGuestAmounts
                );

            if (pricesMatch) {
                currentGroup.end = currentDate;
            } else {
                groups.push(currentGroup);
                currentGroup = {
                    start: currentDate,
                    end: currentDate,
                    roomTypeCode: current.roomTypeCode,
                    baseByGuestAmounts: current.baseByGuestAmounts,
                    additionalGuestAmounts: current.additionalGuestAmounts,
                };
            }
        }

        groups.push(currentGroup);
        return groups;
    }

    private static arePricesEqual(
        a: Array<{ numberOfGuests: number; amountBeforeTax: number }>,
        b: Array<{ numberOfGuests: number; amountBeforeTax: number }>
    ): boolean {
        if (a.length !== b.length) return false;
        return a.every(
            (item, index) =>
                item.numberOfGuests === b[index].numberOfGuests &&
                item.amountBeforeTax === b[index].amountBeforeTax
        );
    }
}
