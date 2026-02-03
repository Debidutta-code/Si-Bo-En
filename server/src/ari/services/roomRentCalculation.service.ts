// services/roomRentCalculationEnhanced.service.ts

  import { differenceInCalendarDays, differenceInDays, startOfDay } from 'date-fns';
  import { errorResponse, successResponse } from '../../utils/return';
  import { prisma } from "../../config";
  import { toUTCDate, nowUTC } from '../../utils';

  interface AddonInput {
    addonId: string;
    availabilityId: string;
    date: string | Date;
    price: number;
    quantity: number;
    type: string; // PostingRhythm
    name: string;
    code: string;
  }

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
      geoRestrictionApplied?: GeoRestrictionDetail;
      promotionApplied?: PromotionDetail;
      ratePlanRuleApplied?: RatePlanRuleDetail;
      addonsBreakdown?: AddonBreakdown[];
      addonsTotal?: number;
      finalTotal?: number;
    };
  }

 interface DailyBreakdown {
  date: string;
  dayOfWeek: string;
  ratePlanCode: string;
  baseRate: number;
  additionalCharges: number;
  geoAdjustment?: number;
  rateAfterGeo?: number;
  promotionDiscount?: number;  // Keep this
  promotionsApplied?: PromotionAppliedDetail[];  // ✅ ADD THIS - array of promotions
  ratePlanRuleDiscount?: number;
  finalRatePerRoom: number;
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

// ✅ ADD THIS NEW INTERFACE
interface PromotionAppliedDetail {
  promotionId: string;
  promotionName: string;
  promotionType: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
}

  interface TaxDetail {
    name: string;
    amount: number;
    type: string;
  }

  interface GeoRestrictionDetail {
    countryCode: string;
    restrictionType: string;
    restrictionAction: string;
    adjustmentAmount: number;
    adjustmentPercentage?: number;
    totalAdjustment: number;
  }

  interface PromotionDetail {
    promotionId: string;
    promotionName: string;
    promotionType: string;
    discountType: string;
    discountValue: number;
    totalDiscount: number;
  }

  interface RatePlanRuleDetail {
    ruleId: string;
    discountType: string;
    discountValue: number;
    totalDiscount: number;
  }

  interface AddonBreakdown {
    addonId: string;
    name: string;
    code: string;
    postingRhythm: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    dates: string[];
    calculationDetails: string;
    isMandatory?: boolean;
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
      userCountryCode?: string,
      deviceType?: string,
      addons?: AddonInput[]
    ): Promise<RateCalculationResult> {
      try {
        console.log('\n========== RATE CALCULATION STARTED ==========');
        console.log('📊 Input Parameters:', {
          propertyCode,
          invTypeCode,
          ratePlanCode,
          startDate,
          endDate,
          noOfAdults,
          noOfChildren,
          noOfRooms,
          userCountryCode,
          deviceType,
          addonsCount: addons?.length || 0
        });

        // Input validation
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

        const start = startDate;
        const end = endDate;
        const numberOfNights = differenceInDays(end, start);

        if (numberOfNights <= 0) {
          return errorResponse('End date must be after start date');
        }

        // Step 1: Get and validate rate plan with all relations
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
            ratePlanRules: true,
            Addons: {
              include: {
                addon: {
                  include: {
                    availability: {
                      where: {
                        date: {
                          gte: start,
                          lt: end,
                        },
                      },
                    },
                  },
                },
              },
            },
            property: {
              include: {
                propertyRooms: {
                  where: {
                    roomType: invTypeCode,
                  },
                },
              },
            },
          },
        });

        if (!ratePlan) {
          return errorResponse('Rate plan not found');
        }

        const room = ratePlan.property.propertyRooms[0];
        if (!room) {
          return errorResponse('Room not found');
        }

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

        // Step 3: Calculate base day-by-day rates
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

        if (!rateCalculation.success) {
          return rateCalculation;
        }

        let dailyBreakdown = rateCalculation.data!.dailyBreakdown;
        let totalAmount = rateCalculation.data!.totalAmount;
        let geoRestrictionDetail: GeoRestrictionDetail | undefined;
        let promotionDetail: PromotionDetail | undefined;
        let ratePlanRuleDetail: RatePlanRuleDetail | undefined;

        console.log('\n💰 Base Rate Calculation Complete:', {
          totalAmount,
          numberOfNights,
          baseRatePerNight: rateCalculation.data!.baseRatePerNight
        });

        // Step 4: Apply Geo-Restrictions FIRST
        console.log('\n========== GEO RESTRICTIONS CHECK ==========');
        console.log('🌍 User Country Code:', userCountryCode || 'Not provided');
        
        if (userCountryCode) {
          const geoResult = await this.applyGeoRestrictions(
            ratePlan.propertyId,
            room.id,
            ratePlan.id,
            userCountryCode,
            dailyBreakdown,
            noOfRooms
          );

          if (!geoResult.success) {
            return geoResult;
          }

          if (geoResult.geoRestriction) {
            dailyBreakdown = geoResult.dailyBreakdown!;
            totalAmount = geoResult.totalAmount!;
            geoRestrictionDetail = geoResult.geoRestriction;
            
            console.log('✅ Geo Restriction Applied:', {
              geoRestrictionDetail,
              newTotalAmount: totalAmount
            });
          } else {
            console.log('ℹ️  No geo restriction found for country:', userCountryCode);
          }
        } else {
          console.log('ℹ️  Geo restriction skipped - no country code provided');
        }

        // Step 5: Apply Promotions SECOND
        console.log('\n========== PROMOTIONS CHECK ==========');
        console.log('📱 Device Type:', deviceType || 'Not provided');
        console.log('📅 Check-in Date:', startDate);
        console.log('📅 Current Date:', nowUTC());
        
        if (deviceType) {
          const promotionResult = await this.applyPromotions(
            ratePlan.propertyId,
            room.id,
            ratePlan.id,
            deviceType,
            dailyBreakdown,
            noOfRooms,
            start,
            numberOfNights
          );

          if (promotionResult.promotionsApplied && promotionResult.promotionsApplied.length > 0) {
  dailyBreakdown = promotionResult.dailyBreakdown!;
  totalAmount = promotionResult.totalAmount!;
  
  console.log(`✅ ${promotionResult.promotionsApplied.length} Promotion(s) Applied:`, {
    promotions: promotionResult.promotionsApplied,
    totalDiscount: promotionResult.totalDiscount,
    newTotalAmount: totalAmount
  });
} else {
  console.log('ℹ️  No applicable promotion found');
}
        } else {
          console.log('ℹ️  Promotion check skipped - no device type provided');
        }

        // Step 6: Apply Rate Plan Rules THIRD
        if (ratePlan.ratePlanRules && ratePlan.ratePlanRules.isActive) {
          const ruleResult = await this.applyRatePlanRules(
            ratePlan.ratePlanRules,
            dailyBreakdown,
            noOfRooms,
            numberOfNights,
            start,
            end
          );

          if (ruleResult.rule) {
            dailyBreakdown = ruleResult.dailyBreakdown!;
            totalAmount = ruleResult.totalAmount!;
            ratePlanRuleDetail = ruleResult.rule;
          }
        }

        // Step 7: Get mandatory addons linked to the rate plan
        let addonsBreakdown: AddonBreakdown[] = [];
        let addonsTotal = 0;

        const mandatoryAddonsResult = await this.getMandatoryAddons(
          ratePlan.id,
          start,
          end,
          noOfAdults,
          noOfChildren,
          noOfRooms,
          numberOfNights
        );

        if (!mandatoryAddonsResult.success) {
          return mandatoryAddonsResult;
        }

        addonsBreakdown = mandatoryAddonsResult.addonsBreakdown!;
        addonsTotal = mandatoryAddonsResult.addonsTotal!;

        // Step 8: Calculate optional addons from UI
        if (addons && addons.length > 0) {
          const optionalAddonsResult = await this.calculateOptionalAddons(
            addons,
            ratePlan.id,
            noOfAdults,
            noOfChildren,
            noOfRooms,
            numberOfNights
          );

          if (!optionalAddonsResult.success) {
            return optionalAddonsResult;
          }

          // Merge with mandatory addons
          addonsBreakdown = [...addonsBreakdown, ...optionalAddonsResult.addonsBreakdown!];
          addonsTotal += optionalAddonsResult.addonsTotal!;
        }

        // Step 9: Calculate totals
        const totalBaseAmount = dailyBreakdown.reduce(
          (sum: number, day: any) => sum + day.totalForAllRooms,
          0
        );

        // FIXED: Addons are added to totalBaseAmount BEFORE tax calculation
        const totalAmountWithAddons = totalAmount + addonsTotal;

        console.log('\n💵 Amount Summary Before Tax:', {
          baseAmount: totalAmount,
          addonsTotal,
          totalAmountWithAddons
        });

        // Calculate guest additional charges separately for breakdown
        const guestAdditionalCharges = rateCalculation.data!.breakdown.totalAdditionalCharges;
        
        // Total additional charges = guest charges + addons
        const totalAdditionalCharges = guestAdditionalCharges + addonsTotal;

        // Step 10: Calculate tax on (base amount + addons)
        console.log('\n========== TAX CALCULATION ==========');
        const taxCalculation = await this.calculateTax(ratePlan, totalAmountWithAddons);
        const totalTax = taxCalculation.totalTax;
        const priceAfterTax = totalAmountWithAddons + totalTax;
        const finalTotal = priceAfterTax;

        console.log('📋 Tax Details:', taxCalculation.taxDetails);
        console.log('💰 Total Tax:', totalTax);
        console.log('💳 Price After Tax:', priceAfterTax);
        console.log('🎯 Final Total:', finalTotal);

        console.log('\n========== RATE CALCULATION COMPLETED ==========\n');

        return successResponse('Price calculated successfully', {
          totalAmount: Number(totalAmountWithAddons.toFixed(2)),
          numberOfNights,
          baseRatePerNight: Number(
            (rateCalculation.data!.breakdown.totalBaseAmount / numberOfNights / noOfRooms).toFixed(2)
          ),
          additionalGuestCharges: rateCalculation.data!.additionalGuestCharges,
          breakdown: {
            totalBaseAmount: Number(totalBaseAmount.toFixed(2)),
            totalAdditionalCharges: Number(totalAdditionalCharges.toFixed(2)),
            addonsTotal: Number(addonsTotal.toFixed(2)),
            totalAmount: Number(totalAmountWithAddons.toFixed(2)),
            numberOfNights,
            averagePerNight: Number((totalAmountWithAddons / numberOfNights).toFixed(2)),
          },
          dailyBreakdown,
          tax: taxCalculation.taxDetails,
          totalTax,
          priceAfterTax: Number(priceAfterTax.toFixed(2)),
          availableRooms: inventoryCheck.availableRooms!,
          requestedRooms: noOfRooms,
          geoRestrictionApplied: geoRestrictionDetail,
          promotionApplied: promotionDetail,
          ratePlanRuleApplied: ratePlanRuleDetail,
          addonsBreakdown,
          addonsTotal: Number(addonsTotal.toFixed(2)),
          finalTotal: Number(finalTotal.toFixed(2)),
        });
      } catch (error) {
        console.error('❌ Error in getRoomRentService:', error);
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
      if (!propertyCode || !invTypeCode)
        return { isValid: false, message: 'Hotel and room type required' };
      if (!ratePlanCode) return { isValid: false, message: 'Rate plan required' };
      if (!startDate || !endDate) return { isValid: false, message: 'Dates required' };
      if (noOfAdults < 1) return { isValid: false, message: 'At least 1 adult required' };
      if (noOfChildren < 0) return { isValid: false, message: 'Children cannot be negative' };
      if (noOfRooms < 1) return { isValid: false, message: 'At least 1 room required' };
      if (startDate >= endDate)
        return { isValid: false, message: 'End date must be after start date' };
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

      let current = new Date(start.getTime());

      while (current < end) {
        stayDates.push(new Date(current.getTime()));
        current.setUTCDate(current.getUTCDate() + 1);
      }

      const inventories = await prisma.inventory.findMany({
        where: {
          propertyCode,
          roomTypeCode,
          date: { in: stayDates },
        },
      });

      if (inventories.length !== stayDates.length) {
        return errorResponse(
          `Inventory not found for all dates. Expected ${stayDates.length}, found ${inventories.length}`
        );
      }

      let minAvailability = Infinity;
      for (const inv of inventories) {
        if (!inv.ratePlans.includes(ratePlanCode)) {
          return errorResponse(`Rate plan ${ratePlanCode} not available for date ${inv.date}`);
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

          const charge = await prisma.charge.findFirst({
            where: {
              propertyCode,
              roomTypeCode,
              ratePlanCode,
              date: {
                gte: startOfDateUTC,
                lt: endOfDateUTC,
              },
              isSaleStopped: false,
            },
            include: {
              baseGuestAmounts: true,
              additionalGuestAmounts: true,
            },
          });

          if (!charge) {
            return errorResponse(`No rates found for date: ${dateStr}`);
          }

          const dayApplicable = this.isDayApplicable(charge, dayOfWeek);
          if (!dayApplicable) {
            return errorResponse(`Rate plan not applicable for ${dayOfWeek} on ${dateStr}`);
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
            finalRatePerRoom: rateCalculation.totalPerRoom,
            totalForAllRooms: rateCalculation.totalAmountForDay,
            currencyCode: 'USD',
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
        const adultRate = additionalGuestAmounts.find((aga: any) => aga.ageQualifyingCode === '10');
        const childRate = additionalGuestAmounts.find((aga: any) => aga.ageQualifyingCode === '8');

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

        for (let i = 0; i < childrenInBaseRate; i++) {
          childrenChargesBreakdown.push({
            childIndex: i + 1,
            ageQualifyingCode: '8',
            chargeAmount: 0,
            note: 'Covered by base rate',
          });
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
            adultChargesDetail: adultChargesBreakdown,
            childrenChargesDetail: childrenChargesBreakdown,
          },
        };
      } catch (error) {
        console.error('Error in calculateSingleDayRate:', error);
        return errorResponse('Error calculating single day rate');
      }
    }

    private static async applyGeoRestrictions(
      propertyId: string,
      roomId: string,
      ratePlanId: string,
      userCountryCode: string,
      dailyBreakdown: DailyBreakdown[],
      noOfRooms: number
    ): Promise<any> {
      try {
        console.log('🔍 Searching for geo restriction with:', {
          propertyId,
          roomId,
          ratePlanId,
          userCountryCode
        });

        const geoRatePlan = await prisma.geoRatePlan.findFirst({
          where: {
            propertyId,
            roomId,
            ratePlanId,
            isActive: true,
            countryCode: {
              has: userCountryCode,
            },
          },
        });

        console.log('📦 Geo Rate Plan Query Result:', geoRatePlan ? {
          id: geoRatePlan.id,
          countryCode: geoRatePlan.countryCode,
          restrictionType: geoRatePlan.restrictionType,
          restrictionTypeAction: geoRatePlan.restrictionTypeAction,
          restrictionValue: geoRatePlan.restrictionValue,
          isActive: geoRatePlan.isActive
        } : 'No geo restriction found');

        if (!geoRatePlan) {
          return { success: true, geoRestriction: null };
        }

        // Check if booking is restricted for this country
        if (geoRatePlan.restrictionType === 'restricted') {
          console.log('🚫 Booking restricted for country:', userCountryCode);
          return errorResponse(
            `Bookings from country ${userCountryCode} are not allowed for this rate plan`
          );
        }

        console.log('🧮 Calculating geo adjustments...');
        let totalAdjustment = 0;
        const updatedBreakdown = dailyBreakdown.map((day, index) => {
          let adjustment = 0;
          const baseRateForDay = day.baseRate + day.additionalCharges;

          console.log(`  Day ${index + 1} (${day.date}):`, {
            baseRate: day.baseRate,
            additionalCharges: day.additionalCharges,
            baseRateForDay
          });

          if (geoRatePlan.restrictionType === 'percentage') {
            const percentage = Number(geoRatePlan.restrictionValue || 0);
            adjustment = (baseRateForDay * percentage) / 100;
            console.log(`    Percentage adjustment: ${percentage}% = ${adjustment}`);

            if (geoRatePlan.restrictionTypeAction === 'decrease') {
              adjustment = -adjustment;
              console.log(`    Action: decrease, final adjustment: ${adjustment}`);
            }
          } else if (geoRatePlan.restrictionType === 'fixed') {
            adjustment = Number(geoRatePlan.restrictionValue || 0);
            console.log(`    Fixed adjustment: ${adjustment}`);

            if (geoRatePlan.restrictionTypeAction === 'decrease') {
              adjustment = -adjustment;
              console.log(`    Action: decrease, final adjustment: ${adjustment}`);
            }
          }

          const rateAfterGeo = baseRateForDay + adjustment;
          const totalForAllRooms = rateAfterGeo * noOfRooms;
          totalAdjustment += adjustment * noOfRooms;

          console.log(`    Rate after geo: ${rateAfterGeo}, Total for ${noOfRooms} rooms: ${totalForAllRooms}`);

          return {
            ...day,
            geoAdjustment: Number(adjustment.toFixed(2)),
            rateAfterGeo: Number(rateAfterGeo.toFixed(2)),
            finalRatePerRoom: Number(rateAfterGeo.toFixed(2)),
            totalForAllRooms: Number(totalForAllRooms.toFixed(2)),
          };
        });

        const newTotalAmount = updatedBreakdown.reduce((sum, day) => sum + day.totalForAllRooms, 0);

        console.log('✅ Geo restriction summary:', {
          totalAdjustment,
          newTotalAmount
        });

        return {
          success: true,
          dailyBreakdown: updatedBreakdown,
          totalAmount: newTotalAmount,
          geoRestriction: {
            countryCode: userCountryCode,
            restrictionType: geoRatePlan.restrictionType,
            restrictionAction: geoRatePlan.restrictionTypeAction,
            adjustmentAmount: Number(geoRatePlan.restrictionValue || 0),
            adjustmentPercentage:
              geoRatePlan.restrictionType === 'percentage'
                ? Number(geoRatePlan.restrictionValue || 0)
                : undefined,
            totalAdjustment: Number(totalAdjustment.toFixed(2)),
          },
        };
      } catch (error) {
        console.error('❌ Error in applyGeoRestrictions:', error);
        return errorResponse('Error applying geo restrictions');
      }
    }

    // FIXED: Promotion logic
private static async applyPromotions(
  propertyId: string,
  roomId: string,
  ratePlanId: string,
  deviceType: string,
  dailyBreakdown: DailyBreakdown[],
  noOfRooms: number,
  checkInDate: Date,
  numberOfNights: number
): Promise<any> {
  try {
    const now = nowUTC();
    const checkInUTC = toUTCDate(checkInDate);

    const todayStart = startOfDay(now);
    const checkInStart = startOfDay(checkInUTC);

    const daysUntilCheckIn = differenceInCalendarDays(
      checkInStart,
      todayStart
    );

    console.log('📅 Date comparison:', {
      now: now.toISOString(),
      checkInDate: checkInUTC.toISOString(),
      daysUntilCheckIn,
    });

    // ✅ FIXED: Fetch promotions for EITHER specific room OR null (applies to all rooms)
    const promotions = await prisma.promotion.findMany({
      where: {
        propertyId,
        ratePlanId,
        isActive: true,
        OR: [
          { roomId }, // Specific room
          { roomId: null }, // Applies to all rooms
        ],
        promotionType: {
          in: ['early_bird', 'device_specific', 'offer_for_tonight'],
        },
      },
    });

    console.log(`🔍 Found ${promotions.length} total promotions for rate plan`);

    if (promotions.length === 0) {
      return { success: true, promotionsApplied: [] };
    }

    // ✅ COLLECT ALL APPLICABLE PROMOTIONS
    const applicablePromotions: any[] = [];

    for (const promo of promotions) {
      let isApplicable = false;

      console.log(`\n🔍 Checking promotion: "${promo.promotionName}" (${promo.promotionType})`);

      // 🌙 OFFER FOR TONIGHT
      if (promo.promotionType === 'offer_for_tonight') {
        const isToday = checkInStart.getTime() === todayStart.getTime();

        const isWithinTimeWindow =
          (!promo.validFrom || now >= promo.validFrom) &&
          (!promo.validTo || now <= promo.validTo);

        isApplicable = isToday && isWithinTimeWindow;

        console.log('  🌙 Offer for tonight check:', {
          isToday,
          isWithinTimeWindow,
          validFrom: promo.validFrom,
          validTo: promo.validTo,
          isApplicable,
        });
      }

      // 🐦 EARLY BIRD
      else if (promo.promotionType === 'early_bird') {
        const requiredDays = promo.advanceBookingDays ?? 0;
        
        // ✅ FIXED: Check if validFrom/validTo allows current date
        const isWithinValidityWindow =
          (!promo.validFrom || now >= promo.validFrom) &&
          (!promo.validTo || now <= promo.validTo);

        isApplicable = daysUntilCheckIn >= requiredDays && isWithinValidityWindow;

        console.log('  🐦 Early bird check:', {
          daysUntilCheckIn,
          requiredDays,
          isWithinValidityWindow,
          validFrom: promo.validFrom,
          validTo: promo.validTo,
          isApplicable,
        });
      }

      // 📱 DEVICE SPECIFIC
      else if (promo.promotionType === 'device_specific') {
        // ✅ FIXED: Check if deviceType array includes the user's device
        const hasMatchingDevice = promo.deviceType && promo.deviceType.length > 0
          ? promo.deviceType.includes(deviceType as any)
          : false;

        // ✅ Check validity window
        const isWithinValidityWindow =
          (!promo.validFrom || now >= promo.validFrom) &&
          (!promo.validTo || now <= promo.validTo);

        isApplicable = hasMatchingDevice && isWithinValidityWindow;

        console.log('  📱 Device-specific promo check:', {
          requiredDevices: promo.deviceType,
          userDevice: deviceType,
          hasMatchingDevice,
          isWithinValidityWindow,
          validFrom: promo.validFrom,
          validTo: promo.validTo,
          isApplicable,
        });
      }

      if (isApplicable) {
        applicablePromotions.push(promo);
        console.log(`  ✅ Promotion "${promo.promotionName}" is applicable!`);
      } else {
        console.log(`  ❌ Promotion "${promo.promotionName}" is NOT applicable`);
      }
    }

    console.log(`\n📊 Total applicable promotions: ${applicablePromotions.length}`);

    if (applicablePromotions.length === 0) {
      return { success: true, promotionsApplied: [] };
    }

    // ✅ APPLY ALL PROMOTIONS (SEQUENTIAL - each discount applies to already-discounted rate)
    let totalDiscount = 0;
    const promotionDetails: any[] = [];

    const updatedBreakdown = dailyBreakdown.map(day => {
      let ratePerRoom = day.finalRatePerRoom;
      let dayDiscount = 0;

      console.log(`\n📅 Processing day: ${day.date} (${day.dayOfWeek})`);
      console.log(`  Starting rate: ${ratePerRoom}`);

      for (const promo of applicablePromotions) {
        // ✅ Check if promotion applies to this day of week
        if (!this.isPromotionDayApplicable(promo, day.dayOfWeek)) {
          console.log(`  ⏭️  Skipping "${promo.promotionName}" - not applicable on ${day.dayOfWeek}`);
          continue;
        }

        let discount = 0;

        if (promo.DiscountType === 'percentage') {
          discount = (ratePerRoom * Number(promo.DiscountValue || 0)) / 100;
        } else if (promo.DiscountType === 'flat') {
          discount = Number(promo.DiscountValue || 0);
        }

        ratePerRoom -= discount;
        dayDiscount += discount;

        console.log(`  💸 Applied "${promo.promotionName}": -${discount.toFixed(2)} → New rate: ${ratePerRoom.toFixed(2)}`);
      }

      totalDiscount += dayDiscount * noOfRooms;

      return {
        ...day,
        finalRatePerRoom: Number(ratePerRoom.toFixed(2)),
        totalForAllRooms: Number((ratePerRoom * noOfRooms).toFixed(2)),
      };
    });

    const newTotalAmount = updatedBreakdown.reduce(
      (sum, d) => sum + d.totalForAllRooms,
      0
    );

    console.log(`\n💰 Promotion Summary:`);
    console.log(`  Total discount: ${totalDiscount.toFixed(2)}`);
    console.log(`  New total amount: ${newTotalAmount.toFixed(2)}`);

    return {
      success: true,
      dailyBreakdown: updatedBreakdown,
      totalAmount: newTotalAmount,
      totalDiscount: Number(totalDiscount.toFixed(2)),
      promotionsApplied: applicablePromotions.map(p => ({
        promotionId: p.id,
        promotionName: p.promotionName,
        promotionType: p.promotionType,
        discountType: p.DiscountType,
        discountValue: Number(p.DiscountValue || 0),
      })),
    };
  } catch (error) {
    console.error('❌ Error in applyPromotions:', error);
    return errorResponse('Error applying promotions');
  }
}


    private static isPromotionDayApplicable(promotion: any, dayOfWeek: string): boolean {
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
      return promotion[field] === true;
    }

    private static async applyRatePlanRules(
      ratePlanRule: any,
      dailyBreakdown: DailyBreakdown[],
      noOfRooms: number,
      numberOfNights: number,
      startDate: Date,
      endDate: Date
    ): Promise<any> {
      try {
        // Check date range validity
        if (ratePlanRule.startDate && ratePlanRule.endDate) {
          const ruleStart = toUTCDate(ratePlanRule.startDate);
          const ruleEnd = toUTCDate(ratePlanRule.endDate);
          const bookingStart = toUTCDate(startDate);

          if (bookingStart < ruleStart || bookingStart > ruleEnd) {
            return { success: true, rule: null };
          }
        }

        // Check min/max LOS
        if (ratePlanRule.minLos && numberOfNights < ratePlanRule.minLos) {
          return errorResponse(`Minimum ${ratePlanRule.minLos} nights required for this rate plan`);
        }

        if (ratePlanRule.maxLos && numberOfNights > ratePlanRule.maxLos) {
          return errorResponse(`Maximum ${ratePlanRule.maxLos} nights allowed for this rate plan`);
        }

        // Apply discount if present
        if (!ratePlanRule.discountType || !ratePlanRule.discountValue) {
          return { success: true, rule: null };
        }

        let totalDiscount = 0;
        const updatedBreakdown = dailyBreakdown.map((day) => {
          const currentRate = day.finalRatePerRoom;
          let discount = 0;

          if (ratePlanRule.discountType === 'percentage') {
            discount = (currentRate * Number(ratePlanRule.discountValue)) / 100;
          } else if (ratePlanRule.discountType === 'flat') {
            discount = Number(ratePlanRule.discountValue);
          }

          const rateAfterRule = currentRate - discount;
          const totalForAllRooms = rateAfterRule * noOfRooms;
          totalDiscount += discount * noOfRooms;

          return {
            ...day,
            ratePlanRuleDiscount: Number(discount.toFixed(2)),
            finalRatePerRoom: Number(rateAfterRule.toFixed(2)),
            totalForAllRooms: Number(totalForAllRooms.toFixed(2)),
          };
        });

        const newTotalAmount = updatedBreakdown.reduce((sum, day) => sum + day.totalForAllRooms, 0);

        return {
          success: true,
          dailyBreakdown: updatedBreakdown,
          totalAmount: newTotalAmount,
          rule: {
            ruleId: ratePlanRule.id,
            discountType: ratePlanRule.discountType,
            discountValue: Number(ratePlanRule.discountValue),
            totalDiscount: Number(totalDiscount.toFixed(2)),
          },
        };
      } catch (error) {
        console.error('Error in applyRatePlanRules:', error);
        return errorResponse('Error applying rate plan rules');
      }
    }

    private static async calculateTax(ratePlan: any, baseAmount: number): Promise<any> {
      try {
        console.log('💰 Calculating tax on amount:', baseAmount);
        console.log('📋 Tax Group:', ratePlan.taxGroup ? {
          id: ratePlan.taxGroup.id,
          name: ratePlan.taxGroup.name,
          rulesCount: ratePlan.taxGroup.taxGroupRules?.length || 0
        } : 'No tax group');

        const taxDetails: TaxDetail[] = [];
        let totalTax = 0;

        if (!ratePlan.taxGroup || !ratePlan.taxGroup.taxGroupRules) {
          console.log('ℹ️  No tax rules found');
          return { taxDetails: [], totalTax: 0 };
        }

        const sortedRules = ratePlan.taxGroup.taxGroupRules.sort(
          (a: any, b: any) => a.taxRule.priority - b.taxRule.priority
        );

        console.log(`📜 Processing ${sortedRules.length} tax rules (sorted by priority):`);

        let applicableAmount = baseAmount;

        for (const rule of sortedRules) {
          const taxRule = rule.taxRule;

          console.log(`\n  Tax Rule: ${taxRule.name}`, {
            priority: taxRule.priority,
            type: taxRule.type,
            value: taxRule.value,
            isInclusive: taxRule.isInclusive,
            validFrom: taxRule.validFrom,
            validTo: taxRule.validTo
          });

          const now = nowUTC();
          if (now < new Date(taxRule.validFrom) || now > new Date(taxRule.validTo)) {
            console.log('    ⏭️  Skipped - outside valid date range');
            continue;
          }

          let taxAmount = 0;

          if (taxRule.type === 'percentage') {
            taxAmount = (applicableAmount * taxRule.value) / 100;
            console.log(`    Percentage calculation: ${applicableAmount} × ${taxRule.value}% = ${taxAmount}`);
          } else if (taxRule.type === 'fixed') {
            taxAmount = taxRule.value;
            console.log(`    Fixed amount: ${taxAmount}`);
          }

          taxDetails.push({
            name: taxRule.name,
            amount: Number(taxAmount.toFixed(2)),
            type: taxRule.type,
          });

          totalTax += taxAmount;

          console.log(`    Tax amount: ${taxAmount}`);
          console.log(`    Is inclusive: ${taxRule.isInclusive}`);

          if (!taxRule.isInclusive) {
            applicableAmount += taxAmount;
            console.log(`    New applicable amount for next tax: ${applicableAmount}`);
          }
        }

        console.log('\n✅ Tax calculation complete:', {
          totalTax: Number(totalTax.toFixed(2)),
          taxDetailsCount: taxDetails.length
        });

        return {
          taxDetails,
          totalTax: Number(totalTax.toFixed(2)),
        };
      } catch (error) {
        console.error('❌ Error in calculateTax:', error);
        return { taxDetails: [], totalTax: 0 };
      }
    }

    private static async getMandatoryAddons(
      ratePlanId: string,
      startDate: Date,
      endDate: Date,
      noOfAdults: number,
      noOfChildren: number,
      noOfRooms: number,
      numberOfNights: number
    ): Promise<any> {
      try {
        // Get all addons linked to this rate plan
        const ratePlanAddons = await prisma.ratePlanWithAddon.findMany({
          where: {
            ratePlanId: ratePlanId,
          },
          include: {
            addon: {
              include: {
                availability: {
                  where: {
                    date: {
                      gte: startDate,
                      lt: endDate,
                    },
                  },
                },
              },
            },
          },
        });

        if (ratePlanAddons.length === 0) {
          // No mandatory addons for this rate plan
          return {
            success: true,
            addonsBreakdown: [],
            addonsTotal: 0,
          };
        }

        const addonsBreakdown: AddonBreakdown[] = [];
        let addonsTotal = 0;

        for (const ratePlanAddon of ratePlanAddons) {
          const addon = ratePlanAddon.addon;

          // Check if addon has availability for all dates
          if (addon.availability.length === 0) {
            return errorResponse(
              `Mandatory addon "${addon.name}" has no availability for the selected dates`
            );
          }

          // Check if all dates have availability
          const unavailableDates = addon.availability.filter((av) => !av.isAvailable);
          if (unavailableDates.length > 0) {
            return errorResponse(
              `Mandatory addon "${addon.name}" is not available for all selected dates`
            );
          }

          // Calculate total price for this mandatory addon (quantity = 1 by default)
          const totalGuests = noOfAdults + noOfChildren;
          const avgPrice =
            addon.availability.reduce((sum, av) => sum + av.price, 0) / addon.availability.length;

          let totalPrice = 0;
          let calculationDetails = '';

          switch (addon.postingRhythm) {
            case 'per_night':
              totalPrice = avgPrice * numberOfNights;
              calculationDetails = `${avgPrice} × ${numberOfNights} nights`;
              break;

            case 'per_person_per_night':
              totalPrice = avgPrice * numberOfNights * totalGuests;
              calculationDetails = `${avgPrice} × ${numberOfNights} nights × ${totalGuests} guests`;
              break;

            case 'per_person_per_stay':
              totalPrice = avgPrice * totalGuests;
              calculationDetails = `${avgPrice} × ${totalGuests} guests`;
              break;

            case 'per_stay':
              totalPrice = avgPrice;
              calculationDetails = `${avgPrice} (per stay)`;
              break;

            case 'per_room':
              totalPrice = avgPrice * noOfRooms;
              calculationDetails = `${avgPrice} × ${noOfRooms} rooms`;
              break;

            case 'per_room_per_night':
              totalPrice = avgPrice * noOfRooms * numberOfNights;
              calculationDetails = `${avgPrice} × ${noOfRooms} rooms × ${numberOfNights} nights`;
              break;

            case 'per_person_per_room':
              totalPrice = avgPrice * totalGuests * noOfRooms;
              calculationDetails = `${avgPrice} × ${totalGuests} guests × ${noOfRooms} rooms`;
              break;

            default:
              totalPrice = avgPrice;
              calculationDetails = `${avgPrice} (default)`;
          }

          addonsBreakdown.push({
            addonId: addon.id,
            name: addon.name,
            code: addon.code,
            postingRhythm: addon.postingRhythm,
            unitPrice: Number(avgPrice.toFixed(2)),
            quantity: 1,
            totalPrice: Number(totalPrice.toFixed(2)),
            dates: addon.availability.map((av) => av.date.toISOString().split('T')[0]),
            calculationDetails: `${calculationDetails} (Mandatory)`,
            isMandatory: true,
          });

          addonsTotal += totalPrice;
        }

        return {
          success: true,
          addonsBreakdown,
          addonsTotal: Number(addonsTotal.toFixed(2)),
        };
      } catch (error) {
        console.error('Error in getMandatoryAddons:', error);
        return errorResponse('Error calculating mandatory addons');
      }
    }

    private static async calculateOptionalAddons(
      addons: AddonInput[],
      ratePlanId: string,
      noOfAdults: number,
      noOfChildren: number,
      noOfRooms: number,
      numberOfNights: number
    ): Promise<any> {
      try {
        const addonsBreakdown: AddonBreakdown[] = [];
        let addonsTotal = 0;

        for (const addonInput of addons) {
          // Validate addon availability
          const addonAvailability = await prisma.addonAvailability.findUnique({
            where: {
              id: addonInput.availabilityId,
            },
            include: {
              addon: true,
            },
          });

          if (!addonAvailability) {
            return errorResponse(
              `Addon availability not found for addon: ${addonInput.name} (${addonInput.code})`
            );
          }

          if (!addonAvailability.isAvailable) {
            return errorResponse(`Addon ${addonInput.name} is not available for the selected date`);
          }

          // Use database price as source of truth
          const unitPrice = addonAvailability.price;
          const quantity = addonInput.quantity;
          const postingRhythm = addonInput.type;
          const totalGuests = noOfAdults + noOfChildren;

          let totalPrice = 0;
          let calculationDetails = '';

          switch (postingRhythm) {
            case 'per_night':
              totalPrice = unitPrice * quantity * numberOfNights;
              calculationDetails = `${unitPrice} × ${quantity} × ${numberOfNights} nights`;
              break;

            case 'per_person_per_night':
              totalPrice = unitPrice * quantity * numberOfNights * totalGuests;
              calculationDetails = `${unitPrice} × ${quantity} × ${numberOfNights} nights × ${totalGuests} guests`;
              break;

            case 'per_person_per_stay':
              totalPrice = unitPrice * quantity * totalGuests;
              calculationDetails = `${unitPrice} × ${quantity} × ${totalGuests} guests`;
              break;

            case 'per_stay':
              totalPrice = unitPrice * quantity;
              calculationDetails = `${unitPrice} × ${quantity}`;
              break;

            case 'per_room':
              totalPrice = unitPrice * quantity * noOfRooms;
              calculationDetails = `${unitPrice} × ${quantity} × ${noOfRooms} rooms`;
              break;

            case 'per_room_per_night':
              totalPrice = unitPrice * quantity * noOfRooms * numberOfNights;
              calculationDetails = `${unitPrice} × ${quantity} × ${noOfRooms} rooms × ${numberOfNights} nights`;
              break;

            case 'per_person_per_room':
              totalPrice = unitPrice * quantity * totalGuests * noOfRooms;
              calculationDetails = `${unitPrice} × ${quantity} × ${totalGuests} guests × ${noOfRooms} rooms`;
              break;

            default:
              return errorResponse(`Unknown posting rhythm: ${postingRhythm}`);
          }

          addonsBreakdown.push({
            addonId: addonInput.addonId,
            name: addonInput.name,
            code: addonInput.code,
            postingRhythm,
            unitPrice: Number(unitPrice.toFixed(2)),
            quantity,
            totalPrice: Number(totalPrice.toFixed(2)),
            dates: [addonInput.date.toString()],
            calculationDetails: `${calculationDetails} (Optional)`,
            isMandatory: false,
          });

          addonsTotal += totalPrice;
        }

        return {
          success: true,
          addonsBreakdown,
          addonsTotal: Number(addonsTotal.toFixed(2)),
        };
      } catch (error) {
        console.error('Error in calculateOptionalAddons:', error);
        return errorResponse('Error calculating optional addons');
      }
    }
  }