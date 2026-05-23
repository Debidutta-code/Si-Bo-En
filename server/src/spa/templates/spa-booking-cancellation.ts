import { emailShell } from '../../agency/templates/email.shell';

export function templateSpaBookingCancellation(data: {
    userName: string;
    userEmail: string;
    bookingId: string;
    cancelledSlot: {
        spaName: string;
        date: string;
        startTime: string;
        endTime: string | null;
    };
    cancelledOn: string;
}): string {
    const body = `
      <tr>
        <td class="content" style="padding:0 40px 20px 40px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#333333;">Dear ${data.userName},</p>
          <p style="margin:10px 0 0 0;font-size:14px;line-height:1.8;color:#333333;">
            Your spa slot has been <strong>cancelled</strong> as requested. Details below.
          </p>
        </td>
      </tr>

      <tr>
        <td class="content" style="padding:0 40px 20px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="background:#FEF2F2;border:2px solid #FECACA;border-radius:8px;">
            <tr>
              <td style="padding:20px;text-align:center;">
                <p style="margin:0 0 6px 0;font-size:12px;font-weight:700;color:#DC2626;
                           text-transform:uppercase;letter-spacing:0.8px;">Cancellation Reference</p>
                <p style="margin:0;font-size:22px;font-weight:700;color:#B91C1C;
                           font-family:'Courier New',monospace;letter-spacing:1px;">${data.bookingId}</p>
                <p style="margin:8px 0 0 0;font-size:11px;color:#EF4444;">Cancelled on ${data.cancelledOn}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td class="content" style="padding:0 40px 20px 40px;">
          <p style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#333333;">Cancelled Slot</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="background:#F8FAFC;border:2px solid #E2E8F0;border-radius:8px;">
            <tr>
              <td style="padding:16px 20px 8px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;width:40%;"><strong>Service:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#1E293B;">${data.cancelledSlot.spaName}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;"><strong>Date:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#1E293B;">${data.cancelledSlot.date}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;"><strong>Time:</strong></td>
                    <td style="padding:6px 0;font-size:13px;color:#1E293B;">
                      ${data.cancelledSlot.startTime}${data.cancelledSlot.endTime ? ` – ${data.cancelledSlot.endTime}` : ''}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td class="content" style="padding:0 40px 30px 40px;">
          <p style="margin:0 0 12px 0;font-size:14px;line-height:1.8;color:#333333;">
            If you did not request this cancellation or wish to rebook, please contact us and we will do our best to accommodate you.
          </p>
          <p style="margin:0;font-size:14px;font-weight:600;color:#333333;">The Spa &amp; Wellness Team</p>
        </td>
      </tr>`;

    const footer = `
      <p style="margin:0 0 8px 0;font-size:13px;color:#666666;font-weight:bold;">Need help?</p>
      <p style="margin:0;font-size:12px;color:#666666;">
        Email: <a href="mailto:spa@revchill.com" style="color:#4A90E2;text-decoration:none;">spa@revchill.com</a>
      </p>`;

    return emailShell(body, footer, data.userEmail);
}