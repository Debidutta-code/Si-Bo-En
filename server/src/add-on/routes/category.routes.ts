import { Router } from "express";
import { CategoryController } from "../controllers";

const router = Router();
const categoryController = new CategoryController();

router.post(
    "/",
    categoryController.createCategory
);

router.get(
    "/",
    categoryController.getAllCategories
);


router.get(
    "/:categoryId",
    categoryController.getCategoryById
);


router.put(
    "/:categoryId",
    categoryController.updateCategory
);


router.post(
    "/:categoryId/subcategories",
    categoryController.addSubCategoryToCategory
);
router.delete(
    "/:categoryId/subcategories/:subcategoryId",
    categoryController.removeSubCategoryFromCategory
);

export { router as CategoryRoutes };
