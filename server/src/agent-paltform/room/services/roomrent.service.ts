import { differenceInDays } from 'date-fns';
import { errorResponse, successResponse } from '../../../utils/return';
import { IApiResponse, toUTCDate } from '../../../utils';
import { AgentPricingRepository } from '../repository';
import { 
    IAgentPricingRequest, 
    IAgentPricingResponse, 
    IDailyBreakdown,
    IIncludedAddon,
    ITaxDetail 
} from '../types';

export class AgentPricingService {
    
    public async getAgentPricing(
        data: IAgentPricingRequest,
        agencyId: string
    ): Promise<IApiResponse<IAgentPricingResponse>> {
        try {
            const {
                propertyCode,
                invTypeCode,
                startDate,
                endDate,
                ratePlanCode,
                noOfChildren,
                noOfAdults,
                noOfRooms
            } = data;

            // Validate inputs
            const validationResult = this.validateInputs(data);
            if (!validationResult.isValid) {
                return errorResponse(validationResult.message || 'Invalid input');
            }

            const numberOfNights = differenceInDays(endDate, startDate);
            if (numberOfNights <= 0) {
                return errorResponse('End date must be after start date');
            }

            // Get agency details for commission calculation
            const agency = await AgentPricingRepository.getAgencyDetails(agencyId);
            if (!agency) {
                return errorResponse('Agency not found or has been deleted');
            }

            // Get rate plan with tax configuration
            const ratePlan = await AgentPricingRepository.getRatePlanWithTax(ratePlanCode);
            
            if (!ratePlan) {
                return errorResponse('Rate plan not found');
            }

            // Check inventory availability
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

            // Calculate day-by-day rates
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

            const totalBaseAmount = rateCalculation.data!.breakdown.totalBaseAmount;
            const totalAdditionalCharges = rateCalculation.data!.breakdown.totalAdditionalCharges;

            // Calculate included addons (from rate plan)
            let includedAddons: IIncludedAddon[] = [];
            let totalIncludedAddons = 0;

            if (ratePlan.Addons && ratePlan.Addons.length > 0) {
                const addonIds = ratePlan.Addons.map((ra: any) => ra.addonId);
                const addonsResult = await this.calculateIncludedAddons(
                    addonIds,
                    startDate,
                    endDate,
                    noOfAdults,
                    noOfChildren,
                    noOfRooms
                );

                if (addonsResult.success) {
                    includedAddons = addonsResult.data!.addons;
                    totalIncludedAddons = addonsResult.data!.totalAmount;
                }
            }

            // Calculate subtotal (base + additional charges + included addons)
            const subtotal = totalBaseAmount + totalAdditionalCharges + totalIncludedAddons;

            // Calculate agency commission
            const commissionCalculation = this.calculateAgencyCommission(
                subtotal,
                agency.commissionType,
                agency.commissionValue
            );

            const totalBeforeTax = subtotal + commissionCalculation.commissionAmount;

            // Calculate tax on base amount
            const taxCalculation = await this.calculateTax(ratePlan, totalBaseAmount);
            const totalTax = taxCalculation.totalTax;
            
            // Final amount = subtotal + commission + tax
            const finalAmount = totalBeforeTax + totalTax;

            return successResponse('Price calculated successfully', {
                totalAmount: Number(finalAmount.toFixed(2)),
                numberOfNights,
                baseRatePerNight: totalBaseAmount / numberOfNights / noOfRooms,
                additionalGuestCharges: totalAdditionalCharges,

                breakdown: {
                    totalBaseAmount: Number(totalBaseAmount.toFixed(2)),
                    totalAdditionalCharges: Number(totalAdditionalCharges.toFixed(2)),
                    totalIncludedAddons: Number(totalIncludedAddons.toFixed(2)),
                    subtotal: Number(subtotal.toFixed(2)),
                    agencyCommission: Number(commissionCalculation.commissionAmount.toFixed(2)),
                    totalBeforeTax: Number(totalBeforeTax.toFixed(2)),
                    totalTax: Number(totalTax.toFixed(2)),
                    totalAmount: Number(finalAmount.toFixed(2)),
                    averagePerNight: Number((finalAmount / numberOfNights).toFixed(2))
                },

                dailyBreakdown: rateCalculation.data!.dailyBreakdown,

                availableRooms: inventoryCheck.availableRooms!,
                requestedRooms: noOfRooms,

                includedAddons,

                agencyCommission: {
                    commissionType: commissionCalculation.commissionType,
                    commissionValue: commissionCalculation.commissionValue,
                    commissionAmount: Number(commissionCalculation.commissionAmount.toFixed(2)),
                    commissionCurrency: agency.commissionCurrency || 'INR'
                },

                tax: taxCalculation.taxDetails,
                totalTax: Number(totalTax.toFixed(2)),

                priceAfterTax: Number(finalAmount.toFixed(2))
            });

        } catch (error) {
            console.error('Error in getAgentPricing:', error);
            return errorResponse('Internal server error');
        }
    }

