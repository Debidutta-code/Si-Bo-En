import {
    addFields,
    getFields,
    updateField,
    deleteField,
    updateManyFields,
    getAllFields
} from "../api";

import type { ICLoyaltyField, IULoyaltyField } from "../interfaces";

export const getAllFieldService = async () => {
    try {
        const response = await getAllFields();
        return response;
    } catch (error) {
        return { success: false, message: "Failed to retrieve fields." };
    }
}
export const addFieldsService = async (data: ICLoyaltyField | ICLoyaltyField[]) => {
    try {
        const fieldsArray = Array.isArray(data) ? data : [data];
        
        for (const field of fieldsArray) {
            if (!field.loyaltyProgramId || field.loyaltyProgramId.trim() === "") {
                return { success: false, message: "Loyalty Program ID is required." };
            }
            if (!field.masterRegistrationFieldId || field.masterRegistrationFieldId.trim() === "") {
                return { success: false, message: "Master Registration Field ID is required." };
            }
            if (!field.fieldName || field.fieldName.trim() === "") {
                return { success: false, message: "Field Name is required." };
            }
            if (typeof field.visibleInRegistration !== "boolean") {
                return { success: false, message: "Visible in registration status is required." };
            }
            if (typeof field.visibleInCustomerForm !== "boolean") {
                return { success: false, message: "Visible in customer form status is required." };
            }
            if (typeof field.required !== "boolean") {
                return { success: false, message: "Required field status is required." };
            }
        }
        
        let successCount = 0;
        let lastError = null;
        
        for (const field of fieldsArray) {
            try {
                const response = await addFields(field);
                if (response.success) {
                    successCount++;
                } else {
                    lastError = response;
                    break;
                }
            } catch (error) {
                lastError = { success: false, message: "Failed to add field" };
                break;
            }
        }
        
        if (lastError) {
            return lastError;
        }
        
        return { 
            success: true, 
            message: `${successCount} field(s) added successfully`,
            data: { count: successCount }
        };
    } catch (error) {
        return { success: false, message: "Failed to add field." };
    }
};

export const getFieldsService = async (loyaltyProgramId: string) => {
    try {
        if (!loyaltyProgramId || loyaltyProgramId.trim() === "") {
            return { success: false, message: "Loyalty Program ID is required." };
        }
        const response = await getFields(loyaltyProgramId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to retrieve fields." };
    }
};

export const updateFieldService = async (loyaltyProgramId: string, fieldName: string, data: IULoyaltyField) => {
    try {
        if (!loyaltyProgramId || loyaltyProgramId.trim() === "") {
            return { success: false, message: "Loyalty Program ID is required." };
        }
        if (!fieldName || fieldName.trim() === "") {
            return { success: false, message: "Field Name is required." };
        }
        if (!data.fieldName || data.fieldName.trim() === "") {
            return { success: false, message: "New Field Name is required." };
        }
        if (typeof data.visibleInRegistration !== "boolean") {
            return { success: false, message: "Visible in registration status is required." };
        }
        if (typeof data.visibleInCustomerForm !== "boolean") {
            return { success: false, message: "Visible in customer form status is required." };
        }
        if (typeof data.required !== "boolean") {
            return { success: false, message: "Required field status is required." };
        }
        const response = await updateField(loyaltyProgramId, fieldName, data);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to update field." };
    }
};

export const deleteFieldService = async (loyaltyProgramId: string, fieldName: string) => {
    try {
        if (!loyaltyProgramId || loyaltyProgramId.trim() === "") {
            return { success: false, message: "Loyalty Program ID is required." };
        }
        if (!fieldName || fieldName.trim() === "") {
            return { success: false, message: "Field Name is required." };
        }
        const response = await deleteField(loyaltyProgramId, fieldName);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to delete field." };
    }
};

export const updateManyFieldsService = async (loyaltyProgramId: string, fields: IULoyaltyField[]) => {
    try {
        if (!loyaltyProgramId || loyaltyProgramId.trim() === "") {
            return { success: false, message: "Loyalty Program ID is required." };
        }
        if (!fields || !Array.isArray(fields) || fields.length === 0) {
            return { success: false, message: "Fields array is required and cannot be empty." };
        }
        for (const field of fields) {
            if (!field.fieldName || field.fieldName.trim() === "") {
                return { success: false, message: "All fields must have a field name." };
            }
            // if (typeof field.visibleInRegistration !== "boolean" || 
            //     typeof field.visibleInCustomerForm !== "boolean" || 
            //     typeof field.required !== "boolean") {
            //     return { success: false, message: "All fields must have valid boolean properties." };
            // }
        }
        const response = await updateManyFields(loyaltyProgramId, fields);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to update multiple fields." };
    }
};
