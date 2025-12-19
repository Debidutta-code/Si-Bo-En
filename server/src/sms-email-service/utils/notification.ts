// Enum for the type of notification channel
export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

// Enum for the status of the notification
export enum NotificationStatus {
  SENT = 'sent',
  FAILED = 'failed',
  PENDING = 'pending',
}

// Enum for the provider/platform used to send the notification
export enum NotificationProvider {
  TWILIO = 'Twilio',
  SENDGRID = 'SendGrid',
  AWS = 'AWS',
  FCM = 'FCM',
  OTHER = 'Other',
}