    private calculateAgencyCommission(
        subtotal: number,
        commissionType: 'percentage' | 'fixed',
        commissionValue: number
    ): {
        commissionType: 'percentage' | 'fixed';
        commissionValue: number;
        commissionAmount: number;
    } {
        let commissionAmount = 0;

        if (commissionType === 'percentage') {
            // Calculate percentage-based commission
            commissionAmount = (subtotal * commissionValue) / 100;
        } else if (commissionType === 'fixed') {
            // Fixed commission amount
            commissionAmount = commissionValue;
        }

        return {
            commissionType,
            commissionValue,
            commissionAmount
        };
    }

    private validateInputs(data: IAgentPricingRequest): { isValid: boolean; message?: string } {
        if (!data.propertyCode || !data.invTypeCode) {
            return { isValid: false, message: 'Property and room type required' };
        }
        if (!data.ratePlanCode) {
            return { isValid: false, message: 'Rate plan required' };
        }
        if (!data.startDate || !data.endDate) {
            return { isValid: false, message: 'Dates required' };
        }
        if (data.noOfAdults < 1) {
            return { isValid: false, message: 'At least 1 adult required' };
        }
        if (data.noOfChildren < 0) {
            return { isValid: false, message: 'Children cannot be negative' };
        }
        if (data.noOfRooms < 1) {
            return { isValid: false, message: 'At least 1 room required' };
        }
        if (data.startDate >= data.endDate) {
            return { isValid: false, message: 'End date must be after start date' };
        }
        return { isValid: true };
    }

