import {createAddOn,
    deleteAddOn,
    fetchAddOns,
    updateAddOn} from "../api";
import type { 
    IAddonCreate,
    IAddonUpdate,
} from "../interface";
export const createAddOnService = async (data:IAddonCreate,propertyId:string) => {
    try {
        if(!data.name || data.name.trim() === "") {
            return { success: false, message: "Add-on name is required." };
        }
        if(!data.variantId || data.variantId.trim() === "") {
            return { success: false, message: "Variant ID is required." };
        }
        if(!propertyId || propertyId.trim() === "") {
            return { success: false, message: "Property ID is required." };
        }
        if(!data.images) {    
            return { success: false, message: "At least one image is required." };
        }
        const response = await createAddOn(data,propertyId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to create add-on."};
    }
}
export const updateAddOnService = async (addOnId:string, data:IAddonUpdate) => {
    try {
        if(!addOnId || addOnId.trim() === "") {
            return { success: false, message: "Add-on ID is required." };
        }
        if(!data.name || data.name.trim() === "") {
            return { success: false, message: "Add-on name is required." };
        }
        if(!data.variantId || data.variantId.trim() === "") {
            return { success: false, message: "Variant ID is required." };
        }
        const response = await updateAddOn(addOnId, data);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to update add-on."};
    }
}
export const fetchAddOnsService = async (propertyId:string) => {
    try {
        if(!propertyId || propertyId.trim() === "") {
            return { success: false, message: "Property ID is required." };
        }
        const response = await fetchAddOns(propertyId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to fetch add-ons."};
    }
}
export const deleteAddOnService = async (addOnId:string) => {
    try {
        if(!addOnId || addOnId.trim() === "") {
            return { success: false, message: "Add-on ID is required." };
        }
        const response = await deleteAddOn(addOnId);
        return response;
    } catch (error) {
        return { success: false, message: "Failed to delete add-on."};
    }
}