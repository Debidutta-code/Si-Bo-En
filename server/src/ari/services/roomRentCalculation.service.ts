// services/roomRentCalculation.service.ts

import { differenceInDays } from 'date-fns';
import { errorResponse, successResponse } from '../../utils/return';

import { prisma } from "../../config"
import { IApiResponse, nowUTC, toUTC, toUTCDate } from '../../utils';
import {
    RoomRentCalculationRepository
} from "../repository/room-rent.repository";
import { Decimal } from '@prisma/client/runtime/library';
import { CurrencyCode } from '../../pms/frontoffice/payment/types';
interface PriceCalculationData {
    totalAmount: number;
    numberOfNights: number;
    baseRatePerNight: number;
    additionalGuestCharges: number;

    breakdown: {
        originalBaseAmount: number;
        loyaltyDiscountAmount: number;
        promotionDiscountAmount: number;
        totalBaseAmount: number;
        totalAdditionalCharges: number;
        totalTax: number;
        totalAmount: number;
        averagePerNight: number;
    };

    dailyBreakdown: DailyBreakdown[];

    availableRooms: number;
    requestedRooms: number;

    promotions: {
        applied: PromotionResult[];
        totalDiscount: number;
    };

    userAddons: {
        selected: UserAddonResult[];
        totalAmount: number;
    };

    loyaltyDiscount?: LoyaltyDiscountResult;

    tax: TaxDetail[];
    totalTax: number;

    priceAfterTax: number;
}

interface UserAddonResult {
    addonCode: string;
    addonName: string;
    price: number;
    quantity: number;
    totalAmount: number;
}
interface PromotionResult {
    promotionType: string;
    promotionCode?: string;
    discountType: "percentage" | "flat";
    discountValue: number;
    discountAmount: number;
    appliedOn: "base_amount" | "adjusted_base";
}
interface LoyaltyDiscountResult {
    type: "percentage" | "flat";
    value: number;
    discountAmount: number;
    appliedTo: "base_amount";
    guestEmail: string;
    loyaltyMemberId: string;
}

interface UserAddonResult {
    addonCode: string;
    addonName: string;
    price: number;
    quantity: number;
    totalAmount: number;
}


interface DailyBreakdown {
    date: string;
    dayOfWeek: string;
    ratePlanCode: string;
    baseRate: number;
    additionalCharges: number;
    totalPerRoom: number;
    totalForAllRooms: number;
    currencyCode: string;
    breakdown: {
        baseAmount: number;
        additionalAdultCharges: number;
        additionalChildrenCharges: number;
        totalAdditionalCharges: number;
        baseGuestsIncluded: number;
        adultsInBaseRate: number;
        childrenInBaseRate: number;
        adultsNotInBaseRate: number;
        childrenNotInBaseRate: number;
        adultChargesDetail: any[];
        childrenChargesDetail: any[];
    };
}

