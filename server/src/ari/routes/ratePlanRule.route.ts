import { Router } from 'express';
import { RatePlanRuleController } from '../controllers';
import { protect } from '../../middlewares/auth.middleware';
import { checkRoleBased } from '../../middlewares/checkRole.middleware';

export const ratePlanRuleRouter = Router();

ratePlanRuleRouter
  .route('/')
  .post(
    protect,
    checkRoleBased('canCreateRatePlan'),
    RatePlanRuleController.createRatePlanRule
  );

ratePlanRuleRouter
  .route('/:ratePlanId')
  .get(
    protect,
    RatePlanRuleController.getRatePlanRuleByRatePlanId
  )
  .put(
    protect,
    checkRoleBased('canUpdateRatePlan'),
    RatePlanRuleController.updateRatePlanRule
  )
  .delete(
    protect,
    checkRoleBased('canDeleteRatePlan'),
    RatePlanRuleController.deleteRatePlanRule
  );
