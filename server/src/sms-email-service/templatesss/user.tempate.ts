import { config } from "../../config";

export const generateOTPEmailTemplate = (
    otp: string,
    purpose: string,
    email?: string
): string => {
    const purposeText =
        {
            email_verification: 'Email Verification',
            password_reset: 'Password Reset',
            login: 'Login Verification',
            customer_reset: 'Password Reset',
        }[purpose] || 'Verification';

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink =
        purpose === 'password_reset' && email
            ? `${frontendUrl}/forgot-password?email=${encodeURIComponent(email)}&otp=${otp}&verified=true`
            : '';

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${purposeText} - RevChill </title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .container {
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 28px;
                    font-weight: bold;
                    color: #2563eb;
                }
                .otp-box {
                    background-color: #2563eb;
                    color: white;
                    font-size: 32px;
                    font-weight: bold;
                    text-align: center;
                    padding: 20px;
                    border-radius: 8px;
                    letter-spacing: 8px;
                    margin: 30px 0;
                }
                .content {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .button-container {
                    text-align: center;
                    margin: 20px 0;
                }
                .reset-button {
                    display: inline-block;
                    background-color: #2563eb;
                    color: white !important;
                    text-decoration: none;
                    padding: 15px 40px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .reset-button:hover {
                    background-color: #1d4ed8;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 12px;
                    color: #666;
                }
                .warning {
                    background-color: #fef3c7;
                    border-left: 4px solid #f59e0b;
                    padding: 15px;
                    margin-top: 20px;
                    border-radius: 4px;
                }
                .divider {
                    text-align: center;
                    margin: 20px 0;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">RevChill</div>
                    <h2>${purposeText}</h2>
                </div>
                <div class="otp-box">
                    ${otp}
                </div>
                
                <div class="content">
                    <p><strong>This OTP is valid for 10 minutes.</strong></p>
                    <p>If you didn't request this code, please ignore this email.</p>
                </div>
                
                <div class="warning">
                    <strong>Security Notice:</strong> Never share this OTP with anyone. RevChill staff will never ask for your OTP.
                </div>
                
                <div class="footer">
                    <p>© ${new Date().getFullYear()} RevChill. All rights reserved.</p>
                    <p>This is an automated email, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

export const generateWelcomeEmailTemplate = (name: string): string => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to RevChill</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .container {
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 28px;
                    font-weight: bold;
                    color: #2563eb;
                }
                .content {
                    margin-bottom: 20px;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 12px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">RevChill</div>
                    <h2>Welcome Aboard!</h2>
                </div>
                
                <div class="content">
                    <p>Dear ${name},</p>
                    <p>Welcome to RevChill! We're excited to have you on board.</p>
                    <p>Your account has been successfully verified and you can now access all features of our property management system.</p>
                    <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                    <p>Best regards,<br>The RevChill Team</p>
                </div>
                
                <div class="footer">
                    <p>© ${new Date().getFullYear()} RevChill. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

export const generateAccountCreatedTemplate = (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    propertyName: string,
    loginUrl: string
): string => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Created - RevChill</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .container {
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 28px;
                    font-weight: bold;
                    color: #2563eb;
                }
                .content {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .credentials-box {
                    background-color: #f3f4f6;
                    padding: 20px;
                    border-radius: 6px;
                    margin: 20px 0;
                    text-align: left;
                }
                .credentials-box p {
                    margin: 8px 0;
                    font-size: 14px;
                }
                .credentials-box .label {
                    color: #666;
                    font-weight: bold;
                }
                .credentials-box .value {
                    font-family: monospace;
                    background-color: #fff;
                    padding: 4px 8px;
                    border-radius: 4px;
                    border: 1px solid #e5e7eb;
                }
                .button-container {
                    text-align: center;
                    margin: 30px 0;
                }
                .change-password-button {
                    display: inline-block;
                    background-color: #2563eb;
                    color: white;
                    text-decoration: none;
                    padding: 15px 40px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .change-password-button:hover {
                    background-color: #1d4ed8;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 12px;
                    color: #666;
                }
                .warning {
                    background-color: #fef3c7;
                    border-left: 4px solid #f59e0b;
                    padding: 15px;
                    margin-top: 20px;
                    border-radius: 4px;
                }
                .action-required {
                    background-color: #fee2e2;
                    border-left: 4px solid #ef4444;
                    padding: 15px;
                    margin-top: 20px;
                    border-radius: 4px;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">RevChill</div>
                    <h2>Your Account Has Been Created for ${propertyName}</h2>
                </div>

                <div class="content">
                    <p>Hello ${firstName} ${lastName},</p>
                    <p>An account has been created for you on RevChill. Here are your login details:</p>
                </div>

                <div class="credentials-box">
                    <p><span class="label">Email:</span> <span class="value">${email}</span></p>
                    <p><span class="label">Temporary Password:</span> <span class="value">${password}</span></p>
                </div>

                <div class="action-required">
                    <strong>⚠️ For your security, please change this password after your first login.</strong>
                </div>

                <div class="button-container">
                    <a href="${loginUrl}" class="change-password-button">Log In &amp; Change Password</a>
                </div>

                <div class="content">
                    <p>If you did not expect this email or believe this account was created in error, please contact support immediately.</p>
                </div>

                <div class="warning">
                    <strong>Security Notice:</strong> Never share your password with anyone. RevChill staff will never ask for your password.
                </div>

                <div class="footer">
                    <p>© ${new Date().getFullYear()} RevChill. All rights reserved.</p>
                    <p>This is an automated email, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};