export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type PolicyType = 'deposit' | 'guarantee' | 'cancellation';

export interface IPolicy {
    id: string;
    policyName: string;
    type: PolicyType;
    description: string;
}

export interface IRatePlan {
    id: string;
    ratePlanName: string;
    ratePlanCode: string;
    deviceType: DeviceType[];
    propertyId: string;
    depositPolicy: IPolicy | null;
    depositPolicyId: string | null;
    cancellationPolicy: IPolicy | null;
    cancellationPolicyId: string | null;
    guaranteePolicy: IPolicy | null;
    guaranteePolicyId: string | null;
    roomOnlyVisible: boolean;
    b2bAvailable: boolean;
    b2cAvailable: boolean;
}