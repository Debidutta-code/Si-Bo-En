import { CurrencyCode } from "@/components/currencyCode/currency-code.type";
import { getAnalytics, getAgencyProperties } from "../api";
import type { DashboardFilters } from "../interface";

export const fetchAnalyticsService = async (targetCurrency:CurrencyCode,filters?: DashboardFilters) => {
    try {
        const response = await getAnalytics(targetCurrency,filters);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to fetch analytics."
        };
    }
};

export const fetchAgencyPropertiesService = async () => {
    try {
        const response = await getAgencyProperties();
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to fetch agency properties."
        };
    }
};