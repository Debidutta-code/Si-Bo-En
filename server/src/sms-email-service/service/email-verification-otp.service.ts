import nodemailer from "nodemailer";
import { EmailOTPRepository } from "../reposititory";
import { generateOTPEmailTemplate, 
    generatePasswordResetLinkTemplate } from "../templatesss";
import { config } from "../../config";

export class EmailService {
    private transporter: nodemailer.Transporter;
    private otpRepository: EmailOTPRepository;
    private senderEmail: string;
    private senderName: string;

    constructor() {
        this.otpRepository = new EmailOTPRepository();
        this.senderEmail = process.env.SENDER_EMAIL || "info@swiftrooms.ai";
        this.senderName = process.env.SENDER_NAME || "SwiftRooms";

        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: config.senderEmail,
                pass: config.senderEmailPassword,
            },
        });
    }

    private generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Send OTP email
    async sendOTPEmail(
        email: string,
        purpose: "email_verification" | "password_reset" | "login"
    ): Promise<{ success: boolean; message: string }> {
        try {
            // Check if there's a recent OTP
            const existingOTP = await this.otpRepository.getOTPStatus(email, purpose);
            if (existingOTP && existingOTP.remainingAttempts <= 0) {
                return {
                    success: false,
                    message: "Maximum OTP attempts reached. Please try again later.",
                };
            }

            // Generate new OTP
            const otp = this.generateOTP();

            // Save to database
            await this.otpRepository.createOTP(email, otp, purpose, 10);

            // Prepare email content
            const htmlContent = generateOTPEmailTemplate(otp, purpose, email);
            const subject = {
                email_verification: "Verify Your Email - SwiftRooms",
                password_reset: "Reset Your Password - SwiftRooms",
                login: "Your Login Code - SwiftRooms",
            }[purpose];

            // Send email
            await this.transporter.sendMail({
                from: `"${this.senderName}" <${this.senderEmail}>`,
                to: email,
                subject,
                html: htmlContent,
            });

            return {
                success: true,
                message: "OTP sent successfully to your email",
            };
        } catch (error) {
            console.error("Error sending OTP email:", error);
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to send OTP email",
            };
        }
    }

    // Verify OTP
    async verifyOTP(
        email: string,
        otp: string,
        purpose: "email_verification" | "password_reset" | "login"
    ): Promise<{ success: boolean; message: string }> {
        try {
            const otpDoc = await this.otpRepository.verifyOTP(email, otp, purpose);

            if (!otpDoc) {
                return {
                    success: false,
                    message: "Invalid or expired OTP",
                };
            }

            return {
                success: true,
                message: "OTP verified successfully",
            };
        } catch (error) {
            console.error("Error verifying OTP:", error);
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to verify OTP",
            };
        }
    }


    // Send password reset link
    async sendPasswordResetLink(email: string, resetToken: string): Promise<{ success: boolean; message: string }> {
        try {
            // Generate reset link
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
            const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

            // Prepare email content
            const htmlContent = generatePasswordResetLinkTemplate(resetLink);
            const subject = "Reset Your Password - SwiftRooms";

            // Send email
            await this.transporter.sendMail({
                from: `"${this.senderName}" <${this.senderEmail}>`,
                to: email,
                subject,
                html: htmlContent,
            });

            return {
                success: true,
                message: "Password reset link sent successfully to your email",
            };
        } catch (error) {
            console.error("Error sending password reset link:", error);
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to send password reset link",
            };
        }
    }

}

export const emailService = new EmailService();