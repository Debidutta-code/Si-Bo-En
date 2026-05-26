import { ILoyalityGuests, ILoyalityGuestsWDP } from '.';
import { CurrencyCode } from '../../tax-system/interfaces';

export interface ICCreationLoyaltyGuest {
    customerId: string;
    creationLoyaltyConfigId: string;
    metaData: any;
    guestLevel: number;
    noOfBookings: number;
}

export interface ICreationLoyaltyGuest extends ICCreationLoyaltyGuest {
    id: string;
}

export interface ICreationLoyaltyGuestWG extends ICreationLoyaltyGuest {
    LoyalityGuest: ILoyalityGuests;
}
export interface ICreationLoyaltyGuestWDP extends ICreationLoyaltyGuest {
    LoyalityGuest: ILoyalityGuestsWDP;
}
