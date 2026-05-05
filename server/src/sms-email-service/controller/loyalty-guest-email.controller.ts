import { Request, Response } from "express";
import { loyaltyGuestEmailService } from "../service/loyality-guest.service";

/**
 * POST /email/loyalty-guest/send-otp
 * Body: { email: string }
 */
export const sendOtp = async (req: Request, res: Response): Promise<Response> => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format." });
    }

    try {
        const result = await loyaltyGuestEmailService.sendOTP(email);

        if (!result.success) {
            const status = result.message === "Loyalty guest not found" ? 404 : 429;
            return res.status(status).json({ success: false, message: result.message });
        }

        return res.status(200).json({ success: true, message: result.message });
    } catch (error: any) {
        console.error("Error in loyalty-guest sendOtp:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * POST /email/loyalty-guest/verify-otp
 * Body: { email: string; otp: string }
 */
export const verifyOtp = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }

    try {
        const result = await loyaltyGuestEmailService.verifyOTP(email, otp);

        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message });
        }

        return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        console.error("Error in loyalty-guest verifyOtp:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * POST /email/loyalty-guest/send-reset-link
 * Body: { email: string }
 */
export const sendPasswordResetLink = async (req: Request, res: Response): Promise<Response> => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format." });
    }

    try {
        const result = await loyaltyGuestEmailService.sendPasswordResetLink(email);

        if (!result.success) {
            const status = result.message === "Loyalty guest not found" ? 404 : 500;
            return res.status(status).json({ success: false, message: result.message });
        }

        return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        console.error("Error in loyalty-guest sendPasswordResetLink:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
