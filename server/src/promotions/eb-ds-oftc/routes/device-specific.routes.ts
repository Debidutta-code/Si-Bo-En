import { Router } from 'express';
import { protect } from '../../../middlewares/auth.middleware';
import { checkRoleBased } from '../../../middlewares/checkRole.middleware';
import { attachPropertyDetails } from '../../../middlewares/property.middleware';
import { DeviceSpecificPromotionController } from '../controllers';

export const deviceSpecificPromotionRouter = Router();
const deviceSpecificPromotionController = new DeviceSpecificPromotionController();
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
    deviceSpecificPromotionController.createDeviceSpecificPromotion.bind(deviceSpecificPromotionController)
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
    deviceSpecificPromotionController.getDeviceSpecificPromotionsByProperty.bind(deviceSpecificPromotionController)
  );

// Get, update, delete device-specific promotion by ID
deviceSpecificPromotionRouter
  .route('/:promotionId')
  .get(
    protect,
    deviceSpecificPromotionController.getDeviceSpecificPromotionById.bind(deviceSpecificPromotionController)
  )
  .patch(
    protect,
    checkRoleBased('canUpdateRatePlan'),
    deviceSpecificPromotionController.updateDeviceSpecificPromotion.bind(deviceSpecificPromotionController)
  )
  .delete(
    protect,
    checkRoleBased('canDeleteRatePlan'),
    deviceSpecificPromotionController.deleteDeviceSpecificPromotion.bind(deviceSpecificPromotionController)
  );

