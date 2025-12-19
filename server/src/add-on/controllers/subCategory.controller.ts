import { Request, Response } from "express";
import { SubCategoryService } from "../services";
import { generateAddOnSubCategoryCode } from "../utils";
import { successResponse, errorResponse } from "../../utils/return";

export class SubCategoryController {
    private subCategoryService: SubCategoryService;

    constructor() {
        this.subCategoryService = new SubCategoryService();
    }

    /**
     * Create a new subcategory
     */
    createSubCategory = async (req: Request, res: Response) => {
        try {
            let { name, categoryId } = req.body;

            // Generate code from backend if not provided

            const code = await generateAddOnSubCategoryCode();


            const subCategory = await this.subCategoryService.createSubCategory(code, name, categoryId);

            return res.status(subCategory.success ? 201 : 400).json(subCategory);
        } catch (error: any) {

            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to create subcategory", error.message));
            }

            return res.status(500).json(errorResponse("Failed to create subcategory", "Unable to create subcategory at this moment"));
        }
    };

    /**
     * Get all subcategories
     */
    getAllSubCategories = async (req: Request, res: Response) => {
        try {
            const subCategories = await this.subCategoryService.getAllSubCategories();

            return res.status(subCategories.success ? 200 : 400).json(subCategories);
        } catch (error: any) {

            return res.status(500).json(errorResponse("Failed to fetch subcategories", "Unable to fetch subcategories at this moment"));
        }
    };

    /**
     * Get subcategory by ID
     */
    getSubCategoryById = async (req: Request, res: Response) => {
        try {
            const { subcategoryId } = req.params;

            const subCategory = await this.subCategoryService.getSubCategoryById(subcategoryId);

            return res.status(subCategory.success ? 200 : 400).json(subCategory);
        } catch (error: any) {
            console.error("Failed to fetch subcategory at Controller Layer:", error);

            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to fetch subcategory", error.message));
            }

            return res.status(500).json(errorResponse("Failed to fetch subcategory", "Unable to fetch subcategory at this moment"));
        }
    };

    /**
     * Update subcategory
     */
    updateSubCategory = async (req: Request, res: Response) => {
        try {
            const { subcategoryId } = req.params;
            const updateData = req.body;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json(errorResponse("Update payload cannot be empty", "Update payload cannot be empty"));
            }

            const subCategory = await this.subCategoryService.updateSubCategory(subcategoryId, updateData);

            return res.status(subCategory.success ? 200 : 400).json(subCategory);
        } catch (error: any) {
            console.error("Failed to update subcategory at Controller Layer:", error);

            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to update subcategory", error.message));
            }

            return res.status(500).json(errorResponse("Failed to update subcategory", "Unable to update subcategory at this moment"));
        }
    };

    /**
     * Add variant to subcategory
     */
    addVariantToSubCategory = async (req: Request, res: Response) => {
        try {
            const { subcategoryId } = req.params;
            const { variantId } = req.body;

            if (!variantId) {
                return res.status(400).json(errorResponse("Variant ID is required", "Variant ID is required"));
            }

            const subCategory = await this.subCategoryService.addVariantToSubCategory(subcategoryId, variantId);

            return res.status(subCategory.success ? 200 : 400).json(subCategory);
        } catch (error: any) {
            console.error("Failed to add variant to subcategory at Controller Layer:", error);

            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to add variant to subcategory", error.message));
            }

            return res.status(500).json(errorResponse("Failed to add variant to subcategory", "Unable to add variant to subcategory at this moment"));
        }
    };

    /**
     * Add addon to subcategory
     */
    addAddonToSubCategory = async (req: Request, res: Response) => {
        try {
            const { subcategoryId } = req.params;
            const { addonId } = req.body;

            if (!addonId) {
                return res.status(400).json(errorResponse("Addon ID is required", "Addon ID is required"));
            }

            const subCategory = await this.subCategoryService.addAddonToSubCategory(subcategoryId, addonId);

            return res.status(subCategory.success ? 200 : 400).json(subCategory);
        } catch (error: any) {
            console.error("Failed to add addon to subcategory at Controller Layer:", error);

            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to add addon to subcategory", error.message));
            }

            return res.status(500).json(errorResponse("Failed to add addon to subcategory", "Unable to add addon to subcategory at this moment"));
        }
    };

    /**
     * Remove variant from subcategory
     */
    removeVariantFromSubCategory = async (req: Request, res: Response) => {
        try {
            const { subcategoryId, variantId } = req.params;

            const subCategory = await this.subCategoryService.removeVariantFromSubCategory(subcategoryId, variantId);

            return res.status(subCategory.success ? 200 : 400).json(subCategory);
        } catch (error: any) {
            console.error("Failed to remove variant from subcategory at Controller Layer:", error);

            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to remove variant from subcategory", error.message));
            }

            return res.status(500).json(errorResponse("Failed to remove variant from subcategory", "Unable to remove variant from subcategory at this moment"));
        }
    };

    /**
     * Remove addon from subcategory
     */
    removeAddonFromSubCategory = async (req: Request, res: Response) => {
        try {
            const { subcategoryId, addonId } = req.params;

            const subCategory = await this.subCategoryService.removeAddonFromSubCategory(subcategoryId, addonId);

            return res.status(subCategory.success ? 200 : 400).json(subCategory);
        } catch (error: any) {
            console.error("Failed to remove addon from subcategory at Controller Layer:", error);

            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to remove addon from subcategory", error.message));
            }

            return res.status(500).json(errorResponse("Failed to remove addon from subcategory", "Unable to remove addon from subcategory at this moment"));
        }
    };
}
