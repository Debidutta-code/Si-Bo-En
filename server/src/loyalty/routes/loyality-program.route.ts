import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { checkRoleBased } from '../../middlewares/checkRole.middleware';
import {
    LoyalityProgramController,
} from '../controllers';

const router = Router();

// Initialize controllers
const loyalityProgramController = new LoyalityProgramController();

router
    .route('/')
    .post(
        protect,
        loyalityProgramController.createLoyaltyProgram.bind(
            loyalityProgramController
        )
    );

router
    .route('/:loyaltyProgramId')
    .get(
        protect,
        loyalityProgramController.getLoyaltyProgram.bind(
            loyalityProgramController
        )
    )
    .patch(
        protect,
        loyalityProgramController.updateLoyaltyProgram.bind(
            loyalityProgramController
        )
    )
    .delete(
        protect,
        loyalityProgramController.deleteLoyaltyProgram.bind(
            loyalityProgramController
        )
    );

router
    .route('/creation/:creationId')
    .get(
        protect,
        loyalityProgramController.getLoyaltyProgramByCreationId.bind(
            loyalityProgramController
        )
    );

router
    .route('/property/:creationLoyaltyConfigId')
    .get(
        protect,
        loyalityProgramController.getPropertyLoyalityProgramByCreationId.bind(
            loyalityProgramController
        )
    );


export default router;
