import { EmailVerificationOTP } from "../models";

export class EmailOTPRepository {
    async createOTP(email: string, otp: string, purpose: string, expiresInMinutes: number = 10) {
        try {
            await EmailVerificationOTP.updateMany(
                { email, purpose, isUsed: false },
                { isUsed: true }
            );

            const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

            const otpDoc = await EmailVerificationOTP.create({
                email,
                otp,
                purpose,
                expiresAt,
                isUsed: false,
                attempts: 0,
            });

            return otpDoc;
        } catch (error) {
            throw new Error(`Failed to create OTP: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async verifyOTP(email: string, otp: string, purpose: string) {
        try {
            const otpDoc = await EmailVerificationOTP.findOne({
                email,
                otp,
                purpose,
                isUsed: false,
                expiresAt: { $gt: new Date() },
            });

            if (!otpDoc) {
                await EmailVerificationOTP.updateOne(
                    { email, purpose, isUsed: false },
                    { $inc: { attempts: 1 } }
                );
                return null;
            }

            if (otpDoc.attempts >= 5) {
                return null;
            }

            otpDoc.isUsed = true;
            await otpDoc.save();

            return otpDoc;
        } catch (error) {
            throw new Error(`Failed to verify OTP: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async deleteExpiredOTPs() {
        try {
            const result = await EmailVerificationOTP.deleteMany({
                expiresAt: { $lt: new Date() },
            });
            return result.deletedCount;
        } catch (error) {
            throw new Error(`Failed to delete expired OTPs: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getOTPStatus(email: string, purpose: string) {
        try {
            const otpDoc = await EmailVerificationOTP.findOne({
                email,
                purpose,
                isUsed: false,
                expiresAt: { $gt: new Date() },
            }).sort({ createdAt: -1 });

            if (!otpDoc) {
                return null;
            }

            return {
                exists: true,
                attempts: otpDoc.attempts,
                expiresAt: otpDoc.expiresAt,
                remainingAttempts: 5 - otpDoc.attempts,
            };
        } catch (error) {
            throw new Error(`Failed to get OTP status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}