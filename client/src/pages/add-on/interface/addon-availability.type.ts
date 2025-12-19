import type { IAddon } from "./addon.type";

// AddonAvailability interfaces
export interface IAddonAvailability {
    id: string;
    addonId: string;
    propertyId: string;
    date: Date;
    price: number;
    currencyCode: string;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAddonAvailabilityCreate {
    addonId: string;
    from: Date;
    to: Date;
    price: number;
    currencyCode: string;
    isAvailable: boolean;
}

export interface IAddonAvailabilityUpdate {
    id: string;
    price: number;
    currencyCode: string;
    isAvailable: boolean;
}

export interface IAddonAvailabilityWithRelations extends IAddonAvailability {
    addon?: IAddon;
}