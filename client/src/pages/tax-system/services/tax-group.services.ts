import {
    addRulesToTaxGroup,
    createTaxGroup,
    deleteTaxGroup,
    getTaxGroupsByPropertyId,
    removeRulesFromTaxGroup,
    updateTaxGroup,
    addRatePlanToTaxGroup,
    removeRatePlanFromTaxGroup
} from "../api";

import type  {  ICTaxGroup,IUTaxGroup } from "../interface";


export const createTaxGroupService = async (propertyId: string, data: ICTaxGroup)=> {
    try {
        if(!propertyId){
            return {
                success: false,
                message: "Property ID is required to create a tax group.",
            }   
        }
        if(!data || !data.name || data.name.trim() === ""){
            return {
                success: false,
                message: "Tax group name is required.",
            }   
        }
        const response = await createTaxGroup(propertyId, data);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to create tax group.",
        }
    }
}
export const getTaxGroupsByPropertyIdService = async (propertyId: string) => {
    try {
        if(!propertyId){
            return {
                success: false,
                message: "Property ID is required to fetch tax groups.",
            }
        }
        const response = await getTaxGroupsByPropertyId(propertyId);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to fetch tax groups.",
        }
    }
}
export const updateTaxGroupService = async (taxGroupId: string, data: IUTaxGroup) => {
    try {
        if(!taxGroupId){
            return {
                success: false,
                message: "Tax Group ID is required to update tax group.",
            }
        }
        const response = await updateTaxGroup(taxGroupId, data);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to update tax group.",
        }
    }
}
export const deleteTaxGroupService = async (taxGroupId: string) => {
    try {
        if(!taxGroupId){
            return {
                success: false,
                message: "Tax Group ID is required to delete tax group.",
            }
        }
        const response = await deleteTaxGroup(taxGroupId);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to delete tax group.",
        }
    }
}
export const addRulesToTaxGroupService = async (taxGroupId: string, ruleIds: string[]) => {
    try {
        if(!taxGroupId){
            return {
                success: false,
                message: "Tax Group ID is required to add rules.",
            }
        }
        const response = await addRulesToTaxGroup(taxGroupId, ruleIds);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to add rules to tax group.",
        }
    }
}
export const removeRulesFromTaxGroupService = async (taxGroupId: string, ruleIds: string[]) => {
    try {
        if(!taxGroupId){
            return {
                success: false,
                message: "Tax Group ID is required to remove rules.",
            }
        }
        const response = await removeRulesFromTaxGroup(taxGroupId, ruleIds);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to remove rules from tax group.",
        }
    }
}
export const addRatePlanToTaxGroupService = async (taxGroupId: string, ratePlanCode: string) => {
    try {
        if(!taxGroupId){
            return {
                success: false,
                message: "Tax Group ID is required to add rate plan.",
            }
        }
        if(!ratePlanCode){
            return {
                success: false,
                message: "Rate Plan Code is required to add rate plan.",
            }
        }
        const response = await addRatePlanToTaxGroup(taxGroupId, ratePlanCode);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to add rate plan to tax group.",
        }
    }
}
export const removeRatePlanFromTaxGroupService = async (taxGroupId: string, ratePlanCode: string) => {
    try {
        if(!taxGroupId){
            return {
                success: false,
                message: "Tax Group ID is required to add rate plan.",
            }
        }
        if(!ratePlanCode){
            return {
                success: false,
                message: "Rate Plan Code is required to add rate plan.",
            }
        }
        const response = await removeRatePlanFromTaxGroup(taxGroupId, ratePlanCode);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to remove rate plan from tax group.",
        }
    }
}