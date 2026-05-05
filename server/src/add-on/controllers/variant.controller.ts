import { Request, Response } from "express";
import { VariantService } from "../services";
import {  generateAddOnVariantCode } from "../utils";
import { successResponse,errorResponse } from "../../utils/return";

export class VariantController {
    private variantService: VariantService;

    constructor() {
        this.variantService = new VariantService();
    }

    /**
     * Create a new variant
     */
    createVariant = async (req: Request, res: Response) => {
        try {
            let {  name, subcategoryId } = req.body;

            // Generate code from backend if not provided
            
            const code = await generateAddOnVariantCode();

            const variant = await this.variantService.createVariant(code, name, subcategoryId);

                return res.status(variant.success ? 201 : 400).json(variant);
        } catch (error: any) {
            console.error("Failed to create variant at Controller Layer:", error);

            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to create variant", error.message));
            }

            return res.status(500).json(errorResponse("Failed to create variant", "Unable to create variant at this moment"));
        }
    };

    /**
     * Get all variants
     */
    getAllVariants = async (req: Request, res: Response) => {
        try {
            const variants = await this.variantService.getAllVariants();

            return res.status(variants.success ? 200 : 400).json(variants);
        } catch (error: any) {
            console.error("Failed to fetch variants at Controller Layer:", error);

            return res.status(500).json(errorResponse("Failed to fetch variants", "Unable to fetch variants at this moment"));
        }
    };

    /**
     * Get variant by ID
     */
    getVariantById = async (req: Request, res: Response) => {
        try {
            const { variantId } = req.params;

            const variant = await this.variantService.getVariantById(variantId);

            return res.status(variant.success ? 200 : 400).json(variant);
        } catch (error: any) {
            console.error("Failed to fetch variant at Controller Layer:", error);

            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to fetch variant", error.message));
            }

            return res.status(500).json(errorResponse("Failed to fetch variant", "Unable to fetch variant at this moment"));
        }
    };

    /**
     * Get variants by subcategory ID
     */
    getVariantsBySubCategoryId = async (req: Request, res: Response) => {
        try {
            const { subcategoryId } = req.params;

            const variants = await this.variantService.getVariantsBySubCategoryId(subcategoryId);

            return res.status(variants.success ? 200 : 400).json(variants);
        } catch (error: any) {
            console.error("Failed to fetch variants by subcategory at Controller Layer:", error);

            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to fetch variants by subcategory", error.message));
            }

            return res.status(500).json(errorResponse("Failed to fetch variants by subcategory", "Unable to fetch variants at this moment"));
        }
    };

    /**
     * Update variant
     */
    updateVariant = async (req: Request, res: Response) => {
        try {
            const { variantId } = req.params;
            const updateData = req.body;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json(errorResponse("Update payload cannot be empty", "Update payload cannot be empty"));
            }

            const variant = await this.variantService.updateVariant(variantId, updateData);

            return res.status(variant.success ? 200 : 400).json(variant);
        } catch (error: any) {
            console.error("Failed to update variant at Controller Layer:", error);

            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to update variant", error.message));
            }

            return res.status(500).json(errorResponse("Failed to update variant", "Unable to update variant at this moment"));
        }
    };

    /**
     * Delete variant
     */
    deleteVariant = async (req: Request, res: Response) => {
        try {
            const { variantId } = req.params;

            const variant = await this.variantService.deleteVariant(variantId);

            return res.status(variant.success ? 200 : 400).json(variant);
        } catch (error: any) {
            console.error("Failed to delete variant at Controller Layer:", error);

            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to delete variant", error.message));
            }

            return res.status(500).json(errorResponse("Failed to delete variant", "Unable to delete variant at this moment"));
        }
    };

    /**
     * Add addon to variant
     */
    addAddonToVariant = async (req: Request, res: Response) => {
        try {
            const { variantId } = req.params;
            const { addonId } = req.body;

            if (!addonId) {
                return res.status(400).json(errorResponse("Addon ID is required", "Addon ID is required"));
            }

            const variant = await this.variantService.addAddonToVariant(variantId, addonId);

            return res.status(variant.success ? 200 : 400).json(variant);
        } catch (error: any) {
            console.error("Failed to add addon to variant at Controller Layer:", error);

            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to add addon to variant", error.message));
            }

            return res.status(500).json(errorResponse("Failed to add addon to variant", "Unable to add addon to variant at this moment"));
        }
    };

    /**
     * Remove addon from variant
     */
    removeAddonFromVariant = async (req: Request, res: Response) => {
        try {
            const { variantId, addonId } = req.params;

            const variant = await this.variantService.removeAddonFromVariant(variantId, addonId);

            return res.status(variant.success ? 200 : 400).json(variant);
        } catch (error: any) {
            console.error("Failed to remove addon from variant at Controller Layer:", error);

            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to remove addon from variant", error.message));
            }

            return res.status(500).json(errorResponse("Failed to remove addon from variant", "Unable to remove addon from variant at this moment"));
        }
    };
}
