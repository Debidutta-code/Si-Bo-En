export type PolicyTypes = 'cancellation' | 'deposit' | 'guarantee' ;

export interface ICPolicy {
    policyName: string;
    type: PolicyTypes;
    description?: string;
}
export interface IPolicy{
    id: string;
    policyName: string;
    type: PolicyTypes;
    description?: string;
    ratePlanCode?: string;
    ratePlanName?:string;
    propertyId: string;
    createdAt: Date;
    updatedAt: Date;
}