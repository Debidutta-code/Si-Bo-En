import { ICAgencyApplication } from '../types';
import { agencyTypeLabel, emailShell } from './email.shell';

export function templateApplicationSubmitted(
    data: ICAgencyApplication & { id: string }
): string {
    const trackingBaseUrl = `https://bookings-revchilltech.trip-swift.ai/agency-application/track-application`;
    const trackingUrl = `${trackingBaseUrl}/${data.id}`;

    const submittedOn = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

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
            Thank you for submitting your <strong>${agencyTypeLabel(data.agencyType)}</strong> partnership application
            to RevChill Tech on <strong>${submittedOn}</strong>. We have successfully received your application and
            our partnership team will begin reviewing it shortly.
          </p>

          <p style="margin:0 0 25px 0;font-size:14px;line-height:1.8;color:#333333;text-align:justify;">
            You can expect a decision within <strong>3–5 business days</strong>. In the meantime, you can track
            the real-time status of your application using the button below. Keep your <strong>Application ID</strong>
            handy — you'll need it to track your application.
          </p>

          <!-- Application ID highlight box -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="margin:0 0 25px 0;background:#EFF6FF;border:2px solid #BFDBFE;border-radius:8px;">
            <tr>
              <td style="padding:20px;text-align:center;">
                <p style="margin:0 0 6px 0;font-size:12px;font-weight:700;color:#1D4ED8;text-transform:uppercase;letter-spacing:0.8px;">
                  Your Application ID
                </p>
                <p style="margin:0;font-size:22px;font-weight:700;color:#1E40AF;font-family:'Courier New',monospace;letter-spacing:1px;">
                  ${data.id}
                </p>
                <p style="margin:8px 0 0 0;font-size:11px;color:#3B82F6;">
                  Save this ID to track your application status
                </p>
              </td>
            </tr>
          </table>

          <!-- Track Application CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 30px 0;">
            <tr>
              <td align="center">
                <a href="${trackingUrl}"
                   style="display:inline-block;padding:13px 32px;background:#4A90E2;color:#ffffff;font-size:14px;
                          font-weight:600;text-decoration:none;border-radius:6px;letter-spacing:0.3px;">
                  Track Your Application
                </a>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top:10px;">
                <p style="margin:0;font-size:11px;color:#94A3B8;">
                  Or copy this link:
                  <a href="${trackingUrl}" style="color:#4A90E2;text-decoration:none;word-break:break-all;">${trackingUrl}</a>
                </p>
              </td>
            </tr>
          </table>

          <!-- Application Summary heading -->
          <p style="margin:0 0 8px 0;font-size:15px;font-weight:600;color:#333333;">Application Details</p>
          <p style="margin:0 0 15px 0;font-size:14px;line-height:1.8;color:#333333;">
            Please review the information below. If anything is incorrect, contact us immediately at
            <a href="mailto:partnerships@revchill.com" style="color:#4A90E2;text-decoration:none;">partnerships@revchill.com</a>
            before the review process begins.
          </p>

          <!-- Agency Information box -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="margin:0 0 20px 0;background:#F8FAFC;border:2px solid #E2E8F0;border-radius:8px;">
            <tr>
              <td style="padding:16px 20px 8px 20px;">
                <p style="margin:0;font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;">
                  Agency Information
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 20px 16px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;width:42%;"><strong>Agency Name:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#1E293B;">${data.agencyName}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;"><strong>Agency Type:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#1E293B;">${agencyTypeLabel(data.agencyType)}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;"><strong>Agency Email:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#1E293B;">${data.agencyEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;"><strong>Contact Number:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#1E293B;">${data.contactNo}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;"><strong>Tax Number:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#1E293B;">${data.taxNo}</td>
                  </tr>
                  ${data.iataCode ? `
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;"><strong>IATA Code:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#1E293B;">${data.iataCode}</td>
                  </tr>` : ''}
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;"><strong>Address:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#1E293B;">${data.address}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Applicant Information box -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="margin:0 0 20px 0;background:#F8FAFC;border:2px solid #E2E8F0;border-radius:8px;">
            <tr>
              <td style="padding:16px 20px 8px 20px;">
                <p style="margin:0;font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;">
                  Applicant Information
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 20px 16px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;width:42%;"><strong>Full Name:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#1E293B;">${data.applicantName}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;"><strong>Email:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#1E293B;">${data.applicantEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;"><strong>Phone:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#1E293B;">${data.applicantPhone}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;"><strong>Application Status:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#F59E0B;font-weight:600;">⏳ Pending Review</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;"><strong>Submitted On:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#1E293B;">${submittedOn}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- What Happens Next -->
          <p style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#333333;">What Happens Next?</p>
          <ul style="margin:0 0 20px 0;padding-left:20px;font-size:14px;line-height:1.8;color:#333333;">
            <li>Our team will review your application within <strong>3–5 business days</strong></li>
            <li>You will receive an email notification once a decision has been made</li>
            <li>If approved, your partner portal credentials will be sent to you</li>
            <li>If additional information is required, we will reach out directly</li>
          </ul>

          <p style="margin:0 0 20px 0;font-size:14px;line-height:1.8;color:#333333;text-align:justify;">
            Thank you for your interest in partnering with RevChill Tech. We appreciate your trust and look forward
            to reviewing your application.
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