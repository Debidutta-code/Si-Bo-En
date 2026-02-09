import nodemailer from "nodemailer";
import {config} from "../../config";
export async function sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
    const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: parseInt(config.smtpPort!),
        secure: false,
        auth: {
            user: config.senderEmail,
            pass: config.senderEmailPassword
        }
    });

    const mailOptions = {
        from: `${config.senderEmail}`,
        to,
        subject,
        html: htmlContent
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
}