import { Request, Response } from "express";
import nodemailer from "nodemailer";
import OtpModel from "../model/otp";

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * SEND OTP
 */
export const sendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const existingOtp = await OtpModel.findOne({ email });
    const now = new Date();

    if (existingOtp) {
      const otpAge = now.getTime() - existingOtp.createdAt.getTime();

      // OTP expired (2 minutes)
      if (otpAge > 2 * 60 * 1000) {
        await OtpModel.deleteOne({ email });
      } else {
        // OTP still valid
        if (existingOtp.attemptCount >= 3) {
          return res.status(429).json({
            message: "Too many attempts. Please check your email address.",
          });
        }

        existingOtp.attemptCount += 1;
        await existingOtp.save();

        return res.status(429).json({
          message: "OTP already sent. Please wait 2 minutes before retrying.",
        });
      }
    }

    // Generate OTP
    const otp =
      process.env.MODE_ENV === "development"
        ? "123456"
        : Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP
    await OtpModel.create({
      email,
      otp,
      attemptCount: 1,
      verified: false,
      createdAt: new Date(),
    });

    // Send email only in production
    if (process.env.MODE_ENV === "production") {
      const mailOptions = {
        from: `"${process.env.SENDER_NAME || "YourApp"}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is: ${otp}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; background-color: #f4f6f8; padding: 30px; border-radius: 10px;">
            <div style="background-color: #4f46e5; color: white; text-align: center; padding: 16px; border-radius: 8px 8px 0 0;">
              <h2 style="margin: 0;">Verify Your Email</h2>
            </div>

            <div style="padding: 24px; background-color: white;">
              <p>Hello 👋,<br/>Use the OTP below to verify your email:</p>

              <div style="text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 20px 0;">
                ${otp}
              </div>

              <p style="font-size: 14px; color: #6b7280; text-align: center;">
                This OTP is valid for <strong>2 minutes</strong>.
              </p>

              <hr style="margin: 24px 0;" />

              <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                If you didn’t request this, please ignore this email.
              </p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    return res.status(200).json({
      message:
        process.env.MODE_ENV === "development"
          ? "OTP sent successfully (dev mode)"
          : "OTP sent successfully.",
    });
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * VERIFY OTP
 */
export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  try {
    const existing = await OtpModel.findOne({ email });

    if (!existing) {
      return res.status(400).json({ message: "OTP has expired or not found." });
    }

    if (existing.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    await OtpModel.deleteOne({ email });

    return res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
