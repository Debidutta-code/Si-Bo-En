import { Request, Response } from 'express';
import NotificationService from '../service/notification';
import { NotificationType, NotificationProvider } from '../utils/notification';

class NotificationController {
  /**
   * POST /api/notifications/log
   * Logs a successful notification (email, SMS, or push)
   */
  public async logNotification(req: Request, res: Response): Promise<void> {
    try {
      const { userId, to, title, body, type, provider } = req.body;

      // Validate required fields
      if (!userId || !to || !body || !type) {
        res.status(400).json({ error: 'Missing required fields.' });
        return;
      }

      await NotificationService.logNotification({
        userId,
        to,
        title,
        body,
        type: type as NotificationType,
        provider: provider as NotificationProvider,
      });

      res.status(201).json({ message: 'Notification log saved.' });
    } catch (error) {
      console.error('Error logging notification:', error);
      res.status(500).json({ error: 'Failed to log notification.' });
    }
  }

  /**
   * POST /api/notifications/failure
   * Logs a failed notification send with error message
   */
  public async logNotificationFailure(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { userId, to, title, body, type, provider, errorMsg } = req.body;

      if (!userId || !to || !body || !type || !errorMsg) {
        res.status(400).json({ error: 'Missing required fields.' });
        return;
      }

      await NotificationService.logFailure(
        {
          userId,
          to,
          title,
          body,
          type: type as NotificationType,
          provider: provider as NotificationProvider,
        },
        errorMsg
      );

      res.status(201).json({ message: 'Failed notification log saved.' });
    } catch (error) {
      console.error('Error logging failed notification:', error);
      res.status(500).json({ error: 'Failed to log failed notification.' });
    }
  }
}

export default new NotificationController();
