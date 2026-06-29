import createAxiosInstance from "@/components/axiosInstance";
import type { DashboardFilters } from "../interface";
import { CurrencyCode } from "@/components/currencyCode/currency-code.type";

const axiosInstance = createAxiosInstance();

export const getAnalytics = async (targetCurrency: CurrencyCode, filters?: DashboardFilters) => {
    try {
        const params = new URLSearchParams();
        if (filters?.propertyId) params.append('propertyId', filters.propertyId);
        if (filters?.bookingStatus) params.append('bookingStatus', filters.bookingStatus);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        params.append('targetCurrency', targetCurrency);

        const queryString = params.toString();
        const url = `/agent-platform/dashboard/analytics?${queryString}`;

        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message || 'Failed to fetch analytics'
            };
        }
    }
};

export const getAgencyProperties = async () => {
    try {
        const response = await axiosInstance.get('/agent-platform/dashboard/properties');
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message || 'Failed to fetch properties'
            };
        }
    }
};