    private async checkInventoryAvailability(
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

        let current = new Date(start.getTime());

        while (current < end) {
            stayDates.push(new Date(current.getTime()));
            current.setUTCDate(current.getUTCDate() + 1);
        }

        const inventories = await AgentPricingRepository.checkInventoryAvailability(
            propertyCode,
            roomTypeCode,
            ratePlanCode,
            stayDates
        );

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

    private async calculateDayByDayRates(
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
            const dailyBreakdown: IDailyBreakdown[] = [];
            let totalAmount = 0;
            let totalBaseAmount = 0;
            let totalAdditionalCharges = 0;

            const stayDates: Date[] = [];
            const start = toUTCDate(startDate);
            const end = toUTCDate(endDate);

            let current = toUTCDate(start);

            while (current < end) {
                stayDates.push(toUTCDate(current));
                current.setUTCDate(current.getUTCDate() + 1);
            }

            for (const date of stayDates) {
                const dayOfWeek = this.getDayOfWeek(date);
                const dateStr = date.toISOString().split('T')[0];

                const startOfDateUTC = toUTCDate(dateStr);
                const endOfDateUTC = new Date(startOfDateUTC.getTime() + 24 * 60 * 60 * 1000);

                const charge = await AgentPricingRepository.getChargeForDate(
                    propertyCode,
                    roomTypeCode,
                    ratePlanCode,
                    startOfDateUTC,
                    endOfDateUTC
                );

                if (!charge) {
                    return errorResponse(`No rates found for date: ${dateStr}`);
                }

                const dayApplicable = this.isDayApplicable(charge, dayOfWeek);
                if (!dayApplicable) {
                    return errorResponse(
                        `Rate plan not applicable for ${dayOfWeek} on ${dateStr}`
                    );
                }

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

            const averageBaseRate = numberOfNights > 0 ? totalBaseAmount / numberOfNights / noOfRooms : 0;

            return {
                success: true,
                data: {
                    totalAmount,
                    numberOfNights,
                    baseRatePerNight: averageBaseRate,
                    additionalGuestCharges: numberOfNights > 0 ? totalAdditionalCharges / numberOfNights : 0,
                    breakdown: {
                        totalBaseAmount,
                        totalAdditionalCharges,
                        totalAmount,
                        numberOfNights,
                        averagePerNight: numberOfNights > 0 ? totalAmount / numberOfNights : 0,
                    },
                    dailyBreakdown,
                },
            };
        } catch (error) {
            console.error('Error in calculateDayByDayRates:', error);
            return errorResponse('Error calculating day-by-day rates');
        }
    }

    private getDayOfWeek(date: Date): string {
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        return days[date.getDay()];
    }

    private isDayApplicable(charge: any, dayOfWeek: string): boolean {
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

    private calculateSingleDayRate(
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

            const sortedBaseRates = baseGuestAmounts.sort(
                (a: any, b: any) => a.numberOfGuests - b.numberOfGuests
            );

            let selectedBaseRate = sortedBaseRates.find(
                (rate: any) => rate.numberOfGuests >= totalGuests
            );

            if (!selectedBaseRate) {
                selectedBaseRate = sortedBaseRates[sortedBaseRates.length - 1];
            }

            const baseRatePerRoom = Number(selectedBaseRate.amountBeforeTax);
            const baseGuestsIncluded = selectedBaseRate.numberOfGuests;

            const totalGuestsCoveredByBase = baseGuestsIncluded * noOfRooms;

            const adultsInBaseRate = Math.min(noOfAdults, totalGuestsCoveredByBase);
            const remainingBaseCapacity = totalGuestsCoveredByBase - adultsInBaseRate;
            const childrenInBaseRate = Math.min(noOfChildren, remainingBaseCapacity);

            const adultsNotInBaseRate = noOfAdults - adultsInBaseRate;
            const childrenNotInBaseRate = noOfChildren - childrenInBaseRate;

            const additionalGuestAmounts = charge.additionalGuestAmounts || [];
            const adultRate = additionalGuestAmounts.find(
                (aga: any) => aga.ageQualifyingCode === '10'
            );
            const childRate = additionalGuestAmounts.find(
                (aga: any) => aga.ageQualifyingCode === '8'
            );

            let additionalAdultCharges = 0;
            if (adultsNotInBaseRate > 0 && adultRate) {
                const chargeAmount = Number(adultRate.amount);
                additionalAdultCharges = adultsNotInBaseRate * chargeAmount;
            }

            let additionalChildrenCharges = 0;
            if (childrenNotInBaseRate > 0 && childRate) {
                const chargeAmount = Number(childRate.amount);
                additionalChildrenCharges = childrenNotInBaseRate * chargeAmount;
            }

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
                    totalAdditionalCharges: additionalAdultCharges + additionalChildrenCharges,
                    baseGuestsIncluded,
                    adultsInBaseRate,
                    childrenInBaseRate,
                    adultsNotInBaseRate,
                    childrenNotInBaseRate,
                },
            };
        } catch (error) {
            console.error('Error in calculateSingleDayRate:', error);
            return errorResponse('Error calculating single day rate');
        }
    }

    private async calculateIncludedAddons(
        addonIds: string[],
        checkInDate: Date,
        checkOutDate: Date,
        noOfAdults: number,
        noOfChildren: number,
        noOfRooms: number
    ): Promise<IApiResponse<{ addons: IIncludedAddon[], totalAmount: number }>> {
        try {
            const addons = await AgentPricingRepository.getIncludedAddons(
                addonIds,
                checkInDate,
                checkOutDate
            );

            if (addons.length === 0) {
                return successResponse('No included addons available', {
                    addons: [],
                    totalAmount: 0
                });
            }

            const numberOfNights = differenceInDays(checkOutDate, checkInDate);
            if (numberOfNights <= 0) {
                return errorResponse('Invalid stay duration for addons calculation');
            }

            let totalAddonAmount = 0;
            const addonDetails: IIncludedAddon[] = [];
            const totalGuests = noOfAdults + noOfChildren;

            for (const addon of addons) {
                if (!addon.availability || addon.availability.length === 0) {
                    continue;
                }

                let addonAmount = 0;

                switch (addon.postingRhythm) {
                    case 'per_night':
                        addonAmount = addon.availability.reduce(
                            (sum: number, avail: any) => sum + avail.price, 
                            0
                        );
                        break;

                    case 'per_stay':
                        addonAmount = addon.availability[0].price;
                        break;

                    case 'per_person_per_night':
                        addonAmount = addon.availability.reduce(
                            (sum: number, avail: any) => sum + avail.price, 
                            0
                        ) * totalGuests;
                        break;

                    case 'per_person_per_stay':
                        addonAmount = addon.availability[0].price * totalGuests;
                        break;

                    case 'per_room':
                        addonAmount = addon.availability[0].price * noOfRooms;
                        break;

                    case 'per_room_per_night':
                        addonAmount = addon.availability.reduce(
                            (sum: number, avail: any) => sum + avail.price, 
                            0
                        ) * noOfRooms;
                        break;

                    case 'per_person_per_room':
                        addonAmount = addon.availability[0].price * totalGuests * noOfRooms;
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
                    description: addon.description || ''
                });
            }

            return successResponse('Included addons calculated successfully', {
                addons: addonDetails,
                totalAmount: Number(totalAddonAmount.toFixed(2))
            });
        } catch (error) {
            console.error('Error in calculateIncludedAddons:', error);
            return errorResponse('Error calculating included addons');
        }
    }

    private async calculateTax(ratePlan: any, baseAmount: number): Promise<any> {
        try {
            const taxDetails: ITaxDetail[] = [];
            let totalTax = 0;

            if (!ratePlan.taxGroup || !ratePlan.taxGroup.taxGroupRules) {
                return { taxDetails: [], totalTax: 0 };
            }

            const sortedRules = ratePlan.taxGroup.taxGroupRules.sort(
                (a: any, b: any) => a.taxRule.priority - b.taxRule.priority
            );

            let applicableAmount = baseAmount;

            for (const rule of sortedRules) {
                const taxRule = rule.taxRule;

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
}