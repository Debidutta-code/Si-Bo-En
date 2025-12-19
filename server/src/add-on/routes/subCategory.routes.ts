import { Router } from "express";
import { SubCategoryController } from "../controllers";

const router = Router();
const subCategoryController = new SubCategoryController();

/**
 * @route   POST /api/addon/subcategories
 * @desc    Create a new subcategory
 * @access  Private
 */
router.post(
    "/",
    // validateRequest(validateCreateSubCategory),
    subCategoryController.createSubCategory
);

/**
 * @route   GET /api/addon/subcategories
 * @desc    Get all subcategories
 * @access  Public
 */
router.get(
    "/",
    subCategoryController.getAllSubCategories
);

/**
 * @route   GET /api/addon/subcategories/:subcategoryId
 * @desc    Get subcategory by ID
 * @access  Public
 */
router.get(
    "/:subcategoryId",
    subCategoryController.getSubCategoryById
);

/**
 * @route   PUT /api/addon/subcategories/:subcategoryId
 * @desc    Update subcategory
 * @access  Private
 */
router.put(
    "/:subcategoryId",
    // validateRequest(validateUpdateSubCategory),
    subCategoryController.updateSubCategory
);

/**
 * @route   POST /api/addon/subcategories/:subcategoryId/variants
 * @desc    Add variant to subcategory
 * @access  Private
 */
router.post(
    "/:subcategoryId/variants",
    subCategoryController.addVariantToSubCategory
);

/**
 * @route   POST /api/addon/subcategories/:subcategoryId/addons
 * @desc    Add addon to subcategory
 * @access  Private
 */
router.post(
    "/:subcategoryId/addons",
    subCategoryController.addAddonToSubCategory
);

/**
 * @route   DELETE /api/addon/subcategories/:subcategoryId/variants/:variantId
 * @desc    Remove variant from subcategory
 * @access  Private
 */
router.delete(
    "/:subcategoryId/variants/:variantId",
    subCategoryController.removeVariantFromSubCategory
);

/**
 * @route   DELETE /api/addon/subcategories/:subcategoryId/addons/:addonId
 * @desc    Remove addon from subcategory
 * @access  Private
 */
router.delete(
    "/:subcategoryId/addons/:addonId",
    subCategoryController.removeAddonFromSubCategory
);

export { router as SubCategoryRoutes };
