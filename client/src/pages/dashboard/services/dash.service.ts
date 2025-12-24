import {
    fetchAnalytics,
    fetchProperties,
    fetchStatisticsComparison  // 🆕 ADD THIS IMPORT
} from "../api";

export const fetchAnaltyticsService = async(propertyid?: string, propertyCode?: string, propetyName?: string) => {
    try {
        return await fetchAnalytics(propertyid && propertyid, propertyCode && propertyCode, propetyName && propetyName)
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

// 🆕 ADD THIS NEW SERVICE
export const fetchStatisticsComparisonService = async(
    comparisonType: 'date' | 'month' | 'year',
    selectedDate: string,
    propertyId?: string,
    propertyCode?: string,
    propertyName?: string
) => {
    try {
        return await fetchStatisticsComparison(comparisonType, selectedDate, propertyId, propertyCode, propertyName)
    } catch (error) {
        return {
            success: false,
            message: "Failed to fetch Statistics Comparison"
        }
    }
}