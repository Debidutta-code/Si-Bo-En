import { RatePlanController } from "../controllers";
import { Router } from 'express';

export const ratePlanRouter = Router();


import { protect } from '../../middlewares/auth.middleware';
import { checkRoleBased } from "../../middlewares/checkRole.middleware";


ratePlanRouter
  .route('/')
  .post(
    protect,
    checkRoleBased('canCreateRatePlan'),
    RatePlanController.createRatePlan
  );
ratePlanRouter
  .route('/:propertyId')
  .get(
    protect,
    RatePlanController.getRatePlansByPropertyIdController
  )

ratePlanRouter.route('/:ratePlanCode')
  .patch(
    protect,
    checkRoleBased('canUpdateRatePlan'),
    RatePlanController.updateRatePlan
  ).delete(
    protect,
    checkRoleBased('canDeleteRatePlan'),
    RatePlanController.deleteRatePlan
  );

ratePlanRouter.route("/add/tax").put(
  protect,
  RatePlanController.addTaxGroupToRatePlan
);
ratePlanRouter.route("/remove/tax").put(
  protect,
  RatePlanController.removeTaxGroupFromRatePlan
);