import type { PolicyTypes } from "../interfaces";
import { createPolicy, getPolicies,addPolicyToRatePlan,deletePolicyApi, updatePolicyApi } from "../api"
import { upsertPolicyTranslationService } from "./policy-multilang.services";
import type { UpsertPolicyTranslationPayload } from "../interfaces/policy-multilang.interface";

export const createPolicyService = async (policyName: string, type: PolicyTypes, propertyId: string, description?: string, translations?: UpsertPolicyTranslationPayload) => {
    if (!policyName || !type) {
        return {
            success: false,
            message: "Policy name and type are required"
        }
    }
    if (!propertyId) {
        return {
            success: false,
            message: "Property ID is required"
        }
    }
    try {
        const resp = await createPolicy({
            policyName,
            type,
            description
        }, propertyId);

        // Upsert translations if provided and creation succeeded
        if (resp?.success && resp?.data?.id && translations && Object.keys(translations).length > 0) {
            await upsertPolicyTranslationService(resp.data.id, translations);
        }

        return resp;
    } catch (error: any) {
        return {
            success: false,
            message: error.message
        }
    }
}

export const getPoliciesByHotelCodeService = async (propertyId: string) => {
    if (!propertyId) {
        return {
            success: false,
            message: "Property ID is required"
        }
    }
    try {
        return await getPolicies(propertyId);
    } catch (error: any) {
        return {
            success: false,
            message: error.message
        }
    }
}
export const deletePolicyService = async (policyId: string) => {
    if (!policyId) {
        return {
            success: false,
            message: "Policy ID is required"
        }
    }
    try {
        return await deletePolicyApi(policyId);
    } catch (error: any) {
        return {
            success: false,
            message: error.message
        }
    }
}
export const addPolicyToRatePlanService = async (policyId: string, ratePlanId: string) => {
    if (!policyId || !ratePlanId) {
        return {
            success: false,
            message: "Policy ID and Rate Plan ID are required"
        }
    }
    try {
        return await addPolicyToRatePlan(policyId, ratePlanId);
    } catch (error: any) {
        return {
            success: false,
            message: error.message
        }
    }
}
export const updatePolicyDetailsService = async (policyId: string, policyName?: string, description?: string, translations?: UpsertPolicyTranslationPayload) => {
    if (!policyId) {
        return {
            success: false,
            message: "Policy ID is required"
        }
    }
    if (!policyName && description === undefined) {
        return {
            success: false,
            message: "At least one field is required"
        }
    }
    try {
        const resp = await updatePolicyApi(policyId, { policyName, description });
        if (resp?.success && translations && Object.keys(translations).length > 0) {
            await upsertPolicyTranslationService(policyId, translations);
        }
        return resp;
    } catch (error: any) {
        return {
            success: false,
            message: error.message
        }
    }
}