// services/roomRentCalculation.service.ts

import { differenceInDays, startOfDay } from 'date-fns';
import { errorResponse, successResponse } from '../../utils/return';

import { prisma } from "../../config"
import { getPropertyCode } from "../utils";

interface RateCalculationResult {
  success: boolean;
  message?: string;
  data?: {
    totalAmount: number;
    numberOfNights: number;
    baseRatePerNight: number;
    additionalGuestCharges: number;
    breakdown: {
      totalBaseAmount: number;
      totalAdditionalCharges: number;
      totalAmount: number;
      averagePerNight: number;
      numberOfNights: number;
    };
    dailyBreakdown: DailyBreakdown[];
    tax: TaxDetail[];
    totalTax: number;
    priceAfterTax: number;
    availableRooms: number;
    requestedRooms: number;
  };
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

export class RoomRentCalculationService {
  public static async getRoomRentService(
    propertyCode: string,
    invTypeCode: string,
    startDate: Date,
    endDate: Date,
    ratePlanCode: string,
    noOfChildren: number,
    noOfAdults: number,
    noOfRooms: number
  ): Promise<RateCalculationResult> {
    try {
      // Input validation
      if (!propertyCode) {
        return errorResponse('Invalid property ID');
      }
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

      console.log("Service received dates:", start, end);

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
      console.log("inv ava:", start, end);

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
      console.log("Calculating day-by-day rates with dates:", start, end);
      console.log("Calculating day-by-day rates with dates:", startDate, endDate);
      
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
      console.log(rateCalculation)
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
  public static async getRoomRentServiceByCode(
    propertyCode: string,
    invTypeCode: string,
    startDate: Date,
    endDate: Date,
    ratePlanCode: string,
    noOfChildren: number,
    noOfAdults: number,
    noOfRooms: number
  ): Promise<RateCalculationResult> {
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

      console.log("Service received dates:", start, end);

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
      // console.log("inv ava:", start, end);

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
      console.log("Calculating day-by-day rates with dates:", start, end);
      console.log("Calculating day-by-day rates with dates:", startDate, endDate);
      
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
      console.log(rateCalculation)
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
    const stayDates: string[] = [];
    const currentDate = new Date(startDate);  // Create a copy, not a reference
    console.log(startDate, endDate)

    while (currentDate < endDate) {
      stayDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    console.log("Stay dates", stayDates)
    const inventories = await prisma.inventory.findMany({
      where: {
        propertyCode,
        roomTypeCode,
        date: { in: stayDates },
      },
    });
    console.log(inventories)
    if (inventories.length !== stayDates.length) {
      return errorResponse('Inventory not found for all dates in the range');
    }

    let minAvailability = Infinity;
    for (const inv of inventories) {
      // Check if ratePlanCode exists in ratePlans array
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
      const currentDate = new Date(startDate);  // Create a proper copy
      console.log("currentDate", currentDate)
      console.log("startDate", startDate)
      console.log("endDate", endDate)

      // No need to setHours - dates are already in UTC midnight format from controller

      const endDateCheck = new Date(endDate);  // Create a copy of endDate

      while (currentDate < endDateCheck) {
        stayDates.push(new Date(currentDate));  // Push a copy, not reference
        currentDate.setDate(currentDate.getDate() + 1);
      }
      console.log(stayDates)
      for (const date of stayDates) {
        const dayOfWeek = this.getDayOfWeek(date);
        const dateStr = date.toISOString().split('T')[0];

        // Get charge for this date - using date range for better matching
        const startOfDateUTC = new Date(dateStr + 'T00:00:00.000Z');
        const endOfDateUTC = new Date(dateStr + 'T23:59:59.999Z');
        const charge = await prisma.charge.findFirst({
          where: {
            propertyCode,
            roomTypeCode,
            ratePlanCode,
            date: {
              gte: startOfDateUTC,
              lte: endOfDateUTC,
            },
            isSaleStopped: false
            // Removed isSaleStopped filter - you can add it back if needed
          },
          include: {
            baseGuestAmounts: true,
            additionalGuestAmounts: true,
          },
        });
        console.log("charge", charge)

        // if (!charge) {
        //   // Check if rate exists but sales are stopped
        //   const chargeWithSalesStopped = await prisma.charge.findFirst({
        //     where: {
        //       propertyCode,
        //       roomTypeCode,
        //       ratePlanCode,
        //       date: {
        //         gte: startOfDateUTC,
        //         lte: endOfDateUTC,
        //       },
        //       isAvailable: true,
        //     },
        //   });

        //   if (chargeWithSalesStopped && chargeWithSalesStopped.isSaleStopped) {
        //     return errorResponse(
        //       `Sales are stopped for date: ${dateStr}. Please choose different dates.`
        //     );
        //   }

        //   return errorResponse(`No rates found for date: ${dateStr}`);
        // }

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
        totalAdditionalCharges +=
          rateCalculation.additionalGuestCharges * noOfRooms;
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
}