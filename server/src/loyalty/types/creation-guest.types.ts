import { ICustomer } from '../../customer/types';
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
    Customer: ICustomer;
}
export interface ICreationLoyaltyGuestWDP extends ICreationLoyaltyGuest {
    Customer: ICustomer;
}
