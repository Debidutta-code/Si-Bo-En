import { Router } from 'express';
import { protect } from '../../../middlewares/auth.middleware';
import { MLOSController } from '../controllers';
import { checkRoleBased } from '../../../middlewares/checkRole.middleware';

export const mlosRouter = Router();

mlosRouter
.route('/')
  .post(
    protect,
    checkRoleBased('canCreateRatePlan'),
    MLOSController.createRatePlanRule
  );

mlosRouter
  .route('/:ratePlanId')
  .get(
    protect,
    MLOSController.getRatePlanRuleByRatePlanId
  )
  .put(
    protect,
    checkRoleBased('canUpdateRatePlan'),
    MLOSController.updateRatePlanRule
  )
  .delete(
    protect,
    checkRoleBased('canDeleteRatePlan'),
    MLOSController.deleteRatePlanRule
  );
mlosRouter
  .route('/property/:propertyId')
  .get(
    protect,
    MLOSController.getRatePlanRulesByPropertyId
  );