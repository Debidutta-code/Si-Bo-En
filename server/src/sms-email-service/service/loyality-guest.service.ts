import { prisma } from '../../config';
import passwordResetTokenRepository from '../reposititory/password-reset-token.repository';
import { emailService } from './email-verification-otp.service';

export class LoyaltyGuestEmailService {
    /**
     * Verify the guest exists in the loyalty program, then send a 6-digit OTP
     * with purpose "password_reset" so they can prove identity before setting a password.
     */
    public async sendOTP(
        email: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            const guest = await prisma.loyalityGuest.findUnique({
                where: { guestEmail: email },
            });
            if (!guest) {
                return { success: false, message: 'Loyalty guest not found' };
            }

            return await emailService.sendOTPEmail(email, 'password_reset');
        } catch (error) {
            console.error('LoyaltyGuestEmailService.sendOTP error:', error);
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to send OTP',
            };
        }
    }

    /**
     * Verify the OTP submitted by the loyalty guest.
     */
    public async verifyOTP(
        email: string,
        otp: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            return await emailService.verifyOTP(email, otp, 'password_reset');
        } catch (error) {
            console.error('LoyaltyGuestEmailService.verifyOTP error:', error);
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to verify OTP',
            };
        }
    }

    /**
     * Generate a secure reset token and email a password-reset link to the loyalty guest.
     */
    public async sendPasswordResetLink(
        email: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            const guest = await prisma.loyalityGuest.findUnique({
                where: { guestEmail: email },
            });
            if (!guest) {
                return { success: false, message: 'Loyalty guest not found' };
            }

            const resetToken =
                await passwordResetTokenRepository.createResetToken(email);
            return await emailService.sendPasswordResetLink(email, resetToken);
        } catch (error) {
            console.error(
                'LoyaltyGuestEmailService.sendPasswordResetLink error:',
                error
            );
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

export const loyaltyGuestEmailService = new LoyaltyGuestEmailService();
