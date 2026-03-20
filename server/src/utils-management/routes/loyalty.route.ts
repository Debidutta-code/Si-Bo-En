import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { checkMultiplePermissions, checkRoleBased } from '../../middlewares/checkRole.middleware';
import { LoyaltyGuestFieldControllers } from '../controllers';
const loyaltyGuestFieldRouter = Router();
const loyaltyGuestFieldControllers = new LoyaltyGuestFieldControllers();

loyaltyGuestFieldRouter
    .route('/')
    .post(loyaltyGuestFieldControllers.createLoyaltyGuestFields.bind(loyaltyGuestFieldControllers))
    .get(loyaltyGuestFieldControllers.getLoyaltyGuestFields.bind(loyaltyGuestFieldControllers));
loyaltyGuestFieldRouter
    .route('/:id')
    .post(loyaltyGuestFieldControllers.deleteLoyaltyGuestFields.bind(loyaltyGuestFieldControllers));
export { loyaltyGuestFieldRouter };
