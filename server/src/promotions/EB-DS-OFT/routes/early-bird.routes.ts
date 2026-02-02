import { Router } from 'express';
import { protect } from '../../../middlewares/auth.middleware';
import { checkRoleBased } from '../../../middlewares/checkRole.middleware';
import { attachPropertyDetails } from '../../../middlewares/property.middleware';
import { EarlyBirdPromotionController } from '../controllers';

export const earlyBirdPromotionRouter = Router();

// Create early-bird promotion
earlyBirdPromotionRouter
  .route('/')
  .post(
    protect,
    checkRoleBased('canCreateRatePlan'),
    attachPropertyDetails({
      identifierType: 'id',
      key: 'propertyId',
      source: 'body'
    }),
    EarlyBirdPromotionController.createEarlyBirdPromotion
  );

// Get all early-bird promotions by property ID
earlyBirdPromotionRouter
  .route('/property/:propertyId')
  .get(
    protect,
    attachPropertyDetails({
      identifierType: 'id',
      key: 'propertyId',
      source: 'params'
    }),
    EarlyBirdPromotionController.getEarlyBirdPromotionsByProperty
  );

// Get, update, delete early-bird promotion by ID
earlyBirdPromotionRouter
  .route('/:promotionId')
  .get(
    protect,
    EarlyBirdPromotionController.getEarlyBirdPromotionById
  )
  .patch(
    protect,
    checkRoleBased('canUpdateRatePlan'),
    EarlyBirdPromotionController.updateEarlyBirdPromotion
  )
  .delete(
    protect,
    checkRoleBased('canDeleteRatePlan'),
    EarlyBirdPromotionController.deleteEarlyBirdPromotion
  );

// Toggle early-bird promotion status
earlyBirdPromotionRouter
  .route('/:promotionId/toggle-status')
  .patch(
    protect,
    checkRoleBased('canUpdateRatePlan'),
    EarlyBirdPromotionController.toggleEarlyBirdPromotionStatus
  );