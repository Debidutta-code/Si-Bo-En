import type { ICPropertyActiveLanguage } from "../types";
import {addPropertyLanguage,
    deletePropertyLanguage,
    getPropertyLanguages
} from "../api/property-language.api";
export const getPropertyLanguagesService = async (propertyId: string) => {
    try {
        const response=await getPropertyLanguages(propertyId)
        return response
    } catch (error) {
        return {
            success: false,
            message: "An error occurred while fetching property languages."
        }
    }
}
export const addPropertyLanguageService = async (languageDetail:ICPropertyActiveLanguage) => {
    try {
        const response=await addPropertyLanguage(languageDetail)
        return response
    } catch (error) {
        return {
            success: false,
            message: "An error occurred while adding the property language."
        }
    }
}
export const deletePropertyLanguageService = async (propertyLanguageId: string) => {
    try {
        const response=await deletePropertyLanguage(propertyLanguageId)
        return response
    } catch (error) {
        return {
            success: false,
            message: "An error occurred while deleting the property language."
        }
    }
}