export interface IPropertyLoyalityWithLoyality{
    CreationLoyaltyConfig:ICreationLoyality;
    creationLoyaltyConfigId: string;
    propertyId: string;
    propertyCode: string;
    propertyName: string;
}
export interface ICCreationLoyality {
      creationId: string
      loyaltyDiscountType: DiscountType;
      discountValue: number;
      currencyCode: CurrencyCode | null;
}
export interface ITCreationLoyality extends ICCreationLoyality {
      id: string;
}
export interface IUCreationLoyalty {
      loyaltyDiscountType: DiscountType;
      discountValue: number;
      currencyCode: CurrencyCode | null;
}
export interface ICreationLoyality extends ICCreationLoyality {
      id: string;
      AdvanceLoyaltyProgram: IAdvanceLoyaltyprogram | null;
      BasicLoyaltyProgram: IloyaltyProgram | null;
      loyaltyConditions: ILoyalityCondition[] | null;
      LoyaltyProgramFieldConfig: ILoyaltyField[] | null;
      loyaltySpecialConditions: ILoyalitySpecialCondition[] | null;
}
export interface ICAdvanceLoyaltyprogram {
    loyaltyProgramId: string;

    activeInCorporateWeb: boolean;
    defaultLoginMode: boolean;
    externalRegistrationUrl: string | null;
    roomLimitByBooking: number;
    blockUserFieldFromForm: boolean;

}
export interface IAdvanceLoyaltyprogram extends ICAdvanceLoyaltyprogram{
    id:string;

}
export interface ICloyaltyProgram {
    loyaltyProgramId: string;
    isActive: boolean;
    logo: string[];
}
export interface IloyaltyProgram extends ICloyaltyProgram {
    id: string;
    isActive: boolean;
}
export interface ICLoyalityCondition {
    loyaltyProgramId: string;
    text: string;
    language: Languages;
}
export interface ILoyalityCondition extends ICLoyalityCondition {
    id: string;
    isActive: boolean;
    isDeleted: boolean;
}
export type Languages = 'en';
export interface ICLoyaltyField {
    loyaltyProgramId: string
    masterRegistrationFieldId: string

    fieldName: string

    visibleInRegistration: boolean;
    visibleInCustomerForm: boolean;
    required: boolean;
}
export interface ILoyaltyField extends ICLoyaltyField {
    id: string;
}
export interface ILoyalitySpecialCondition extends ICLoyalitySpecialCondition {
    id: string;
    isActive: boolean;
    isDeleted: boolean;
}
export interface ICLoyalitySpecialCondition {
    loyaltyProgramId: string;
    title: string;
    subTitle: string | null;
    language: Languages;

}
export type DiscountType = "percentage" | "flat";
export type CurrencyCode="USD"|"EUR"|"INR";
