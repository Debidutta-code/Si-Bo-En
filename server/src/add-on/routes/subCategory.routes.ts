import { Router } from 'express';
import { SubCategoryController } from '../controllers';

const router = Router();
const subCategoryController = new SubCategoryController();

router.post('/', subCategoryController.createSubCategory);

router.get('/', subCategoryController.getAllSubCategories);

router.get('/:subcategoryId', subCategoryController.getSubCategoryById);

router.put('/:subcategoryId', subCategoryController.updateSubCategory);

router.post(
    '/:subcategoryId/variants',
    subCategoryController.addVariantToSubCategory
);

router.post(
    '/:subcategoryId/addons',
    subCategoryController.addAddonToSubCategory
);

router.delete(
    '/:subcategoryId/variants/:variantId',
    subCategoryController.removeVariantFromSubCategory
);

router.delete(
    '/:subcategoryId/addons/:addonId',
    subCategoryController.removeAddonFromSubCategory
);

export { router as SubCategoryRoutes };
