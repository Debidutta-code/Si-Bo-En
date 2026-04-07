import { differenceInDays } from 'date-fns';
import { DateTime } from 'luxon';
import { errorResponse, successResponse, IApiResponse, toUTCDate } from '../../../utils';
import { AgentPricingRepository } from '../repository';
import {
    IAgentPricingRequest,
    IAgentPricingResponse,
    IAgencyDetails,
    ICharge,
    IRoom,
    IRatePlan,
    IAddonWithAvailability,
    IBookingOffset,
    IRatePlanRule,
    IGuestDistributionEntry,
    IDailyBreakdown,
    IPerRoomBreakdown,
    IIncludedAddonDetail,
    ITaxDetail,
    ITouristTaxDetail,
    IAgencyCommissionDetail,
    IChargeBaseByGuest,
    IChargeAdditionalGuest,
    ITouristTaxRaw,
} from '../types';
import { CurrencyCode } from '../../../tax-system/interfaces/tourist-tax.type';

export class AgentPricingService {
    private repository: AgentPricingRepository;

    constructor() {
        this.repository = new AgentPricingRepository();
    }

    // ─── Public Entry Point ───────────────────────────────────────────────────

   public async getAgentPricing(
    data: IAgentPricingRequest
): Promise<IApiResponse<IAgentPricingResponse>> {
    try {
        const {
            propertyCode,
            invTypeCode,
            ratePlanCode,
            startDate,
            endDate,
            noOfRooms,
            guestDistribution,
            includedAddons,
            agencyId,
        } = data;

        const numberOfNights = differenceInDays(endDate, startDate);
        if (numberOfNights <= 0) {
            return errorResponse('End date must be after start date');
        }

        const stayDates = this.buildStayDates(startDate, endDate);

        // ── Fetch ratePlan first to get its id ───────────────────────────
        const ratePlan = await this.repository.getRatePlanWithTax(ratePlanCode);
        if (!ratePlan) return errorResponse('Rate plan not found');

        // ── Parallel fetch everything else ───────────────────────────────
        const [agency, room, inventories, charges, bookingOffset, ratePlanRule] =
            await Promise.all([
                this.repository.getAgencyDetails(agencyId),
                this.repository.getRoomByTypeCode(propertyCode, invTypeCode),
                this.repository.getInventoryForDates(propertyCode, invTypeCode, stayDates),
                this.repository.getChargesForDates(propertyCode, invTypeCode, ratePlanCode, stayDates),
                this.repository.getBookingOffset(ratePlan.id, toUTCDate(startDate)),
                this.repository.getRatePlanRule(ratePlan.id),
            ]);

        if (!agency) return errorResponse('Agency not found or has been deleted');
        if (!room) return errorResponse('Room type not found');

        // ── Inventory check ──────────────────────────────────────────────
        const inventoryResult = this.validateInventory(inventories, stayDates, ratePlanCode, noOfRooms);
        if (!inventoryResult.success) return errorResponse(inventoryResult.error);
        const availableRooms = inventoryResult.availableRooms;

        // ── Charge restrictions ──────────────────────────────────────────
        const chargeRestrictionError = this.validateChargeRestrictions(charges, stayDates);
        if (chargeRestrictionError) return errorResponse(chargeRestrictionError);

        // ── Booking offset / MLOS restrictions ───────────────────────────
        const restrictionError = this.validateBookingRestrictions(
            bookingOffset, ratePlanRule, startDate, endDate, numberOfNights
        );
        if (restrictionError) return errorResponse(restrictionError);

        // ── Occupancy validation per room ────────────────────────────────
        const occupancyError = this.validateOccupancy(guestDistribution, room);
        if (occupancyError) return errorResponse(occupancyError);

        // ── Base price calculation ────────────────────────────────────────
        const basePriceResult = this.calculateBasePriceAllRooms(charges, guestDistribution, numberOfNights);
        if (!basePriceResult.success) return errorResponse(basePriceResult.error!);
        const { totalBaseAmount, totalAdditionalCharges, dailyBreakdown } = basePriceResult.data!;

        // ── Included addons ──────────────────────────────────────────────
        const addonIdsToFetch = includedAddons && includedAddons.length > 0
            ? includedAddons
            : ratePlan.Addons.map(a => a.addonId);

        const addonsResult = await this.calculateIncludedAddons(
            addonIdsToFetch, stayDates, guestDistribution, noOfRooms, numberOfNights
        );
        const { addons: includedAddonDetails, totalAmount: includedAddonsAmount } = addonsResult;

        // ── Build final amounts ──────────────────────────────────────────
        const currencyCode = charges[0]?.currencyCode ?? ('USD' as CurrencyCode);

        const amountBeforeTax = round(totalBaseAmount + totalAdditionalCharges);
        const totalAddonAmount = round(includedAddonsAmount);
        const subtotalAmount = round(amountBeforeTax + totalAddonAmount);

        const commissionDetail = this.calculateCommission(amountBeforeTax, agency);
        const agencyCommissionAmount = round(commissionDetail.commissionAmount);
        const totalAfterCommission = round(subtotalAmount + agencyCommissionAmount);

        const taxResult = this.calculateTax(ratePlan, totalBaseAmount);
        const taxedAmount = round(taxResult.totalTax);

        const touristTaxDetail = this.calculateTouristTax(room.TouristTaxs, totalBaseAmount, numberOfNights, noOfRooms, room.numberOfBedrooms);

        const currentChargeableAmount = round(totalAfterCommission + taxedAmount);
        const latterpayableAmount = round(touristTaxDetail?.calculatedAmount ?? 0);
        const totalAmount = round(currentChargeableAmount + latterpayableAmount);

        return successResponse('Price calculated successfully', {
            numberOfNights,
            currencyCode,

            currentChargeableAmount,
            latterpayableAmount,
            totalAmount,

            breakdown: {
                amountBeforeTax,
                totalAddonAmount,
                subtotal: subtotalAmount,
                agencyCommissionAmount,
                totalAfterCommission,
                taxedAmount,
                currentChargeableAmount,
                latterpayableAmount,
                totalAmount,
                averagePerNight: round(currentChargeableAmount / numberOfNights),
            },

            dailyBreakdown,
            includedAddons: includedAddonDetails,
            taxes: taxResult.taxDetails,
            touristTax: touristTaxDetail,
            agencyCommission: commissionDetail,

            availableRooms,
            requestedRooms: noOfRooms,
        });
    } catch (error) {
        if (error instanceof Error) {
            return errorResponse('Failed to calculate pricing', error.message);
        }
        return errorResponse('Failed to calculate pricing');
    }
}

