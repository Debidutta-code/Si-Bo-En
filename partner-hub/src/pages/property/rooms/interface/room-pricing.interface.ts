
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

// ─── Response Breakdowns ──────────────────────────────────────────────────────

export interface IAgencyCommissionDetail {
    commissionType: 'percentage' | 'fixed';
    commissionValue: number;
    commissionAmount: number;
    commissionCurrency: string;
}

export interface ITouristTaxDetail {
    id: string;
    name: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    calculatedAmount: number;
    currencyCode: string;
}

export interface IDailyPriceBrakeDown {
    roomNumber: string;
    guestDistribution: {
        adults: number;
        children: number;
        childAges: number[];
    };
    date: string;
    baseChargesAmount: number;
    additionalChargesAmount: number;
    addOnBrakeDown: IAddonBrakeDown[];
    totalAmount: number;
    currencyCode: string;
}

export interface ITaxBrakeDown {
    name: string;
    taxedAmount: number;
    currencyCode: string;
}

export interface IAddonBrakeDown {
    addonId: string;
    name: string;
    amount: number;
    quantity: number;
    totalAmount: number;
    currencyCode: string;
    date: string;
    type: 'included' | 'selected';
}

// ─── Main Response ────────────────────────────────────────────────────────────

export interface IAgentPricingResponse {
    // mirrors B2C finalPrice shape exactly
    totalAmount: number;
    amountBeforeTax: number;
    taxedAmount: number;
    totalAddonAmount: number;
    totalPromotionAmount: number;
    currentChargeableAmount: number;
    latterpayableAmount: number;
    loyalityDiscount: number;
    promoCodeDiscount: number;
    currencyCode: string;

    // agency specific
    agencyCommissionAmount: number;
    agencyCommission: IAgencyCommissionDetail;

    // breakdowns
    dailyPriceBrakeDown: IDailyPriceBrakeDown[];
    taxBrakeDown: ITaxBrakeDown[];
    addonBrakeDowns: IAddonBrakeDown[];
    promotionBrakeDown: [];

    // tourist tax
    touristTax: ITouristTaxDetail | null;

    availableRooms: number;
    requestedRooms: number;
}