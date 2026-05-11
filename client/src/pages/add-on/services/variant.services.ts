import {createAddonVariant,
    deleteVariant,
    fetchAddonVariants,
    updateVariant} from "../api";

import type { IAddonVariantCreate,IAddonVariantUpdate } from "../interface";

export const createVariantService = async (data: IAddonVariantCreate, propertyId: string) => {
    try {
        if(!data.name || data.name.trim() === "") {
            return { success: false, message: "Variant name is required." };
        }
        if(!data.subcategoryId || data.subcategoryId.trim() === "") {
            return { success: false, message: "Sub-category ID is required." };
        }
        if(!propertyId || propertyId.trim() === "") {
            return { success: false, message: "Property ID is required." };
        }
        const response = await createAddonVariant(data, propertyId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to create variant."};
    }
}
export const updateVariantService = async (variantId:string, data:IAddonVariantUpdate) => {
    try {
        if(!variantId || variantId.trim() === "") {
            return { success: false, message: "Variant ID is required." };
        }
        if(!data.name || data.name.trim() === "") {
            return { success: false, message: "Variant name is required." };
        }
        if(!data.subcategoryId || data.subcategoryId.trim() === "") {
            return { success: false, message: "Sub-category ID is required." };
        }
        const response = await updateVariant(variantId, data);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to update variant."};
    }
}
export const fetchVariantsService = async (propertyId: string) => {
    try {
                if(!propertyId || propertyId.trim() === "") {
            return { success: false, message: "Property detail is required." };
        }

        const response = await fetchAddonVariants(propertyId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to fetch variants."};
    }
}
export const deleteVariantService = async (variantId:string) => {
    try {
        if(!variantId || variantId.trim() === "") {
            return { success: false, message: "Variant ID is required." };
        }
        const response = await deleteVariant(variantId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to delete variant."};
    }
}