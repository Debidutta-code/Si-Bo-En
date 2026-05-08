import { ITaxGroupRule } from './';
import { CurrencyCode } from './tourist-tax.type';
export type TaxType = 'percentage' | 'fixed';
export type TaxApplicableOn = 'room_rate' | 'total_amount';
export interface ICTaxRule {
    name: string;
    type: TaxType;
    value: number;
    applicableOn: TaxApplicableOn;
    description: string | null;
    validFrom: Date;
    validTo: Date;
    priority: number;
    currencyCode: CurrencyCode;
}
export interface ITaxRule extends ICTaxRule {
    id: string;
    propertyId: string;
}
export interface IGetTaxRule extends ICTaxRule {
    id: string;
    propertyId: string;
    taxGroupRules: ITaxGroupRule[];
    createdAt: Date;
    updatedAt: Date;
}