    // ─── Stay Dates ───────────────────────────────────────────────────────────

    private buildStayDates(startDate: Date, endDate: Date): Date[] {
        const dates: Date[] = [];
        let current = toUTCDate(startDate);
        const last = toUTCDate(endDate);
        while (current < last) {
            dates.push(current);
            current = toUTCDate(
                new Date(new Date(current).setUTCDate(current.getUTCDate() + 1))
            );
        }
        return dates;
    }

    // ─── Inventory Validation ─────────────────────────────────────────────────

    private validateInventory(
        inventories: { availability: number; ratePlans: string[]; date: Date }[],
        stayDates: Date[],
        ratePlanCode: string,
        noOfRooms: number
    ): { success: true; availableRooms: number } | { success: false; error: string } {
        if (inventories.length !== stayDates.length) {
            return {
                success: false,
                error: `Inventory not available for all dates. Expected ${stayDates.length}, found ${inventories.length}`,
            };
        }

        let minAvailability = Infinity;

        for (const inv of inventories) {
            if (!inv.ratePlans.includes(ratePlanCode)) {
                return {
                    success: false,
                    error: `Rate plan ${ratePlanCode} not available on ${inv.date.toDateString()}`,
                };
            }
            if (inv.availability < noOfRooms) {
                return {
                    success: false,
                    error: `Only ${inv.availability} room(s) available on ${inv.date.toDateString()}, but ${noOfRooms} requested`,
                };
            }
            minAvailability = Math.min(minAvailability, inv.availability);
        }

        return { success: true, availableRooms: minAvailability };
    }

    // ─── Charge Restrictions ─────────────────────────────────────────────────

    private validateChargeRestrictions(
        charges: ICharge[],
        stayDates: Date[]
    ): string | null {
        if (charges.length !== stayDates.length) {
            return `Rates not found for all dates. Expected ${stayDates.length}, found ${charges.length}`;
        }

        // CTA — first date
        if (charges[0]?.isClosedToArrival) {
            return `Check-in is not allowed on ${charges[0].date.toDateString()}`;
        }

        // CTD — last date (checkout date charge)
        const lastCharge = charges[charges.length - 1];
        if (lastCharge?.isClosedToDeparture) {
            return `Check-out is not allowed on ${lastCharge.date.toDateString()}`;
        }

        // Sale stopped / day of week applicability
        const dayKeys: Record<number, keyof ICharge> = {
            0: 'sunApplicable',
            1: 'monApplicable',
            2: 'tueApplicable',
            3: 'wedApplicable',
            4: 'thuApplicable',
            5: 'friApplicable',
            6: 'satApplicable',
        };

        for (const charge of charges) {
            if (charge.isSaleStopped) {
                return `Sale is stopped on ${charge.date.toDateString()}${charge.restrictionNotes ? `: ${charge.restrictionNotes}` : ''}`;
            }
            const dow = new Date(charge.date).getDay();
            const key = dayKeys[dow];
            if (!charge[key]) {
                return `Rate plan not applicable on ${new Date(charge.date).toDateString()}`;
            }
        }

        return null;
    }

