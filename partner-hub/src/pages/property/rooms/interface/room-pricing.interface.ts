
export interface IGuestDistributionEntry {
    adults: number;
    children: number;
    childAges: number[];
}

export interface IAgentPricingRequest {
    propertyCode: string;
    invTypeCode: string;
    startDate: string;
    endDate: string;
    ratePlanCode: string;
    noOfAdults: number;
    noOfChildren: number;
    noOfRooms: number;
    childAges: number[];
    guestDistribution: IGuestDistributionEntry[];
    agencyId: string;
    includedAddons?: string[];
    roomsArray?: IGuestDistributionEntry[];
}

// ─── Response ─────────────────────────────────────────────────────────────────

export interface IAgencyCommissionDetail {
    commissionType: 'percentage' | 'fixed';
    commissionValue: number;
    commissionAmount: number;
    commissionCurrency: string;
}

export interface ITaxDetail {
    name: string;
    amount: number;
    type: 'percentage' | 'fixed';
}

export interface ITouristTaxDetail {
    id: string;
    name: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    calculatedAmount: number;
    currencyCode: string;
}

export interface IIncludedAddonDetail {
    addonId: string;
    addonName: string;
    addonCode: string;
    postingRhythm: string;
    totalAmount: number;
    currencyCode: string;
    description: string;
}

export interface IPerRoomBreakdown {
    roomNumber: number;
    adults: number;
    children: number;
    adultBaseAmount: number;
    childBaseAmount: number;
    additionalAdultCharges: number;
    additionalChildCharges: number;
    roomTotal: number;
}

export interface IDailyBreakdown {
    date: string;
    dayOfWeek: string;
    baseAmount: number;
    additionalCharges: number;
    totalForAllRooms: number;
    currencyCode: string;
    perRoomBreakdown: IPerRoomBreakdown[];
}

export interface IAgentPricingBreakdown {
    amountBeforeTax: number;
    totalAddonAmount: number;
    subtotal: number;
    agencyCommissionAmount: number;
    totalAfterCommission: number;
    taxedAmount: number;
    currentChargeableAmount: number;
    latterpayableAmount: number;
    totalAmount: number;
    averagePerNight: number;
}

export interface IAgentFinalPriceResponse {
    numberOfNights: number;
    currencyCode: string;
    currentChargeableAmount: number;
    latterpayableAmount: number;
    totalAmount: number;
    breakdown: IAgentPricingBreakdown;
    dailyBreakdown: IDailyBreakdown[];
    includedAddons: IIncludedAddonDetail[];
    agencyCommission: IAgencyCommissionDetail;
    taxes: ITaxDetail[];
    touristTax: ITouristTaxDetail | null;
    availableRooms: number;
    requestedRooms: number;
}