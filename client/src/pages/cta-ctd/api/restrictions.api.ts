// api/restrictions.api.ts

import createAxiosInstance from "@/components/axiosInstance";
import type { CreateRestrictionPayload, RestrictionFilters } from "../interfaces";

export async function applyRestriction(payload: CreateRestrictionPayload) {
    const axiosInstance = createAxiosInstance();
    try {
        const response = await axiosInstance.post('/ari/cta-ctd/apply', payload);
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
}

export async function getRestrictions(
    propertyCode: string,
    filters?: RestrictionFilters
) {
    const axiosInstance = createAxiosInstance();
    try {
        const params = new URLSearchParams();

        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.restrictionType) params.append('restrictionType', filters.restrictionType);
        if (filters?.roomTypeCode) params.append('roomTypeCode', filters.roomTypeCode);
        if (filters?.ratePlanCode) params.append('ratePlanCode', filters.ratePlanCode);
        const queryString = params.toString();
        const url = `/ari/cta-ctd/${propertyCode}${queryString ? `?${queryString}` : ''}`;

        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
}

export async function getRoomTypes(propertyId: string) {
    const axiosInstance = createAxiosInstance();
    try {
        const response = await axiosInstance.get(
            `/property-management/property/${propertyId}/room/inv-setup`
        );
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
}

export async function getRatePlans(propertyId: string) {
    const axiosInstance = createAxiosInstance();
    try {
        const response = await axiosInstance.get(`/ari/rate-plan/${propertyId}`);
        return response.data;
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
}