import PasswordResetToken, {
    IPasswordResetToken,
} from '../models/password-reset-token.model';
import crypto from 'crypto';

class PasswordResetTokenRepository {
    // Create a new reset token (invalidate old ones first)
    async createResetToken(email: string): Promise<string> {
        // Invalidate any existing tokens for this email
        await PasswordResetToken.updateMany(
            { email, isUsed: false },
            { isUsed: true }
        );

        // Generate a secure random token (32 bytes = 64 hex characters)
        const token = crypto.randomBytes(32).toString('hex');

        // Token expires in 30 minutes
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        const resetToken = new PasswordResetToken({
            email,
            token,
            expiresAt,
            isUsed: false,
        });

        await resetToken.save();
        return token;
    }

    // Verify reset token and get email
    async verifyResetToken(
        token: string
    ): Promise<{ email: string; isValid: boolean }> {
        const resetToken = await PasswordResetToken.findOne({ token });

        if (!resetToken) {
            return { email: '', isValid: false };
        }

        // Check if token is expired
        if (new Date() > resetToken.expiresAt) {
            return { email: resetToken.email, isValid: false };
        }

        // Check if already used
        if (resetToken.isUsed) {
            return { email: resetToken.email, isValid: false };
        }

        return { email: resetToken.email, isValid: true };
    }

    // Mark token as used
    async markTokenAsUsed(token: string): Promise<void> {
        await PasswordResetToken.updateOne({ token }, { isUsed: true });
    }

    // Delete expired tokens (cleanup)
    async deleteExpiredTokens(): Promise<void> {
        await PasswordResetToken.deleteMany({
            expiresAt: { $lt: new Date() },
        });
    }

    // Get token status for debugging
    async getTokenStatus(token: string): Promise<IPasswordResetToken | null> {
        return await PasswordResetToken.findOne({ token });
    }
}

export default new PasswordResetTokenRepository();
