import { CurrencyCode } from '../../tax-system/interfaces/tourist-tax.type';

export interface IAddonAvailability {
    id: string;
    addonId: string;
    date: Date;
    price: number;
    currencyCode: string;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreateAddonAvailability {
    addonId: string;
    date: Date;
    price: number;
    currencyCode?: CurrencyCode;
    isAvailable?: boolean;
}

export interface IUpdateAddonAvailability {
    date?: Date;
    price?: number;
    currencyCode?: string;
    isAvailable?: boolean;
}