    // ─── Booking Offset / MLOS ────────────────────────────────────────────────

    private validateBookingRestrictions(
        bookingOffset: IBookingOffset | null,
        ratePlanRule: IRatePlanRule | null,
        startDate: Date,
        endDate: Date,
        numberOfNights: number
    ): string | null {
        if (bookingOffset) {
            const hoursUntilCheckIn = DateTime.fromJSDate(toUTCDate(startDate))
                .diff(DateTime.now(), 'hours').hours;

            if (
                bookingOffset.minimumAdvanceBookingOffset !== null &&
                hoursUntilCheckIn < bookingOffset.minimumAdvanceBookingOffset
            ) {
                return `Booking must be made at least ${bookingOffset.minimumAdvanceBookingOffset} hours in advance`;
            }
            if (
                bookingOffset.maximumAdvanceBookingOffset !== null &&
                hoursUntilCheckIn > bookingOffset.maximumAdvanceBookingOffset
            ) {
                return `Booking cannot be made more than ${bookingOffset.maximumAdvanceBookingOffset} hours in advance`;
            }
        }

        if (ratePlanRule?.isActive) {
            const withinPeriod = this.isDateRangeWithinPeriod(
                startDate, endDate,
                ratePlanRule.startDate,
                ratePlanRule.endDate
            );
            if (withinPeriod) {
                if (ratePlanRule.minLos !== null && numberOfNights < ratePlanRule.minLos) {
                    return `Minimum stay for this rate plan is ${ratePlanRule.minLos} nights`;
                }
                if (ratePlanRule.maxLos !== null && numberOfNights > ratePlanRule.maxLos) {
                    return `Maximum stay for this rate plan is ${ratePlanRule.maxLos} nights`;
                }
            }
        }

        return null;
    }

    private isDateRangeWithinPeriod(
        startDate: Date,
        endDate: Date,
        periodStart: Date | null | undefined,
        periodEnd: Date | null | undefined
    ): boolean {
        if (!periodStart && !periodEnd) return true;
        if (periodStart && startDate < periodStart) return false;
        if (periodEnd && endDate > periodEnd) return false;
        return true;
    }

    // ─── Occupancy Validation ─────────────────────────────────────────────────

    private validateOccupancy(
        guestDistribution: IGuestDistributionEntry[],
        room: IRoom
    ): string | null {
        for (let i = 0; i < guestDistribution.length; i++) {
            const { adults, children } = guestDistribution[i];
            const roomNum = i + 1;

            if (adults > room.maxNumberOfAdults) {
                return `Room ${roomNum}: exceeds maximum adults allowed (${room.maxNumberOfAdults})`;
            }
            if (children > room.maxNumberOfChildren) {
                return `Room ${roomNum}: exceeds maximum children allowed (${room.maxNumberOfChildren})`;
            }
            if (adults + children > room.maxOccupancy) {
                return `Room ${roomNum}: exceeds maximum occupancy (${room.maxOccupancy})`;
            }
        }
        return null;
    }

    // ─── Base Price Calculation ───────────────────────────────────────────────

