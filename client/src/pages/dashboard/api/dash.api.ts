import createAxiosInstance from "@/components/axiosInstance";
import type { CurrencyCode } from "@/components/currency-code/currency-code.type";
const axiosInstance = createAxiosInstance()

export const fetchAnalytics = async(selectedPropertyId?: string, propertyCode?: string, propertyName?: string,selectedCurrency?: CurrencyCode) => {
    try {
        const response = await axiosInstance.get(`/dash/get-analytics?${selectedPropertyId && "propertyId=" + selectedPropertyId}&&${propertyCode && "propertyCode=" + propertyCode}&&${propertyName && "propertyName=" + propertyName}&&${selectedCurrency && "selectedCurrency=" + selectedCurrency}`)
        return response.data
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}

export const fetchProperties = async() => {
    try {
        const response = await axiosInstance.get("/dash/properties")
        return response.data
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}
export const fetchPropertiesByCreationId = async(creationId: string) => {
    try {
        const response = await axiosInstance.get(`/dash/properties-by-creation-id?creationId=${creationId}`)
        return response.data
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}

// 🆕 ADD THIS NEW API FUNCTION
export const fetchStatisticsComparison = async(
    comparisonType: 'date' | 'month' | 'year',
    selectedDate: string,
    propertyId?: string,
    propertyCode?: string,
    propertyName?: string,
    selectedCurrency?:CurrencyCode
) => {
    try {
        const params = new URLSearchParams({
            comparisonType,
            selectedDate,        
            ...(propertyId && { propertyId }),
            ...(propertyCode && { propertyCode }),
            ...(propertyName && { propertyName }),
            ...(selectedCurrency && { selectedCurrency })
        });

        const response = await axiosInstance.get(`/dash/statistics-comparison?${params.toString()}`);
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
};