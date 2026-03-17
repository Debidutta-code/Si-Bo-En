export interface  UpdatePlanData {
  baseGuestAmounts: BaseGuestAmount[];
  additionalGuestAmounts: AdditionalGuestAmount[];
}
export interface RateCalculationResult {
  success: boolean;
  message?: string;
  data?: {
    totalAmount: number;
    numberOfNights: number;
    baseRatePerNight: number;
    additionalGuestCharges: number;
    breakdown: {
      baseAmount: number;
      additionalAdultCharges: number;
      additionalChildCharges: number;
      totalPerNight: number;
      totalForAllNights: number;
    };
    dailyBreakdown?: Array<{
      date: string;
      dayOfWeek: string;
      ratePlanCode: string;
      baseRate: number;
      additionalCharges: number;
      totalPerRoom: number;
      totalForAllRooms: number;
      currencyCode: string;
    }>;
    availableRooms: number;
    requestedRooms: number;
  };
}
export interface BaseGuestAmount {
  ageQualifyingCode: string;
  amountBeforeTax: number;
  numberOfGuests: number;
}
export interface AdditionalGuestAmount {
  ageQualifyingCode: string;
  amount: number;
}
export interface IWeekdayCharges {
  sunday: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
}
export interface IDailyAdditionalCharge {
  adults: number;
  children: number;
}
export interface IWeekdayAdditionalCharges {
  sunday: IDailyAdditionalCharge;
  monday: IDailyAdditionalCharge;
  tuesday: IDailyAdditionalCharge;
  wednesday: IDailyAdditionalCharge;
  thursday: IDailyAdditionalCharge;
  friday: IDailyAdditionalCharge;
  saturday: IDailyAdditionalCharge;
}


