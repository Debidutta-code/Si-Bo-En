import { CurrencyCode } from '../../../tax-system/interfaces/tourist-tax.type';

// ─── Request ───────────────────────────────────────────────────────────────────

export interface IGuestDistributionEntry {
    adults: number;
    children: number;
    childAges: number[];
}

export interface IAgentPricingRequest {
    propertyCode: string;
    invTypeCode: string;
    startDate: Date;
    endDate: Date;
    ratePlanCode: string;
    noOfAdults: number;
    noOfChildren: number;
    noOfRooms: number;
    childAges: number[];
    guestDistribution: IGuestDistributionEntry[];
    agencyId: string;
    includedAddons?: string[];
}

// ─── Agency ────────────────────────────────────────────────────────────────────

export interface IAgencyDetails {
    id: string;
    agencyName: string;
    commissionType: 'percentage' | 'fixed';
    commissionValue: number;
    commissionCurrency: string | null;
}

// ─── Charge ────────────────────────────────────────────────────────────────────

export interface IChargeBaseByGuest {
    numberOfGuests: number;
    amountBeforeTax: number;
    ageQualifyingCode: string;
}

export interface IChargeAdditionalGuest {
    ageQualifyingCode: string;
    amount: number;
}

export interface ICharge {
    id: string;
    propertyCode: string;
    roomTypeCode: string;
    ratePlanCode: string;
    date: Date;
    currencyCode: CurrencyCode;
    isSaleStopped: boolean;
    isClosedToArrival: boolean;
    isClosedToDeparture: boolean;
    restrictionNotes: string | null;
    monApplicable: boolean;
    tueApplicable: boolean;
    wedApplicable: boolean;
    thuApplicable: boolean;
    friApplicable: boolean;
    satApplicable: boolean;
    sunApplicable: boolean;
    baseGuestAmounts: IChargeBaseByGuest[];
    additionalGuestAmounts: IChargeAdditionalGuest[];
}

// ─── Rate Plan ────────────────────────────────────────────────────────────────

export interface ITaxRule {
    id: string;
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    applicableOn: string;
    validFrom: Date;
    validTo: Date;
    isInclusive: boolean;
    priority: number;
}

export interface ITaxGroupRule {
    id: string;
    taxGroupId: string;
    taxRuleId: string;
    taxRule: ITaxRule;
}

export interface ITaxGroup {
    id: string;
    name: string;
    taxGroupRules: ITaxGroupRule[];
}

export interface IRatePlanAddonEntry {
    addonId: string;
    addon: {
        id: string;
        name: string;
        code: string;
        postingRhythm: string;
        description: string | null;
        isActive: boolean;
    };
}

export interface IRatePlan {
    id: string;
    ratePlanCode: string;
    ratePlanName: string;
    taxGroup: ITaxGroup | null;
    Addons: IRatePlanAddonEntry[];
}

// ─── Room ─────────────────────────────────────────────────────────────────────

export interface IRoom {
    id: string;
    maxOccupancy: number;
    maxNumberOfAdults: number;
    maxNumberOfChildren: number;
    numberOfBedrooms: number;
    TouristTaxs: ITouristTaxRaw[];
}

export interface ITouristTaxRaw {
    id: string;
    name: string | null;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    currencyCode: CurrencyCode | null;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface IInventory {
    id: string;
    propertyCode: string;
    roomTypeCode: string;
    date: Date;
    availability: number;
    ratePlans: string[];
}

// ─── Addon ────────────────────────────────────────────────────────────────────

export interface IAddonAvailabilityEntry {
    id: string;
    addonId: string;
    date: Date;
    price: number;
    currencyCode: CurrencyCode;
    isAvailable: boolean;
}

export interface IAddonWithAvailability {
    id: string;
    name: string;
    code: string;
    postingRhythm: string;
    description: string | null;
    isActive: boolean;
    availability: IAddonAvailabilityEntry[];
}

// ─── Booking Offset ──────────────────────────────────────────────────────────

export interface IBookingOffset {
    id: string;
    ratePlanId: string;
    date: Date;
    minimumAdvanceBookingOffset: number | null;
    maximumAdvanceBookingOffset: number | null;
    isActive: boolean;
}

// ─── MLOS ─────────────────────────────────────────────────────────────────────

export interface IRatePlanRule {
    id: string;
    ratePlanId: string;
    isActive: boolean;
    minLos: number | null;
    maxLos: number | null;
    startDate: Date | null;
    endDate: Date | null;
}

// ─── Response ─────────────────────────────────────────────────────────────────

export interface IDailyBreakdown {
    date: string;
    dayOfWeek: string;
    baseAmount: number;
    additionalCharges: number;
    totalForAllRooms: number;
    currencyCode: CurrencyCode;
    perRoomBreakdown: IPerRoomBreakdown[];
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

export interface IIncludedAddonDetail {
    addonId: string;
    addonName: string;
    addonCode: string;
    postingRhythm: string;
    totalAmount: number;
    currencyCode: CurrencyCode;
    description: string;
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
    currencyCode: CurrencyCode;
}

export interface IAgencyCommissionDetail {
    commissionType: 'percentage' | 'fixed';
    commissionValue: number;
    commissionAmount: number;
    commissionCurrency: string;
}
export interface IAgentPricingResponse {
    numberOfNights: number;
    currencyCode: CurrencyCode;

    // ── Top-level summary (mirrors PriceBrakeDown pattern) ────────────
    currentChargeableAmount: number;   // what guest pays now
    latterpayableAmount: number;       // tourist tax — paid at property
    totalAmount: number;               // currentChargeableAmount + latterpayableAmount

    // ── Full breakdown ────────────────────────────────────────────────
    breakdown: {
        amountBeforeTax: number;           // base charges + additional guest charges
        totalAddonAmount: number;          // included addons total
        subtotal: number;                  // amountBeforeTax + totalAddonAmount
        agencyCommissionAmount: number;    // commission on subtotal
        totalAfterCommission: number;      // subtotal + agencyCommissionAmount
        taxedAmount: number;               // tax calculated on base amount
        currentChargeableAmount: number;   // totalAfterCommission + taxedAmount
        latterpayableAmount: number;       // tourist tax (pay later)
        totalAmount: number;               // currentChargeableAmount + latterpayableAmount
        averagePerNight: number;           // currentChargeableAmount / numberOfNights
    };

    dailyBreakdown: IDailyBreakdown[];
    includedAddons: IIncludedAddonDetail[];
    taxes: ITaxDetail[];
    touristTax: ITouristTaxDetail | null;
    agencyCommission: IAgencyCommissionDetail;

    availableRooms: number;
    requestedRooms: number;
}