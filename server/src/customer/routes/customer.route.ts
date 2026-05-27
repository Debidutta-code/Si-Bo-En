import { Router } from 'express';
import { CustomerController } from '../controllers';
import { customerProtect } from '../../middlewares/customer-auth.middleware';

const customerRouter = Router();
const customerController = new CustomerController();

customerRouter
    .route('/register')
    .post(customerController.register.bind(customerController));

customerRouter
    .route('/login')
    .post(customerController.login.bind(customerController));

customerRouter
    .route('/logout')
    .post(customerController.logout.bind(customerController));

customerRouter
    .route('/me')
    .get(customerProtect, customerController.getMe.bind(customerController));

customerRouter
    .route('/update-password')
    .patch(customerProtect, customerController.updatePassword.bind(customerController));

export { customerRouter };