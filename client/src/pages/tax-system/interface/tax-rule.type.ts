import type { CurrencyCode } from "@/components/currency-code/currency-code.type";

// TaxRule Interfaces
export type TaxType = "percentage" | "fixed"

export type TaxApplicableOn = "room_rate" | "total_amount";

export interface ITaxRule {
    id: string;
    name: string;
    type: TaxType;
    value: number;
    applicableOn: TaxApplicableOn;
    description: string | null;
    priority: number;
    propertyId: string;
    createdAt: Date;
    updatedAt: Date;
    currencyCode: CurrencyCode;

    taxGroupRules?: {
        id: string;
        taxGroupId: string;
        taxGroup: {
            id: string;
            name: string;
            isActive: boolean;
            _translations?: {
                name: string;
            }
        }
    }[];
    _translations?: {
        name: string;
        description: string;
    }
}

export interface ICTaxRule {
    name: string;
    type: TaxType;
    value: number;
    applicableOn: TaxApplicableOn;
    description?: string;
    priority: number;
    currencyCode: CurrencyCode;
}

export interface IUTaxRule {
    name: string;
    type: TaxType;
    value: number;
    applicableOn: TaxApplicableOn;
    description: string;
    priority: number;
    currencyCode: CurrencyCode;
}

export interface IDTaxRule {
    id: string;
}

export interface IFTaxRule {
    id?: string;
    propertyId?: string;
    type?: TaxType;
}