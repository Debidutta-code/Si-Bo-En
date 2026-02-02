import type { CreateRatePlan, RatePlanRule } from "../interfaces/ratePlan.type";
import createAxiosInstance from "@/components/axiosInstance";
const axiosInstance = createAxiosInstance();

export async function createRatePlan(propertyId:string,payload: CreateRatePlan) {
    try {
        const response = await axiosInstance.post(`/ari/rate-plan?propertyId=${propertyId}`, payload);
        return response.data;
    } catch (error:any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}


export async function getRatePlans(propertyId:string) {
    try {
        const response = await axiosInstance.get(`/ari/rate-plan/${propertyId}`);
        return response.data;
    } catch (error:any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}
export async function deleteRatePlan(ratePlanCode:string) {
    try {
        const response = await axiosInstance.delete(`/ari/rate-plan/${ratePlanCode}`);
        return response.data;
    } catch (error:any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}

export async function updateRatePlan(ratePlanCode:string,payload: Partial<CreateRatePlan>) {
    try {
        const response = await axiosInstance.patch(`/ari/rate-plan/${ratePlanCode}`, payload);
        return response.data;
    } catch (error:any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}



export async function createRatePlanRule(payload: Partial<RatePlanRule>) {
    try {
        const response = await axiosInstance.post(`/promotions/mlos`, payload);
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

export async function getRatePlanRule(ratePlanId: string) {
    try {
        const response = await axiosInstance.get(`/promotions/mlos/${ratePlanId}`);
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

export async function updateRatePlanRule(ratePlanId: string, payload: Partial<RatePlanRule>) {
    try {
        const response = await axiosInstance.put(`/promotions/mlos/${ratePlanId}`, payload);
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

export async function deleteRatePlanRule(ratePlanId: string) {
    try {
        const response = await axiosInstance.delete(`/promotions/mlos/${ratePlanId}`);
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

/**
 * Add an addon to a rate plan
 */
export async function addAddonToRatePlan(ratePlanCode: string, addonId: string) {
    try {
        const response = await axiosInstance.post('/ari/rate-plan-with-addon/', {
            ratePlanCode,
            addonId
        });
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
}

/**
 * Remove an addon from a rate plan
 */
export async function removeAddonFromRatePlan(ratePlanCode: string, addonId: string) {
    try {
        const response = await axiosInstance.delete('/ari/rate-plan-with-addon/', {
            data: {
                ratePlanCode,
                addonId
            }
        });
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
}

/**
 * Get all addons for a specific rate plan
 */
export async function getAddonsByRatePlanCode(ratePlanCode: string) {
    try {
        const response = await axiosInstance.get(`/ari/rate-plan-with-addon/${ratePlanCode}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
}