export interface policyInterface {
    depositPolicy: string;
    cancellationPolicy: string;
    guaranteePolicy: string;
}

export interface IRatePlanMetadata {
    propertyId: string;
    // propertyCode: string;
    ratePlanName: string;
    ratePlanDescription?: string;
    ratePlanCode: string;
    depositPolicy: string;
    cancellationPolicy: string;
    guaranteePolicy: string;
    b2bAvailable: boolean;
    b2cAvailable: boolean;
    roomOnlyVisible: boolean;
}
export interface IRatePlanFPromotions {
    id: string;
    propertyId: string;
    // propertyCode: string;
    ratePlanName: string;
    ratePlanDescription?: string;
    ratePlanCode: string;
    b2bAvailable: boolean;
    b2cAvailable: boolean;
}
export interface IRatePlanUpdate {
    ratePlanName?: string;
    depositPolicyId?: string;
    cancellationPolicyId?: string;
    guaranteePolicyId?: string;
    taxId?: string;
    b2bAvailable?: boolean;
    b2cAvailable?: boolean;
    roomOnlyVisible?: boolean;
}

export interface IRatePlan extends IRatePlanMetadata {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
