import nodemailer from 'nodemailer';

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
  const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:3001'}/login`;
  const fromEmail = process.env.EMAIL_FROM || 'RHIZAN Hub <onboarding@resend.dev>';

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

  // 1. Try Resend API if RESEND_API_KEY is configured
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

  // 2. Try Gmail or Standard SMTP
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;

  if (emailUser && emailPass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user: emailUser,
          pass: emailPass.replace(/\s+/g, ''), // Strip spaces if copied from Google App Password
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"RHIZAN Hub" <${emailUser}>`,
        to,
        subject: 'You have been invited to RHIZAN Hub',
        html: htmlContent,
      });

      console.log(`✉️ Email successfully delivered to ${to} via SMTP`);
      return { sent: true, message: `Email invitation dispatched to ${to}` };
    } catch (err: any) {
      console.error('❌ SMTP email delivery failed:', err.message);
      return { sent: false, message: `SMTP delivery failed: ${err.message}` };
    }
  }

  // 3. Fallback: log to console with clear guidance
  console.log(`\n========================================`);
  console.log(`📨 [INVITATION READY TO SEND]`);
  console.log(`To: ${to}`);
  console.log(`Temporary Password: ${temporaryPassword}`);
  console.log(`Login URL: ${loginUrl}`);
  console.log(`⚠️ To send real emails automatically, add RESEND_API_KEY or EMAIL_USER/EMAIL_PASS in server/.env`);
  console.log(`========================================\n`);

  return {
    sent: false,
    message: 'Invitation created. To send emails automatically, please configure your Gmail App Password or Resend API key in server/.env.',
  };
};
