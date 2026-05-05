import { IAgencyApplication } from "../types";
import { formatCommission, agencyTypeLabel, emailShell } from "./email.shell";

interface ApprovalEmailParams {
    application: IAgencyApplication;
    agentEmail: string;
    agentPassword: string;
    loginUrl: string;
}
 
export function templateApplicationApproved({
    application,
    agentEmail,
    agentPassword,
    loginUrl,
}: ApprovalEmailParams): string {
    const formattedCommission = formatCommission(
        application.commissionType,
        application.commissionValue,
        application.commissionCurrency
    );
 
    const body = `
      <!-- Recipient -->
      <tr>
        <td class="content" style="padding:0 40px 30px 40px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#333333;">
            ${application.applicantName}<br/>
            ${application.agencyName}<br/>
            ${application.address}
          </p>
        </td>
      </tr>
 
      <!-- Greeting -->
      <tr>
        <td class="content" style="padding:0 40px 20px 40px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#333333;">Dear ${application.applicantName},</p>
          <p style="margin:10px 0 0 0;font-size:14px;font-weight:600;color:#333333;">
            RE: Partnership Approval – ${application.agencyName}
          </p>
        </td>
      </tr>
 
      <!-- Body -->
      <tr>
        <td class="content" style="padding:0 40px 20px 40px;">
          <p style="margin:0 0 20px 0;font-size:14px;line-height:1.8;color:#333333;text-align:justify;">
            Congratulations! We are delighted to inform you that your ${agencyTypeLabel(application.agencyType)} partnership
            application has been <strong style="color:#22C55E;">approved</strong>.
            Welcome to the RevChill Tech partner network!
          </p>
 
          <!-- Credentials Box -->
          <p style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#333333;">Your Account Credentials</p>
          <p style="margin:0 0 15px 0;font-size:14px;line-height:1.8;color:#333333;">
            Your partner account has been created. Use the credentials below to access the RevChill Tech partner portal:
          </p>
          <table class="cred-box" width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="margin:0 0 25px 0;background:#F8FAFC;border:2px solid #E2E8F0;border-radius:8px;">
            <tr>
              <td style="padding:25px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr><td style="padding:6px 0 2px;font-size:13px;color:#64748B;"><strong>Login URL:</strong></td></tr>
                  <tr>
                    <td style="padding:0 0 14px;">
                      <a href="${loginUrl}" style="font-size:14px;color:#4A90E2;text-decoration:none;word-break:break-all;">${loginUrl}</a>
                    </td>
                  </tr>
                  <tr><td style="padding:6px 0 2px;font-size:13px;color:#64748B;"><strong>Email:</strong></td></tr>
                  <tr>
                    <td style="padding:0 0 14px;font-size:14px;color:#1E293B;font-family:'Courier New',monospace;">${agentEmail}</td>
                  </tr>
                  <tr><td style="padding:6px 0 2px;font-size:13px;color:#64748B;"><strong>Temporary Password:</strong></td></tr>
                  <tr>
                    <td style="padding:0 0 10px;">
                      <span style="font-size:14px;color:#1E293B;font-family:'Courier New',monospace;background:#FFFFFF;padding:8px 12px;border-radius:4px;border:1px solid #E2E8F0;display:inline-block;">
                        ${agentPassword}
                      </span>
                    </td>
                  </tr>
                </table>
                <p style="margin:15px 0 0 0;font-size:12px;color:#DC2626;line-height:1.5;">
                  ⚠️ <strong>Important:</strong> Please change your password immediately after your first login for security purposes.
                </p>
              </td>
            </tr>
          </table>
 
          <!-- Partnership Details -->
          <p style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#333333;">Partnership Details</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="margin:0 0 25px 0;background:#F8FAFC;border:2px solid #E2E8F0;border-radius:8px;">
            <tr>
              <td style="padding:20px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;width:42%;"><strong>Agency Name:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;">${application.agencyName}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Agency Type:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;">${agencyTypeLabel(application.agencyType)}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Commission:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;">${formattedCommission}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Partnership Status:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#22C55E;font-weight:600;">Active</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
 
          <p style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#333333;">Next Steps</p>
          <ul style="margin:0 0 20px 0;padding-left:20px;font-size:14px;line-height:1.8;color:#333333;">
            <li>Log in to your partner portal using the credentials above</li>
            <li>Change your temporary password to a secure one</li>
            <li>Complete your agency profile and upload necessary documents</li>
            <li>Explore available properties and commission structures</li>
            <li>Review our partner guidelines and terms of service</li>
            <li>Contact our support team if you need any assistance</li>
          </ul>
 
          <p style="margin:0 0 20px 0;font-size:14px;line-height:1.8;color:#333333;text-align:justify;">
            We look forward to a prosperous partnership with ${application.agencyName} and are excited to support your growth in the travel industry.
          </p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#333333;">Best regards,</p>
        </td>
      </tr>
 
      <!-- Signature -->
      <tr>
        <td class="content" style="padding:0 40px 30px 40px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#333333;font-weight:600;">
            The RevChill Tech Partnership Team
          </p>
        </td>
      </tr>`;
 
    const footer = `
      <p style="margin:0 0 8px 0;font-size:13px;color:#666666;font-weight:bold;">Need Help Getting Started?</p>
      <p style="margin:0 0 15px 0;font-size:12px;color:#666666;">
        Email: <a href="mailto:partnerships@revchill.com" style="color:#4A90E2;text-decoration:none;">partnerships@revchill.com</a> |
        Support: <a href="mailto:support@revchill.com" style="color:#4A90E2;text-decoration:none;">support@revchill.com</a>
      </p>`;
 
    return emailShell(body, footer, application.agencyEmail);
}