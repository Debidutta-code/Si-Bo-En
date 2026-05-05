// services/restrictions.service.ts

import { applyRestriction, getRestrictions, getRatePlans, getRoomTypes } from "../api";
import type { CreateRestrictionPayload, RestrictionFilters } from "../interfaces";

export async function applyRestrictionService(payload: CreateRestrictionPayload) {
    // Validation
    if (!payload.propertyCode) {
        return {
            success: false,
            message: "Property code is required"
        };
    }

    if (!payload.restrictionType || !['CTA', 'CTD'].includes(payload.restrictionType)) {
        return {
            success: false,
            message: "Valid restriction type (CTA or CTD) is required"
        };
    }

    if (!payload.dates || payload.dates.length === 0) {
        return {
            success: false,
            message: "At least one date is required"
        };
    }

    if (
        (!payload.globalRatePlans || payload.globalRatePlans.length === 0) &&
        (!payload.roomRestrictions || payload.roomRestrictions.length === 0)
    ) {
        return {
            success: false,
            message: "Must specify either global rate plans or room restrictions"
        };
    }

    const result = await applyRestriction(payload);
    return result;
}

export async function fetchRestrictionsService(
    propertyCode: string,
    filters?: RestrictionFilters
) {
    if (!propertyCode) {
        return {
            success: false,
            message: "Property code is required"
        };
    }

    const result = await getRestrictions(propertyCode, filters);
    return result;
}

export async function fetchRoomTypesService(propertyId: string) {
    if (!propertyId) {
        return {
            success: false,
            message: "Property ID is required"
        };
    }

    const result = await getRoomTypes(propertyId);
    return result;
}

export async function fetchRatePlansService(propertyId: string) {
    if (!propertyId) {
        return {
            success: false,
            message: "Property ID is required"
        };
    }

    const result = await getRatePlans(propertyId);
    return result;
}