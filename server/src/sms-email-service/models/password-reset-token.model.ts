import mongoose from 'mongoose';

interface IPasswordResetToken extends mongoose.Document {
    email: string;
    token: string;
    expiresAt: Date;
    isUsed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const passwordResetTokenSchema = new mongoose.Schema<IPasswordResetToken>(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        isUsed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// TTL index to automatically delete expired tokens after 1 hour
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

const PasswordResetToken = mongoose.model<IPasswordResetToken>(
    'PasswordResetToken',
    passwordResetTokenSchema
);

export default PasswordResetToken;
export { IPasswordResetToken };
