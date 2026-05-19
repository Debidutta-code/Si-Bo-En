import type { RatePlan } from ".";
import type { ITaxRule } from "./tax-rule.type";


// TaxGroup Interfaces
export interface ITaxGroup {
    id: string;
    name: string;
    isActive: boolean;
    propertyId: string;
    ratePlans?: RatePlan[];
    taxGroupRules?: {
        id: string;
        taxRuleId: string;
        taxRule: ITaxRule;
        _translations?: {
            name: string;
            description:string;
        }
    }[];
    
    createdAt: Date;
    updatedAt: Date;
    _translations?: {
        name: string;
    }
}

export interface ICTaxGroup {
    name: string;
    isActive: boolean;
    taxRuleIds?: string[];
}

export interface IUTaxGroup {
    name: string;
    isActive: boolean;
    taxRuleIds?: string[];
}

export interface IDTaxGroup {
    id: string;
}

export interface IFTaxGroup {
    id?: string;
    propertyId?: string;
    isActive?: boolean;
}

// TaxGroupRule Interfaces
export interface ITaxGroupRule {
    id: string;
    taxGroupId: string;
    taxRuleId: string;
}

export interface ICTaxGroupRule {
    taxGroupId: string;
    taxRuleId: string;
}

export interface IUTaxGroupRule {
    taxGroupId?: string;
    taxRuleId?: string;
}

export interface IDTaxGroupRule {
    id: string;
}

export interface IFTaxGroupRule {
    id?: string;
    taxGroupId?: string;
    taxRuleId?: string;
}

// Enums (assuming these are defined elsewhere, but included for completeness)

// Response Interfaces with Relations
// export interface ITaxRuleWithRelations extends ITaxRule {
//     taxGroupRules?: ITaxGroupRule[];
// }

// export interface ITaxGroupWithRelations extends ITaxGroup {
//     taxGroupRules?: ITaxGroupRule[];
//     taxRules?: ITaxRule[];
// }

export interface ITaxGroupRuleWithRelations extends ITaxGroupRule {
    taxGroup?: ITaxGroup;
    taxRule?: ITaxRule;
}