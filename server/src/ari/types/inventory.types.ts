import type { ICharges } from './charges.type';

export interface Availability {
    date: string;
    count: number;
}

export interface IInventory {
    id: string;
    propertyCode: string;
    createdAt: Date;
    updatedAt: Date;
    ratePlans: string[];
    roomTypeCode: string;
    date: string;
    availability: number;
}
export interface IIdInventory {
    id: string;
    propertyCode: string;
    propertyName: string | null;
    roomTypeCode: string;
    availability: Availability;
    ratePlans: string[];
}
export interface InventoryWithRate {
    inventory: {
        hotelCode: string;
        roomTypeCode: string;
        availability: {
            date: string;
            count: number;
        };
    };
    rate: ICharges | null;
    date: string;
}

export interface ICreateInventoryRepo {
    propertyCode: string;
    roomTypeCode: string;
    date: string;
    availability: number;
}
