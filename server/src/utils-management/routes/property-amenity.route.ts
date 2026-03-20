import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { checkMultiplePermissions, checkRoleBased } from '../../middlewares/checkRole.middleware';
import { AminityController } from '../controllers';
const aminityRouter = Router();
const propertyAminityController = new AminityController();

aminityRouter
    .route('/get')
    .get(
        protect,
        checkMultiplePermissions(['canCreateHotel', 'canUpdateHotel']),
        propertyAminityController.getAmenities.bind(propertyAminityController)
    );

aminityRouter
    .route('/create')
    .post(
        protect,
        checkRoleBased('canCDAmenity'),
        propertyAminityController.createAminity.bind(propertyAminityController)
    );

aminityRouter
    .route('/update')
    .patch(
        protect,
        checkRoleBased('canCDAmenity'),
        propertyAminityController.deleteAmenities.bind(propertyAminityController)
    );

    export { aminityRouter };

