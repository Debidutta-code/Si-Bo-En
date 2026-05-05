import { Request, Response } from "express";
import { emailService } from "../service";

export const sendOtp = async (req: Request, res: Response) => {
  const { email, purpose } = req.body;

  if (!email) {
    return res.status(400).json({ 
      success: false,
      message: "Email is required." 
    });
  }

  const otpPurpose = purpose || "email_verification";

  // Validate purpose
  if (!["email_verification", "password_reset", "login"].includes(otpPurpose)) {
    return res.status(400).json({ 
      success: false,
      message: "Invalid purpose. Must be one of: email_verification, password_reset, login" 
    });
  }

  try {
    const result = await emailService.sendOTPEmail(email, otpPurpose);

    if (!result.success) {
      return res.status(429).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp, purpose } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ 
      success: false,
      message: "Email and OTP are required." 
    });
  }

  // Default purpose to email_verification if not provided
  const otpPurpose = purpose || "email_verification";

  try {
    const result = await emailService.verifyOTP(email, otp, otpPurpose);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};