import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { checkRoleBased } from '../../middlewares/checkRole.middleware';
import { RatePlanWithAddonController } from '../controllers';

export const ratePlanWithAddonRouter = Router();

ratePlanWithAddonRouter.post(
  '/',
  protect,
  checkRoleBased('canUpdateRatePlan'),
  RatePlanWithAddonController.addAddonToRatePlan
);

ratePlanWithAddonRouter.delete(
  '/',
  protect,
  checkRoleBased('canUpdateRatePlan'),
  RatePlanWithAddonController.removeAddonFromRatePlan
);

ratePlanWithAddonRouter.get(
  '/:ratePlanCode',
  protect,
  RatePlanWithAddonController.getAddonsByRatePlanCode
);
ratePlanWithAddonRouter.get(
  '/:addonId',
  protect,
  RatePlanWithAddonController.getRatePlansByAddonId
);

export default ratePlanWithAddonRouter;