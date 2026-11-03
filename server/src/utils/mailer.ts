import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

interface SendInvitationParams {
  to: string;
  name: string;
  temporaryPassword: string;
  invitedBy?: string;
}

export const sendInvitationEmail = async ({
  to,
  name,
  temporaryPassword,
  invitedBy = 'Rhizan Technologies',
}: SendInvitationParams): Promise<{ sent: boolean; message: string }> => {
  const clientBaseUrl =
    process.env.CLIENT_URL ||
    (process.env.NODE_ENV === 'production' || process.env.VERCEL
      ? 'https://rhizan-hub.vercel.app'
      : 'http://localhost:3001');
  const loginUrl = `${clientBaseUrl}/login`;
  const autoFillLoginUrl = `${clientBaseUrl}/login?email=${encodeURIComponent(to)}&temp=${encodeURIComponent(temporaryPassword)}`;

  const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const emailPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === 'true'
      : port === 465;

  const fromEmail =
    process.env.EMAIL_FROM ||
    (emailUser ? `"RHIZAN Hub" <${emailUser}>` : '"RHIZAN Hub" <contact@rhizantech.com>');

  const htmlContent = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>You have been invited to RHIZAN Hub</title>
      <style type="text/css">
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        .password-box:hover { border-color: #14b8a6 !important; background-color: #0a1120 !important; }
        .btn-primary:hover { background-color: #0f766e !important; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #080b11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #080b11; table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 40px 16px;">
            <!-- Outer Card Container (580px max) -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #0f1422; border: 1px solid #1e283d; border-radius: 20px; overflow: hidden; box-shadow: 0 24px 48px rgba(0, 0, 0, 0.65);">
              
              <!-- Top Accent Gradient Line -->
              <tr>
                <td style="height: 4px; background: linear-gradient(90deg, #0d9488 0%, #14b8a6 50%, #06b6d4 100%);"></td>
              </tr>

              <!-- Header & Brand -->
              <tr>
                <td style="padding: 36px 36px 20px 36px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td>
                        <div style="display: inline-block; padding: 6px 14px; background-color: rgba(13, 148, 136, 0.15); border: 1px solid rgba(20, 184, 166, 0.4); border-radius: 100px;">
                          <span style="font-size: 11px; font-weight: 800; color: #2dd4bf; letter-spacing: 1.5px; text-transform: uppercase;">✦ RHIZAN HUB</span>
                        </div>
                      </td>
                      <td align="right">
                        <span style="font-size: 11px; color: #64748b; font-family: monospace; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Workspace Access</span>
                      </td>
                    </tr>
                  </table>

                  <!-- Greeting & Title -->
                  <h1 style="margin: 24px 0 8px 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1.25;">
                    Welcome to the team, ${name}!
                  </h1>
                  <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
                    You have been invited by <strong style="color: #ffffff;">${invitedBy}</strong> to join the RHIZAN Hub operations platform. Your account is provisioned and ready for activation.
                  </p>
                </td>
              </tr>

              <!-- Credentials Card -->
              <tr>
                <td style="padding: 0 36px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0a0e19; border: 1px solid #1a2338; border-radius: 14px; padding: 22px;">
                    <tr>
                      <td>
                        <!-- Work Email Row -->
                        <span style="display: block; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 4px;">
                          Work Email
                        </span>
                        <span style="display: block; font-size: 14px; font-weight: 600; color: #e2e8f0; font-family: monospace; margin-bottom: 20px;">
                          ${to}
                        </span>

                        <!-- Temporary Password Header with Copy Hint -->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 8px;">
                          <tr>
                            <td>
                              <span style="font-size: 10px; font-weight: 800; color: #2dd4bf; text-transform: uppercase; letter-spacing: 1.2px;">
                                Temporary Password
                              </span>
                            </td>
                            <td align="right">
                              <span style="font-size: 11px; color: #94a3b8; font-weight: 500;">
                                📋 Click text to select & copy
                              </span>
                            </td>
                          </tr>
                        </table>

                        <!-- Click-to-Open & Auto-Fill Password Box -->
                        <a href="${autoFillLoginUrl}" target="_blank" style="text-decoration: none; display: block;" title="Click to auto-fill temporary password and sign in">
                          <div class="password-box" style="background-color: #050811; border: 1px dashed rgba(20, 184, 166, 0.6); border-radius: 12px; padding: 16px 20px; text-align: center; cursor: pointer;">
                            <span style="display: inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 22px; font-weight: 800; color: #2dd4bf; letter-spacing: 3px; user-select: all; -webkit-user-select: all; -moz-user-select: all; cursor: pointer;" title="Click to copy and auto-fill temporary password">
                              ${temporaryPassword}
                            </span>
                          </div>
                        </a>
                        <p style="margin: 8px 0 0 0; text-align: center; font-size: 11px; color: #64748b;">
                          💡 Click the password above to automatically fill credentials in your browser
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Primary Call To Action Button -->
              <tr>
                <td style="padding: 28px 36px 12px 36px; text-align: center;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                        <a href="${autoFillLoginUrl}" target="_blank" class="btn-primary" style="display: inline-block; background-color: #0d9488; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 12px; letter-spacing: 0.3px; box-shadow: 0 6px 18px rgba(13, 148, 136, 0.45); text-align: center;">
                          Accept Invitation & Sign In →
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 12px 0 0 0; font-size: 11px; color: #64748b;">
                    The button above opens RHIZAN Hub with your email and temporary password automatically filled in.
                  </p>
                </td>
              </tr>

              <!-- Security Notice Banner -->
              <tr>
                <td style="padding: 16px 36px 24px 36px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 12px; padding: 14px 16px;">
                    <tr>
                      <td valign="top" style="padding-right: 12px; width: 20px;">
                        <span style="font-size: 16px; line-height: 1;">🛡️</span>
                      </td>
                      <td>
                        <span style="display: block; font-size: 12px; font-weight: 700; color: #f59e0b; margin-bottom: 2px;">
                          Mandatory First-Login Password Change
                        </span>
                        <span style="display: block; font-size: 11px; color: #cbd5e1; line-height: 1.5;">
                          For security compliance, this temporary password expires upon first use. You will be prompted to create your new private password immediately after signing in.
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Manual Link Fallback -->
              <tr>
                <td style="padding: 0 36px 24px 36px; border-top: 1px solid #1a2338; padding-top: 20px;">
                  <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.6;">
                    If the button does not open, navigate directly to:<br />
                    <a href="${loginUrl}" style="color: #2dd4bf; text-decoration: none; word-break: break-all; font-family: monospace;">${loginUrl}</a>
                  </p>
                </td>
              </tr>

              <!-- Corporate Footer -->
              <tr>
                <td style="background-color: #0a0d18; padding: 24px 36px; border-top: 1px solid #182236; text-align: center;">
                  <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #94a3b8; letter-spacing: 0.5px;">
                    Rhizan Technologies • RHIZAN Hub Platform
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #475569; line-height: 1.5;">
                    This invitation was securely dispatched to <strong>${to}</strong>.<br />
                    If you did not expect this invitation, you can safely ignore this email.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // 1. Prioritize SMTP if configured
  if (emailUser && emailPass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user: emailUser,
          pass: emailPass.trim(),
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });

      const info = await transporter.sendMail({
        from: fromEmail,
        to,
        subject: 'You have been invited to RHIZAN Hub',
        html: htmlContent,
      });

      console.log(`✉️ Email successfully delivered to ${to} via SMTP (Message ID: ${info.messageId})`);
      return { sent: true, message: `Email invitation dispatched to ${to} via SMTP.` };
    } catch (err: any) {
      console.error('❌ SMTP email delivery failed:', err.message);
      return { sent: false, message: `SMTP delivery failed: ${err.message}` };
    }
  }

  // 2. Secondary: Resend API if RESEND_API_KEY is configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject: 'You have been invited to RHIZAN Hub',
          html: htmlContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Resend API error');
      }

      console.log(`✉️ Email successfully delivered to ${to} via Resend (ID: ${data.id})`);
      return { sent: true, message: `Email invitation dispatched to ${to} via Resend.` };
    } catch (err: any) {
      console.error('❌ Resend email delivery failed:', err.message);
      return { sent: false, message: `Resend error: ${err.message}` };
    }
  }

  // 3. Fallback: log to console with clear guidance
  console.log(`\n========================================`);
  console.log(`📨 [INVITATION READY TO SEND]`);
  console.log(`To: ${to}`);
  console.log(`Temporary Password: ${temporaryPassword}`);
  console.log(`Login URL: ${loginUrl}`);
  console.log(`⚠️ To send real emails automatically, ensure SMTP or Resend credentials are configured in server/.env`);
  console.log(`========================================\n`);

  return {
    sent: false,
    message: 'Invitation created. To send emails automatically, please configure SMTP credentials in server/.env.',
  };
};
