// services/touristTax.service.ts

import {
    createTouristTaxApi,
    deleteTouristTaxApi,
    fetchTouristTaxesByPropertyApi,
    updateTouristTaxApi
} from "../api";
import type { ICTouristTax, IUTouristTax } from "../interface";

const validateTouristTaxData = (touristTaxData: ICTouristTax) => {
    if(!touristTaxData.name||touristTaxData.name.trim()==""){
        return {success:false,meassage:"Tourist Tax name is required"}
    }
    if (!touristTaxData.roomId || touristTaxData.roomId.trim() === "") {
        return { success: false, message: "Room type is required for tourist tax." };
    }

    if (touristTaxData.discountType !== "flat" && touristTaxData.discountType !== "percentage") {
        return { success: false, message: "Discount type must be either 'flat' or 'percentage'." };
    }

    if (touristTaxData.discountValue !== undefined && touristTaxData.discountValue !== null) {
        if (touristTaxData.discountValue <= 0) {
            return { success: false, message: "Discount value must be greater than zero." };
        }

        if (touristTaxData.discountType === "percentage" && touristTaxData.discountValue > 100) {
            return { success: false, message: "For percentage type, discount value cannot exceed 100." };
        }
    }

    return { success: true };
};

export const createTouristTaxService = async (propertyId: string, touristTaxData: ICTouristTax) => {
    try {
        const validation = validateTouristTaxData(touristTaxData);
        if (!validation.success) {
            return validation;
        }
        const response = await createTouristTaxApi(propertyId, touristTaxData);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to create tourist tax."
        };
    }
};

export const fetchTouristTaxesByPropertyService = async (propertyId: string) => {
    try {
        if (!propertyId) {
            return { success: false, message: "Property ID is required to fetch tourist taxes." };
        }
        const response = await fetchTouristTaxesByPropertyApi(propertyId);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to fetch tourist taxes."
        };
    }
};

export const updateTouristTaxService = async (touristTaxId: string, touristTaxData: IUTouristTax) => {
    try {
        const validation = validateTouristTaxData({
            ...touristTaxData,
        } as ICTouristTax);
        
        if (!validation.success) {
            return validation;
        }
        
        const response = await updateTouristTaxApi(touristTaxId, touristTaxData);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to update tourist tax."
        };
    }
};

export const deleteTouristTaxService = async (touristTaxId: string) => {
    try {
        const response = await deleteTouristTaxApi(touristTaxId);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to delete tourist tax."
        };
    }
};