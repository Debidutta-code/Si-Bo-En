import type { CurrencyCode } from "@/pages/tax-system/interface";

export interface CreateRatePlan {
    ratePlanName: string;
    b2bAvailable: boolean;
    b2cAvailable: boolean;
}

export interface RatePlan {
    id: string;
    propertyId: string;
    ratePlanName: string;
    ratePlanCode: string;
    b2bAvailable: boolean;
    b2cAvailable: boolean;
    cancellationPolicy?: string | null;
    cancellationPolicyId?: string | null;
    createdAt?: string;
    depositPolicy?: string | null;
    depositPolicyId?: string | null;
    guaranteePolicy?: string | null;
    guaranteePolicyId?: string | null;
    taxGroupId?: string | null;
    updatedAt?: string;
    ratePlanRules?: RatePlanRule | null;
    Addons?: RatePlanWithAddon[] | null;
}
export interface RatePlanWithAddon {
    id: string;
    ratePlanId: string;
    addonId: string;
    addonName: string;
    addonType: string;
    addonPrice: number;
    addonDescription: string;
    addonImage: string;
    addonIsActive: boolean;
}
export interface RatePlanRule {
    id: string;
    ratePlanId: string;
    startDate?: string | null;
    endDate?: string | null;
    minLos: number;
    maxLos?: number | null;
    discountType?: "percentage" | "flat" | "none";
    discountValue?: number | null;
    isActive: boolean;
    isAutoApplied: boolean;
    currencyCode:CurrencyCode
}
export interface ICRatePlanRule{
    ratePlanId: string;
    startDate?: string | null;
    endDate?: string | null;
    minLos: number;
    maxLos?: number | null;
    discountType?: "percentage" | "flat" | "none";
    discountValue?: number | null;
    isActive: boolean;
    isAutoApplied: boolean;
    currencyCode:CurrencyCode
}
export interface LoaderProps {
    isLoading: boolean;
    text: string;
}