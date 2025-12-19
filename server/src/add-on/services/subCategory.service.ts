import SubCategoryRepository from "../repository/subCategory.repository";
import CategoryAddonRepository from "../repository/categoryAddon.repository";
import { IAddonSubCategory } from "../interfaces";
import { successResponse,errorResponse } from "../../utils/return";
import { IApiResponse } from "../../utils/return.types";
export class SubCategoryService {
    /**
     * Create a new addon subcategory
     */
    async createSubCategory(code: string, name: string, categoryId: string): Promise<IApiResponse> {
        try {

            // Check if category exists
            const category = await CategoryAddonRepository.getCategoryById(categoryId);
            if (!category) {
                return errorResponse("Category not found", "Category not found");
            }

            // Check if subcategory with same code already exists
            const existingSubCategories = await SubCategoryRepository.getAllSubCategories();
            const exists = existingSubCategories.some(subCat => subCat.code === code);

            if (exists) {
                return errorResponse("Subcategory with this code already exists", "Subcategory with this code already exists");
            }

            const subCategory = await SubCategoryRepository.createSubCategory(
                code,
                name,
                categoryId
            );
            if (!subCategory.id) {
                return errorResponse("Failed to create subcategory", "Failed to create subcategory");
            }
            // Add subcategory to category
            await CategoryAddonRepository.addSubCategoryToCategory(categoryId, subCategory.id);

            return successResponse("Subcategory created successfully", subCategory);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to create subcategory", error.message);
            }
            return errorResponse("Failed to create subcategory", "Unknown error");
        }
    }

    /**
     * Get all subcategories
     */
    async getAllSubCategories(): Promise<IApiResponse> {
        try {
            const subCategories = await SubCategoryRepository.getAllSubCategories();
            return successResponse("Subcategories fetched successfully", subCategories);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch subcategories", error.message);
            }
            return errorResponse("Failed to fetch subcategories", "Unknown error");
        }
    }

    /**
     * Get subcategory by ID
     */
    async getSubCategoryById(subCategoryId: string): Promise<IApiResponse> {
        try {

            const subCategory = await SubCategoryRepository.getSubCategoryById(subCategoryId);
            if (!subCategory) {
                return errorResponse("Subcategory not found", "Subcategory not found");
            }
            
            return successResponse("Subcategory fetched successfully", subCategory);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch subcategory", error.message);
            }
            return errorResponse("Failed to fetch subcategory", "Unknown error");
        }
    }

    /**
     * Update subcategory
     */
    async updateSubCategory(subCategoryId: string, updateData: Partial<IAddonSubCategory>): Promise<IApiResponse> {
        try {

            // Check if subcategory exists
            const existingSubCategory = await SubCategoryRepository.getSubCategoryById(subCategoryId);
            if (!existingSubCategory) {
                return errorResponse("Subcategory not found", "Subcategory not found");
            }

            // If updating code, check for duplicates
            if (updateData.code && updateData.code !== existingSubCategory.code) {
                const allSubCategories = await SubCategoryRepository.getAllSubCategories();
                const codeExists = allSubCategories.some(
                    subCat => subCat.code === updateData.code && subCat.id !== subCategoryId
                );

                if (codeExists) {
                    return errorResponse("Subcategory with this code already exists", "Subcategory with this code already exists");
                }
            }

            // If updating categoryId, validate it exists
            if (updateData.categoryId) {
                const category = await CategoryAddonRepository.getCategoryById(updateData.categoryId.toString());
                if (!category) {
                    return errorResponse("Category not found", "Category not found");
                }
            }

            const updatedSubCategory = await SubCategoryRepository.updateSubCategory(subCategoryId, updateData);
            if (!updatedSubCategory) {
                return errorResponse("Failed to update subcategory", "Failed to update subcategory");
            }

            return successResponse("Subcategory updated successfully", updatedSubCategory);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to update subcategory", error.message);
            }
            return errorResponse("Failed to update subcategory", "Unknown error");
        }
    }

    /**
     * Add variant to subcategory
     */
    async addVariantToSubCategory(subCategoryId: string, variantId: string): Promise<IApiResponse> {
        try {

            const subCategory = await SubCategoryRepository.addVariantToSubCategory(
                subCategoryId,
                variantId
            );

            if (!subCategory) {
                return errorResponse("Failed to add variant to subcategory", "Failed to add variant to subcategory");
            }

            return successResponse("Variant added to subcategory successfully", subCategory);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to add variant to subcategory", error.message);
            }
            return errorResponse("Failed to add variant to subcategory", "Unknown error");
        }
    }

    /**
     * Add addon to subcategory
     */
    async addAddonToSubCategory(subCategoryId: string, addonId: string): Promise<IApiResponse> {
        try {

            const subCategory = await SubCategoryRepository.addAddonToSubCategory(
                subCategoryId,
                addonId
            );

            if (!subCategory) {
                return errorResponse("Failed to add addon to subcategory", "Failed to add addon to subcategory");
            }

            return successResponse("Addon added to subcategory successfully", subCategory);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to add addon to subcategory", error.message);
            }
            return errorResponse("Failed to add addon to subcategory", "Unknown error");
        }
    }

    /**
     * Remove variant from subcategory
     */
    async removeVariantFromSubCategory(subCategoryId: string, variantId: string): Promise<IApiResponse> {
        try {

            const subCategory = await SubCategoryRepository.removeVariantFromSubCategory(
                subCategoryId,
                variantId
            );

            if (!subCategory) {
                return errorResponse("Failed to remove variant from subcategory", "Failed to remove variant from subcategory");
            }

            return successResponse("Variant removed from subcategory successfully", subCategory);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to remove variant from subcategory", error.message);
            }
            return errorResponse("Failed to remove variant from subcategory", "Unknown error");
        }
    }

    /**
     * Remove addon from subcategory
     */
    async removeAddonFromSubCategory(subCategoryId: string, addonId: string): Promise<IApiResponse> {
        try {

            const subCategory = await SubCategoryRepository.removeAddonFromSubCategory(
                subCategoryId,
                addonId
            );

            if (!subCategory) {
                return errorResponse("Failed to remove addon from subcategory", "Failed to remove addon from subcategory");
            }

            return successResponse("Addon removed from subcategory successfully", subCategory);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse("Failed to remove addon from subcategory", error.message);
            }
            return errorResponse("Failed to remove addon from subcategory", "Unknown error");
        }
    }
}
