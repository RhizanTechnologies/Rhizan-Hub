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
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || '"RHIZAN Hub" <no-reply@rhizan.com>';
  const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:3001'}/login`;

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
        .footer { font-size: 12px; color: #737373; margin-top: 24px; border-top: 1px solid #262626; pt: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo-badge">RHIZAN HUB</div>
        <h1>Welcome to RHIZAN Hub, ${name}!</h1>
        <p>You have been invited by ${invitedBy} to join the RHIZAN Hub internal operations workspace.</p>
        
        <div class="cred-box">
          <div class="cred-item"><strong>Email:</strong> ${to}</div>
          <div class="cred-item"><strong>Temporary Password:</strong> ${temporaryPassword}</div>
        </div>

        <p>⚠️ <strong>Security Requirement:</strong> For your security, you will be prompted to change your temporary password immediately upon your first login.</p>

        <a href="${loginUrl}" class="btn">Sign In to RHIZAN Hub</a>

        <div class="footer">
          If you did not expect this invitation, you can safely ignore this email.<br/>
          Rhizan Technologies • Internal Workspace
        </div>
      </div>
    </body>
    </html>
  `;

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      await transporter.sendMail({
        from,
        to,
        subject: 'Invitation to join RHIZAN Hub',
        html: htmlContent,
      });

      console.log(`✉️ Email invitation successfully dispatched to ${to}`);
      return { sent: true, message: 'Invitation email sent successfully.' };
    } catch (err: any) {
      console.error(`Failed to send email via SMTP:`, err.message);
      return { sent: false, message: `SMTP error: ${err.message}` };
    }
  }

  // If no SMTP configured, log simulated email to console
  console.log(`\n========================================`);
  console.log(`📨 [SIMULATED EMAIL INVITATION]`);
  console.log(`To: ${to}`);
  console.log(`Name: ${name}`);
  console.log(`Temporary Password: ${temporaryPassword}`);
  console.log(`Login URL: ${loginUrl}`);
  console.log(`========================================\n`);

  return {
    sent: false,
    message: 'Invitation generated. SMTP is not configured, credentials displayed for manual sharing.',
  };
};
