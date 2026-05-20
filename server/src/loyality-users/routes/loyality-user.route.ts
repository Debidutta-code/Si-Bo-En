import { Router } from 'express';
import { LoyalityUserController } from '../controllers';
import { verificationRouter } from './verification.route';

const loyalityGuestRouter = Router();
const loyalityUserController = new LoyalityUserController();

loyalityGuestRouter.use('/verification', verificationRouter);

loyalityGuestRouter
    .route('/login')
    .post(loyalityUserController.loginUser.bind(loyalityUserController));
loyalityGuestRouter
    .route('/login-with-email')
    .post(loyalityUserController.loginWithEmail.bind(loyalityUserController));
loyalityGuestRouter
    .route('/update-password')
    .patch(loyalityUserController.updatePassword.bind(loyalityUserController));

// Protected: reads loyaltyToken cookie via loyaltyProtect middleware
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
