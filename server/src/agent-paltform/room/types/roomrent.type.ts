export interface IAgentPricingRequest {
    propertyCode: string;
    invTypeCode: string;
    startDate: Date;
    endDate: Date;
    ratePlanCode: string;
    noOfAdults: number;
    noOfChildren: number;
    noOfRooms: number;
}

export interface IAgentPricingResponse {
    totalAmount: number;
    numberOfNights: number;
    baseRatePerNight: number;
    additionalGuestCharges: number;
    
    breakdown: {
        totalBaseAmount: number;
        totalAdditionalCharges: number;
        totalIncludedAddons: number;
        subtotal: number; // Before commission and tax
        agencyCommission: number;
        totalBeforeTax: number;
        totalTax: number;
        totalAmount: number;
        averagePerNight: number;
    };

    dailyBreakdown: IDailyBreakdown[];
    
    availableRooms: number;
    requestedRooms: number;
    
    includedAddons: IIncludedAddon[];
    
    agencyCommission: {
        commissionType: 'percentage' | 'fixed';
        commissionValue: number;
        commissionAmount: number;
        commissionCurrency: string;
    };
    
    tax: ITaxDetail[];
    totalTax: number;
    
    priceAfterTax: number;
}

export interface IDailyBreakdown {
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
    };
}

export interface IIncludedAddon {
    addonId: string;
    addonName: string;
    addonCode: string;
    postingRhythm: string;
    amount: number;
    currencyCode: string;
    description: string;
}

export interface ITaxDetail {
    name: string;
    amount: number;
    type: string;
}