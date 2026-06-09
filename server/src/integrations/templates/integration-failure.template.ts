// integrations/site-minder/templates/site-minder-failure.template.ts

import { emailShell } from "../../agency/templates/email.shell";
import { SiteMinderAvailDayJobData, SiteMinderDayJobData, SiteMinderRateDayJobData } from "../../queue/site-minder.queus";

export function templateSiteMinderFailure(record: {
    type: 'availability' | 'rates';
    hotelCode: string;
    date: string;
    roomTypeCode: string;
    ratePlanCode: string;
    reason: string;
    failedAt: string;
    attemptsMade: number;
    originalJobId: string | undefined;
    rawData: SiteMinderDayJobData;
}): string {
    const typeLabel = record.type === 'availability' ? 'Availability' : 'Rate Amount';
    const typeColor = record.type === 'availability' ? '#D97706' : '#DC2626';

    const availData = record.type === 'availability' ? record.rawData as SiteMinderAvailDayJobData : null;
    const ratesData = record.type === 'rates' ? record.rawData as SiteMinderRateDayJobData : null;

    const body = `
      <!-- Greeting -->
      <tr>
        <td class="content" style="padding:0 40px 20px 40px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#333333;">Dear Operations Team,</p>
          <p style="margin:10px 0 0 0;font-size:14px;font-weight:600;color:#333333;">
            RE: SiteMinder ${typeLabel} Push — Permanent Failure
          </p>
        </td>
      </tr>

      <!-- Alert Banner -->
      <tr>
        <td class="content" style="padding:0 40px 20px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="margin:0 0 25px 0;background:#FEF2F2;border:2px solid #FECACA;border-radius:8px;">
            <tr>
              <td style="padding:20px;">
                <p style="margin:0 0 8px 0;font-size:15px;color:#DC2626;font-weight:700;">
                  🚨 Manual Intervention Required
                </p>
                <p style="margin:0;font-size:14px;line-height:1.8;color:#333333;">
                  A SiteMinder <strong>${typeLabel}</strong> job has permanently failed after
                  <strong>${record.attemptsMade} attempts</strong> and could not be recovered by the dead-letter queue.
                  The affected date will not reflect the latest data from SiteMinder until this is resolved.
                </p>
              </td>
            </tr>
          </table>

          <!-- Job Details -->
          <p style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#333333;">Failure Details</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="margin:0 0 25px 0;background:#F8FAFC;border:2px solid #E2E8F0;border-radius:8px;">
            <tr>
              <td style="padding:20px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;width:42%;"><strong>Job Type:</strong></td>
                    <td style="padding:6px 0;font-size:13px;font-weight:700;color:${typeColor};">${typeLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;"><strong>Original Job ID:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#1E293B;font-family:monospace;">${record.originalJobId ?? 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;"><strong>Hotel Code:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#1E293B;font-family:monospace;">${record.hotelCode}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;"><strong>Date Affected:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#1E293B;font-weight:600;">${record.date}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;"><strong>Room Type Code:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#1E293B;font-family:monospace;">${record.roomTypeCode}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;"><strong>Rate Plan Code:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#1E293B;font-family:monospace;">${record.ratePlanCode}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;"><strong>Attempts Made:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#DC2626;font-weight:600;">${record.attemptsMade}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;"><strong>Failed At:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#1E293B;">${new Date(record.failedAt).toLocaleString('en-GB', { timeZone: 'UTC' })} UTC</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Error Reason -->
          <p style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#333333;">Error Reason</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="margin:0 0 25px 0;background:#FFF7ED;border:2px solid #FED7AA;border-radius:8px;">
            <tr>
              <td style="padding:20px;">
                <p style="margin:0;font-size:13px;line-height:1.8;color:#333333;font-family:monospace;word-break:break-all;">
                  ${record.reason}
                </p>
              </td>
            </tr>
          </table>

          <!-- Availability Payload -->
          ${availData ? `
          <p style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#333333;">Availability Data — Use This to Re-push</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="margin:0 0 25px 0;background:#F0FDF4;border:2px solid #BBF7D0;border-radius:8px;">
            <tr>
              <td style="padding:20px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;width:44%;"><strong>Booking Limit:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;font-family:monospace;">${availData.bookingLimit ?? 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Master Restriction:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;font-family:monospace;">${availData.restrictionStatuses?.find(r => !r.restriction || r.restriction === 'Master')?.status ?? 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Closed to Arrival:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;font-family:monospace;">${availData.restrictionStatuses?.find(r => r.restriction === 'Arrival')?.status ?? 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Closed to Departure:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;font-family:monospace;">${availData.restrictionStatuses?.find(r => r.restriction === 'Departure')?.status ?? 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Min LOS:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;font-family:monospace;">${availData.lengthsOfStay?.find(l => l.minMaxMessageType === 'SetMinLOS')?.time ?? 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748B;"><strong>Max LOS:</strong></td>
                    <td style="padding:5px 0;font-size:13px;color:#1E293B;font-family:monospace;">${availData.lengthsOfStay?.find(l => l.minMaxMessageType === 'SetMaxLOS')?.time ?? 'N/A'}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>` : ''}

          <!-- Rates Payload -->
          ${ratesData ? `
          <p style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#333333;">Rate Data — Use This to Re-push</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="margin:0 0 12px 0;background:#F0FDF4;border:2px solid #BBF7D0;border-radius:8px;">
            <tr>
              <td style="padding:20px;">
                <p style="margin:0 0 10px 0;font-size:13px;color:#64748B;font-weight:600;">Base by Guest Amounts</p>
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
                  <tr>
                    <td style="padding:4px 8px 4px 0;font-size:12px;color:#64748B;font-weight:600;">Guests</td>
                    <td style="padding:4px 8px 4px 0;font-size:12px;color:#64748B;font-weight:600;">Age Code</td>
                    <td style="padding:4px 0;font-size:12px;color:#64748B;font-weight:600;">Amount (before tax)</td>
                  </tr>
                  ${ratesData.rates.baseByGuestAmounts.map((b: any) => `
                  <tr>
                    <td style="padding:4px 8px 4px 0;font-size:13px;color:#1E293B;font-family:monospace;">${b.numberOfGuests}</td>
                    <td style="padding:4px 8px 4px 0;font-size:13px;color:#1E293B;font-family:monospace;">${b.ageQualifyingCode}</td>
                    <td style="padding:4px 0;font-size:13px;color:#1E293B;font-family:monospace;">${b.amountBeforeTax} ${ratesData.rates.currencyCode}</td>
                  </tr>`).join('')}
                </table>
                ${ratesData.rates.additionalGuestAmounts?.length > 0 ? `
                <p style="margin:0 0 10px 0;font-size:13px;color:#64748B;font-weight:600;">Additional Guest Amounts</p>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:4px 8px 4px 0;font-size:12px;color:#64748B;font-weight:600;">Age Code</td>
                    <td style="padding:4px 0;font-size:12px;color:#64748B;font-weight:600;">Amount</td>
                  </tr>
                  ${ratesData.rates.additionalGuestAmounts.map((a: any) => `
                  <tr>
                    <td style="padding:4px 8px 4px 0;font-size:13px;color:#1E293B;font-family:monospace;">${a.ageQualifyingCode}</td>
                    <td style="padding:4px 0;font-size:13px;color:#1E293B;font-family:monospace;">${a.amount} ${ratesData.rates.currencyCode}</td>
                  </tr>`).join('')}
                </table>` : ''}
              </td>
            </tr>
          </table>` : ''}

          <!-- Raw JSON -->
          <p style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#333333;">Raw Payload (JSON)</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="margin:0 0 25px 0;background:#1E293B;border-radius:8px;">
            <tr>
              <td style="padding:20px;">
                <pre style="margin:0;font-size:11px;color:#94a3b8;font-family:monospace;white-space:pre-wrap;word-break:break-all;">${JSON.stringify(record.rawData, null, 2)}</pre>
              </td>
            </tr>
          </table>

          <!-- Action Required -->
          <p style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#333333;">Action Required</p>
          <ul style="margin:0 0 20px 0;padding-left:20px;font-size:14px;line-height:1.8;color:#333333;">
            <li>Check the database for the affected date <strong>${record.date}</strong></li>
            <li>Verify the SiteMinder connection and credentials for hotel <strong>${record.hotelCode}</strong></li>
            <li>Manually re-trigger the ${typeLabel.toLowerCase()} push if needed</li>
            <li>Review server logs for root cause around <strong>${record.failedAt}</strong></li>
          </ul>

          <p style="margin:0;font-size:14px;line-height:1.6;color:#333333;">Best regards,</p>
        </td>
      </tr>

      <!-- Signature -->
      <tr>
        <td class="content" style="padding:0 40px 30px 40px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#333333;font-weight:600;">
            RevChill Tech — Automated Monitoring System
          </p>
        </td>
      </tr>`;

    const footer = `
      <p style="margin:0 0 8px 0;font-size:13px;color:#666666;font-weight:bold;">RevChill Tech Engineering</p>
      <p style="margin:0 0 15px 0;font-size:12px;color:#666666;">
        This is an automated alert. Do not reply to this email.
      </p>`;

    return emailShell(body, footer, 'ops@revchill.com');
}