export interface Charges {
    id: string;
    propertyCode: string;

    ratePlanCode: string;
    ratePlanName: string;

    roomTypeCode: string;
    roomTypeName: string;

    currencyCode: string;

    date: string;
    isSaleStopped: boolean;
    availableRooms: number;
    baseGuestAmounts: IBaseGuestAmounts[];
    additionalGuestAmounts: IAdditionalGuestAmount[];
}
export interface IUpdatePrice {
    id: string;
    amount: number;
}
export interface ICreateCharges {
    ratePlanCode: string;
    roomTypeCode: string;
    startDate: string;
    endDate: string;
    currencyCode: string;
    baseByGuestAmounts: IBaseGuestAmounts[];
    additionalGuestAmounts: IAdditionalGuestAmount[];
}

export interface ApplicableDaysOfWeek {
    monApplicable: boolean;
    tueApplicable: boolean;
    wedApplicable: boolean;
    thuApplicable: boolean;
    friApplicable: boolean;
    satApplicable: boolean;
    sunApplicable: boolean;
}
export type qualifyingAgeCode = "10" | "8" | "5"
export interface IBaseGuestAmounts {
    amountBeforeTax: string;
    numberOfGuests: number;
    ageQualifyingCode: qualifyingAgeCode;
}
export interface IAdditionalGuestAmount {
    ageQualifyingCode: qualifyingAgeCode;
    amount: number;
}

export interface IFilterProps {
    startDate?: string;
    endDate?: string;
    ratePlanCode?: string;
    roomTypeCode?: string;
}

export interface IUpdatedCharges {
    id: string;
    baseGuestAmounts: IBaseGuestAmounts[];
    additionalGuestAmounts: IAdditionalGuestAmount[];
}
export interface CreateMappingPayload {
    ratePlanCode: string;
    ratePlanName: string;
    roomTypeCode: string;
    roomTypeName: string;
    baseByGuestAmounts: IBaseGuestAmounts[];
    additionalGuestAmounts: IAdditionalGuestAmount[];
    currencyCode: string;
    startDate: string;
    endDate: string;
}