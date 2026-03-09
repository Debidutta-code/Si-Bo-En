import {
    createChildAddon,
    getAllChildAddons,
    updateChildAddon,
    deleteChildAddon
} from "../api";
import type {
    ICChildAddoon,
    IUpdateChildAddon
} from "../interface";



export const createChildAddonService = async (childAddonData: ICChildAddoon) => {
    try {
        if (childAddonData.discountApplicable) {
            if(childAddonData.minAge < 0) {
                return {
                    success: false,
                    message: "Invalid minimum age"
                }
            }
            if(childAddonData.maxAge && childAddonData.maxAge <= 0) {
                return {
                    success: false,
                    message: "Invalid maximum age"
                }
            }
            if(childAddonData.minAge && childAddonData.maxAge && childAddonData.minAge >= childAddonData.maxAge) {
                return {
                    success: false,
                    message: "Invalid age range"
                }
            }
        }
        return await createChildAddon(childAddonData);
    } catch (error) {
        return {
            success: false,
            message: "Failed to create child addon"
        }
    }
}


export const getAllChildAddonsService = async (addonId: string) => {
    try {
        return await getAllChildAddons(addonId);
    } catch (error) {
        return {
            success: false,
            message: "Failed to retrieve child addons"
        }
    }
}
export const updateChildAddonService = async (childAddonId: string, childAddonData: IUpdateChildAddon) => {
    try {
        if (childAddonData.discountApplicable) {
            if(childAddonData.minAge < 0) {
                return {
                    success: false,
                    message: "Invalid minimum age"
                }
            }
            if(childAddonData.maxAge && childAddonData.maxAge <= 0) {
                return {
                    success: false,
                    message: "Invalid maximum age"
                }
            }
            if(childAddonData.minAge && childAddonData.maxAge && childAddonData.minAge >= childAddonData.maxAge) {
                return {
                    success: false,
                    message: "Invalid age range"
                }
            }
            if (childAddonData.discountType === "percentage" &&
                childAddonData.discountAmount &&
                (childAddonData.discountAmount <= 0 || childAddonData.discountAmount > 100)) {
                return {
                    success: false,
                    message: "Invalid discount amount for discount type percentage"
                }
            }
            else {
                if (childAddonData.discountAmount &&
                    childAddonData.discountAmount <= 0) {
                    return {
                        success: false,
                        message: "Invalid discount amount for discount type fixed"
                    }

                }
                if(!childAddonData.currencyCode){
                    return{
                        success:false,
                        message:"Currency code is required for flat discount type"
                    }
                }
            }
        }
        return await updateChildAddon(childAddonId, childAddonData);
    } catch (error) {
        return {
            success: false,
            message: "Failed to update child addon"
        }
    }
}

export const deleteChildAddonService = async (childAddonId: string) => {
    try {
        return await deleteChildAddon(childAddonId);
    } catch (error) {
        return {
            success: false,
            message: "Failed to delete child addon"
        }
    }
}