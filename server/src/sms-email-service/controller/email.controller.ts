import { Request, Response } from 'express';
import EmailService from '../service/email.service';

class EmailController {
  /**
   * POST /api/email/send
   * Sends an email via SendGrid
   */
  public async sendEmail(req: Request, res: Response): Promise<void> {
    try {
      const { to, subject, text, html } = req.body;

      if (!to || !subject || (!text && !html)) {
        res.status(400).json({
          error:
            'Missing required fields: to, subject, and either text or html.',
        });
        return;
      }

      await EmailService.sendEmail({ to, subject, text, html });

      res.status(200).json({ message: 'Email sent successfully.' });
    } catch (error: any) {
      console.error('Error in EmailController:', error.message);
      res.status(500).json({ error: 'Failed to send email.' });
    }
  }
}

export default new EmailController();
