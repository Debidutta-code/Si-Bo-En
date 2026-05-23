import { emailShell } from '../../agency/templates/email.shell';
import { CurrencyCode } from '../../tax-system/interfaces';

export function templateSpaBookingConfirmation(data: {
    userName: string;
    userEmail: string;
    bookingId: string;
    slots: {
        spaName: string;
        date: string;
        startTime: string;
        endTime: string | null;
        amount: number;
        currencyCode: string;
    }[];
    totalAmount: number;
    currencyCode: string;
}): string {
    const bookedOn = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    const slotsHtml = data.slots.map(slot => `
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#1E293B;">${slot.spaName}</td>
          <td style="padding:8px 0;font-size:13px;color:#1E293B;">${slot.date}</td>
          <td style="padding:8px 0;font-size:13px;color:#1E293B;">
            ${slot.startTime}${slot.endTime ? ` – ${slot.endTime}` : ''}
          </td>
          <td style="padding:8px 0;font-size:13px;color:#1E293B;text-align:right;">
            ${slot.amount > 0 ? `${slot.currencyCode} ${slot.amount.toFixed(2)}` : 'Inclusive'}
          </td>
        </tr>
    `).join('');

    const body = `
      <tr>
        <td class="content" style="padding:0 40px 20px 40px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#333333;">Dear ${data.userName},</p>
          <p style="margin:10px 0 0 0;font-size:14px;line-height:1.8;color:#333333;">
            Your spa &amp; wellness booking has been <strong>confirmed</strong>. Please find the details below.
          </p>
        </td>
      </tr>

      <tr>
        <td class="content" style="padding:0 40px 20px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="background:#EFF6FF;border:2px solid #BFDBFE;border-radius:8px;">
            <tr>
              <td style="padding:20px;text-align:center;">
                <p style="margin:0 0 6px 0;font-size:12px;font-weight:700;color:#1D4ED8;
                           text-transform:uppercase;letter-spacing:0.8px;">Booking Reference</p>
                <p style="margin:0;font-size:22px;font-weight:700;color:#1E40AF;
                           font-family:'Courier New',monospace;letter-spacing:1px;">${data.bookingId}</p>
                <p style="margin:8px 0 0 0;font-size:11px;color:#3B82F6;">Booked on ${bookedOn}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td class="content" style="padding:0 40px 20px 40px;">
          <p style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#333333;">Booked Slots</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="background:#F8FAFC;border:2px solid #E2E8F0;border-radius:8px;">
            <tr>
              <td style="padding:10px 20px;font-size:11px;font-weight:700;color:#64748B;
                         text-transform:uppercase;letter-spacing:0.5px;">Service</td>
              <td style="padding:10px 20px;font-size:11px;font-weight:700;color:#64748B;
                         text-transform:uppercase;letter-spacing:0.5px;">Date</td>
              <td style="padding:10px 20px;font-size:11px;font-weight:700;color:#64748B;
                         text-transform:uppercase;letter-spacing:0.5px;">Time</td>
              <td style="padding:10px 20px;font-size:11px;font-weight:700;color:#64748B;
                         text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Amount</td>
            </tr>
            <tr>
              <td colspan="4" style="padding:0 20px 12px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  ${slotsHtml}
                </table>
              </td>
            </tr>
            ${data.totalAmount > 0 ? `
            <tr>
              <td colspan="4" style="padding:12px 20px;border-top:2px solid #E2E8F0;text-align:right;">
                <span style="font-size:14px;font-weight:700;color:#1E293B;">
                  Total: ${data.currencyCode} ${data.totalAmount.toFixed(2)}
                </span>
              </td>
            </tr>` : ''}
          </table>
        </td>
      </tr>

      <tr>
        <td class="content" style="padding:0 40px 30px 40px;">
          <p style="margin:0 0 12px 0;font-size:14px;line-height:1.8;color:#333333;">
            Please arrive <strong>10 minutes early</strong> for your appointment.
            If you need to cancel or reschedule, please contact us at least
            <strong>24 hours in advance</strong>.
          </p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#333333;">
            We look forward to welcoming you.
          </p>
          <p style="margin:16px 0 0 0;font-size:14px;font-weight:600;color:#333333;">
            The Spa &amp; Wellness Team
          </p>
        </td>
      </tr>`;

    const footer = `
      <p style="margin:0 0 8px 0;font-size:13px;color:#666666;font-weight:bold;">Need to make changes?</p>
      <p style="margin:0;font-size:12px;color:#666666;">
        Email: <a href="mailto:spa@revchill.com" style="color:#4A90E2;text-decoration:none;">spa@revchill.com</a>
      </p>`;

    return emailShell(body, footer, data.userEmail);
}