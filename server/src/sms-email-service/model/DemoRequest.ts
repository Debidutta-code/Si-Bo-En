// server/Email/model/EmailRequest.ts
import mongoose from 'mongoose';

const EmailRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('DemoRequest', EmailRequestSchema);
