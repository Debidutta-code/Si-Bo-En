export interface CreatePolicyData {
    policyName: string;
    type: 'deposit' | 'guarantee' | 'cancellation';
    description: string;
    ratePlanCode?: string;
    propertyId: string;
}

export interface UpdatePolicyData {
    ratePlanCode: string;
    ratePlanName: string;
}

export interface PolicyFilters {
    ratePlanCode: string;
    propertyId: string;
}
export interface allPolicies {
    id: string;
    policyName: string;
    type: 'deposit' | 'guarantee' | 'cancellation';
    description: string;
    propertyId: string;
    ratePlanCode?: string;
    ratePlanName?: string;
}
export interface IPolicy {
    id: string;
    policyName: string;
    type: 'deposit' | 'guarantee' | 'cancellation';
    description: string;
    propertyId: string | null;
}
export interface FilterOptions {
    activityType?: string;
    search?: string; // for text-based search (e.g., bookingCode, propertyName, etc.)
    initiatedBy?: string;
    startDate?: Date;
    endDate?: Date;
    [key: string]: any; // dynamic fields
}

export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface RemovePolicyFromRatePlansData {
    policyId: string;
    ratePlanIds: string[];
}