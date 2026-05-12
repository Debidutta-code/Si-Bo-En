import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { checkRoleBased } from '../../middlewares/checkRole.middleware';
import { BankController } from '../controller';

export const paymentDetailsRoute = Router({ mergeParams: true });
paymentDetailsRoute
    .route('/')
    .post(
        protect,
        checkRoleBased('canCreateHotel'),
        BankController.addBankDetails
    )
    .get(BankController.getBankDetailsByPropertyId)
    .put(
        protect,
        checkRoleBased('canUpdatePaymentDetails'),
        BankController.updatePaymentMethodsByPropertyId
    );
