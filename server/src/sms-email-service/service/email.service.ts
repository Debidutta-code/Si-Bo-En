import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

interface SendEmailInput {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: {
    content: string; // base64 encoded string
    filename: string;
    type: string; // e.g. "application/pdf"
    disposition?: string; // optional (default: "attachment")
  }[];
}

class EmailService {
  public async sendEmail(input: SendEmailInput): Promise<void> {
    const {
      to,
      subject,
      text,
      html,
      // , attachments = []
    } = input;

    if (!text && !html) {
      throw new Error('At least one of "text" or "html" must be provided.');
    }

    const senderEmail = process.env.SENDER_EMAIL;
    const name = process.env.SENDER_NAME;
    if (!senderEmail) {
      throw new Error(
        'Sender email is not defined. Please set SENDER_EMAIL in .env'
      );
    }

    const msg = {
      to,
      from: {
        email: senderEmail,
        name: name,
      }, // Must be verified in SendGrid
      subject,
      ...(text && { text }),
      ...(html && { html }),
      // attachments,
    };

    try {
      await sgMail.send(msg as any); // Cast to `any` to bypass strict internal type
      console.log(`✅ Email sent to ${to}`);
    } catch (error: any) {
      console.error(
        '❌ SendGrid Error:',
        error.response?.body || error.message
      );
      throw new Error('Email sending failed');
    }
  }
}

export default new EmailService();
