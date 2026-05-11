import { Router } from 'express';
import { CategoryController } from '../controllers';
import { attachPropertyDetails } from '../../middlewares/property.middleware';
import { protect } from '../../middlewares/auth.middleware';
const categoryRouter = Router();
const categoryController = new CategoryController();

categoryRouter.use(protect);
categoryRouter.route("/")
    .post(attachPropertyDetails({
        identifierType:"id",
        key:"id",
        source:"query"
    }),categoryController.createCategory.bind(categoryController))
    .get(categoryController.getAllCategories.bind(categoryController));

categoryRouter.route('/:categoryId')
    .get(categoryController.getCategoryById.bind(categoryController))
    .put(categoryController.updateCategory.bind(categoryController))
    .delete(categoryController.deleteCategory.bind(categoryController));


export { categoryRouter };
