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
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #f5f5f5; margin: 0; padding: 24px; }
        .card { max-width: 520px; margin: 0 auto; background-color: #121212; border: 1px solid #262626; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .logo-badge { display: inline-block; background: #14b8a6; color: #0a0a0a; font-weight: 800; font-size: 14px; padding: 4px 10px; border-radius: 6px; letter-spacing: 1px; margin-bottom: 20px; }
        h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 8px; }
        p { font-size: 14px; line-height: 1.6; color: #a3a3a3; margin: 12px 0; }
        .cred-box { background: #1a1a1a; border: 1px dashed #333333; border-radius: 10px; padding: 16px; margin: 24px 0; }
        .cred-item { font-size: 13px; margin: 6px 0; color: #d4d4d4; }
        .cred-item strong { color: #14b8a6; }
        .btn { display: inline-block; background-color: #0d9488; color: #ffffff !important; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: 600; border-radius: 8px; margin: 16px 0; text-align: center; }
        .footer { font-size: 12px; color: #737373; margin-top: 24px; border-top: 1px solid #262626; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo-badge">RHIZAN HUB</div>
        <h1>Welcome to RHIZAN Hub, ${name}!</h1>
        <p>You have been invited by <strong>${invitedBy}</strong> to join the RHIZAN Hub workspace.</p>
        
        <div class="cred-box">
          <div class="cred-item"><strong>Work Email:</strong> ${to}</div>
          <div class="cred-item"><strong>Temporary Password:</strong> ${temporaryPassword}</div>
        </div>

        <p>⚠️ <strong>Security Notice:</strong> Upon your first sign in, you will be prompted to set your new permanent password before entering the platform.</p>

        <a href="${loginUrl}" class="btn">Sign In to RHIZAN Hub</a>

        <div class="footer">
          Rhizan Technologies • Internal Workspace Management
        </div>
      </div>
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
