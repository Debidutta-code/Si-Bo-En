import { Router } from 'express';
import { SubCategoryController } from '../controllers';
import { protect } from '../../middlewares/auth.middleware';
import { attachPropertyDetails } from '../../middlewares/property.middleware';

const subcategoryRouter = Router();
const subCategoryController = new SubCategoryController();
subcategoryRouter.use(protect);
subcategoryRouter.route("/")
    .post(attachPropertyDetails({
        identifierType: "id",
        key: "id",
        source: "query"
    }), subCategoryController.createSubCategory.bind(subCategoryController))
    .get(subCategoryController.getAllSubCategories.bind(subCategoryController));

subcategoryRouter.route('/:subcategoryId')
    .get(subCategoryController.getSubCategoryById.bind(subCategoryController))
    .put(subCategoryController.updateSubCategory.bind(subCategoryController))
    .delete(subCategoryController.deleteSubCategory.bind(subCategoryController));

export { subcategoryRouter };
