import { Router } from "express";
import { CategoryController } from "../controllers";

const router = Router();
const categoryController = new CategoryController();

/**
 * @route   POST /api/addon/categories
 * @desc    Create a new category
 * @access  Private
 */
router.post(
    "/",
    // validateRequest(validateCreateCategory),
    categoryController.createCategory
);

/**
 * @route   GET /api/addon/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get(
    "/",
    categoryController.getAllCategories
);

/**
 * @route   GET /api/addon/categories/:categoryId
 * @desc    Get category by ID
 * @access  Public
 */
router.get(
    "/:categoryId",
    categoryController.getCategoryById
);

/**
 * @route   PUT /api/addon/categories/:categoryId
 * @desc    Update category
 * @access  Private
 */
router.put(
    "/:categoryId",
    // validateRequest(validateUpdateCategory),
    categoryController.updateCategory
);

/**
 * @route   POST /api/addon/categories/:categoryId/subcategories
 * @desc    Add subcategory to category
 * @access  Private
 */
router.post(
    "/:categoryId/subcategories",
    categoryController.addSubCategoryToCategory
);

/**
 * @route   DELETE /api/addon/categories/:categoryId/subcategories/:subcategoryId
 * @desc    Remove subcategory from category
 * @access  Private
 */
router.delete(
    "/:categoryId/subcategories/:subcategoryId",
    categoryController.removeSubCategoryFromCategory
);

export { router as CategoryRoutes };
