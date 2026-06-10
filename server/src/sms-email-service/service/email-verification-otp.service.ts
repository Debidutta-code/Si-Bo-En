import { EmailOTPRepository } from '../reposititory';
import {
    generatePasswordResetLinkTemplate,
} from '../templatesss';
import { config } from '../../config';
import { emailQueue } from '../../index';
import { generateOTPEmailTemplate } from '../templatesss/otp.tempate';

export class EmailService {
    private otpRepository: EmailOTPRepository;
    constructor() {
        this.otpRepository = new EmailOTPRepository();
    }

    private generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Send OTP email
    async sendOTPEmail(
        email: string,
        purpose: 'email_verification' | 'password_reset' | 'login' | 'customer_reset' | 'property_recovery'
    ): Promise<{ success: boolean; message: string }> {
        try {
            const existingOTP = await this.otpRepository.getOTPStatus(
                email,
                purpose
            );
            if (existingOTP && existingOTP.remainingAttempts <= 0) {
                return {
                    success: false,
                    message:
                        'Maximum OTP attempts reached. Please try again later.',
                };
            }

            const otp = this.generateOTP();

            // Save to database
            await this.otpRepository.createOTP(email, otp, purpose, 10);

            const htmlContent = generateOTPEmailTemplate(
                otp,
                purpose,
                email
            );
            const subject = {
                email_verification: 'Verify Your Email - RevChill',
                password_reset: 'Reset Your Password - RevChill',
                login: 'Your Login Code - RevChill',
                customer_reset: 'Reset Your Password - RevChill',
                property_recovery: 'Property Recovery OTP - RevChill',
            }[purpose];

            await emailQueue.enqueueEmail({
                to: email,
                bcc: [],
                subject,
                htmlContent,
                priority: 'critical',
                meta: {
                    template: 'otp',
                    event: purpose,
                },
            });
            return {
                success: true,
                message: 'OTP sent successfully to your email',
            };
        } catch (error) {
            console.error('Error sending OTP email:', error);
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to send OTP email',
            };
        }
    }

    async verifyOTP(
        email: string,
        otp: string,
        purpose: 'email_verification' | 'password_reset' | 'login' | 'customer_reset'
    ): Promise<{ success: boolean; message: string }> {
        try {
            const otpDoc = await this.otpRepository.verifyOTP(
                email,
                otp,
                purpose
            );

            if (!otpDoc) {
                return {
                    success: false,
                    message: 'Invalid or expired OTP',
                };
            }

            return {
                success: true,
                message: 'OTP verified successfully',
            };
        } catch (error) {
            console.error('Error verifying OTP:', error);
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to verify OTP',
            };
        }
    }

    async sendPasswordResetLink(
        email: string,
        resetToken: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            // Generate reset link
            const frontendUrl = config.frontendUrl || 'http://localhost:5173';
            const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

            const htmlContent = generatePasswordResetLinkTemplate(resetLink);
            const subject = 'Reset Your Password - RevChill';

            await emailQueue.enqueueEmail({
                to: email,
                bcc: [],
                subject,
                htmlContent,
                priority: 'critical',
                meta: {
                    template: 'password_reset_link',
                    event: 'password_reset',
                },
            });

            return {
                success: true,
                message: 'Password reset link sent successfully to your email',
            };
        } catch (error) {
            console.error('Error sending password reset link:', error);
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to send password reset link',
            };
        }
    }
}

export const emailService = new EmailService();
