import { Router } from 'express';
import { protect } from '../../../middlewares/auth.middleware';
import { checkRoleBased } from '../../../middlewares/checkRole.middleware';
import { attachPropertyDetails } from '../../../middlewares/property.middleware';
import { OfferForTonightPromotionController } from '../controllers';

export const offerForTonightPromotionRouter = Router();
const offerForTonightController = new OfferForTonightPromotionController();
// Create offer-for-tonight promotion
offerForTonightPromotionRouter.route('/').post(
    protect,
    checkRoleBased('canCreateRatePlan'),
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'body',
    }),
    offerForTonightController.createOfferForTonightPromotion.bind(
        offerForTonightController
    )
);

// Get all offer-for-tonight promotions by property ID
offerForTonightPromotionRouter.route('/property/:propertyId').get(
    protect,
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'params',
    }),
    offerForTonightController.getOfferForTonightPromotionsByProperty.bind(
        offerForTonightController
    )
);

// Get, update, delete offer-for-tonight promotion by ID
offerForTonightPromotionRouter
    .route('/:promotionId')
    .get(
        protect,
        offerForTonightController.getOfferForTonightPromotionById.bind(
            offerForTonightController
        )
    )
    .patch(
        protect,
        checkRoleBased('canUpdateRatePlan'),
        offerForTonightController.updateOfferForTonightPromotion.bind(
            offerForTonightController
        )
    )
    .delete(
        protect,
        checkRoleBased('canDeleteRatePlan'),
        offerForTonightController.deleteOfferForTonightPromotion.bind(
            offerForTonightController
        )
    );
