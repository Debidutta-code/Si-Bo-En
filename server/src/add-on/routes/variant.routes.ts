import { Router } from "express";
import { VariantController } from "../controllers";

const router = Router();
const variantController = new VariantController();

/**
 * @route   POST /api/addon/variants
 * @desc    Create a new variant
 * @access  Private
 */
router.post(
    "/",
    // validateRequest(validateCreateVariant),
    variantController.createVariant
);

/**
 * @route   GET /api/addon/variants
 * @desc    Get all variants
 * @access  Public
 */
router.get(
    "/",
    variantController.getAllVariants
);

/**
 * @route   GET /api/addon/variants/:variantId
 * @desc    Get variant by ID
 * @access  Public
 */
router.get(
    "/:variantId",
    variantController.getVariantById
);

/**
 * @route   GET /api/addon/variants/subcategory/:subcategoryId
 * @desc    Get variants by subcategory ID
 * @access  Public
 */
router.get(
    "/subcategory/:subcategoryId",
    variantController.getVariantsBySubCategoryId
);

/**
 * @route   PUT /api/addon/variants/:variantId
 * @desc    Update variant
 * @access  Private
 */
router.put(
    "/:variantId",
    // validateRequest(validateUpdateVariant),
    variantController.updateVariant
);

/**
 * @route   DELETE /api/addon/variants/:variantId
 * @desc    Delete variant
 * @access  Private
 */
router.delete(
    "/:variantId",
    variantController.deleteVariant
);

/**
 * @route   POST /api/addon/variants/:variantId/addons
 * @desc    Add addon to variant
 * @access  Private
 */
router.post(
    "/:variantId/addons",
    variantController.addAddonToVariant
);

/**
 * @route   DELETE /api/addon/variants/:variantId/addons/:addonId
 * @desc    Remove addon from variant
 * @access  Private
 */
router.delete(
    "/:variantId/addons/:addonId",
    variantController.removeAddonFromVariant
);

export { router as VariantRoutes };
