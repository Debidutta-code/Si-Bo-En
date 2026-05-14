import { Router } from 'express';
import { OtaUserController } from '../controllers';
import { otaProtect } from '../../../middlewares/ota-user.middleware';

const otaUserRouter = Router();
const userController = new OtaUserController();

(otaUserRouter
    .route('/login')
    .post(userController.loginUser.bind(userController)),
    otaUserRouter
        .route('/')
        .post(userController.registerUser.bind(userController))
        .get(otaProtect, userController.getOtaUser.bind(userController))
        .put(
            otaProtect,
            userController.updateProfileDetails.bind(userController)
        )
        .delete(otaProtect, userController.deleteUser.bind(userController)));
otaUserRouter
    .route('/verify')
    .post(userController.verifyUser.bind(userController));
otaUserRouter
    .route('/password')
    .put(otaProtect, userController.updatePassword.bind(userController));

otaUserRouter
    .route('/forgot-password')
    .post(userController.forgotPassword.bind(userController));

otaUserRouter
    .route('/send-otp')
    .post(userController.sendOtp.bind(userController));

otaUserRouter
    .route('/verify-otp')
    .post(userController.verifyOtp.bind(userController));

export { otaUserRouter };
