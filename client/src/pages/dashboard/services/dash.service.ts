import type { CurrencyCode } from "@/components/currency-code/currency-code.type";
import {
    fetchAnalytics,
    fetchProperties,
    fetchStatisticsComparison  // 🆕 ADD THIS IMPORT
} from "../api";
import { fetchPropertiesByCreationId } from "../api/dash.api";

export const fetchAnaltyticsService = async(propertyid?: string, propertyCode?: string, propetyName?: string,selectedCurrency?: CurrencyCode) => {
    try {
        return await fetchAnalytics(propertyid && propertyid, propertyCode && propertyCode, propetyName && propetyName,selectedCurrency && selectedCurrency)
    } catch (error) {
        return {
            success: false,
            message: "Failed to fetch Analytics"
        }
    }
}

export const fetchPropertiesService = async() => {
    try {
        return await fetchProperties()
    } catch (error) {
        return {
            success: false,
            message: "Failed to Properties"
        }
    }
}
export const fetchPropertiesByCreationIdService = async(creationId: string) => {
    try {
        return await fetchPropertiesByCreationId(creationId)
    } catch (error) {
        return {
            success: false,
            message: "Failed to fetch Properties"
        }
    }
}

// 🆕 ADD THIS NEW SERVICE
export const fetchStatisticsComparisonService = async(
    comparisonType: 'date' | 'month' | 'year',
    selectedDate: string,
    propertyId?: string,
    propertyCode?: string,
    propertyName?: string,
    selectedCurrency?:CurrencyCode
) => {
    try {
        return await fetchStatisticsComparison(comparisonType, selectedDate, propertyId, propertyCode, propertyName,selectedCurrency)
    } catch (error) {
        return {
            success: false,
            message: "Failed to fetch Statistics Comparison"
        }
    }
}