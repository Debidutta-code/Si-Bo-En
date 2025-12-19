import NotificationLogModel, {
  INotificationLog,
} from '../model/notification.model';
import {
  NotificationType,
  NotificationStatus,
  NotificationProvider,
} from '../utils/notification';
import mongoose from 'mongoose';

interface CreateNotificationLogInput {
  user_id: mongoose.Types.ObjectId;
  type: NotificationType;
  to: string;
  title?: string;
  body: string;
  status?: NotificationStatus;
  error?: string;
  provider?: NotificationProvider;
}

class NotificationLogDAO {
  // Save a new notification log entry
  public async create(
    logData: CreateNotificationLogInput
  ): Promise<INotificationLog> {
    try {
      const log = new NotificationLogModel({
        ...logData,
        status: logData.status || NotificationStatus.PENDING,
        provider: logData.provider || NotificationProvider.OTHER,
      });

      return await log.save();
    } catch (error) {
      console.error('Error saving notification log:', error);
      throw new Error('Failed to create notification log');
    }
  }

  // (Optional) Fetch logs by user
  public async getLogsByUser(
    userId: mongoose.Types.ObjectId
  ): Promise<INotificationLog[]> {
    return NotificationLogModel.find({ user_id: userId })
      .sort({ created_at: -1 })
      .exec();
  }

  // (Optional) Fetch logs by type and status
  public async getLogsByTypeAndStatus(
    type: NotificationType,
    status: NotificationStatus
  ): Promise<INotificationLog[]> {
    return NotificationLogModel.find({ type, status }).exec();
  }
}

export default new NotificationLogDAO();
