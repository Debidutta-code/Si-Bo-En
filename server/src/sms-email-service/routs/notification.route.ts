import express from 'express';
import NotificationController from '../controller/notification';
import emailController from '../controller/email.controller';
import { sendOtp, verifyOtp } from '../controller/otpVerification.controller';

const router = express.Router();

router.post('/log', NotificationController.logNotification);
router.post('/failure', NotificationController.logNotificationFailure);
router.post('/send-mail', emailController.sendEmail);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// 👇 named export
export const EmailRoutes = router;