    private calculateBasePriceAllRooms(
        charges: ICharge[],
        guestDistribution: IGuestDistributionEntry[],
        numberOfNights: number
    ): {
        success: boolean;
        error?: string;
        data?: {
            totalBaseAmount: number;
            totalAdditionalCharges: number;
            dailyBreakdown: IDailyBreakdown[];
        };
    } {
        const dailyBreakdown: IDailyBreakdown[] = [];
        let totalBaseAmount = 0;
        let totalAdditionalCharges = 0;

        for (const charge of charges) {
            const perRoomBreakdown: IPerRoomBreakdown[] = [];
            let dayBase = 0;
            let dayAdditional = 0;

            for (let i = 0; i < guestDistribution.length; i++) {
                const { adults, children } = guestDistribution[i];

                const result = this.calculateSingleRoomDayPrice(charge, adults, children);

                // null means charge cannot cover these guests — don't show price
                if (result === null) {
                    return {
                        success: false,
                        error: `No valid rate available for room ${i + 1} with ${adults} adult(s) and ${children} child(ren) on ${new Date(charge.date).toDateString()}`,
                    };
                }

                dayBase += result.adultBaseAmount + result.childBaseAmount;
                dayAdditional += result.additionalAdultCharges + result.additionalChildCharges;

                perRoomBreakdown.push({
                    roomNumber: i + 1,
                    adults,
                    children,
                    adultBaseAmount: round(result.adultBaseAmount),
                    childBaseAmount: round(result.childBaseAmount),
                    additionalAdultCharges: round(result.additionalAdultCharges),
                    additionalChildCharges: round(result.additionalChildCharges),
                    roomTotal: round(
                        result.adultBaseAmount +
                        result.childBaseAmount +
                        result.additionalAdultCharges +
                        result.additionalChildCharges
                    ),
                });
            }

            totalBaseAmount += dayBase;
            totalAdditionalCharges += dayAdditional;

            const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

            dailyBreakdown.push({
                date: new Date(charge.date).toISOString().split('T')[0],
                dayOfWeek: days[new Date(charge.date).getDay()],
                baseAmount: round(dayBase),
                additionalCharges: round(dayAdditional),
                totalForAllRooms: round(dayBase + dayAdditional),
                currencyCode: charge.currencyCode,
                perRoomBreakdown,
            });
        }

        return {
            success: true,
            data: { totalBaseAmount, totalAdditionalCharges, dailyBreakdown },
        };
    }


    private calculateSingleRoomDayPrice(
        charge: ICharge,
        adults: number,
        children: number
    ): {
        adultBaseAmount: number;
        childBaseAmount: number;
        additionalAdultCharges: number;
        additionalChildCharges: number;
    } | null {
        const adultResult = this.calculateGuestTypePrice(
            adults,
            charge.baseGuestAmounts.filter(b => b.ageQualifyingCode === '10'),
            charge.additionalGuestAmounts.find(a => a.ageQualifyingCode === '10')
        );
        if (adultResult === null) return null;

        let childBaseAmount = 0;
        let additionalChildCharges = 0;

        if (children > 0) {
            const childResult = this.calculateGuestTypePrice(
                children,
                charge.baseGuestAmounts.filter(b => b.ageQualifyingCode === '8'),
                charge.additionalGuestAmounts.find(a => a.ageQualifyingCode === '8')
            );
            if (childResult === null) return null;
            childBaseAmount = childResult.baseAmount;
            additionalChildCharges = childResult.additionalCharges;
        }

        return {
            adultBaseAmount: adultResult.baseAmount,
            childBaseAmount,
            additionalAdultCharges: adultResult.additionalCharges,
            additionalChildCharges,
        };
    }

    private calculateGuestTypePrice(
        count: number,
        baseAmounts: IChargeBaseByGuest[],
        additionalCharge: IChargeAdditionalGuest | undefined
    ): { baseAmount: number; additionalCharges: number } | null {
        const sorted = [...baseAmounts].sort((a, b) => a.numberOfGuests - b.numberOfGuests);

        // Exact match → use directly, no extra charge
        const exact = sorted.find(b => b.numberOfGuests === count);
        if (exact) {
            return { baseAmount: Number(exact.amountBeforeTax), additionalCharges: 0 };
        }

        if (sorted.length > 0) {
            const max = sorted[sorted.length - 1];
            const extra = count - max.numberOfGuests;

            if (extra <= 0) {
                // count is within the max base → same price as max base
                return { baseAmount: Number(max.amountBeforeTax), additionalCharges: 0 };
            }

            // extra guests beyond the max base entry
            if (!additionalCharge) {
                // No additional charge defined → cannot price these guests
                return null;
            }

            return {
                baseAmount: Number(max.amountBeforeTax),
                additionalCharges: extra * Number(additionalCharge.amount),
            };
        }

        // No base entries at all
        if (!additionalCharge) return null;

        return {
            baseAmount: 0,
            additionalCharges: count * Number(additionalCharge.amount),
        };
    }

    // ─── Included Addons ─────────────────────────────────────────────────────

