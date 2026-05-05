import { formatDate } from "../../ari/utils";
import { AgentDeletedEmailParams } from "../types/template.types";
import { emailShell } from "./email.shell";

export function templateAgentDeleted(params: AgentDeletedEmailParams): string {
    const { agentName, agentEmail, agencyName, deletedByName, reason } = params;
 
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
            RE: Your Agent Account Has Been Removed – ${agencyName}
          </p>
        </td>
      </tr>
 
      <!-- Body -->
      <tr>
        <td class="content" style="padding:0 40px 20px 40px;">
          <p style="margin:0 0 20px 0;font-size:14px;line-height:1.8;color:#333333;text-align:justify;">
            This is to inform you that your agent account under <strong>${agencyName}</strong> on the RevChill Tech
            platform has been <strong style="color:#DC2626;">removed</strong> by <strong>${deletedByName}</strong>
            on ${formatDate(new Date())}.
          </p>
 
          <!-- Account Info Box -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="margin:0 0 25px 0;background:#FEF2F2;border:2px solid #FECACA;border-radius:8px;">
            <tr>
              <td style="padding:20px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;width:42%;"><strong>Agent Name:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;">${agentName}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Agent Email:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;">${agentEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Agency:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;">${agencyName}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Removed By:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;">${deletedByName}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Date:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;">${formatDate(new Date())}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Account Status:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#DC2626;font-weight:600;">Deactivated</td>
                  </tr>
                </table>
                ${reason ? `
                <div style="margin-top:15px;padding-top:15px;border-top:1px solid #FECACA;">
                  <p style="margin:0 0 5px 0;font-size:13px;color:#DC2626;font-weight:600;">Reason:</p>
                  <p style="margin:0;font-size:14px;line-height:1.8;color:#333333;">${reason}</p>
                </div>` : ''}
              </td>
            </tr>
          </table>
 
          <p style="margin:0 0 20px 0;font-size:14px;line-height:1.8;color:#333333;text-align:justify;">
            Your access to the RevChill Tech partner portal has been revoked immediately. If you believe this was
            done in error or have any questions regarding this decision, please contact your agency administrator
            or our support team.
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
      <p style="margin:0 0 8px 0;font-size:13px;color:#666666;font-weight:bold;">Questions?</p>
      <p style="margin:0 0 15px 0;font-size:12px;color:#666666;">
        Support: <a href="mailto:support@revchill.com" style="color:#4A90E2;text-decoration:none;">support@revchill.com</a>
      </p>`;
 
    return emailShell(body, footer, agentEmail);
}