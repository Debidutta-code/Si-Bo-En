import NotificationLogDAO from '../repository/notification.repository';
import {
  NotificationType,
  NotificationStatus,
  NotificationProvider,
} from '../utils/notification';
import mongoose from 'mongoose';

interface SendNotificationInput {
  userId: string; // Can be string, we convert to ObjectId
  to: string;
  title?: string;
  body: string;
  type: NotificationType;
  provider?: NotificationProvider;
}

/**
 * NotificationService handles the logic for logging notification sends.
 * Actual send (via SendGrid, Twilio, FCM, etc.) should be handled by a separate module.
 */
class NotificationService {
  /**
   * Logs the sending of a notification.
   * This does not actually send the notification — it just logs it.
   */
  public async logNotification(input: SendNotificationInput): Promise<void> {
    const { userId, to, title, body, type, provider } = input;

    try {
      await NotificationLogDAO.create({
        user_id: new mongoose.Types.ObjectId(userId),
        to,
        title,
        body,
        type,
        provider,
        status: NotificationStatus.SENT, // Or PENDING if actual send is async
      });

      console.log(`[Notification Logged] Type: ${type} | To: ${to}`);
    } catch (err) {
      console.error('Failed to log notification:', err);
    }
  }

  /**
   * Logs a failed notification with error reason.
   */
  public async logFailure(
    input: SendNotificationInput,
    errorMsg: string
  ): Promise<void> {
    const { userId, to, title, body, type, provider } = input;

    try {
      await NotificationLogDAO.create({
        user_id: new mongoose.Types.ObjectId(userId),
        to,
        title,
        body,
        type,
        provider,
        status: NotificationStatus.FAILED,
        error: errorMsg,
      });

      console.warn(
        `[Notification Failed] Type: ${type} | To: ${to} | Error: ${errorMsg}`
      );
    } catch (err) {
      console.error('Failed to log failed notification:', err);
    }
  }
}

export default new NotificationService();
