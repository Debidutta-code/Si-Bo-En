
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
    validFrom: Date;
    validTo: Date;
    isInclusive: boolean;
    priority: number;
    propertyId: string;
    createdAt: Date;
    updatedAt: Date;
    taxGroupRules?: {
        id: string;
        taxGroupId: string;
        taxGroup: {
            id: string;
            name: string;
            isActive: boolean;
        }
    }[];
}

export interface ICTaxRule {
    name: string;
    type: TaxType;
    value: number;
    applicableOn: TaxApplicableOn;
    description?: string;
    validFrom: Date;
    validTo: Date;
    isInclusive?: boolean;
    priority: number;
}

export interface IUTaxRule {
    name: string;
    type: TaxType;
    value: number;
    applicableOn: TaxApplicableOn;
    description: string;
    validFrom: Date;
    validTo: Date;
    isInclusive: boolean;
    priority: number;
}

export interface IDTaxRule {
    id: string;
}

export interface IFTaxRule {
    id?: string;
    propertyId?: string;
    type?: TaxType;
    isInclusive?: boolean;
}