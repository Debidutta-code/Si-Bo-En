import { DiscountType } from '../../promocode/types';
import { CurrencyCode } from '../../tax-system/interfaces/tourist-tax.type';

export interface ICChildAddoon {
    minAge: number;
    maxAge: number;
    addonId: string;
    discountApplicable: boolean;
    discountType: DiscountType | null;
    discountAmount: number | null;
    currencyCode: CurrencyCode | null;
}
export interface IChildAddon extends ICChildAddoon {
    id: string;
}
export interface IUpdateChildAddon {
    minAge: number;
    maxAge: number;
    discountApplicable: boolean;
    discountType: DiscountType | null;
    discountAmount: number | null;
    currencyCode: CurrencyCode | null;
}
