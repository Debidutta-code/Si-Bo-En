import {
    IAddonAvailability,
    IBookingAddon,
    IChildAddon,
    PostingRhythm,
} from '../../add-on/interfaces';
import { DeviceType, IPolicy } from '../../agent-paltform/property/types';
import { DiscountType } from '../../promocode/types';
import {
    IGeoRatePlan,
    IGeoRatePlanWithoutRatePlan,
    restrictionTypeAction,
} from '../../promotions/geo-rate-plan/interfaces';
import { IMLOS } from '../../promotions/mlos/interfaces';
import {
    TaxApplicableOn,
    TaxType,
} from '../../tax-system/interfaces/tax-rule.type';
import { IBookingOffset } from '../../ari/types';
import { CurrencyCode } from '../../tax-system/interfaces/tourist-tax.type';

export interface ICustomizableDeal {
    id: string;
    propertyId: string;
    propertyCode: string;
    discountType: DiscountType;
    discountValue: number | null;
    currencyCode: CurrencyCode | null;
    startDate: Date;
    endDate: Date;
    roomId: string;
    roomType: string;
    ratePlanId: string;
    ratePlanCode: string;
    isAutoApplied: boolean;
    isActive: boolean;
    CustomizableDealsApplicableAddons: ICustomizableDealApplicableAddon[];
}

export interface ICustomizableDealApplicableAddon {
    id: string;
    customizableDealId: string;
    addOnId: string;
    AddOn: {
        id: string;
        name: string;
        code: string;
    };
}
export interface IGuestDistribution {
    adults: number;
    childAges: number[];
    children: number;
}
export interface IRatePlan {
    id: string;
    ratePlanName: string;
    ratePlanCode: string;
    deviceType: DeviceType[];
    propertyId: string;
    depositPolicy: IPolicy | null;
    depositPolicyId: string | null;
    cancellationPolicy: IPolicy | null;
    cancellationPolicyId: string | null;
    guaranteePolicy: IPolicy | null;
    guaranteePolicyId: string | null;
    taxGroup: ITaxGroup | null;
    taxGroupId: string | null;
    b2bAvailable: boolean;
    b2cAvailable: boolean;
    charges: ICharge[];
    // Addons: IRatePlanWithAddon[];
    geoRatePlans: IGeoRatePlanWithoutRatePlan[];
    bookingOffsets: IBookingOffset[];
}
export interface ITaxGroup {
    id: string;
    name: string;
    isActive: boolean;
    propertyId: string;
    taxGroupRules: ITaxGroupRule[];
}
export interface ITaxGroupRule {
    id: string;
    taxGroupId: string;
    taxRuleId: string;
    taxRule: ITaxRule;
}
export interface ITaxRule {
    id: string;
    name: string;
    type: TaxType;
    value: number;
    applicableOn: TaxApplicableOn;
    description: string | null;
    isInclusive: boolean;
    priority: number;
}
export interface IRatePlanWithAddon {
    id: string;
    ratePlanId: string;
    addonId: string;
    addon: IAddOn;
}
export interface IAddOn {
    id: string;
    propertyId: string;
    categoryId: string | null;
    subcategoryId: string | null;
    variantId: string | null;
    ratePlanId: string | null;
    code: string;
    name: string;
    postingRhythm: PostingRhythm;
    description: string | null;
    isActive: boolean;
    images: string[];
    availability: IAddonAvailability[];
    ChildAddons: IChildAddon[];
}
export interface ICustomizableDeal {
    id: string;
    propertyId: string;
    propertyCode: string;
    discountType: DiscountType;
    discountValue: number | null;
    currencyCode: CurrencyCode | null;
    isAutoApplied: boolean;
}
export interface ICharge {
    id: string;
    propertyCode: string;
    ratePlanName: string;
    ratePlanCode: string;
    roomTypeCode: string;
    roomTypeName: string;
    currencyCode: CurrencyCode;
    date: Date;
    isAvailable: boolean;
    // Days of week applicability
    isSaleStopped: boolean;

    monApplicable: boolean;
    tueApplicable: boolean;
    wedApplicable: boolean;
    thuApplicable: boolean;
    friApplicable: boolean;
    satApplicable: boolean;
    sunApplicable: boolean;
    isClosedToArrival: boolean;
    isClosedToDeparture: boolean;
    restrictionNotes: string | null;
    baseGuestAmounts: IChargeBaseByGuest[];
    additionalGuestAmounts: IChargeAdditionalGuest[];
}
export interface IChargeBaseByGuest {
    amountBeforeTax: number;
    numberOfGuests: number;
    ageQualifyingCode: string;
}
export interface IChargeAdditionalGuest {
    ageQualifyingCode: string;
    amount: number;
}
export interface ISelectedAddonsS {
    addOnId: string;
    availability: {
        date: Date;
        quantity: number;
    }[];
}
export interface ISelectedAddonsR {
    addOnId: string;
    dates: Date[];
}
export interface IIncludedAddons {
    addOnId: string;
    addOnCode: string;
}
export interface ISelectedPromotion {
    id: string;
    promotionType: 'mlos' | 'normal';
}
export interface PriceBrakeDown {
    totalAmount: number;
    amountBeforeTax: number;
    taxedAmount: number;
    totalAddonAmount: number;
    totalPromotionAmount: number;
    currentChargeableAmount: number;
    latterpayableAmount: number;
    promoCodeDiscount: number;
    currencyCode: CurrencyCode;
    addonBrakeDowns?: AddOnBrakeDown[];
    dailyPriceBrakeDown?: DailyPriceBrakeDown[];
    taxBrakeDown?: TaxBrakeDown[];
    promotionBrakeDown?: PromotionBrakeDown[];
    // spaPricingBrakeDowns?: ISpaPricing[];
    loyalityDiscount: number;
}

export interface DailyPriceBrakeDown {
    roomNumber: string;
    guestDistribution: IGuestDistribution;
    date: string;
    baseChargesAmount: number;
    additionalChargesAmount: number;
    addOnBrakeDown: AddOnBrakeDown[];
    totalAmount: number;
    currencyCode: CurrencyCode;
}
export interface TaxBrakeDown {
    name: string;
    taxedAmount: number;
    currencyCode: CurrencyCode;
    id?: string;
    _translations?: Record<string, string>;
}
export interface AddOnBrakeDown {
    addonId: string;
    name: string;
    amount: number;
    quantity: number;
    totalAmount: number;
    currencyCode: CurrencyCode;
    date: string;
    type: 'included' | 'selected';
    _translations?: Record<string, string>;
}
export interface PromotionBrakeDown {
    id: string;
    promotionType:
        | 'mlos'
        | 'normal'
        | 'early_bird'
        | 'device_specific'
        | 'offer_for_tonight';
    name: string;
    discountType: DiscountType;
    discountValue: number;
    currencyCode: CurrencyCode | null;
    discountAmount: number;
    restrictionType: 'increase' | 'decrease' | 'payLater';
    type: 'user_applied' | 'auto_applied';
    _translations?: Record<string, string>;
}
export interface IRoomDetails {
    adults: number;
    children: number;
    childAges: number[];
}
