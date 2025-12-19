import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType = 'email' | 'sms' | 'push';
export type NotificationStatus = 'sent' | 'failed' | 'pending';
export type NotificationProvider =
  | 'Twilio'
  | 'SendGrid'
  | 'AWS'
  | 'FCM'
  | 'Other';

export interface INotificationLog extends Document {
  user_id: mongoose.Types.ObjectId;
  type: NotificationType;
  to: string;
  title?: string | null;
  body: string;
  status: NotificationStatus;
  error?: string | null;
  provider: NotificationProvider;
  created_at?: Date;
}

const NotificationLogSchema: Schema = new Schema<INotificationLog>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['email', 'sms', 'push'],
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: null,
    },
    body: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending'],
      default: 'pending',
    },
    error: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
      enum: ['Twilio', 'SendGrid', 'AWS', 'FCM', 'Other'],
      default: 'Other',
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // or set to true if you prefer createdAt/updatedAt fields
  }
);

export default mongoose.model<INotificationLog>(
  'NotificationLog',
  NotificationLogSchema
);
