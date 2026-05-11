import mongoose from 'mongoose';

interface IEmailVerificationOTP extends mongoose.Document {
    email: string;
    otp: string;
    purpose: 'email_verification' | 'password_reset' | 'login';
    expiresAt: Date;
    isUsed: boolean;
    attempts: number;
    createdAt: Date;
    updatedAt: Date;
}

const emailVerificationOTPSchema = new mongoose.Schema<IEmailVerificationOTP>(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        otp: {
            type: String,
            required: true,
        },
        purpose: {
            type: String,
            enum: ['email_verification', 'password_reset', 'login'],
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        isUsed: {
            type: Boolean,
            default: false,
        },
        attempts: {
            type: Number,
            default: 0,
            max: 5,
        },
    },
    {
        timestamps: true,
    }
);

emailVerificationOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

emailVerificationOTPSchema.index({ email: 1, purpose: 1, isUsed: 1 });

const EmailVerificationOTP = mongoose.model<IEmailVerificationOTP>(
    'EmailVerificationOTP',
    emailVerificationOTPSchema
);

export { EmailVerificationOTP, IEmailVerificationOTP };
