import { Router } from 'express';
import { protect } from '../../../middlewares/auth.middleware';
import { MLOSController } from '../controllers';
import { checkRoleBased } from '../../../middlewares/checkRole.middleware';

export const mlosRouter = Router();
const mlosController = new MLOSController();
mlosRouter
    .route('/')
    .post(
        protect,
        checkRoleBased('canCreateRatePlan'),
        mlosController.createRatePlanRule.bind(mlosController)
    );

mlosRouter
    .route('/:ratePlanId')
    .get(
        protect,
        mlosController.getRatePlanRuleByRatePlanId.bind(mlosController)
    )
    .put(
        protect,
        checkRoleBased('canUpdateRatePlan'),
        mlosController.updateRatePlanRule.bind(mlosController)
    )
    .delete(
        protect,
        checkRoleBased('canDeleteRatePlan'),
        mlosController.deleteRatePlanRule.bind(mlosController)
    );
mlosRouter
    .route('/property/:propertyId')
    .get(
        protect,
        mlosController.getRatePlanRulesByPropertyId.bind(mlosController)
    );
