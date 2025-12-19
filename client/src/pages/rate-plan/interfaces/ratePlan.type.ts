export interface CreateRatePlan {
    ratePlanName: string;
    b2bAvailable: boolean;
    b2cAvailable: boolean;
    minimumLengthOfStay: number;
    maximumLengthOfStay?: number;
}

export interface RatePlan {
    id: string;
    propertyId: string;
    ratePlanName: string;
    ratePlanCode: string;
    b2bAvailable: boolean;
    b2cAvailable: boolean;
    minimumLengthOfStay?: number;
    maximumLengthOfStay?: number;
    cancellationPolicy?: string | null;
    cancellationPolicyId?: string | null;
    createdAt?: string;
    depositPolicy?: string | null;
    depositPolicyId?: string | null;
    guaranteePolicy?: string | null;
    guaranteePolicyId?: string | null;
    taxGroupId?: string | null;
    updatedAt?: string;
}
export interface LoaderProps {
    isLoading: boolean;
    text: string;
}