import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { checkRoleBased } from '../../middlewares/checkRole.middleware';
import {
    LoyalityConditionController,
    LoyalitySpecialConditionController,
} from '../controllers';

const router = Router();

// Initialize controllers
const loyalityConditionController = new LoyalityConditionController();
const loyalitySpecialConditionController =
    new LoyalitySpecialConditionController();

// ===== Loyalty Condition Routes =====
router
    .route('/')
    .post(
        protect,
        loyalityConditionController.createCondition.bind(
            loyalityConditionController
        )
    );

router
    .route('/:id')
    .patch(
        protect,
        loyalityConditionController.updateCondition.bind(
            loyalityConditionController
        )
    )
    .delete(
        protect,
        loyalityConditionController.deleteCondition.bind(
            loyalityConditionController
        )
    );

router
    .route('/program/:loyaltyProgramId')
    .get(
        protect,
        loyalityConditionController.getConditionsByProgramId.bind(
            loyalityConditionController
        )
    );

// ===== Loyalty Special Condition Routes =====
router
    .route('/special')
    .post(
        protect,
        loyalitySpecialConditionController.createSpecialCondition.bind(
            loyalitySpecialConditionController
        )
    );

router
    .route('/special/:id')
    .patch(
        protect,
        loyalitySpecialConditionController.updateSpecialCondition.bind(
            loyalitySpecialConditionController
        )
    )
    .delete(
        protect,
        loyalitySpecialConditionController.deleteSpecialCondition.bind(
            loyalitySpecialConditionController
        )
    );

router
    .route('/special/program/:loyaltyProgramId')
    .get(
        protect,
        loyalitySpecialConditionController.getSpecialConditionsByProgramId.bind(
            loyalitySpecialConditionController
        )
    );

export default router;
