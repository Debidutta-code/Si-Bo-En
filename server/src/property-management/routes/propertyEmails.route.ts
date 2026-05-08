import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { PropertyEmailController } from '../controller';

const router = Router();
const propertyEmailController = new PropertyEmailController();
router
    .route('/property/:propertyId')
    .post(
        protect,
        propertyEmailController.createPropertyEmail.bind(
            propertyEmailController
        )
    )
    .get(
        protect,
        propertyEmailController.getPropertyEmails.bind(propertyEmailController)
    );
router
    .route('/:id')
    .delete(
        protect,
        propertyEmailController.deletePropertyEmail.bind(
            propertyEmailController
        )
    )
    .put(
        protect,
        propertyEmailController.updatePropertyEmail.bind(
            propertyEmailController
        )
    );

export { router as propertyEmailRouter };
