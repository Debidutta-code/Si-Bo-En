import { PromotionBrakeDown } from '../../../booking-engine/types';
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
    includedAddons: string[];
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
    currencyCode: CurrencyCode | null;
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

export interface IRatePlan {
    id: string;
    ratePlanCode: string;
    ratePlanName: string;
    b2bAvailable: boolean;
    taxGroup: ITaxGroup | null;
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

// ─── Rate Plan Rule (MLOS) ────────────────────────────────────────────────────

export interface IRatePlanRule {
    id: string;
    ratePlanId: string;
    isActive: boolean;
    minLos: number | null;
    maxLos: number | null;
    startDate: Date | null;
    endDate: Date | null;
}

// ─── Response — mirrors B2C PriceBrakeDown shape ──────────────────────────────

export interface IAddonBrakeDown {
    addonId: string;
    name: string;
    amount: number;
    quantity: number;
    totalAmount: number;
    currencyCode: CurrencyCode;
    date: string;
    type: 'included';
}

export interface ITaxBrakeDown {
    name: string;
    taxedAmount: number;
    currencyCode: CurrencyCode;
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
    currencyCode: CurrencyCode;
}
export interface IAgentPricingResponse {
    currencyCode: CurrencyCode;

    // ── Top-level flat (mirrors B2C PriceBrakeDown) ───────────────────
    totalAmount: number; // currentChargeableAmount + latterpayableAmount
    amountBeforeTax: number; // base + additional guest charges
    taxedAmount: number; // priority-based tax on subtotal
    totalAddonAmount: number; // included addons total
    totalPromotionAmount: number; // always 0 (no promotions for agent)
    currentChargeableAmount: number; // subtotal + taxedAmount
    latterpayableAmount: number; // tourist tax — paid at property
    loyalityDiscount: number; // always 0
    promoCodeDiscount: number; // always 0

    // ── Agent-specific ────────────────────────────────────────────────
    agencyCommissionAmount: number; // commission on amountBeforeTax
    agencyCommission: IAgencyCommissionDetail;

    // ── Breakdowns ────────────────────────────────────────────────────
    dailyPriceBrakeDown: IDailyPriceBrakeDown[];
    taxBrakeDown: ITaxBrakeDown[];
    addonBrakeDown: IAddonBrakeDown[];
    promotionBrakeDown: PromotionBrakeDown[];
    touristTax: ITouristTaxDetail | null;

    availableRooms: number;
    requestedRooms: number;
}
