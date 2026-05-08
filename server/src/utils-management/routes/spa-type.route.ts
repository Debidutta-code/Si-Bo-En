import { protect } from '../../middlewares/auth.middleware';
import {
    SpaCategoryController,
    SpaSubCategoryController,
} from '../controllers';
import { Router } from 'express';

const spaTypeRouter = Router();
const spaCategoryRouter = Router();
const spaSubCategoryRouter = Router();
const spaCategoryController = new SpaCategoryController();
const spaSubCategoryController = new SpaSubCategoryController();

spaTypeRouter.use('/category', spaCategoryRouter);
spaTypeRouter.use('/sub-category', spaSubCategoryRouter);

spaCategoryRouter
    .route('/')
    .get(spaCategoryController.getAllSpaCategories.bind(spaCategoryController))
    .post(spaCategoryController.createSpaCategory.bind(spaCategoryController));

spaCategoryRouter
    .route('/:id')
    .put(spaCategoryController.updateSpaCategory.bind(spaCategoryController))
    .delete(
        spaCategoryController.deleteSpaCategory.bind(spaCategoryController)
    );

spaSubCategoryRouter
    .route('/')
    .get(
        spaSubCategoryController.getAllSpaSubCategories.bind(
            spaSubCategoryController
        )
    )
    .post(
        spaSubCategoryController.createSpaSubCategory.bind(
            spaSubCategoryController
        )
    );

spaSubCategoryRouter
    .route('/:id')
    .put(
        spaSubCategoryController.updateSpaSubCategory.bind(
            spaSubCategoryController
        )
    )
    .delete(
        spaSubCategoryController.deleteSubCategory.bind(
            spaSubCategoryController
        )
    );

export { spaTypeRouter };
