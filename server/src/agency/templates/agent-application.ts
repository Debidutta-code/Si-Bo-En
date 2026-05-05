import { emailQueue } from '../../index';
import { IAgencyApplication, ICAgencyApplication, AgencyType, AgentCommissionType } from '../types';
 import { emailShell, agencyTypeLabel } from './email.shell';


 export function templateApplicationSubmitted(data: ICAgencyApplication): string {
    const body = `
      <!-- Recipient -->
      <tr>
        <td class="content" style="padding:0 40px 30px 40px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#333333;">
            ${data.applicantName}<br/>
            ${data.agencyName}<br/>
            ${data.address}
          </p>
        </td>
      </tr>
 
      <!-- Greeting -->
      <tr>
        <td class="content" style="padding:0 40px 20px 40px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#333333;">Dear ${data.applicantName},</p>
          <p style="margin:10px 0 0 0;font-size:14px;font-weight:600;color:#333333;">
            RE: Partnership Application Received – ${data.agencyName}
          </p>
        </td>
      </tr>
 
      <!-- Body -->
      <tr>
        <td class="content" style="padding:0 40px 20px 40px;">
          <p style="margin:0 0 20px 0;font-size:14px;line-height:1.8;color:#333333;text-align:justify;">
            Thank you for submitting your ${agencyTypeLabel(data.agencyType)} partnership application to RevChill Tech.
            We have received your application and our team will review it shortly.
          </p>
 
          <!-- Application Summary Box -->
          <p style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#333333;">Application Details</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="margin:0 0 25px 0;background:#F8FAFC;border:2px solid #E2E8F0;border-radius:8px;">
            <tr>
              <td style="padding:20px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;width:42%;"><strong>Agency Name:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;">${data.agencyName}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Agency Type:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;">${agencyTypeLabel(data.agencyType)}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Agency Email:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;">${data.agencyEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Contact Number:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;">${data.contactNo}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Tax Number:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;">${data.taxNo}</td>
                  </tr>
                  ${data.iataCode ? `
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>IATA Code:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;">${data.iataCode}</td>
                  </tr>` : ''}
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Applicant Name:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;">${data.applicantName}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Applicant Email:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;">${data.applicantEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Application Status:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#F59E0B;font-weight:600;">Pending Review</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
 
          <p style="margin:0 0 15px 0;font-size:14px;line-height:1.8;color:#333333;font-weight:600;">
            Please verify the details above
          </p>
          <p style="margin:0 0 20px 0;font-size:14px;line-height:1.8;color:#333333;text-align:justify;">
            If any of the information listed is incorrect or needs to be updated, please contact our partnership team
            immediately at <a href="mailto:partnerships@revchill.com" style="color:#4A90E2;text-decoration:none;">partnerships@revchill.com</a>
            so we can make the necessary changes before the review process begins.
          </p>
 
          <p style="margin:0 0 15px 0;font-size:14px;line-height:1.8;color:#333333;">What happens next:</p>
          <ul style="margin:0 0 20px 0;padding-left:20px;font-size:14px;line-height:1.8;color:#333333;">
            <li>Our team will review your application within 3–5 business days</li>
            <li>You will receive an email notification once a decision has been made</li>
            <li>If approved, your partner account credentials will be sent to you</li>
            <li>If additional information is required, we will reach out directly</li>
          </ul>
 
          <p style="margin:0 0 20px 0;font-size:14px;line-height:1.8;color:#333333;text-align:justify;">
            Thank you for your interest in partnering with RevChill Tech. We appreciate your trust and look forward to reviewing your application.
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
      <p style="margin:0 0 8px 0;font-size:13px;color:#666666;font-weight:bold;">Need Help?</p>
      <p style="margin:0 0 15px 0;font-size:12px;color:#666666;">
        Email: <a href="mailto:partnerships@revchill.com" style="color:#4A90E2;text-decoration:none;">partnerships@revchill.com</a> |
        Support: <a href="mailto:support@revchill.com" style="color:#4A90E2;text-decoration:none;">support@revchill.com</a>
      </p>`;
 
    return emailShell(body, footer, data.agencyEmail);
}