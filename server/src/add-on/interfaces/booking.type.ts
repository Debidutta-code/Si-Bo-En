export interface IBookingAddon {
    id: string;
    reservationId: string;
    addonId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    currencyCode: string;
    specialInstructions?: string | null;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreateBookingAddonInput {
    reservationId: string;
    addonId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    currencyCode?: string;
    specialInstructions?: string;
    date?: Date;
}

export interface IUpdateBookingAddonInput {
    name?: string;
    unitPrice?: number;
    quantity?: number;
    totalPrice?: number;
    currencyCode?: string;
    specialInstructions?: string;
    date?: Date;
}