import { ICharges } from './charges.type';

export interface MappedRate {
    ratePlanCode: string;
    ratePlanName: string;
    pricing: ICharges;
    depositPolicyId: string | null;
    cancellationPolicyId: string | null;
    guaranteePolicyId: string | null;
}
