
export interface policyInterface {
    depositPolicy: string;
    cancellationPolicy: string;
    guaranteePolicy: string;
}

export interface IRatePlanMetadata {
    propertyId: string;
    propertyCode: string;
    ratePlanName: string;
    ratePlanDescription?: string;
    ratePlanCode: string;
    depositPolicy: string;
    cancellationPolicy: string;
    guaranteePolicy: string;
    b2bAvailable: boolean;
    b2cAvailable: boolean;
    minimumLenghthOfStay: number;
    maximumLengthOfStay?: number;
}

export interface IRatePlanUpdate {
    ratePlanName?: string;
    depositPolicyId?: string;
    cancellationPolicyId?: string;
    guaranteePolicyId?: string;
    taxId?: string;
    b2bAvailable?: boolean;
    b2cAvailable?: boolean;
    minimumLengthOfStay?: number;
    
    maximumLengthOfStay?: number;
}
export interface IRatePlan extends IRatePlanMetadata{
id:string;
createdAt:string;
updatedAt:string;
}