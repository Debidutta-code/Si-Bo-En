import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { checkMultiplePermissions, checkRoleBased } from '../../middlewares/checkRole.middleware';
import { PaymentIntegrationController } from '../controllers';

const paymentIntegrationRouter = Router();
paymentIntegrationRouter
    .route('/')
    .get(protect, PaymentIntegrationController.getPaymentIntegrations)
    .post(protect, PaymentIntegrationController.createPaymentIntegration);

paymentIntegrationRouter
    .route('/master-payment-integrations')
    .get(protect, PaymentIntegrationController.getMasterPaymentIntegrations);

paymentIntegrationRouter
    .route('/required-field')
    .post(protect, PaymentIntegrationController.addRequiredField);

paymentIntegrationRouter
    .route('/required-field/:id')
    .delete(protect, PaymentIntegrationController.deleteRequiredField);

paymentIntegrationRouter
    .route('/url-field')
    .post(protect, PaymentIntegrationController.addUrlField);

paymentIntegrationRouter
    .route('/url-field/:id')
    .delete(protect, PaymentIntegrationController.deleteUrlField);

paymentIntegrationRouter
    .route('/:id')
    .patch(protect, PaymentIntegrationController.updatePaymentIntegration)
    .delete(protect, PaymentIntegrationController.deletePaymentIntegration);

export { paymentIntegrationRouter };
