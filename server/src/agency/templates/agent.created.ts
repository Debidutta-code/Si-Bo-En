import { AgentCreatedEmailParams } from "../types/template.types";
import { emailShell } from "./email.shell";


export function templateAgentCreated(params: AgentCreatedEmailParams): string {
    const { agentName, agentEmail, agentPassword, agencyName, loginUrl, createdByName } = params;
 
    const body = `
      <!-- Recipient -->
      <tr>
        <td class="content" style="padding:0 40px 30px 40px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#333333;">
            ${agentName}<br/>
            ${agencyName}
          </p>
        </td>
      </tr>
 
      <!-- Greeting -->
      <tr>
        <td class="content" style="padding:0 40px 20px 40px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#333333;">Dear ${agentName},</p>
          <p style="margin:10px 0 0 0;font-size:14px;font-weight:600;color:#333333;">
            RE: Your Agent Account Has Been Created – ${agencyName}
          </p>
        </td>
      </tr>
 
      <!-- Body -->
      <tr>
        <td class="content" style="padding:0 40px 20px 40px;">
          <p style="margin:0 0 20px 0;font-size:14px;line-height:1.8;color:#333333;text-align:justify;">
            Welcome to RevChill Tech! An agent account has been created for you under <strong>${agencyName}</strong>
            by <strong>${createdByName}</strong>. You now have access to the RevChill Tech partner portal.
          </p>
 
          <!-- Credentials Box -->
          <p style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#333333;">Your Login Credentials</p>
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
 
          <p style="margin:0 0 12px 0;font-size:14px;line-height:1.8;color:#333333;">To get started:</p>
          <ul style="margin:0 0 20px 0;padding-left:20px;font-size:14px;line-height:1.8;color:#333333;">
            <li>Log in using the credentials above</li>
            <li>Change your temporary password immediately</li>
            <li>Update your profile information</li>
            <li>Explore the available properties and tools</li>
          </ul>
 
          <p style="margin:0 0 20px 0;font-size:14px;line-height:1.8;color:#333333;text-align:justify;">
            If you did not expect this email or believe this was created in error, please contact our support team immediately.
          </p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#333333;">Best regards,</p>
        </td>
      </tr>
 
      <!-- Signature -->
      <tr>
        <td class="content" style="padding:0 40px 30px 40px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#333333;font-weight:600;">
            The RevChill Tech Team
          </p>
        </td>
      </tr>`;
 
    const footer = `
      <p style="margin:0 0 8px 0;font-size:13px;color:#666666;font-weight:bold;">Need Assistance?</p>
      <p style="margin:0 0 15px 0;font-size:12px;color:#666666;">
        Support: <a href="mailto:support@revchill.com" style="color:#4A90E2;text-decoration:none;">support@revchill.com</a>
      </p>`;
 
    return emailShell(body, footer, agentEmail);
}