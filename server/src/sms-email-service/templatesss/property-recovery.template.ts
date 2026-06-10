import { config } from "../../config";

export const generatePropertyTransferSuccessTemplate = (
    propertyName: string,
    recoveredBy: string,
    recoveryDateTime: string,
    propertyId: string,
): string => {
    const frontendUrl = config.extranetUrl || 'http://localhost:5173';
    const propertyLink = `${frontendUrl}/app/property/${propertyId}`;

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Property Recovered - RevChill</title>
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
                .status-box {
                    background-color: #16a34a;
                    color: white;
                    font-size: 18px;
                    font-weight: bold;
                    text-align: center;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 30px 0;
                }
                .status-box span {
                    display: block;
                    font-size: 13px;
                    font-weight: normal;
                    margin-top: 6px;
                    opacity: 0.85;
                }
                .details-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                    background-color: #fff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                }
                .details-table td {
                    padding: 12px 16px;
                    border-bottom: 1px solid #e5e7eb;
                    font-size: 14px;
                }
                .details-table td:first-child {
                    font-weight: bold;
                    color: #555;
                    width: 40%;
                    background-color: #f3f4f6;
                }
                .details-table tr:last-child td {
                    border-bottom: none;
                }
                .content {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .button-container {
                    text-align: center;
                    margin: 24px 0;
                }
                .view-button {
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
                .view-button:hover {
                    background-color: #1d4ed8;
                }
                .warning {
                    background-color: #fef3c7;
                    border-left: 4px solid #f59e0b;
                    padding: 15px;
                    margin-top: 20px;
                    border-radius: 4px;
                    font-size: 14px;
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
                    <h2>Property Recovered</h2>
                </div>

                <div class="status-box">
                    ✓ Property Successfully Restored
                    <span>Your property is now active and visible again</span>
                </div>

                <div class="content">
                    <p>Good news! Your property has been successfully recovered and is now accessible on the RevChill platform.</p>
                </div>

                <table class="details-table">
                    <tr>
                        <td>Property Name</td>
                        <td>${propertyName}</td>
                    </tr>
                    <tr>
                        <td>Property ID</td>
                        <td>${propertyId}</td>
                    </tr>
                    <tr>
                        <td>Recovered By</td>
                        <td>${recoveredBy}</td>
                    </tr>
                    <tr>
                        <td>Recovery Date & Time</td>
                        <td>${recoveryDateTime}</td>
                    </tr>
                </table>

                <div class="button-container">
                    <a href="${propertyLink}" class="view-button">View Property</a>
                </div>

                <div class="warning">
                    <strong>Didn't request this?</strong> If you did not initiate this recovery or believe this was done in error, please contact RevChill support immediately.
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


export const generatePropertyTransferOTPTemplate = (
    otp: string,
    propertyName: string,
): string => {

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Property Transfer Request - RevChill</title>
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
                .property-name {
                    background-color: #eff6ff;
                    border: 1px solid #bfdbfe;
                    border-radius: 8px;
                    text-align: center;
                    padding: 14px 20px;
                    font-size: 16px;
                    font-weight: bold;
                    color: #1e40af;
                    margin: 20px 0;
                }
                .otp-box {
                    background-color: #16a34a;
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
                .steps {
                    background-color: #fff;
                    border-radius: 8px;
                    padding: 16px 20px;
                    margin: 20px 0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                    font-size: 14px;
                }
                .steps p {
                    margin: 8px 0;
                    color: #444;
                }
                .steps span {
                    display: inline-block;
                    background-color: #2563eb;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    text-align: center;
                    line-height: 20px;
                    font-size: 12px;
                    font-weight: bold;
                    margin-right: 8px;
                }
                .warning {
                    background-color: #fef3c7;
                    border-left: 4px solid #f59e0b;
                    padding: 15px;
                    margin-top: 20px;
                    border-radius: 4px;
                    font-size: 14px;
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
                    <h2>Property Recovery Request</h2>
                </div>

                <div class="content">
                    <p>A recovery request has been initiated for your property:</p>
                </div>

                <div class="property-name">
                    🏨 ${propertyName}
                </div>

                <div class="content">
                    <p>Please share the OTP below with the admin to confirm and complete the recovery process.</p>
                </div>

                <div class="otp-box">
                    ${otp}
                </div>

                <div class="content">
                    <p><strong>This OTP is valid for 10 minutes.</strong></p>
                    <p>If you didn't request this recovery, please ignore this email.</p>
                </div>

                <div class="steps">
                    <p><span>1</span> Share this OTP with the admin who initiated the recovery.</p>
                    <p><span>2</span> Admin will enter the OTP to confirm and restore your property.</p>
                    <p><span>3</span> You will receive a confirmation email once the recovery is complete.</p>
                </div>

                <div class="warning">
                    <strong>Security Notice:</strong> Never share this OTP with anyone other than the RevChill admin handling your recovery request. RevChill staff will never ask for your OTP unsolicited.
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