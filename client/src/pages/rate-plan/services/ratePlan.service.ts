import { createRatePlan, deleteRatePlan, getRatePlans, updateRatePlan } from "../api";
import type { CreateRatePlan } from "../interfaces";

export async function createRatePlanService(propertyId: string, payload: CreateRatePlan) {
    if (!propertyId) {
        return {
            success: false,
            message: "Property ID is required"
        }
    }
    if (!payload.ratePlanName) {
        return {
            success: false,
            message: "Rate Plan Name is required"
        }
    }
    const result = await createRatePlan(propertyId, payload);
    return result;
}

export async function fetchRatePlansService(propertyId: string) {
    if (!propertyId) {
        return {
            success: false,
            message: "Property ID is required"
        }
    }
    const result = await getRatePlans(propertyId);
    return result;
}

export async function removeRatePlanService(ratePlanCode: string) {
    if (!ratePlanCode) {
        return {
            success: false,
            message: "Rate Plan Code is required"
        }
    }
    const result = await deleteRatePlan(ratePlanCode);
    return result;
}

export async function updateRatePlanService(ratePlanCode: string, payload: Partial<CreateRatePlan>) {
    if (!ratePlanCode) {
        return {
            success: false,
            message: "Rate Plan Code is required"
        }
    }
    if (!payload.ratePlanName) {
        return {
            success: false,
            message: "Rate Plan Name is required"
        }
    }
    const result = await updateRatePlan(ratePlanCode, payload);
    return result;
}