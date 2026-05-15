import createAxiosInstance from "@/components/axiosInstance";
import type { ICPropertyActiveLanguage } from "../types";

const axiosInstance = createAxiosInstance()
export const getPropertyLanguages = async (propertyId: string) => {
    try {
        const response=await axiosInstance.get(`/property-management/property/active-language/${propertyId}`)
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
export const addPropertyLanguage = async (languageDetail:ICPropertyActiveLanguage) => {
    try {
        const response=await axiosInstance.post(`/property-management/property/active-language/${languageDetail.propertyId}`, { language: languageDetail.language })
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
export const deletePropertyLanguage = async (propertyLanguageId: string) => {
    try {
        const response=await axiosInstance.delete(`/property-management/property/active-language/delete/${propertyLanguageId}`)
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