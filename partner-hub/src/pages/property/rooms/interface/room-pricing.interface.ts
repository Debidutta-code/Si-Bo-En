// Agent Pricing interfaces
export interface IAgentPricingRequest {
    propertyCode: string;
    invTypeCode: string;
    startDate: string;
    endDate: string;
    ratePlanCode: string;
    noOfAdults: number;
    noOfChildren: number;
    noOfRooms: number;
}

export interface IAgencyCommission {
    commissionType: 'percentage' | 'fixed';
    commissionValue: number;
    commissionAmount: number;
    commissionCurrency: string;
}

export interface IAgentPricingBreakdown {
    totalBaseAmount: number;
    totalAdditionalCharges: number;
    totalIncludedAddons: number;
    subtotal: number;
    agencyCommission: number;
    totalBeforeTax: number;
    totalTax: number;
    totalAmount: number;
    averagePerNight: number;
}

export interface IAgentPricingResponse {
    totalAmount: number;
    numberOfNights: number;
    baseRatePerNight: number;
    additionalGuestCharges: number;
    breakdown: IAgentPricingBreakdown;
    agencyCommission: IAgencyCommission;
    priceAfterTax: number;
}