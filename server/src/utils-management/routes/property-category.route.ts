import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import {
    checkMultiplePermissions,
    checkRoleBased,
} from '../../middlewares/checkRole.middleware';
import { Category } from '../controllers';
const categoryRouter = Router();
const categoryController = new Category();

categoryRouter
    .route('/get')
    .get(
        protect,
        checkMultiplePermissions(['canCreateHotel', 'canUpdateHotel']),
        categoryController.getCategory.bind(categoryController)
    );

categoryRouter
    .route('/create')
    .post(
        protect,
        checkRoleBased('canCDCategory'),
        categoryController.createCategory.bind(categoryController)
    );

categoryRouter
    .route('/delete/:categoryName')
    .delete(
        protect,
        checkRoleBased('canCDCategory'),
        categoryController.deleteCategory.bind(categoryController)
    );

export { categoryRouter };
