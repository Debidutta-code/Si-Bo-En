import { CurrencyCode } from '../../../tax-system/interfaces/tourist-tax.type';

export interface IBaseByGuest {
    numberOfGuests: number;
    amountBeforeTax: number; // ← was any
    ageQualifyingCode: string; // ← ADDED ('10' = adult, '8' = child)
}

export interface IChargeAdditionalGuest {
    ageQualifyingCode: string;
    amount: number; // ← was any
}

export interface ICharges {
    propertyCode: string;
    ratePlanName: string;
    ratePlanCode: string;
    roomTypeCode: string;
    roomTypeName: string;
    currencyCode: CurrencyCode;
    date: Date;
    isAvailable: boolean;
    isSaleStopped: boolean; // ← ADDED
    monApplicable: boolean; // ← ADDED
    tueApplicable: boolean; // ← ADDED
    wedApplicable: boolean; // ← ADDED
    thuApplicable: boolean; // ← ADDED
    friApplicable: boolean; // ← ADDED
    satApplicable: boolean; // ← ADDED
    sunApplicable: boolean; // ← ADDED
    isClosedToArrival: boolean;
    isClosedToDeparture: boolean;
    restrictionNotes: string | null;
    baseGuestAmounts: IBaseByGuest[];
    additionalGuestAmounts: IChargeAdditionalGuest[];
}
