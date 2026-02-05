import nodemailer from "nodemailer";
import { EmailOTPRepository } from "../reposititory";
import { generateOTPEmailTemplate, generateWelcomeEmailTemplate, generatePasswordResetLinkTemplate } from "../templates";
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

        // Initialize nodemailer transporter
        // Use EMAIL_USER for Gmail authentication, SENDER_EMAIL for display
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: config.senderEmail,
                pass: config.senderEmailPassword,
            },
        });
    }

    // Generate a 6-digit OTP
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

    // Send welcome email
    async sendWelcomeEmail(
        email: string,
        name: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            const htmlContent = generateWelcomeEmailTemplate(name);

            await this.transporter.sendMail({
                from: `"${this.senderName}" <${this.senderEmail}>`,
                to: email,
                subject: "Welcome to SwiftRooms!",
                html: htmlContent,
            });

            return {
                success: true,
                message: "Welcome email sent successfully",
            };
        } catch (error) {
            console.error("Error sending welcome email:", error);
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to send welcome email",
            };
        }
    }

    // Send custom email
    async sendCustomEmail(
        to: string,
        subject: string,
        htmlContent: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            await this.transporter.sendMail({
                from: `"${this.senderName}" <${this.senderEmail}>`,
                to,
                subject,
                html: htmlContent,
            });

            return {
                success: true,
                message: "Email sent successfully",
            };
        } catch (error) {
            console.error("Error sending custom email:", error);
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to send email",
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

    // Clean up expired OTPs (can be run as a cron job)
    async cleanupExpiredOTPs(): Promise<number> {
        try {
            const deletedCount = await this.otpRepository.deleteExpiredOTPs();
            //console.log(`Cleaned up ${deletedCount} expired OTPs`);
            return deletedCount;
        } catch (error) {
            console.error("Error cleaning up expired OTPs:", error);
            return 0;
        }
    }
}

// Export singleton instance
export const emailService = new EmailService();