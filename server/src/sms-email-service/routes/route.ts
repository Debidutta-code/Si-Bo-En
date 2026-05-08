import express from 'express';
import { sendOtp, verifyOtp } from '../controller/booking-otp.controller';
import {
    sendOtp as lgSendOtp,
    verifyOtp as lgVerifyOtp,
    sendPasswordResetLink as lgSendResetLink,
} from '../controller/loyalty-guest-email.controller';

const router = express.Router();

// General booking OTP routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

export default router;
