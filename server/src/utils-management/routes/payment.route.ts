import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import {
    checkMultiplePermissions,
    checkRoleBased,
} from '../../middlewares/checkRole.middleware';
import { PaymentIntegrationController } from '../controllers';

const paymentIntegrationRouter = Router();
paymentIntegrationRouter
    .route('/')
    .get(protect, PaymentIntegrationController.getPaymentIntegrations)
    .post(protect, PaymentIntegrationController.createPaymentIntegration);

paymentIntegrationRouter
    .route('/:id')
    .patch(protect, PaymentIntegrationController.updatePaymentIntegration)
    .delete(protect, PaymentIntegrationController.deletePaymentIntegration);

paymentIntegrationRouter
    .route('/master-payment-integrations')
    .get(protect, PaymentIntegrationController.getMasterPaymentIntegrations);

export { paymentIntegrationRouter };
