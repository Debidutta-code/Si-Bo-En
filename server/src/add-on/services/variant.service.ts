import VariantRepository from "../repository/variant.repository";
import SubCategoryRepository from "../repository/subCategory.repository";
import { IAddonVariant } from "../interfaces";
import { successResponse,errorResponse } from "../../utils/return";
import {IApiResponse} from "../../utils/return.types"

export class VariantService {
    /**
     * Create a new addon variant
     */
    async createVariant(code: string, name: string, subcategoryId: string): Promise<IApiResponse> {
        try {

            // Check if subcategory exists
            const subCategory = await SubCategoryRepository.getSubCategoryById(subcategoryId);
            if (!subCategory) {
                return errorResponse("Subcategory not found", "Subcategory not found");
            }

            // Check if variant with same code already exists
            const existingVariants = await VariantRepository.getAllVariants();
            const exists = existingVariants.some(variant => variant.code === code);

            if (exists) {
                return errorResponse("Variant with this code already exists", "Variant with this code already exists");
            }

            const variant = await VariantRepository.createVariant(
                code,
                name,
                subcategoryId
            );

            // Add variant to subcategory
            await SubCategoryRepository.addVariantToSubCategory(
                subcategoryId, variant.id!
            );

            return successResponse("Variant created successfully", variant);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to create variant", error.message);
            }
            return errorResponse("Failed to create variant", "Unknown error");
        }
    }

    /**
     * Get all variants
     */
    async getAllVariants(): Promise<IApiResponse> {
        try {
            const variants = await VariantRepository.getAllVariants();
            return successResponse("Variants fetched successfully", variants);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch variants", error.message);
            }
            return errorResponse("Failed to fetch variants", "Unknown error");
        }
    }

    /**
     * Get variant by ID
     */
    async getVariantById(variantId: string): Promise<IApiResponse> {
        try {

            const variant = await VariantRepository.getVariantById(variantId);
            if (!variant) {
                return errorResponse("Variant not found", "Variant not found");
            }

            return successResponse("Variant fetched successfully", variant);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch variant", error.message);
            }
            return errorResponse("Failed to fetch variant", "Unknown error");
        }
    }
    /**
     * Get variants by subcategory ID
     */
    async getVariantsBySubCategoryId(subcategoryId: string): Promise<IApiResponse> {
        try{
            const variants = await VariantRepository.getVariantsBySubCategoryId(subcategoryId);
            return successResponse("Variants fetched successfully", variants);  
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch variants by subcategory", error.message);
            }
            return errorResponse("Failed to fetch variants by subcategory", "Unknown error");
        }
    }

    /**
     * Update variant
     */
    async updateVariant(variantId: string, updateData: Partial<IAddonVariant>): Promise<IApiResponse> {
        try {

            // Check if variant exists
            const existingVariant = await VariantRepository.getVariantById(variantId);
            if (!existingVariant) {
                return errorResponse("Variant not found", "Variant not found");
            }

            // If updating code, check for duplicates
            if (updateData.code && updateData.code !== existingVariant.code) {
                const allVariants = await VariantRepository.getAllVariants();
                const codeExists = allVariants.some(
                    variant => variant.code === updateData.code && variant.id?.toString() !== variantId
                );

                if (codeExists) {
                    return errorResponse("Variant with this code already exists", "Variant with this code already exists");
                }
            }

            // If updating subcategoryId, validate it exists
            if (updateData.subcategoryId) {
                const subCategory = await SubCategoryRepository.getSubCategoryById(updateData.subcategoryId.toString());
                if (!subCategory) {
                    return errorResponse("Subcategory not found", "Subcategory not found");
                }
            }

            const updatedVariant = await VariantRepository.updateVariant(variantId, updateData);
            if (!updatedVariant) {
                return errorResponse("Failed to update variant", "Failed to update variant");
            }

            return successResponse("Variant updated successfully", updatedVariant);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to update variant", error.message);
            }
            return errorResponse("Failed to update variant", "Unknown error");
        }
    }   

    /**
     * Delete variant
     */
    async deleteVariant(variantId: string): Promise<IApiResponse> {
        try {

            const variant = await VariantRepository.deleteVariant(variantId);
            if (!variant) {
                return errorResponse("Variant not found", "Variant not found"   );
            }

            // Remove variant from subcategory
            await SubCategoryRepository.removeVariantFromSubCategory(
                variant.subcategoryId.toString(),
                variantId
            );

            return successResponse("Variant deleted successfully", variant);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to delete variant", error.message);
            }
            return errorResponse("Failed to delete variant", "Unknown error");
        }
    }

    /**
     * Add addon to variant
     */
    async addAddonToVariant(variantId: string, addonId: string): Promise<IApiResponse> {
        try {

            const variant = await VariantRepository.addAddonToVariant(
                variantId,
                addonId
            );

            if (!variant) {
                return errorResponse("Failed to add addon to variant", "Failed to add addon to variant");
            }

            return successResponse("Addon added to variant successfully", variant);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to add addon to variant", error.message);
            }
            return errorResponse("Failed to add addon to variant", "Unknown error");
        }
    }

    /**
     * Remove addon from variant
     */
    async removeAddonFromVariant(variantId: string, addonId: string): Promise<IApiResponse> {
        try {

            const variant = await VariantRepository.removeAddonFromVariant(
                variantId,
                addonId
            );

            if (!variant) {
                return errorResponse("Failed to remove addon from variant", "Failed to remove addon from variant");
            }

            return successResponse("Addon removed from variant successfully", variant);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to remove addon from variant", error.message);
            }
            return errorResponse("Failed to remove addon from variant", "Unknown error");
        }
    }
}
