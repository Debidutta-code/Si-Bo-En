import type { IAddon } from "./addon.type";








// BookingAddon interfaces
export interface IBookingAddon {
    id: string;
    bookingId: string;
    addonId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    currencyCode: string;
    specialInstructions: string | null;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBookingAddonCreate {
    bookingId: string;
    addonId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    currencyCode?: string;
    specialInstructions?: string;
    date?: Date;
}

export interface IBookingAddonUpdate {
    bookingId?: string;
    addonId?: string;
    name?: string;
    unitPrice?: number;
    quantity?: number;
    totalPrice?: number;
    currencyCode?: string;
    specialInstructions?: string | null;
    date?: Date;
}

export interface IBookingAddonWithRelations extends IBookingAddon {
    booking?: any;
    addon?: IAddon;
}