import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string;
  attemptCount: number;
  verified: boolean;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    attemptCount: { type: Number, default: 1 }, // ✅ track how many times OTP requested
    verified: { type: Boolean, default: false }, // ✅ whether OTP has been verified
    createdAt: { type: Date, default: Date.now, expires: 120 }, // 2-minute TTL
  },
  { versionKey: false }
);

// ✅ Correctly typed model to avoid TS2349
const OtpModel: Model<IOtp> =
  mongoose.models.Otp || mongoose.model<IOtp>('Otp', otpSchema);

export default OtpModel;
