import { ICTaxRule } from "./"

export interface ICTaxGroup {
    name: string;
    isActive: boolean;
}

export interface IGetTaxGroup extends ICTaxGroup {
    id: string;
    propertyId: string;
    taxGroupRules: ICTaxRule[];
    ratePlans: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface ITaxGroupRule {
    id: string;
    taxGroupId: string;
    taxRuleId: string;
} 