    private async calculateIncludedAddons(
        addonIds: string[],
        stayDates: Date[],
        guestDistribution: IGuestDistributionEntry[],
        numberOfRooms: number,
        numberOfNights: number
    ): Promise<{ addons: IIncludedAddonDetail[]; totalAmount: number }> {
        if (addonIds.length === 0) return { addons: [], totalAmount: 0 };

        const addons = await this.repository.getIncludedAddons(addonIds, stayDates);

        const result: IIncludedAddonDetail[] = [];
        let totalAmount = 0;

        for (const addon of addons) {
            // Must be available for all stay dates
            if (addon.availability.length !== stayDates.length) continue;

            const pricePerDate = Number(addon.availability[0].price);
            const totalAdults = guestDistribution.reduce((sum, r) => sum + r.adults, 0);
            const totalChildren = guestDistribution.reduce((sum, r) => sum + r.children, 0);
            const totalGuests = totalAdults + totalChildren;

            let addonTotal = 0;

            switch (addon.postingRhythm) {
                case 'per_stay':
                    addonTotal = pricePerDate;
                    break;
                case 'per_night':
                    addonTotal = pricePerDate * numberOfNights;
                    break;
                case 'per_room':
                    addonTotal = pricePerDate * numberOfRooms;
                    break;
                case 'per_room_per_night':
                    addonTotal = pricePerDate * numberOfRooms * numberOfNights;
                    break;
                case 'per_person_per_stay':
                    addonTotal = pricePerDate * totalGuests;
                    break;
                case 'per_person_per_night':
                    addonTotal = pricePerDate * totalGuests * numberOfNights;
                    break;
                case 'per_person_per_room':
                    addonTotal = pricePerDate * totalGuests * numberOfRooms;
                    break;
                default:
                    addonTotal = pricePerDate;
            }

            totalAmount += addonTotal;

            result.push({
                addonId: addon.id,
                addonName: addon.name,
                addonCode: addon.code,
                postingRhythm: addon.postingRhythm,
                totalAmount: round(addonTotal),
                currencyCode: addon.availability[0].currencyCode,
                description: addon.description ?? '',
            });
        }

        return { addons: result, totalAmount };
    }

    // ─── Agency Commission ────────────────────────────────────────────────────

    private calculateCommission(
        subtotal: number,
        agency: IAgencyDetails
    ): IAgencyCommissionDetail {
        let commissionAmount = 0;

        if (agency.commissionType === 'percentage') {
            commissionAmount = (subtotal * agency.commissionValue) / 100;
        } else {
            commissionAmount = agency.commissionValue;
        }

        return {
            commissionType: agency.commissionType,
            commissionValue: agency.commissionValue,
            commissionAmount: round(commissionAmount),
            commissionCurrency: agency.commissionCurrency ?? 'USD',
        };
    }

    // ─── Tax ─────────────────────────────────────────────────────────────────

    private calculateTax(
        ratePlan: IRatePlan,
        baseAmount: number
    ): { taxDetails: ITaxDetail[]; totalTax: number } {
        if (!ratePlan.taxGroup?.taxGroupRules?.length) {
            return { taxDetails: [], totalTax: 0 };
        }

        const now = new Date();
        const sortedRules = [...ratePlan.taxGroup.taxGroupRules].sort(
            (a, b) => a.taxRule.priority - b.taxRule.priority
        );

        const taxDetails: ITaxDetail[] = [];
        let runningAmount = baseAmount;
        let totalTax = 0;

        for (const rule of sortedRules) {
            const { taxRule } = rule;

            if (now < new Date(taxRule.validFrom) || now > new Date(taxRule.validTo)) {
                continue;
            }

            let taxAmount = 0;

            if (taxRule.type === 'percentage') {
                taxAmount = (runningAmount * taxRule.value) / 100;
            } else {
                taxAmount = taxRule.value;
            }

            taxDetails.push({
                name: taxRule.name,
                amount: round(taxAmount),
                type: taxRule.type,
            });

            totalTax += taxAmount;

            if (!taxRule.isInclusive) {
                runningAmount += taxAmount;
            }
        }

        return { taxDetails, totalTax: round(totalTax) };
    }

    // ─── Tourist Tax ─────────────────────────────────────────────────────────

    private calculateTouristTax(
        touristTaxes: ITouristTaxRaw[],
        baseAmount: number,
        numberOfNights: number,
        noOfRooms: number,
        noOfBedrooms: number
    ): ITouristTaxDetail | null {
        if (!touristTaxes || touristTaxes.length === 0) return null;

        const tax = touristTaxes[0];

        const calculatedAmount =
            tax.discountType === 'percentage'
                ? (baseAmount * Number(tax.discountValue)) / 100
                : Number(tax.discountValue * numberOfNights * noOfRooms * noOfBedrooms);

        return {
            id: tax.id,
            name: tax.name ?? 'Tourist Tax',
            discountType: tax.discountType,
            discountValue: Number(tax.discountValue),
            calculatedAmount: round(calculatedAmount),
            currencyCode: (tax.currencyCode ?? 'USD') as CurrencyCode,
        };
    }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function round(value: number): number {
    return Number(value.toFixed(2));
}