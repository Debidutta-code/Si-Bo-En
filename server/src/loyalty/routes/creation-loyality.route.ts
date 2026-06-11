import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { CreationLoyalityController } from '../controllers';

const router = Router();

// Initialize controller
const creationLoyalityController = new CreationLoyalityController();

router
    .route('/')
    .post(
        protect,
        creationLoyalityController.createCreationLoyality.bind(
            creationLoyalityController
        )
    );
router.route("/get-properties")
.get(protect,creationLoyalityController.getPropertyByCreationId.bind(creationLoyalityController)) 

router
    .route('/:creationLoyalityId')
    .get(
        protect,
        creationLoyalityController.getCreationLoyalityById.bind(
            creationLoyalityController
        )
    )
    .patch(
        protect,
        creationLoyalityController.updateCreationLoyality.bind(
            creationLoyalityController
        )
    )
    .delete(
        protect,
        creationLoyalityController.deleteLoyality.bind(
            creationLoyalityController
        )
    );

router
    .route('/by-creation/:creationId')
    .get(
        protect,
        creationLoyalityController.getLoyalityByCreation.bind(
            creationLoyalityController
        )
    );


export default router;
