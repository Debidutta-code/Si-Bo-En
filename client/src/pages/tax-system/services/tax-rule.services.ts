import {
    createTaxRuleApi,
    deleteTaxRuleApi,
    fetchTaxRulesByPro,
    updateTaxRuleApi
} from "../api";

import type { ICTaxRule } from "../interface";
export const createTaxRuleService = async (propertyId:string,taxRuleData: ICTaxRule) => {
    try {
        const validation = validateTaxRuleData(taxRuleData);
        if (!validation.success) {
            return validation;
        }
        const response = await createTaxRuleApi(propertyId, taxRuleData);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to create tax rule."
        }
    }
}

export const fetchTaxRulesByPropertyService = async (propertyId: string) => {
    try {
        if (!propertyId) {
            return { success: false, message: "Property ID is required to fetch tax rules." }
        }
        const response = await fetchTaxRulesByPro(propertyId);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to fetch tax rules."
        }
    }
}
const validateTaxRuleData = (taxRuleData: ICTaxRule) => {

    if (!taxRuleData.name || taxRuleData.name.trim() === "") {
        return { success: false, message: "Tax rule name is required to create a tax rule." }
    }
    if (taxRuleData.type !== "percentage" && taxRuleData.type !== "fixed") {
        return { success: false, message: "Tax rule type must be either 'percentage' or 'fixed'." }
    }
    if (taxRuleData.value <= 0) {
        return { success: false, message: "Tax rule value must be greater than zero." }
    }
    if (!taxRuleData.applicableOn || (taxRuleData.applicableOn !== "room_rate" && taxRuleData.applicableOn !== "total_amount")) {
        return { success: false, message: "Tax rule applicableOn must be either 'room_rate' or 'total_amount'." }
    }
    if (taxRuleData.validFrom >= taxRuleData.validTo) {
        return { success: false, message: "Tax rule validFrom date must be earlier than validTo date." }
    }
    if (taxRuleData.priority < 0 || taxRuleData.priority > 5) {
        return { success: false, message: "Tax rule priority must be in between 0 and 5." }
    }
    if (taxRuleData.type === "percentage" && taxRuleData.value > 100) {
        return { success: false, message: "For percentage type, tax rule value cannot exceed 100." }
    }
    return { success: true };
}

export const updateTaxRuleService = async (taxRuleId: string, taxRuleData: ICTaxRule) => {
    try {
        const validation = validateTaxRuleData(taxRuleData);
        if (!validation.success) {
            return validation;
        }
        const response = await updateTaxRuleApi(taxRuleId, taxRuleData);
        return response;
    }catch (error) {
        return {
            success: false,
            message: "Failed to Update tax rule."
        }
    }
}
export const deleteTaxRuleService = async (taxRuleId: string) => {
    try {
        const response = await deleteTaxRuleApi(taxRuleId);
        return response;
    }catch (error) {
        return {
            success: false,
            message: "Failed to delete tax rule."
        }
    }
}