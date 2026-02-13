export const generatePasswordResetLinkTemplate = (resetLink: string): string => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset - SwiftRooms</title>
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
                .button-container {
                    text-align: center;
                    margin: 30px 0;
                }
                .reset-button {
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
                .reset-button:hover {
                    background-color: #1d4ed8;
                }
                .link-box {
                    background-color: #f3f4f6;
                    padding: 15px;
                    border-radius: 4px;
                    margin: 20px 0;
                    word-break: break-all;
                    font-size: 12px;
                    color: #666;
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
                .expiry {
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
                    <div class="logo">SwiftRooms</div>
                    <h2>Password Reset Request</h2>
                </div>
                
                <div class="content">
                    <p>Hello,</p>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                </div>
                
                <div class="button-container">
                    <a href="${resetLink}" class="reset-button">Reset Password</a>
                </div>
                
                <div class="content">
                    <p>Or copy and paste this link into your browser:</p>
                </div>
                
                <div class="link-box">
                    ${resetLink}
                </div>
                
                <div class="expiry">
                    <strong>⏰ This link will expire in 30 minutes</strong>
                </div>
                
                <div class="content">
                    <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                </div>
                
                <div class="warning">
                    <strong>Security Notice:</strong> Never share this link with anyone. SwiftRooms staff will never ask for your password reset link.
                </div>
                
                <div class="footer">
                    <p>© ${new Date().getFullYear()} SwiftRooms. All rights reserved.</p>
                    <p>This is an automated email, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};
