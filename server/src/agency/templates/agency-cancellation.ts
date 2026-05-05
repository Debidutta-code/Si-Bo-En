import { IAgencyApplication } from "../types";
import { agencyTypeLabel, emailShell } from "./email.shell";

interface RejectionEmailParams {
    application: IAgencyApplication;
    rejectionReason: string;
}
 
export function templateApplicationRejected({ application, rejectionReason }: RejectionEmailParams): string {
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
            RE: Application Status Update – ${application.agencyName}
          </p>
        </td>
      </tr>
 
      <!-- Body -->
      <tr>
        <td class="content" style="padding:0 40px 20px 40px;">
          <p style="margin:0 0 20px 0;font-size:14px;line-height:1.8;color:#333333;text-align:justify;">
            Thank you for your interest in partnering with RevChill Tech and for taking the time to submit your
            ${agencyTypeLabel(application.agencyType)} partnership application. We truly appreciate the opportunity to review
            ${application.agencyName}'s credentials.
          </p>
 
          <p style="margin:0 0 20px 0;font-size:14px;line-height:1.8;color:#333333;text-align:justify;">
            After careful consideration, we regret to inform you that we are <strong style="color:#DC2626;">unable to approve</strong>
            your partnership application at this time.
          </p>
 
          <!-- Rejection Reason Box -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="margin:0 0 25px 0;background:#FEF2F2;border:2px solid #FECACA;border-radius:8px;">
            <tr>
              <td style="padding:20px;">
                <p style="margin:0 0 8px 0;font-size:13px;color:#DC2626;font-weight:600;">Reason for Decline:</p>
                <p style="margin:0;font-size:14px;line-height:1.8;color:#333333;">${rejectionReason}</p>
              </td>
            </tr>
          </table>
 
          <!-- Submitted Details Recap -->
          <p style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#333333;">Application Details Submitted</p>
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
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Agency Email:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;">${application.agencyEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Tax Number:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;">${application.taxNo}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Application Status:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#DC2626;font-weight:600;">Declined</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
 
          <p style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#333333;">Interested in Reapplying?</p>
          <p style="margin:0 0 15px 0;font-size:14px;line-height:1.8;color:#333333;">
            We encourage you to address the concerns mentioned above and resubmit your application:
          </p>
          <ul style="margin:0 0 20px 0;padding-left:20px;font-size:14px;line-height:1.8;color:#333333;">
            <li>Review and update any incomplete or inaccurate information</li>
            <li>Ensure all required documents are valid and up-to-date</li>
            <li>Provide additional verification if mentioned in the reason above</li>
            <li>Wait at least 7 days before reapplying</li>
            <li>Contact our partner support team if you need clarification</li>
          </ul>
 
          <p style="margin:0 0 20px 0;font-size:14px;line-height:1.8;color:#333333;text-align:justify;">
            We appreciate your understanding and look forward to the possibility of working with ${application.agencyName} in the future.
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
      <p style="margin:0 0 8px 0;font-size:13px;color:#666666;font-weight:bold;">Contact Our Partnership Team</p>
      <p style="margin:0 0 15px 0;font-size:12px;color:#666666;">
        Email: <a href="mailto:partnerships@revchill.com" style="color:#4A90E2;text-decoration:none;">partnerships@revchill.com</a>
      </p>`;
 
    return emailShell(body, footer, application.agencyEmail);
}