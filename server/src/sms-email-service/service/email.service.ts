// 

import nodemailer from "nodemailer";

interface SendEmailInput {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: {
    content: string;          // base64 encoded string
    filename: string;
    type: string;             // e.g. "application/pdf"
    disposition?: string;     // optional (default: "attachment")
  }[];
}

class EmailService {
  private transporter;

  constructor() {
   this.transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

  }

  public async sendEmail(input: SendEmailInput): Promise<void> {
    const { to, subject, text, html, attachments = [] } = input;

    if (!text && !html) {
      throw new Error('At least one of "text" or "html" must be provided.');
    }

    const senderEmail = process.env.SMTP_USER;
    const name = process.env.SENDER_NAME || "YourApp";

    if (!senderEmail) {
      throw new Error("Sender email is not defined. Please set SMTP_USER in .env");
    }
    const mailOptions = {
      from: `"${name}" <${senderEmail}>`,
      to,
      subject,
      ...(text && { text }),
      ...(html && { html }),
      attachments: attachments.map(att => ({
        filename: att.filename,
        content: Buffer.from(att.content, "base64"), // decode base64
        contentType: att.type,
        disposition: att.disposition || "attachment",
      })),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}`);
    } catch (error: any) {
      console.error("❌ Nodemailer Error:", error.message);
      throw new Error("Email sending failed");
    }
  }
}

export default new EmailService();
