import express from 'express';
import NotificationController from '../controller/notification';
import emailController from '../controller/email.controller';
import { sendOtp } from '../controller/otpVerification.controller';
import { verifyOtp } from '../controller/otpVerification.controller';
// import { sendDemoEmail } from "../controller/demoemail.controller";

const router = express.Router();

router.post('/log', NotificationController.logNotification);
router.post('/failure', NotificationController.logNotificationFailure);
router.post('/send-mail', emailController.sendEmail);

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
// router.post('/demorequest', sendDemoEmail);

export default router;
