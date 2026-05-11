import { Router } from 'express';
import { protect } from '../../../middlewares/auth.middleware';
import { checkRoleBased } from '../../../middlewares/checkRole.middleware';
import { attachPropertyDetails } from '../../../middlewares/property.middleware';
import { EarlyBirdPromotionController } from '../controllers';

export const earlyBirdPromotionRouter = Router();
const earlyBirdPromotionController = new EarlyBirdPromotionController();
// Create early-bird promotion
earlyBirdPromotionRouter.route('/').post(
    protect,
    checkRoleBased('canCreateRatePlan'),
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'body',
    }),
    earlyBirdPromotionController.createEarlyBirdPromotion.bind(
        earlyBirdPromotionController
    )
);

// Get all early-bird promotions by property ID
earlyBirdPromotionRouter.route('/property/:propertyId').get(
    protect,
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'params',
    }),
    earlyBirdPromotionController.getEarlyBirdPromotionsByProperty.bind(
        earlyBirdPromotionController
    )
);

// Get, update, delete early-bird promotion by ID
earlyBirdPromotionRouter
    .route('/:promotionId')
    .get(
        protect,
        earlyBirdPromotionController.getEarlyBirdPromotionById.bind(
            earlyBirdPromotionController
        )
    )
    .patch(
        protect,
        checkRoleBased('canUpdateRatePlan'),
        earlyBirdPromotionController.updateEarlyBirdPromotion.bind(
            earlyBirdPromotionController
        )
    )
    .delete(
        protect,
        checkRoleBased('canDeleteRatePlan'),
        earlyBirdPromotionController.deleteEarlyBirdPromotion.bind(
            earlyBirdPromotionController
        )
    );
