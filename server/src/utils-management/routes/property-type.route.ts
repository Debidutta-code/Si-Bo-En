import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import {
    checkMultiplePermissions,
    checkRoleBased,
} from '../../middlewares/checkRole.middleware';
import { PropertyType } from '../controllers';
const propertyTypeController = new PropertyType();
const propertyTypeRouter = Router();

propertyTypeRouter
    .route('/get')
    .get(
        protect,
        checkMultiplePermissions(['canCreateHotel', 'canUpdateHotel']),
        propertyTypeController.getPropertyTypeController.bind(
            propertyTypeController
        )
    );

propertyTypeRouter
    .route('/create')
    .post(
        protect,
        checkRoleBased('canCDPropertyType'),
        propertyTypeController.createPropertyTypeController.bind(
            propertyTypeController
        )
    );

propertyTypeRouter
    .route('/delete/:propertyTypeName')
    .delete(
        protect,
        checkRoleBased('canCDPropertyType'),
        propertyTypeController.deletePropertyTypeController.bind(
            propertyTypeController
        )
    );

export { propertyTypeRouter };
