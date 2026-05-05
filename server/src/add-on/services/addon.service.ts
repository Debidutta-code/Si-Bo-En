import AddonRepository from "../repository/addon.repository";
import SubCategoryRepository from "../repository/subCategory.repository";
import VariantRepository from "../repository/variant.repository";
import { IAddon ,ICAddon} from "../interfaces";
import { successResponse,errorResponse } from "../../utils/return";
import {IApiResponse} from "../../utils/return.types"
import { deleteFileByUrl } from "../../utils/delete-images.utils";

export class AddonService {
    /**
     * Create a new addon
     */
    async createAddon(addonData: ICAddon):Promise<IApiResponse> {
        try {
            if(!addonData.propertyId){
                return errorResponse("Property ID is required to create an addon");
            }
            if(!addonData.name){
                return errorResponse("Addon name is required");
            }
            if(!addonData.postingRhythm){
                return errorResponse("Posting rhythm is required");
            }


            
            if (addonData.subcategoryId) {
                // Check if subcategory exists
                const subCategory = await SubCategoryRepository.getSubCategoryById(addonData.subcategoryId.toString());
                if (!subCategory) {
                    return errorResponse("Subcategory not found");
                }
            }
            if (addonData.variantId) {
                // Check if variant exists
                const variant = await VariantRepository.getVariantById(addonData.variantId.toString());
                if (!variant) {
                    return errorResponse("Variant not found");
                }
            }

            const addon = await AddonRepository.createAddon(addonData);

            // Add addon to subcategory if provided
            if (addonData.subcategoryId && addon.id) {
                await SubCategoryRepository.addAddonToSubCategory(
                    addonData.subcategoryId.toString(),
                    addon.id
                );
            }

            // Add addon to variant if provided
            if (addonData.variantId && addon.id) {
                await VariantRepository.addAddonToVariant(
                    addonData.variantId.toString(),
                    addon.id
                );
            }

            return successResponse("Addon created successfully", addon);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to create addon", error.message);
            }
            return errorResponse("Failed to create addon", "Unknown error");
        }
    }

    /**
     * Get all addons by property ID
     */
    async getAllAddonsByPropertyId(propertyId: string): Promise<IApiResponse> {
        try {

            const addons = await AddonRepository.getAllAddonsByPropertyId(propertyId);
            return successResponse("Addons fetched successfully", addons);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch addons", error.message);
            }
            return errorResponse("Failed to fetch addons", "Unknown error");
        }
    }

    /**
     * Get all active addons by property ID with populated category, subcategory, and variant for booking
     */
    async getAddonsForBooking(propertyId: string): Promise<IApiResponse> {
        try {

            const addons = await AddonRepository.getAddonsWithDetails(propertyId);

            // Filter only active addons
            const activeAddons = addons.filter(addon => addon.isActive);

            return successResponse("Active addons fetched successfully", activeAddons);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch addons for booking", error.message);
            }
            return errorResponse("Failed to fetch addons for booking", "Unknown error");
        }
    }

    /**
     * Get addon by ID
     */
    async getAddonById(addonId: string): Promise<IApiResponse> {
        try {

            const addon = await AddonRepository.getAddonById(addonId);
            if (!addon) {
                return errorResponse("Addon not found", "Addon not found");
            }

            return successResponse("Addon fetched successfully", addon);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch addon", error.message);
            }
            return errorResponse("Failed to fetch addon", "Unknown error");
        }
    }

    /**
     * Update addon
     */
    async updateAddon(addonId: string, updateData: Partial<IAddon>): Promise<IApiResponse> {
        try {

            // Check if addon exists
            const existingAddon = await AddonRepository.getAddonById(addonId);
            if (!existingAddon) {
                    return errorResponse("Addon not found", "Addon not found");
            }

            // Remove deleted images
            if (updateData.images) {
                const oldImages: string[] = existingAddon.images || [];
                const newImages: string[] = updateData.images || [];
                const imagesToDelete = oldImages.filter(img => !newImages.includes(img));
                
                if (imagesToDelete.length > 0) {
                    await Promise.all(imagesToDelete.map(img => deleteFileByUrl(img).catch(err => console.error("Failed to delete addon image:", img, err))));
                }
            }

            // Validate optional references if being updated
            if (updateData.subcategoryId) {
                const subCategory = await SubCategoryRepository.getSubCategoryById(updateData.subcategoryId.toString());
                if (!subCategory) {
                    return errorResponse("Subcategory not found", "Subcategory not found");
                }
            }
            if (updateData.variantId) {
                const variant = await VariantRepository.getVariantById(updateData.variantId.toString());
                if (!variant) {
                    return errorResponse("Variant not found", "Variant not found");
                }
            }


            const updatedAddon = await AddonRepository.updateAddon(addonId, updateData);
            if (!updatedAddon) {
                return errorResponse("Failed to update addon", "Update operation failed");
            }

            return successResponse("Addon updated successfully", updatedAddon);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to update addon", error.message);
            }
            return errorResponse("Failed to update addon", "Unknown error");
        }
    }

    /**
     * Delete addon
     */
    async deleteAddon(addonId: string): Promise<IApiResponse> {
        try {

            const addon = await AddonRepository.deleteAddon(addonId);
            if (!addon) {
                return errorResponse("Addon not found", "Addon not found");
            }

            // Remove addon from subcategory if it was associated
            if (addon.subcategoryId) {
                await SubCategoryRepository.removeAddonFromSubCategory(
                    addon.subcategoryId.toString(),
                    addonId
                );
            }

            // Remove addon from variant if it was associated
            if (addon.variantId) {
                await VariantRepository.removeAddonFromVariant(
                    addon.variantId.toString(),
                    addonId
                );
            }

            return successResponse("Addon deleted successfully", addon);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to delete addon", error.message);
            }
            return errorResponse("Failed to delete addon", "Unknown error");
        }
    }
}
