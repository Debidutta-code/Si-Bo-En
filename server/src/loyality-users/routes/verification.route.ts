import { Router } from 'express';
import {
    sendOtp,
    verifyOtp,
} from '../../sms-email-service/controller/booking-otp.controller';
import { sendPasswordResetLink } from '../../sms-email-service/controller/loyalty-guest-email.controller';

const verificationRouter = Router();

verificationRouter.route('/send-otp').post(sendOtp);
verificationRouter.route('/verify-otp').post(verifyOtp);
verificationRouter.route('/send-reset-link').post(sendPasswordResetLink);

export { verificationRouter };
