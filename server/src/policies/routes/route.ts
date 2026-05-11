import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { PolicyController } from '../controller';
import { checkRoleBased } from '../../middlewares/checkRole.middleware';
import { attachPropertyDetails } from '../../middlewares/property.middleware';

const router = Router();

router.route('/').post(
    protect,
    checkRoleBased('canCreatePolicy'),
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'body',
    }),
    PolicyController.createPolicies
);
router
    .route('/:id')
    .patch(
        protect,
        checkRoleBased('canUpdatePolicy'),
        PolicyController.updatePolicy
    )
    .put(
        protect,
        checkRoleBased('canUpdatePolicy'),
        PolicyController.updatePolicyDetails
    )
    .delete(
        protect,
        checkRoleBased('canDeletePolicy'),
        PolicyController.deletePolicy
    );
router.route('/getPolicy').post(
    protect,
    checkRoleBased('canViewHotel'),
    attachPropertyDetails({
        identifierType: 'code',
        key: 'propertyCode',
        source: 'body',
    }),
    PolicyController.findPolicy
);
router.route('/getPolicyByHotelCode').get(
    protect,
    checkRoleBased('canViewHotel'),
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'query',
    }),
    PolicyController.getPoliciesByHotelCode
);

router
    .route('/addToRatePlan')
    .post(
        protect,
        checkRoleBased('canCreatePolicy'),
        PolicyController.AddToRatePlan
    );
export default router;
