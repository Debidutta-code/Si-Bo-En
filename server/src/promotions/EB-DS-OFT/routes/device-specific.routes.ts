import { Router } from 'express';
import { protect } from '../../../middlewares/auth.middleware';
import { checkRoleBased } from '../../../middlewares/checkRole.middleware';
import { attachPropertyDetails } from '../../../middlewares/property.middleware';
import { DeviceSpecificPromotionController } from '../controllers';

export const deviceSpecificPromotionRouter = Router();

// Create device-specific promotion
deviceSpecificPromotionRouter
  .route('/')
  .post(
    protect,
    checkRoleBased('canCreateRatePlan'),
    attachPropertyDetails({
      identifierType: 'id',
      key: 'propertyId',
      source: 'body'
    }),
    DeviceSpecificPromotionController.createDeviceSpecificPromotion
  );

// Get all device-specific promotions by property ID
deviceSpecificPromotionRouter
  .route('/property/:propertyId')
  .get(
    protect,
    attachPropertyDetails({
      identifierType: 'id',
      key: 'propertyId',
      source: 'params'
    }),
    DeviceSpecificPromotionController.getDeviceSpecificPromotionsByProperty
  );

// Get, update, delete device-specific promotion by ID
deviceSpecificPromotionRouter
  .route('/:promotionId')
  .get(
    protect,
    DeviceSpecificPromotionController.getDeviceSpecificPromotionById
  )
  .patch(
    protect,
    checkRoleBased('canUpdateRatePlan'),
    DeviceSpecificPromotionController.updateDeviceSpecificPromotion
  )
  .delete(
    protect,
    checkRoleBased('canDeleteRatePlan'),
    DeviceSpecificPromotionController.deleteDeviceSpecificPromotion
  );

// Toggle device-specific promotion status
deviceSpecificPromotionRouter
  .route('/:promotionId/toggle-status')
  .patch(
    protect,
    checkRoleBased('canUpdateRatePlan'),
    DeviceSpecificPromotionController.toggleDeviceSpecificPromotionStatus
  );