import { ICPrimaryGuest, ICReservationGuest } from '../../reservation/types';

export interface ICloyalityGuests {
    customerId: string | null;
    customerEmail: string;
    password: string;
}
export interface ICCloyalityGuests {
    customerId: string | null;
    customerEmail: string;
    password: string;
}
export interface ILoyalityGuests extends ICloyalityGuests {
    id: string;
    createdAt: Date;
}
export interface ILoyalityGuestsWDP extends ILoyalityGuests {
    customer: ICPrimaryGuest | null;
}
export interface IGetLoyaltyGuestsForCreation {
    LoyalityGuest: ILoyalityGuestsWDP | null;
    CreationLoyaltyConfig: {
        id: string;
        loyaltyDiscountType: string;
        discountValue: number;
    } | null;
    guestLevel: number;
}
