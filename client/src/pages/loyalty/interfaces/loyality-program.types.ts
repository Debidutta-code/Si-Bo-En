export interface ICloyaltyProgram {
    loyaltyProgramId: string;
    isActive: boolean;
    logo: string[];
}
export interface IULoyalityProgram {
    isActive: boolean;
    logo: string[];
}
export interface IloyaltyProgram extends ICloyaltyProgram {
    id: string;
    isActive: boolean;
}
export interface ICAdvanceLoyaltyprogram {
    loyaltyProgramId: string;

    activeInCorporateWeb: boolean;
    defaultLoginMode: boolean;
    externalRegistrationUrl: string | null;
    roomLimitByBooking: number;
    blockUserFieldFromForm: boolean;

}
export interface IUAdvanceLoyaltyprogram {
    activeInCorporateWeb: boolean;
    defaultLoginMode: boolean;
    externalRegistrationUrl: string | null;
    roomLimitByBooking: number;
    blockUserFieldFromForm: boolean;
}
export interface IAdvanceLoyaltyprogram extends ICAdvanceLoyaltyprogram{
    id:string;

}