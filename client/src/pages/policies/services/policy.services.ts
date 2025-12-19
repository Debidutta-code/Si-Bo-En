import type { PolicyTypes } from "../interfaces";
import { createPolicy, getPolicies,addPolicyToRatePlan,deletePolicyApi } from "../api"
export const createPolicyService = async (policyName: string, type: PolicyTypes, propertyId: string, description?: string) => {
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
        return await createPolicy({
            policyName,
            type,
            description
        }, propertyId
        );
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