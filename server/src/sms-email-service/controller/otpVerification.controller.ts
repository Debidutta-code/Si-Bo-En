import { Request, Response } from 'express';
import OtpModel from '../model/otp';
import sgMail from '@sendgrid/mail';

// Setup SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const existingOtp = await OtpModel.findOne({ email });

    if (existingOtp) {
      if (existingOtp.attemptCount >= 3) {
        return res.status(429).json({
          message: 'Too many attempts. Please check your email address.',
        });
      }

      existingOtp.attemptCount += 1;
      await existingOtp.save();

      return res.status(429).json({
        message: 'OTP already sent. Please wait 2 minutes before retrying.',
      });
    }

    // If in development mode, use static OTP
    const otp =
      process.env.MODE_ENV === 'development'
        ? '123456'
        : Math.floor(100000 + Math.random() * 900000).toString();

    await OtpModel.create({
      email,
      otp,
      attemptCount: 1,
      verified: false,
    });

    // Only send mail if in production
    if (process.env.MODE_ENV === 'production') {
      const msg = {
        to: email,
        from: {
          email: process.env.SENDER_EMAIL!,
          name: process.env.SENDER_NAME || 'YourApp',
        },
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; background-color: #f4f6f8; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div style="background-color: #4f46e5; color: white; text-align: center; padding: 16px; border-radius: 8px 8px 0 0;">
              <h2 style="margin: 0; font-size: 20px;">Verify Your Email</h2>
            </div>

            <div style="padding: 24px; background-color: white; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px; margin-bottom: 16px;">
                Hello 👋,
                <br />
                Use the OTP below to verify your email address:
              </p>

              <div style="text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #111827; margin: 20px 0;">
                ${otp}
              </div>

              <p style="font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 16px;">
                This OTP is valid for <strong>2 minutes</strong>. Do not share it with anyone.
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

              <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                If you did not request this, please ignore this email or contact support.
              </p>
            </div>
          </div>
        `,
      };

      await sgMail.send(msg);
    }

    res.status(200).json({
      message:
        process.env.MODE_ENV === 'development'
          ? 'Otp send Succsessfully'
          : 'OTP sent successfully.',
    });
  } catch (error: any) {
    console.error('Error sending OTP:', error.response?.body || error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  try {
    const existing = await OtpModel.findOne({ email });

    if (!existing) {
      return res.status(400).json({ message: 'OTP has expired or not found.' });
    }

    if (existing.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    await OtpModel.deleteOne({ email });

    res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// //dummy for checking
// import { Request, Response } from "express";
// import OtpModel from "../model/otp";

// export const sendOtp = async (req: Request, res: Response) => {
//   const { email } = req.body;

//   if (!email) return res.status(400).json({ message: "Email is required." });

//   try {
//     const existingOtp = await OtpModel.findOne({ email });

//     if (existingOtp) {
//       if (existingOtp.attemptCount >= 3) {
//         return res.status(429).json({
//           message: "Too many attempts. Please check your email address.",
//         });
//       }

//       // increment attemptCount
//       existingOtp.attemptCount += 1;
//       await existingOtp.save();

//       return res.status(429).json({
//         message: "OTP already sent. Please wait 2 minutes before retrying.",
//       });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     await OtpModel.create({
//       email,
//       otp,
//       attemptCount: 1,
//       verified: false,
//     });

//     // TODO: Replace with real email service
//     console.log(`OTP sent to ${email}: ${otp}`);

//     res.status(200).json({ message: "OTP sent successfully." });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// export const verifyOtp = async (req: Request, res: Response) => {
//   const { email, otp } = req.body;

//   if (!email || !otp) {
//     return res.status(400).json({ message: "Email and OTP are required." });
//   }

//   const existing = await OtpModel.findOne({ email });
//   if (!existing) {
//     return res.status(400).json({ message: "OTP has expired or not found." });
//   }

//   if (existing.otp !== otp) {
//     return res.status(400).json({ message: "Invalid OTP." });
//   }

//   await OtpModel.deleteOne({ email });

//   res.status(200).json({ message: "OTP verified successfully." });
// };
