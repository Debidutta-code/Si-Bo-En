import { IGuests } from "../../reservation/types";

export interface ICloyalityGuests {
    guestId: string | null;
    guestEmail: string;
    password: string;
}
export interface ICCloyalityGuests {
    guestId: string | null;
    guestEmail: string;
    password: string;
}
export interface ILoyalityGuests extends ICloyalityGuests {
    id: string;
    createdAt: Date;
}
export interface ILoyalityGuestsWDP extends ILoyalityGuests {

    guest: IGuests | null;

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