export interface ICLoyaltyField {
    loyaltyProgramId: string;
    masterRegistrationFieldId: string;

    fieldName: string;

    visibleInRegistration: boolean;
    visibleInCustomerForm: boolean;
    required: boolean;
}
export interface ILoyaltyField extends ICLoyaltyField {
    id: string;
}
export interface IULoyaltyField {
    fieldName: string;

    visibleInRegistration: boolean;
    visibleInCustomerForm: boolean;
    required: boolean;
}
