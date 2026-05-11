import { Router } from 'express';
import { attachPropertyDetails } from '../../../middlewares/property.middleware';
import { protect } from '../../../middlewares/auth.middleware';
import { CustomizableDealController } from '../controllers';

const customizableDealRouter = Router();
const customizableDealController = new CustomizableDealController();

// Create customizable deal
customizableDealRouter.route('/').post(
    protect,
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'body',
    }),
    customizableDealController.createCustomizableDealController.bind(
        customizableDealController
    )
);

// Get all customizable deals for a property
customizableDealRouter.route('/property/:propertyId').get(
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'params',
    }),
    customizableDealController.getCustomizableDealsByPropertyController.bind(
        customizableDealController
    )
);

// Get, Update, Delete specific customizable deal
customizableDealRouter
    .route('/:dealId')
    .get(
        protect,
        customizableDealController.getCustomizableDealByIdController.bind(
            customizableDealController
        )
    )
    .put(
        protect,
        attachPropertyDetails({
            identifierType: 'id',
            key: 'propertyId',
            source: 'body',
        }),
        customizableDealController.updateCustomizableDealController.bind(
            customizableDealController
        )
    )
    .delete(
        protect,
        attachPropertyDetails({
            identifierType: 'id',
            key: 'propertyId',
            source: 'body',
        }),
        customizableDealController.deleteCustomizableDealController.bind(
            customizableDealController
        )
    );

export default customizableDealRouter;