interface TaxDetail {
    name: string;
    amount: number;
    type: string;
}
export interface Promotion {
    id: string;
    promotionName: string;
    propertyId: string;
    validFrom: Date | null;
    validTo: Date | null;
    advanceBookingDays: number | null;
    promotionType: "early_bird" | "offer_for_tonight" | "device_specific";
    roomId: string | null;
    roomType: string | null;
    deviceType: ("mobile" | "tablet" | "desktop")[];
    ratePlanId: string;
    ratePlanCode: string;
    DiscountType: "percentage" | "flat";
    DiscountValue: Decimal | null
    currencyCode: CurrencyCode | null;
    monApplicable: boolean;
    tueApplicable: boolean;
    wedApplicable: boolean;
    thuApplicable: boolean;
    friApplicable: boolean;
    satApplicable: boolean;
    sunApplicable: boolean;
    isActive: boolean;

}
export class RoomRentCalculationService {
    public static async getRoomRentService(
        propertyCode: string,
        invTypeCode: string,
        startDate: Date,
        endDate: Date,
        ratePlanCode: string,
        noOfChildren: number,
        noOfAdults: number,
        noOfRooms: number,
        guestEmail?: string,
        userCountryCode?: string,
        deviceType?: "mobile" | "tablet" | "desktop",
        selectedPromotions?: { id: string, promotionType: any }[],
        userAddons?: any[]
    ): Promise<IApiResponse<PriceCalculationData>> {
        try {
            // === VALIDATION ===
            const validationResult = this.validateInputs(
                propertyCode,
                invTypeCode,
                startDate,
                endDate,
                noOfChildren,
                noOfAdults,
                noOfRooms,
                ratePlanCode
            );
            if (!validationResult.isValid) {
                return errorResponse(validationResult.message || 'Invalid input');
            }

            const numberOfNights = differenceInDays(endDate, startDate);
            if (numberOfNights <= 0) {
                return errorResponse('End date must be after start date');
            }

            // === GET RATE PLAN ===
            const ratePlan = await prisma.ratePlan.findUnique({
                where: { ratePlanCode },
                include: {
                    taxGroup: {
                        include: {
                            taxGroupRules: {
                                include: { taxRule: true },
                            },
                        },
                    },
                },
            });

            if (!ratePlan) {
                return errorResponse('Rate plan not found');
            }

            // === CHECK INVENTORY ===
            const inventoryCheck = await this.checkInventoryAvailability(
                propertyCode,
                invTypeCode,
                ratePlanCode,
                startDate,
                endDate,
                noOfRooms
            );

            if (!inventoryCheck.success) {
                return inventoryCheck;
            }

            // === STEP 1: CALCULATE ORIGINAL BASE PRICE (with guest charges) ===
            const rateCalculation = await this.calculateDayByDayRates(
                propertyCode,
                invTypeCode,
                ratePlanCode,
                noOfAdults,
                noOfChildren,
                noOfRooms,
                numberOfNights,
                startDate,
                endDate
            );

            if (!rateCalculation.success) {
                return rateCalculation;
            }

            const originalBasePrice = rateCalculation.data!.totalAmount;
            const totalBaseAmount = rateCalculation.data!.breakdown.totalBaseAmount;
            const totalAdditionalCharges = rateCalculation.data!.breakdown.totalAdditionalCharges;

            //console.log(`\n=== PRICING CALCULATION ===`);
            //console.log(`Original Base Price: ${originalBasePrice}`);

            // === STEP 2: CALCULATE USER-SELECTED PROMOTIONS (on original base) ===
            // === STEP 2: CALCULATE USER-SELECTED PROMOTIONS (on original base) ===
            let promotionDiscounts: any[] = [];
            let totalPromotionDiscount = 0;

            if (selectedPromotions && selectedPromotions.length > 0) {
                // Separate MLOS from other promotions
                const regularPromotions = selectedPromotions.filter(p => p.promotionType !== "mlos");
                const mlosPromotions = selectedPromotions.filter(p => p.promotionType === "mlos");

                // Handle regular promotions (early_bird, offer_for_tonight, device_specific)
                if (regularPromotions.length > 0) {
                    const promotionResults = await this.promotionsService(
                        ratePlan.propertyId,
                        ratePlanCode,
                        startDate,
                        endDate,
                        new Decimal(originalBasePrice),
                        deviceType || "desktop",
                        regularPromotions  // ✅ Only non-MLOS promotions
                    );

                    if (promotionResults.success && promotionResults.data) {
                        const validPromotions = promotionResults.data
                            .filter((promo: any) => promo.success)
                            .map((promo: any) => ({
                                ...promo.data,
                                calculatedOn: "originalBase",
                                calculatedFrom: originalBasePrice
                            }));

                        promotionDiscounts.push(...validPromotions);
                        totalPromotionDiscount += validPromotions.reduce(
                            (sum: number, p: any) => sum + (p.discountAmount || 0),
                            0
                        );
                    }
                }

                // Handle MLOS promotions separately
                if (mlosPromotions.length > 0) {
                    const mlosResult = await this.calculatemlosService(
                        ratePlanCode,
                        startDate,
                        endDate,
                        new Decimal(originalBasePrice)
                    );

                    if (mlosResult.success) {
                        const mlosData = {
                            ...mlosResult.data,
                            promotionType: "mlos",
                            eligible: true,
                            calculatedOn: "originalBase",
                            calculatedFrom: originalBasePrice
                        };
                        promotionDiscounts.push(mlosData);
                        totalPromotionDiscount += mlosData.discountAmount || 0;
                    }
                }
            }

            //console.log(`Total Promotion Discount: -${totalPromotionDiscount}`);

            // Check for MLOS (if not already in selected promotions)
            const hasMLOS = selectedPromotions?.some(p => p.promotionType === "mlos");
            if (!hasMLOS) {
                const mlosResult = await this.calculatemlosService(
                    ratePlanCode,
                    startDate,
                    endDate,
                    new Decimal(originalBasePrice)
                );

                if (mlosResult.success) {
                    const mlosData = {
                        ...mlosResult.data,
                        promotionType: "mlos",
                        eligible: true,
                        calculatedOn: "originalBase",
                        calculatedFrom: originalBasePrice
                    };
                    // Show as available but not applied
                    // Don't add to totalPromotionDiscount yet
                }
            }

            //console.log(`Total Promotion Discount: -${totalPromotionDiscount}`);

            // === STEP 3: APPLY SILENT ADJUSTMENTS ===
            let currentPrice = originalBasePrice;
            let deviceDiscount = 0;
            let deviceDiscountInfo = null;
            let geoAdjustment = 0;
            let geoAdjustmentInfo = null;
            let loyaltyDiscount = 0;
            let loyaltyDiscountInfo = null;

            // 3.1: Device-specific promotion (silent)
            if (deviceType) {
                const deviceResult = await this.deviceSpecificService(
                    {
                        promotionType: "device_specific",
                        deviceType: [deviceType],
                        DiscountType: "percentage",
                        DiscountValue: new Decimal(0),
                        // This will fetch from database
                    } as any,
                    new Decimal(currentPrice),
                    deviceType
                );

                if (deviceResult.success) {
                    deviceDiscount = deviceResult.data.discountAmount;
                    currentPrice -= deviceDiscount;
                    deviceDiscountInfo = deviceResult.data;
                    //console.log(`Device Discount: -${deviceDiscount} → ${currentPrice}`);
                }
            }

            // 3.2: Geo-based pricing
            if (userCountryCode) {
                const property = await prisma.property.findUnique({
                    where: { propertyCode },
                    select: { id: true }
                });

                if (property) {
                    const geoResult = await this.geoRatePlanService(
                        userCountryCode,
                        ratePlanCode,
                        invTypeCode,
                        property.id,
                        new Decimal(currentPrice)
                    );

                    if (geoResult.success) {
                        const geoData = geoResult.data;
                        if (geoData.restrictionAction === "increase") {
                            geoAdjustment = geoData.adjustmentAmount;
                            currentPrice += geoAdjustment;
                        } else {
                            geoAdjustment = -geoData.adjustmentAmount;
                            currentPrice -= geoData.adjustmentAmount;
                        }
                        geoAdjustmentInfo = geoData;
                        //console.log(`Geo Adjustment: ${geoAdjustment} → ${currentPrice}`);
                    }
                }
            }

            // 3.3: Loyalty discount
            if (guestEmail) {
                const loyaltyResult = await this.getLoyalityDiscount(
                    guestEmail,
                    propertyCode,
                    new Decimal(originalBasePrice)
                );

                if (loyaltyResult.success) {
                    loyaltyDiscount = loyaltyResult.data.discountAmount;
                    currentPrice -= loyaltyDiscount;
                    loyaltyDiscountInfo = loyaltyResult.data;
                    //console.log(`Loyalty Discount: -${loyaltyDiscount} → ${currentPrice}`);
                }
            }

            const adjustedBasePrice = currentPrice;

            // === STEP 4: ADD INCLUDED ADDONS ===
            let includedAddons: any[] = [];
            let includedAddonsTotal = 0;

            const ratePlanWithAddons = await this.ratePlanWithAddonsService(
                ratePlanCode,
                startDate,
                endDate
            );

            if (ratePlanWithAddons.success) {
                includedAddons = ratePlanWithAddons.data.addons || [];
                includedAddonsTotal = ratePlanWithAddons.data.totalAddonAmount || 0;
                currentPrice += includedAddonsTotal;
                //console.log(`Included Addons: +${includedAddonsTotal} → ${currentPrice}`);
            }

            // === STEP 5: SUBTRACT USER-SELECTED PROMOTIONS ===
            currentPrice -= totalPromotionDiscount;
            //console.log(`After Promotions: -${totalPromotionDiscount} → ${currentPrice}`);

            // === STEP 6: ADD USER-SELECTED ADDONS ===
            let userAddonsTotal = 0;
            let userAddonsDetails: any[] = [];

            if (userAddons && userAddons.length > 0) {
                for (const addon of userAddons) {
                    const addonPrice = addon.price * addon.quantity;
                    userAddonsTotal += addonPrice;
                    userAddonsDetails.push({
                        ...addon,
                        totalPrice: addonPrice
                    });
                }
                currentPrice += userAddonsTotal;
                //console.log(`User Addons: +${userAddonsTotal} → ${currentPrice}`);
            }

            const priceBeforeTax = currentPrice;

            // === STEP 7: CALCULATE TAX (on ORIGINAL BASE) ===
            const taxCalculation = await this.calculateTax(
                ratePlan,
                originalBasePrice  // ✅ Tax on original base
            );

            const totalTax = taxCalculation.totalTax;
            const finalPrice = priceBeforeTax + totalTax;

            //console.log(`Tax (on original base): +${totalTax} → ${finalPrice}`);
            //console.log(`=========================\n`);

            // === RETURN COMPREHENSIVE BREAKDOWN ===
            return successResponse("Price calculated successfully", {
                totalAmount: finalPrice,  // ✅ Change from null
                numberOfNights,
                baseRatePerNight: totalBaseAmount / numberOfNights / noOfRooms,
                additionalGuestCharges: totalAdditionalCharges,

                breakdown: {
                    originalBaseAmount: originalBasePrice,
                    loyaltyDiscountAmount: loyaltyDiscount,
                    promotionDiscountAmount: totalPromotionDiscount,
                    totalBaseAmount: adjustedBasePrice,
                    totalAdditionalCharges,
                    totalTax,
                    totalAmount: finalPrice,  // ✅ Change from null
                    averagePerNight: finalPrice / numberOfNights  // ✅ Change from null
                },

                dailyBreakdown: rateCalculation.data!.dailyBreakdown,

                availableRooms: inventoryCheck.availableRooms!,
                requestedRooms: noOfRooms,

                promotions: {
                    applied: promotionDiscounts,
                    totalDiscount: totalPromotionDiscount
                },

                userAddons: {
                    selected: userAddonsDetails,
                    totalAmount: userAddonsTotal  // ✅ Change from null
                },

                loyaltyDiscount: loyaltyDiscountInfo,

                tax: taxCalculation.taxDetails,
                totalTax,

                priceAfterTax: finalPrice  // ✅ Change from null
            });
        } catch (error) {
            console.error('Error in getRoomRentService:', error);
            return errorResponse('Internal server error');
        }
    }
    public static async getRoomRentServiceByCode(
        propertyCode: string,
        invTypeCode: string,
        startDate: Date,
        endDate: Date,
        ratePlanCode: string,
        noOfChildren: number,
        noOfAdults: number,
        noOfRooms: number
    ): Promise<IApiResponse<PriceCalculationData>> {
        try {
            const validationResult = this.validateInputs(
                propertyCode,
                invTypeCode,
                startDate,
                endDate,
                noOfChildren,
                noOfAdults,
                noOfRooms,
                ratePlanCode
            );
            if (!validationResult.isValid) {
                return errorResponse(validationResult.message || 'Invalid input');
            }

            // Use dates directly from controller (already in UTC midnight format)
            const start = startDate;
            const end = endDate;

            //console.log("Service received dates:", start, end);

            const numberOfNights = differenceInDays(end, start);

            if (numberOfNights <= 0) {
                return errorResponse('End date must be after start date');
            }

            // Step 1: Get and validate rate plan
            const ratePlan = await prisma.ratePlan.findUnique({
                where: { ratePlanCode },
                include: {
                    taxGroup: {
                        include: {
                            taxGroupRules: {
                                include: {
                                    taxRule: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!ratePlan) {
                return errorResponse('Rate plan not found');
            }

            // Check min/max length of stay
            // if (numberOfNights < ratePlan.minimumLenghthOfStay) {
            //   return errorResponse(
            //     `Minimum stay of ${ratePlan.minimumLenghthOfStay} nights required for this rate plan.`
            //   );
            // }

            // if (ratePlan.maximumLengthOfStay && numberOfNights > ratePlan.maximumLengthOfStay) {
            //   return errorResponse(
            //     `Maximum stay of ${ratePlan.maximumLengthOfStay} nights allowed for this rate plan.`
            //   );
            // }
            // //console.log("inv ava:", start, end);

            // Step 2: Check inventory availability
            const inventoryCheck = await this.checkInventoryAvailability(
                propertyCode,
                invTypeCode,
                ratePlanCode,
                start,
                end,
                noOfRooms
            );

            if (!inventoryCheck.success) {
                return inventoryCheck;
            }

            // Step 3: Calculate day-by-day rates
            //console.log("Calculating day-by-day rates with dates:", start, end);
            //console.log("Calculating day-by-day rates with dates:", startDate, endDate);

            const rateCalculation = await this.calculateDayByDayRates(
                propertyCode,
                invTypeCode,
                ratePlanCode,
                noOfAdults,
                noOfChildren,
                noOfRooms,
                numberOfNights,
                start,
                end
            );
            //console.log(rateCalculation)
            if (!rateCalculation.success) {
                return rateCalculation;
            }

            // Step 4: Calculate tax on base amount only
            const taxCalculation = await this.calculateTax(
                ratePlan,
                rateCalculation.data!.breakdown.totalBaseAmount
            );

            const totalTax = taxCalculation.totalTax;
            const finalAmount = rateCalculation.data!.totalAmount + totalTax;

            return successResponse('Price calculated successfully', {
                ...rateCalculation.data!,
                tax: taxCalculation.taxDetails,
                totalTax,
                priceAfterTax: Number(finalAmount.toFixed(2)),
                totalAmount: Number(finalAmount.toFixed(2)),
                availableRooms: inventoryCheck.availableRooms!,
                requestedRooms: noOfRooms,
                breakdown: {
                    ...rateCalculation.data!.breakdown,
                    totalAmount: Number(finalAmount.toFixed(2)),
                    averagePerNight: Number((finalAmount / numberOfNights).toFixed(2)),
                },
            });
        } catch (error) {
            console.error('Error in getRoomRentService:', error);
            return errorResponse('Internal server error');
        }
    }

    private static validateInputs(
        propertyCode: string,
        invTypeCode: string,
        startDate: Date,
        endDate: Date,
        noOfChildren: number,
        noOfAdults: number,
        noOfRooms: number,
        ratePlanCode: string
    ): { isValid: boolean; message?: string } {
        if (!propertyCode || !invTypeCode) return { isValid: false, message: 'Hotel and room type required' };
        if (!ratePlanCode) return { isValid: false, message: 'Rate plan required' };
        if (!startDate || !endDate) return { isValid: false, message: 'Dates required' };
        if (noOfAdults < 1) return { isValid: false, message: 'At least 1 adult required' };
        if (noOfChildren < 0) return { isValid: false, message: 'Children cannot be negative' };
        if (noOfRooms < 1) return { isValid: false, message: 'At least 1 room required' };
        if (startDate >= endDate) return { isValid: false, message: 'End date must be after start date' };
        return { isValid: true };
    }

    private static async checkInventoryAvailability(
        propertyCode: string,
        roomTypeCode: string,
        ratePlanCode: string,
        startDate: Date,
        endDate: Date,
        noOfRooms: number
    ): Promise<any> {
        const stayDates: Date[] = [];
        const start = toUTCDate(startDate);
        const end = toUTCDate(endDate);

        let current = new Date(start.getTime()); // Create copy using timestamp

        while (current < end) {
            stayDates.push(new Date(current.getTime())); // Push copy using timestamp
            current.setUTCDate(current.getUTCDate() + 1); // Use UTC methods
        }

        //console.log("Stay dates:", stayDates.map(d => d.toISOString()));

        const inventories = await prisma.inventory.findMany({
            where: {
                propertyCode,
                roomTypeCode,
                date: { in: stayDates },
            },
        });

        //console.log("Found inventories:", inventories.length);

        if (inventories.length !== stayDates.length) {
            return errorResponse(
                `Inventory not found for all dates. Expected ${stayDates.length}, found ${inventories.length}`
            );
        }

        let minAvailability = Infinity;
        for (const inv of inventories) {
            if (!inv.ratePlans.includes(ratePlanCode)) {
                return errorResponse(
                    `Rate plan ${ratePlanCode} not available for date ${inv.date}`
                );
            }

            if (inv.availability < noOfRooms) {
                return errorResponse(
                    `Only ${inv.availability} rooms available on ${inv.date}, but ${noOfRooms} requested`
                );
            }

            minAvailability = Math.min(minAvailability, inv.availability);
        }

        return {
            success: true,
            availableRooms: minAvailability,
        };
    }

    private static async calculateDayByDayRates(
        propertyCode: string,
        roomTypeCode: string,
        ratePlanCode: string,
        noOfAdults: number,
        noOfChildren: number,
        noOfRooms: number,
        numberOfNights: number,
        startDate: Date,
        endDate: Date
    ): Promise<any> {
        try {
            const dailyBreakdown: DailyBreakdown[] = [];
            let totalAmount = 0;
            let totalBaseAmount = 0;
            let totalAdditionalCharges = 0;

            // Generate stay dates (exclude checkout day)
            const stayDates: Date[] = [];
            const start = toUTCDate(startDate);
            const end = toUTCDate(endDate);

            let current = toUTCDate(start); // Create copy using timestamp

            while (current < end) {
                stayDates.push(toUTCDate(current)); // Push copy using timestamp
                current.setUTCDate(current.getUTCDate() + 1); // Use UTC methods
            }

            //console.log("Stay dates for calculation:", stayDates.map(d => d.toISOString()));

            for (const date of stayDates) {
                const dayOfWeek = this.getDayOfWeek(date);
                const dateStr = date.toISOString().split('T')[0];

                // Get charge for this date
                const startOfDateUTC = toUTCDate(dateStr);
                const endOfDateUTC = new Date(startOfDateUTC.getTime() + 24 * 60 * 60 * 1000);

                const charge = await prisma.charge.findFirst({
                    where: {
                        propertyCode,
                        roomTypeCode,
                        ratePlanCode,
                        date: {
                            gte: startOfDateUTC,
                            lt: endOfDateUTC,
                        },
                        isSaleStopped: false
                    },
                    include: {
                        baseGuestAmounts: true,
                        additionalGuestAmounts: true,
                    },
                });

                //console.log("Charge for", dateStr, ":", charge ? "Found" : "Not found");

                if (!charge) {
                    return errorResponse(`No rates found for date: ${dateStr}`);
                }

                // Check day-of-week applicability
                const dayApplicable = this.isDayApplicable(charge, dayOfWeek);
                if (!dayApplicable) {
                    return errorResponse(
                        `Rate plan not applicable for ${dayOfWeek} on ${dateStr}`
                    );
                }

                // Calculate rate for this day
                const rateCalculation = this.calculateSingleDayRate(
                    charge,
                    noOfAdults,
                    noOfChildren,
                    noOfRooms
                );

                if (!rateCalculation.success) {
                    return rateCalculation;
                }

                dailyBreakdown.push({
                    date: dateStr,
                    dayOfWeek,
                    ratePlanCode,
                    baseRate: rateCalculation.baseRatePerRoom,
                    additionalCharges: rateCalculation.additionalGuestCharges,
                    totalPerRoom: rateCalculation.totalPerRoom,
                    totalForAllRooms: rateCalculation.totalAmountForDay,
                    currencyCode: "USD",
                    breakdown: rateCalculation.breakdown,
                });

                totalAmount += rateCalculation.totalAmountForDay;
                totalBaseAmount += rateCalculation.baseRatePerRoom * noOfRooms;
                totalAdditionalCharges += rateCalculation.additionalGuestCharges * noOfRooms;
            }

            const averageBaseRate =
                numberOfNights > 0 ? totalBaseAmount / numberOfNights / noOfRooms : 0;

            return {
                success: true,
                data: {
                    totalAmount,
                    numberOfNights,
                    baseRatePerNight: averageBaseRate,
                    additionalGuestCharges:
                        numberOfNights > 0 ? totalAdditionalCharges / numberOfNights : 0,
                    breakdown: {
                        totalBaseAmount,
                        totalAdditionalCharges,
                        totalAmount,
                        numberOfNights,
                        averagePerNight:
                            numberOfNights > 0 ? totalAmount / numberOfNights : 0,
                    },
                    dailyBreakdown,
                    availableRooms: 0,
                    requestedRooms: 0,
                },
            };
        } catch (error) {
            console.error('Error in calculateDayByDayRates:', error);
            return errorResponse('Error calculating day-by-day rates');
        }
    }
    private static getDayOfWeek(date: Date): string {
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        return days[date.getDay()];
    }

    private static isDayApplicable(charge: any, dayOfWeek: string): boolean {
        const dayMap: { [key: string]: string } = {
            mon: 'monApplicable',
            tue: 'tueApplicable',
            wed: 'wedApplicable',
            thu: 'thuApplicable',
            fri: 'friApplicable',
            sat: 'satApplicable',
            sun: 'sunApplicable',
        };

        const field = dayMap[dayOfWeek];
        return charge[field] === true;
    }

    private static calculateSingleDayRate(
        charge: any,
        noOfAdults: number,
        noOfChildren: number,
        noOfRooms: number
    ): any {
        try {
            const totalGuests = noOfAdults + noOfChildren;
            const baseGuestAmounts = charge.baseGuestAmounts || [];

            if (baseGuestAmounts.length === 0) {
                return errorResponse('No base guest amounts found for this rate');
            }

            // Sort by numberOfGuests ascending
            const sortedBaseRates = baseGuestAmounts.sort(
                (a: any, b: any) => a.numberOfGuests - b.numberOfGuests
            );

            // Find base rate: closest that covers totalGuests OR highest available
            let selectedBaseRate = sortedBaseRates.find(
                (rate: any) => rate.numberOfGuests >= totalGuests
            );

            if (!selectedBaseRate) {
                selectedBaseRate = sortedBaseRates[sortedBaseRates.length - 1];
            }

            const baseRatePerRoom = Number(selectedBaseRate.amountBeforeTax);
            const baseGuestsIncluded = selectedBaseRate.numberOfGuests;

            // Step 1: Calculate guests covered by base rate across all rooms
            const totalGuestsCoveredByBase = baseGuestsIncluded * noOfRooms;

            // Step 2: Distribute guests - Adults first priority
            const adultsInBaseRate = Math.min(noOfAdults, totalGuestsCoveredByBase);
            const remainingBaseCapacity = totalGuestsCoveredByBase - adultsInBaseRate;
            const childrenInBaseRate = Math.min(
                noOfChildren,
                remainingBaseCapacity
            );

            // Step 3: Calculate remaining guests
            const adultsNotInBaseRate = noOfAdults - adultsInBaseRate;
            const childrenNotInBaseRate = noOfChildren - childrenInBaseRate;

            // Get additional guest rates
            const additionalGuestAmounts = charge.additionalGuestAmounts || [];
            const adultRate = additionalGuestAmounts.find(
                (aga: any) => aga.ageQualifyingCode === '10'
            );
            const childRate = additionalGuestAmounts.find(
                (aga: any) => aga.ageQualifyingCode === '8'
            );

            // Step 4: Calculate additional charges for adults
            let additionalAdultCharges = 0;
            let adultChargesBreakdown: any[] = [];

            if (adultsNotInBaseRate > 0 && adultRate) {
                const chargeAmount = Number(adultRate.amount);
                additionalAdultCharges = adultsNotInBaseRate * chargeAmount;

                for (let i = 0; i < adultsNotInBaseRate; i++) {
                    adultChargesBreakdown.push({
                        adultIndex: adultsInBaseRate + i + 1,
                        ageQualifyingCode: '10',
                        chargeAmount,
                        note: 'Additional adult charge - not covered by base rate',
                    });
                }
            }

            // Step 5: Calculate additional charges for children
            let additionalChildrenCharges = 0;
            let childrenChargesBreakdown: any[] = [];

            if (childrenNotInBaseRate > 0 && childRate) {
                const chargeAmount = Number(childRate.amount);
                additionalChildrenCharges = childrenNotInBaseRate * chargeAmount;

                for (let i = 0; i < childrenNotInBaseRate; i++) {
                    childrenChargesBreakdown.push({
                        childIndex: childrenInBaseRate + i + 1,
                        ageQualifyingCode: '8',
                        chargeAmount,
                        note: 'Additional child charge - not covered by base rate',
                    });
                }
            }

            // Add charges for children covered by base rate (no charge)
            for (let i = 0; i < childrenInBaseRate; i++) {
                childrenChargesBreakdown.push({
                    childIndex: i + 1,
                    ageQualifyingCode: '8',
                    chargeAmount: 0,
                    note: 'Covered by base rate',
                });
            }

            // Step 6: Calculate totals
            const totalAdditionalChargesPerRoom =
                (additionalAdultCharges + additionalChildrenCharges) / noOfRooms;
            const totalPerRoom = baseRatePerRoom + totalAdditionalChargesPerRoom;
            const totalAmountForDay = totalPerRoom * noOfRooms;

            return {
                success: true,
                baseRatePerRoom,
                additionalGuestCharges: totalAdditionalChargesPerRoom,
                totalPerRoom,
                totalAmountForDay,
                breakdown: {
                    baseAmount: baseRatePerRoom,
                    additionalAdultCharges,
                    additionalChildrenCharges,
                    totalAdditionalCharges:
                        additionalAdultCharges + additionalChildrenCharges,
                    baseGuestsIncluded,
                    adultsInBaseRate,
                    childrenInBaseRate,
                    adultsNotInBaseRate,
                    childrenNotInBaseRate,
                    adultChargesDetail: adultChargesBreakdown,
                    childrenChargesDetail: childrenChargesBreakdown,
                },
            };
        } catch (error) {
            console.error('Error in calculateSingleDayRate:', error);
            return errorResponse('Error calculating single day rate');
        }
    }

    private static async calculateTax(
        ratePlan: any,
        baseAmount: number
    ): Promise<any> {
        try {
            const taxDetails: TaxDetail[] = [];
            let totalTax = 0;

            if (!ratePlan.taxGroup || !ratePlan.taxGroup.taxGroupRules) {
                return { taxDetails: [], totalTax: 0 };
            }

            // Sort by priority
            const sortedRules = ratePlan.taxGroup.taxGroupRules.sort(
                (a: any, b: any) => a.taxRule.priority - b.taxRule.priority
            );

            let applicableAmount = baseAmount;

            for (const rule of sortedRules) {
                const taxRule = rule.taxRule;

                // Check if tax is currently valid
                const now = new Date();
                if (
                    now < new Date(taxRule.validFrom) ||
                    now > new Date(taxRule.validTo)
                ) {
                    continue;
                }

                let taxAmount = 0;

                if (taxRule.type === 'percentage') {
                    taxAmount = (applicableAmount * taxRule.value) / 100;
                } else if (taxRule.type === 'fixed') {
                    taxAmount = taxRule.value;
                }

                taxDetails.push({
                    name: taxRule.name,
                    amount: Number(taxAmount.toFixed(2)),
                    type: taxRule.type,
                });

                totalTax += taxAmount;

                // If not inclusive, add to applicable amount for next tax
                if (!taxRule.isInclusive) {
                    applicableAmount += taxAmount;
                }
            }

            return {
                taxDetails,
                totalTax: Number(totalTax.toFixed(2)),
            };
        } catch (error) {
            console.error('Error in calculateTax:', error);
            return { taxDetails: [], totalTax: 0 };
        }
    }


    private static async promotionsService(
        propertyId: string,
        ratePlanCode: string,
        startDate: Date,
        endDate: Date,
        baseAmount: Decimal,
        deviceType: "mobile" | "tablet" | "desktop",
        promotions: { id: string, promotionType: "early_bird" | "offer_for_tonight" | "device_specific" }[]
    ): Promise<IApiResponse> {
        try {
            const allPromotions = await RoomRentCalculationRepository.getPromotionDetails(promotions);
            const res = await Promise.all(allPromotions.map(async (promotion) => {
                switch (promotion.promotionType) {
                    case "early_bird":
                        return await this.checkForEarlyBirdService(promotion, startDate, baseAmount);
                    case "offer_for_tonight":
                        return await this.offerForTonightService(promotion, startDate, baseAmount);
                    case "device_specific":
                        return await this.deviceSpecificService(promotion, baseAmount, deviceType);
                    default:
                        return errorResponse("Invalid promotion type");
                }
            }));
            return successResponse("Promotions calculated successfully", res);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to calculate promotions", error.message);
            }
            return errorResponse("Failed to calculate promotions");
        }
    }
    private static async checkForEarlyBirdService(promotion: Promotion, startDate: Date, baseAmount: Decimal): Promise<IApiResponse> {
        try {
            if (!promotion.advanceBookingDays) {
                return errorResponse("Advance booking days not configured for this promotion");
            }

            if (!promotion.DiscountValue) {
                return errorResponse("Discount value not configured for this promotion");
            }

            const currentDate = nowUTC();
            const checkInDate = toUTC(startDate);
            const daysInAdvance = differenceInDays(checkInDate, currentDate);

            if (daysInAdvance < promotion.advanceBookingDays) {
                return errorResponse(
                    `Early bird promotion requires booking at least ${promotion.advanceBookingDays} days in advance. Current advance: ${daysInAdvance} days`,
                );
            }

            // Calculate discount based on type
            let discountAmount = 0;
            const baseAmountNumber = Number(baseAmount);
            const discountValue = Number(promotion.DiscountValue);

            if (promotion.DiscountType === "percentage") {
                // Percentage discount
                discountAmount = (baseAmountNumber * discountValue) / 100;
            } else if (promotion.DiscountType === "flat") {
                // Flat/fixed discount
                discountAmount = discountValue;
            }
            return successResponse("Early bird promotion applied successfully", {
                id: promotion.id,
                promotionName: promotion.promotionName,
                daysInAdvance,
                requiredDays: promotion.advanceBookingDays,
                discountType: promotion.DiscountType,
                discountValue: discountValue,
                discountAmount: Number(discountAmount.toFixed(2)),
                currencyCode: promotion.currencyCode
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to calculate early bird", error.message);
            }
            return errorResponse("Failed to calculate early bird");
        }
    }
    private static async offerForTonightService(promotion: Promotion, startDate: Date, baseAmount: Decimal): Promise<IApiResponse> {
        try {
            if (promotion.DiscountValue === null || promotion.DiscountValue === undefined) {
                return errorResponse("Discount value not configured for this promotion");
            }

            const currentDate = nowUTC();
            const checkInDate = toUTC(startDate);

            const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
            const checkInDateOnly = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate());

            const daysDifference = differenceInDays(checkInDateOnly, currentDateOnly);

            if (daysDifference > 1) {
                return errorResponse(
                    `Offer for tonight is only valid for today or tomorrow. Check-in is ${daysDifference} days away`,
                );
            }

            // Check if the check-in day of week is applicable
            const checkInDayOfWeek = this.getDayOfWeek(checkInDate);
            if (!this.isDayApplicable(promotion, checkInDayOfWeek)) {
                return errorResponse(
                    `Promotion is not applicable for ${checkInDayOfWeek}`,
                );
            }

            if (promotion.validFrom && promotion.validTo) {
                const validFromTime = toUTC(promotion.validFrom);
                const validToTime = toUTC(promotion.validTo);

                // Extract hours and minutes for time comparison
                const currentHour = currentDate.getHours();
                const currentMinute = currentDate.getMinutes();
                const currentTimeInMinutes = currentHour * 60 + currentMinute;

                const validFromHour = validFromTime.getHours();
                const validFromMinute = validFromTime.getMinutes();
                const validFromTimeInMinutes = validFromHour * 60 + validFromMinute;

                const validToHour = validToTime.getHours();
                const validToMinute = validToTime.getMinutes();
                const validToTimeInMinutes = validToHour * 60 + validToMinute;

                if (currentTimeInMinutes < validFromTimeInMinutes || currentTimeInMinutes > validToTimeInMinutes) {
                    return errorResponse(
                        `Promotion is only valid between ${validFromHour}:${validFromMinute.toString().padStart(2, '0')} and ${validToHour}:${validToMinute.toString().padStart(2, '0')}`,
                    );
                }
            }

            let discountAmount = 0;
            const baseAmountNumber = Number(baseAmount);
            const discountValue = Number(promotion.DiscountValue);

            if (promotion.DiscountType === "percentage") {
                discountAmount = (baseAmountNumber * discountValue) / 100;
            } else if (promotion.DiscountType === "flat") {
                discountAmount = discountValue;
            }


            return successResponse("Offer for tonight applied successfully", {
                id: promotion.id,
                promotionName: promotion.promotionName,
                checkInDate: checkInDateOnly.toISOString(),
                dayOfWeek: checkInDayOfWeek,
                daysDifference,
                discountType: promotion.DiscountType,
                discountValue: discountValue,
                discountAmount: Number(discountAmount.toFixed(2)),
                currencyCode: promotion.currencyCode
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to calculate offer for tonight", error.message);
            }
            return errorResponse("Failed to calculate offer for tonight");
        }
    }
    private static async deviceSpecificService(
        promotion: Promotion,
        baseAmount: Decimal,
        userDeviceType: "mobile" | "tablet" | "desktop"
    ): Promise<IApiResponse> {
        try {
            // Fetch actual device-specific promotion from database
            const devicePromo = await RoomRentCalculationRepository.getDeviceSpecificPromotion(
                promotion.propertyId,
                promotion.ratePlanCode,
                userDeviceType
            );

            if (!devicePromo) {
                return errorResponse("No device-specific promotion found");
            }

            // Rest of your existing logic...
            const discountValue = Number(devicePromo.DiscountValue);
            const baseAmountNumber = Number(baseAmount);
            let discountAmount = 0;

            if (devicePromo.DiscountType === "percentage") {
                discountAmount = (baseAmountNumber * discountValue) / 100;
            } else if (devicePromo.DiscountType === "flat") {
                discountAmount = discountValue;
            }

            return successResponse("Device specific promotion applied successfully", {
                id: devicePromo.id,
                promotionName: devicePromo.promotionName,
                userDevice: userDeviceType,
                allowedDevices: devicePromo.deviceType,
                discountType: devicePromo.DiscountType,
                discountValue: discountValue,
                discountAmount: Number(discountAmount.toFixed(2)),
                currencyCode: devicePromo.currencyCode
            });
        } catch (error) {
            return errorResponse("No device promotion available");
        }
    }

    private static async calculatemlosService(ratePlanCode: string, checkInDate: Date, checkoutDate: Date, baseAmount: Decimal): Promise<IApiResponse> {
        try {
            const RatePlan = await RoomRentCalculationRepository.getRatePlanDetails(ratePlanCode);
            if (!RatePlan) {
                return errorResponse("Rate plan not found");
            }

            if (!RatePlan.ratePlanRules) {
                return errorResponse("No rate plan rules found for this rate plan");
            }

            const ratePlanRule = RatePlan.ratePlanRules;

            // Check if rule is active
            if (!ratePlanRule.isActive) {
                return errorResponse("Rate plan rule is not active");
            }

            // Validate discount configuration
            if (!ratePlanRule.discountValue || !ratePlanRule.discountType) {
                return errorResponse("Discount not configured for this rate plan rule");
            }

            // Calculate number of nights
            const numberOfNights = differenceInDays(checkoutDate, checkInDate);

            if (numberOfNights <= 0) {
                return errorResponse("Invalid stay duration");
            }

            // Check if stay duration meets minimum LOS requirement
            if (numberOfNights < ratePlanRule.minLos) {
                return errorResponse(
                    `Minimum length of stay is ${ratePlanRule.minLos} nights. Current stay: ${numberOfNights} nights`,
                );
            }

            // Check if stay duration exceeds maximum LOS (if set)
            if (ratePlanRule.maxLos && numberOfNights > ratePlanRule.maxLos) {
                return errorResponse(
                    `Maximum length of stay is ${ratePlanRule.maxLos} nights. Current stay: ${numberOfNights} nights`,
                );
            }

            // Check if dates fall within the valid period (if set)
            if (ratePlanRule.startDate && ratePlanRule.endDate) {
                const ruleStartDate = new Date(ratePlanRule.startDate);
                const ruleEndDate = new Date(ratePlanRule.endDate);
                const checkIn = new Date(checkInDate);

                if (checkIn < ruleStartDate || checkIn > ruleEndDate) {
                    return errorResponse(
                        `Rate plan rule is only valid from ${ruleStartDate.toDateString()} to ${ruleEndDate.toDateString()}`,
                    );
                }
            }

            // Calculate discount
            let discountAmount = 0;
            const baseAmountNumber = Number(baseAmount);
            const discountValue = Number(ratePlanRule.discountValue);

            if (ratePlanRule.discountType === "percentage") {
                discountAmount = (baseAmountNumber * discountValue) / 100;
            } else if (ratePlanRule.discountType === "flat") {
                discountAmount = discountValue;
            }

            return successResponse("MLOS discount applied successfully", {
                id: ratePlanRule.id,
                ratePlanName: RatePlan.ratePlanName,
                numberOfNights,
                minLos: ratePlanRule.minLos,
                maxLos: ratePlanRule.maxLos,
                discountType: ratePlanRule.discountType,
                discountValue: discountValue,
                discountAmount: Number(discountAmount.toFixed(2)),
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to calculate MLOS", error.message);
            }
            return errorResponse("Failed to calculate MLOS");
        }
    }
    private static async geoRatePlanService(usersCountry: string, ratePlanCode: string, roomTypeCode: string, propertyId: string, baseAmount: Decimal): Promise<IApiResponse> {
        try {

            const geoRatePlan = await RoomRentCalculationRepository.getGroRatePlan(propertyId, roomTypeCode, ratePlanCode, usersCountry);
            if (!geoRatePlan) {
                return errorResponse("No geo-based rate plan found for the user's country");
            }

            // Validate restriction configuration
            if (geoRatePlan.restrictionValue === null || geoRatePlan.restrictionValue === undefined) {
                return errorResponse("Restriction value not configured for this geo rate plan");
            }

            // Check if geo rate plan is restricted completely
            if (geoRatePlan.restrictionType === "restricted") {
                return errorResponse(
                    `Bookings from ${usersCountry} are restricted for this rate plan`,
                );
            }

            // Calculate adjustment based on restriction type and action
            let adjustmentAmount = 0;
            const baseAmountNumber = Number(baseAmount);
            const restrictionValue = Number(geoRatePlan.restrictionValue);

            if (geoRatePlan.restrictionType === "percentage") {
                // Calculate percentage-based adjustment
                adjustmentAmount = (baseAmountNumber * restrictionValue) / 100;
            } else if (geoRatePlan.restrictionType === "fixed") {
                // Fixed amount adjustment
                adjustmentAmount = restrictionValue;
            }

            // Apply action (increase or decrease)
            let finalAmount = baseAmountNumber;
            if (geoRatePlan.restrictionTypeAction === "increase") {
                finalAmount = baseAmountNumber + adjustmentAmount;
            } else if (geoRatePlan.restrictionTypeAction === "decrease") {
                finalAmount = baseAmountNumber - adjustmentAmount;
                // Ensure final amount doesn't go negative
                if (finalAmount < 0) {
                    finalAmount = 0;
                }
            }

            return successResponse("Geo-based rate plan applied successfully", {
                userCountry: usersCountry,
                restrictionType: geoRatePlan.restrictionType,
                restrictionAction: geoRatePlan.restrictionTypeAction,
                restrictionValue: restrictionValue,
                adjustmentAmount: Number(adjustmentAmount.toFixed(2)),
                currencyCode: geoRatePlan.currencyCode,
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to calculate geo-based rate plan", error.message);
            }
            return errorResponse("Failed to calculate geo-based rate plan");
        }
    }
    private static async ratePlanWithAddonsService(
        ratePlanCode: string,
        checkInDate: Date,
        checkOutDate: Date
    ): Promise<IApiResponse> {
        try {
            const ratePlan = await RoomRentCalculationRepository.getRatePlanDetails(ratePlanCode);

            if (!ratePlan || !ratePlan.Addons || ratePlan.Addons.length === 0) {
                return errorResponse("No addons found for this rate plan");
            }

            // ✅ Extract the actual addon IDs from the junction table
            const addonIds = ratePlan.Addons.map((ratePlanAddon: any) => ratePlanAddon.addonId);

            return await this.normalAddonsService(addonIds, checkInDate, checkOutDate);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to calculate rate plan with addons", error.message);
            }
            return errorResponse("Failed to calculate rate plan with addons");
        }
    }
    private static async normalAddonsService(addOnIds: string[], checkInDate: Date, checkOutDate: Date): Promise<IApiResponse> {
        try {
            const addons = await RoomRentCalculationRepository.findAddonsForReservations(addOnIds, checkInDate, checkOutDate);
            if (addons.length === 0) {
                return errorResponse("No addons available for the selected dates");
            }

            const numberOfNights = differenceInDays(checkOutDate, checkInDate);
            if (numberOfNights <= 0) {
                return errorResponse("Invalid stay duration for addons calculation");
            }

            let totalAddonAmount = 0;
            const addonDetails: any[] = [];

            for (const addon of addons) {
                if (!addon.availability || addon.availability.length === 0) {
                    continue; // Skip addons with no availability
                }

                let addonAmount = 0;
                const availabilityCount = addon.availability.length;

                // Calculate price based on posting rhythm
                switch (addon.postingRhythm) {
                    case 'per_night':
                        addonAmount = addon.availability.reduce((sum: number, avail: any) => sum + avail.price, 0);
                        break;

                    case 'per_stay':
                        addonAmount = addon.availability[0].price;
                        break;

                    case 'per_person_per_night':
                        addonAmount = addon.availability.reduce((sum: number, avail: any) => sum + avail.price, 0);
                        break;

                    case 'per_person_per_stay':
                        addonAmount = addon.availability[0].price;
                        break;

                    case 'per_room':
                        addonAmount = addon.availability[0].price;
                        break;

                    case 'per_room_per_night':
                        addonAmount = addon.availability.reduce((sum: number, avail: any) => sum + avail.price, 0);
                        break;

                    case 'per_person_per_room':
                        addonAmount = addon.availability[0].price;
                        break;

                    default:

                        addonAmount = addon.availability[0].price;
                }

                totalAddonAmount += addonAmount;

                addonDetails.push({
                    addonId: addon.id,
                    addonName: addon.name,
                    addonCode: addon.code,
                    postingRhythm: addon.postingRhythm,
                    amount: Number(addonAmount.toFixed(2)),
                    currencyCode: addon.availability[0].currencyCode,
                    availableDates: availabilityCount,
                    description: addon.description
                });
            }

            return successResponse("Addons calculated successfully", {
                totalAddonAmount: Number(totalAddonAmount.toFixed(2)),
                numberOfNights,
                addonsCount: addonDetails.length,
                addons: addonDetails
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to calculate addons", error.message);
            }
            return errorResponse("Failed to calculate addons");
        }
    }
    private static async getLoyalityDiscount(
        guestEmail: string,
        propertyCode: string,
        baseAmount: Decimal
    ): Promise<IApiResponse> {
        try {
            // Validate required fields
            if (!guestEmail || !propertyCode) {
                return errorResponse("Guest email and property code are required");
            }

            if (!baseAmount || Number(baseAmount) <= 0) {
                return errorResponse("Invalid base amount for loyalty discount calculation");
            }

            const property = await prisma.property.findUnique({
                where: { propertyCode: propertyCode },
                select: { id: true, propertyName: true }
            });

            if (!property) {
                return errorResponse("Property not found");
            }

            // Check if guest is a loyalty member
            const loyaltyGuest = await prisma.loyalityGuest.findFirst({
                where: {
                    guestEmail: guestEmail,
                    propertyId: property.id,
                }
            });

            if (!loyaltyGuest) {
                return errorResponse(
                    `Guest ${guestEmail} is not a loyalty member for this property`
                );
            }

            // Get property loyalty config
            const propertyLoyaltyConfig = await prisma.propertyLoyaltyConfig.findUnique({
                where: { propertyId: property.id },
                include: {
                    CreationLoyaltyConfig: true
                }
            });

            if (!propertyLoyaltyConfig) {
                return errorResponse("Loyalty program not configured for this property");
            }

            if (!propertyLoyaltyConfig.isActive) {
                return errorResponse("Loyalty program is not active for this property");
            }

            if (!propertyLoyaltyConfig.CreationLoyaltyConfig) {
                return errorResponse("Loyalty program configuration is incomplete");
            }

            const loyaltyConfig = propertyLoyaltyConfig.CreationLoyaltyConfig;

            // Validate discount configuration
            if (!loyaltyConfig.discountValue || !loyaltyConfig.loyaltyDiscountType) {
                return errorResponse("Loyalty discount not configured properly");
            }

            const discountType = loyaltyConfig.loyaltyDiscountType;
            const discountValue = loyaltyConfig.discountValue;
            const baseAmountNumber = Number(baseAmount);

            // Calculate discount based on type
            let discountAmount = 0;

            if (discountType === 'percentage') {
                discountAmount = (baseAmountNumber * discountValue) / 100;
            } else if (discountType === 'flat') {
                discountAmount = discountValue;
            } else {
                return errorResponse(`Invalid discount type: ${discountType}`);
            }

            // Ensure discount doesn't exceed base amount
            if (discountAmount > baseAmountNumber) {
                discountAmount = baseAmountNumber;
            }

            return successResponse("Loyalty discount applied successfully", {
                guestEmail: guestEmail,
                propertyName: property.propertyName,
                loyaltyMemberId: loyaltyGuest.id,
                discountType: discountType,
                discountValue: discountValue,
                discountAmount: Number(discountAmount.toFixed(2)),
                currencyCode: loyaltyConfig.currencyCode,
                appliedTo: 'base_amount',
                originalAmount: baseAmountNumber,
                amountAfterDiscount: Number((baseAmountNumber - discountAmount).toFixed(2))
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to calculate loyalty discount", error.message);
            }
            return errorResponse("Failed to calculate loyalty discount");
        }
    }
}