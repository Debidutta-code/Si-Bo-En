import { Router } from 'express';
import { LoyalityUserController } from '../controllers';

const loyalityGuestRouter = Router();
const loyalityUserController = new LoyalityUserController();

loyalityGuestRouter
    .route('/me')
    .get(
        loyalityUserController.getMe.bind(loyalityUserController)
    );

// Must be after /me to avoid matching "me" as :id
loyalityGuestRouter
    .route('/:id')
    .get(loyalityUserController.getByUserId.bind(loyalityUserController));

export { loyalityGuestRouter };
