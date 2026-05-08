import { AgencyType, AgentCommissionType } from '../types';

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatCommission(
    type: AgentCommissionType,
    value: number,
    currency: string | null
): string {
    if (type === 'percentage') return `${value}%`;
    return `${currency ?? ''} ${value}`.trim();
}

export function agencyTypeLabel(type: AgencyType): string {
    return type === 'travel_agency' ? 'Travel Agency' : 'Corporate';
}

// ─── Shared Layout Helpers ────────────────────────────────────────────────────

export function waveFooter(color: string, gradient: string): string {
    return `
      <tr>
        <td style="padding: 0;">
          <svg width="100%" height="20" style="display: block; margin-bottom: -1px;" preserveAspectRatio="none" viewBox="0 0 1200 20">
            <path d="M 0,10 Q 100,0 200,10 T 400,10 T 600,10 T 800,10 T 1000,10 T 1200,10 L 1200,20 L 0,20 Z" fill="${color}" opacity="0.3"/>
            <path d="M 0,13 Q 150,5 300,13 T 600,13 T 900,13 T 1200,13 L 1200,20 L 0,20 Z" fill="${color}" opacity="0.5"/>
            <path d="M 0,16 Q 80,10 160,16 T 320,16 T 480,16 T 640,16 T 800,16 T 960,16 T 1200,16 L 1200,20 L 0,20 Z" fill="${color}" opacity="0.7"/>
          </svg>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background: ${gradient}; height: 25px;">
                <svg width="100%" height="25" style="display: block;">
                  <defs>
                    <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.2)" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="25" fill="url(#dots)" />
                  <circle cx="10%" cy="12.5" r="8" fill="rgba(255,255,255,0.15)" />
                  <circle cx="30%" cy="12.5" r="6" fill="rgba(255,255,255,0.15)" />
                  <circle cx="50%" cy="12.5" r="10" fill="rgba(255,255,255,0.2)" />
                  <circle cx="70%" cy="12.5" r="6" fill="rgba(255,255,255,0.15)" />
                  <circle cx="90%" cy="12.5" r="8" fill="rgba(255,255,255,0.15)" />
                </svg>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
}

export function emailShell(
    bodyRows: string,
    footerContact: string,
    recipientEmail: string
): string {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @media only screen and (max-width: 600px) {
        .container { width: 100% !important; }
        .content   { padding: 20px !important; }
        .footer-bar { height: 20px !important; }
        .cred-box  { padding: 15px !important; }
      }
      @media only screen and (min-width: 601px) and (max-width: 1024px) {
        .container { width: 90% !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Arial',sans-serif;color:#333333;">
    <table class="container" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="max-width:650px;margin:40px auto;background:#ffffff;">
 
      <!-- Sender -->
      <tr>
        <td class="content" style="padding:40px 40px 20px 40px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#333333;">
            RevChill Tech Partnership Team<br/>
            RevChill Tech, Business Hub<br/>
          </p>
        </td>
      </tr>
 
      <!-- Date -->
      <tr>
        <td class="content" style="padding:0 40px 20px 40px;">
          <p style="margin:0;font-size:14px;color:#333333;">${formatDate(new Date())}</p>
        </td>
      </tr>
 
      ${bodyRows}
 
      <!-- Footer -->
      <tr>
        <td class="content" style="padding:0 40px 20px 40px;text-align:center;">
          ${footerContact}
          <p style="margin:8px 0 0 0;font-size:11px;color:#999999;line-height:1.6;">
            © ${new Date().getFullYear()} RevChill Tech. All rights reserved.<br/>
            This email was sent to ${recipientEmail}
          </p>
        </td>
      </tr>
 
      ${waveFooter('#4A90E2', 'linear-gradient(90deg,#2E5F8C 0%,#4A90E2 50%,#2E5F8C 100%)')}
    </table>
  </body>
</html>`;
}
