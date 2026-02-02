import { Router } from 'express';
import { protect } from '../../../middlewares/auth.middleware';
import { checkRoleBased } from '../../../middlewares/checkRole.middleware';
import { attachPropertyDetails } from '../../../middlewares/property.middleware';
import { OfferForTonightPromotionController } from '../controllers';

export const offerForTonightPromotionRouter = Router();

// Create offer-for-tonight promotion
offerForTonightPromotionRouter
  .route('/')
  .post(
    protect,
    checkRoleBased('canCreateRatePlan'),
    attachPropertyDetails({
      identifierType: 'id',
      key: 'propertyId',
      source: 'body'
    }),
    OfferForTonightPromotionController.createOfferForTonightPromotion
  );

// Get all offer-for-tonight promotions by property ID
offerForTonightPromotionRouter
  .route('/property/:propertyId')
  .get(
    protect,
    attachPropertyDetails({
      identifierType: 'id',
      key: 'propertyId',
      source: 'params'
    }),
    OfferForTonightPromotionController.getOfferForTonightPromotionsByProperty
  );

// Get, update, delete offer-for-tonight promotion by ID
offerForTonightPromotionRouter
  .route('/:promotionId')
  .get(
    protect,
    OfferForTonightPromotionController.getOfferForTonightPromotionById
  )
  .patch(
    protect,
    checkRoleBased('canUpdateRatePlan'),
    OfferForTonightPromotionController.updateOfferForTonightPromotion
  )
  .delete(
    protect,
    checkRoleBased('canDeleteRatePlan'),
    OfferForTonightPromotionController.deleteOfferForTonightPromotion
  );

// Toggle offer-for-tonight promotion status
offerForTonightPromotionRouter
  .route('/:promotionId/toggle-status')
  .patch(
    protect,
    checkRoleBased('canUpdateRatePlan'),
    OfferForTonightPromotionController.toggleOfferForTonightPromotionStatus
  );