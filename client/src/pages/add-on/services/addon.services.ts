import {createAddOn,
    deleteAddOn,
    fetchAddOns,
    updateAddOn} from "../api";
import type { 
    IAddonCreate,
    IAddonUpdate,
} from "../interface";
import { upsertAddonTranslationService } from "./multi-lang.services";
import type { UpsertAddonTranslationPayload } from "../interface/multi-lang.interface";
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
        const response = await createAddOn(data,propertyId);
        // If translations provided on the create payload, upsert them
        // (UI may attach a `translations` field matching UpsertAddonTranslationPayload)
        const translations = (data as any).translations as UpsertAddonTranslationPayload | undefined;
        if (response?.success && response?.data?.id && translations && Object.keys(translations).length > 0) {
            await upsertAddonTranslationService(response.data.id, translations);
        }
        return response;
    } catch (error) {
        return { success: false, message: "Failed to create add-on."};
    }
}
export const updateAddOnService = async (addOnId:string, data:IAddonUpdate & { translations?: UpsertAddonTranslationPayload }) => {
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
        // If translations provided, upsert them
        if (response?.success && data.translations && Object.keys(data.translations).length > 0) {
            await upsertAddonTranslationService(addOnId, data.translations);
        }
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