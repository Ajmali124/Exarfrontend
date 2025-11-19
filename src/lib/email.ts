import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  const domain =
    process.env.BETTER_AUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://exarpro.com');
  const businessAddress = process.env.EXARPRO_BUSINESS_ADDRESS ?? 'Exarpro, 651 N Broad St, Suite 201, Middletown, DE 19709';

  const emailHTML = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <style>
          :root {
            color-scheme: light;
          }
          body {
            background-color: #f8fafc;
            color: #1c1f2b;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 32px 12px;
          }
          .container {
            max-width: 520px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 18px;
            border: 1px solid #e5e7eb;
            overflow: hidden;
          }
          .header {
            padding: 32px 28px 12px;
            text-align: center;
          }
          .brand {
            font-size: 22px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #7c3aed;
            font-weight: 700;
          }
          .headline {
            font-size: 24px;
            font-weight: 600;
            margin: 24px 0 8px;
            color: #0f172a;
          }
          .subtitle {
            color: #475569;
            font-size: 15px;
            margin: 0 auto 24px;
            line-height: 1.5;
            max-width: 360px;
          }
          .card {
            background: #f5f3ff;
            border-radius: 16px;
            padding: 28px;
            margin: 0 28px 24px;
            border: 1px solid #e9d5ff;
            text-align: center;
          }
          .otp {
            font-size: 44px;
            font-weight: 700;
            letter-spacing: 0.35em;
            color: #5b21b6;
            margin: 0;
            font-family: 'Courier New', monospace;
          }
          .otp-label {
            margin-top: 12px;
            color: #4c1d95;
            font-size: 14px;
            letter-spacing: 0.04em;
          }
          .info {
            padding: 0 28px 28px;
            color: #475569;
            font-size: 14px;
            line-height: 1.6;
          }
          .note {
            background: #eef2ff;
            border-left: 4px solid #7c3aed;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0 0;
            color: #312e81;
          }
          .footer {
            border-top: 1px solid #e5e7eb;
            padding: 24px 28px 32px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
          }
          .footer a {
            color: #7c3aed;
            text-decoration: none;
            font-weight: 600;
          }
          .footer a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <table role="presentation" aria-hidden="true" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center">
              <div class="container">
                <div class="header">
                  <div class="brand">Exarpro</div>
                  <h1 class="headline">Verify your account</h1>
                  <p class="subtitle">
                    Use the secure code below to complete your Exarpro sign up. The code expires in five minutes.
                  </p>
                </div>
                <div class="card">
                  <p class="otp">${token}</p>
                  <div class="otp-label">One-time verification code</div>
                </div>
                <div class="info">
                  Keep this code confidential. If you didn’t initiate this request, you can safely ignore this email—your account stays protected.
                  <div class="note">
                    Need help? Visit <a href="${domain}/support" target="_blank" rel="noopener noreferrer">${domain}/support</a> or reply to this message.
                  </div>
                </div>
                <div class="footer">
                  <div>Sending IP: ${process.env.NEXT_PUBLIC_SENDING_IP ?? '120.09.01.309'}</div>
                  <div style="margin-top: 8px;">
                    ${businessAddress}
                  </div>
                  <div style="margin-top: 8px;">
                    View our <a href="${domain}/privacy">privacy policy</a>.
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await resend.emails.send({
    from: 'Exarpro<info@exarpro.com>',
    to: email,
    subject: 'Verify your Exarpro account',
    html: emailHTML,
    text: `Your Exarpro verification code is ${token}. It expires in five minutes. If you did not request this code, simply ignore the message.`,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const domain =
    process.env.BETTER_AUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const businessAddress = process.env.EXARPRO_BUSINESS_ADDRESS ?? 'Exarpro, 651 N Broad St, Suite 201, Middletown, DE 19709';

  const emailHTML = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <style>
          :root {
            color-scheme: light;
          }
          body {
            background-color: #f8fafc;
            color: #1c1f2b;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 32px 12px;
          }
          .container {
            max-width: 520px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 18px;
            border: 1px solid #e5e7eb;
            overflow: hidden;
          }
          .header {
            padding: 32px 28px 12px;
            text-align: center;
          }
          .brand {
            font-size: 22px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #7c3aed;
            font-weight: 700;
          }
          .headline {
            font-size: 24px;
            font-weight: 600;
            margin: 24px 0 8px;
            color: #0f172a;
          }
          .subtitle {
            color: #475569;
            font-size: 15px;
            margin: 0 auto 24px;
            line-height: 1.5;
            max-width: 360px;
          }
          .card {
            background: #f5f3ff;
            border-radius: 16px;
            padding: 28px;
            margin: 0 28px 24px;
            border: 1px solid #e9d5ff;
            text-align: center;
          }
          .otp {
            font-size: 44px;
            font-weight: 700;
            letter-spacing: 0.35em;
            color: #5b21b6;
            margin: 0;
            font-family: 'Courier New', monospace;
          }
          .otp-label {
            margin-top: 12px;
            color: #4c1d95;
            font-size: 14px;
            letter-spacing: 0.04em;
          }
          .info {
            padding: 0 28px 28px;
            color: #475569;
            font-size: 14px;
            line-height: 1.6;
          }
          .note {
            background: #eef2ff;
            border-left: 4px solid #7c3aed;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0 0;
            color: #312e81;
          }
          .footer {
            border-top: 1px solid #e5e7eb;
            padding: 24px 28px 32px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
          }
          .footer a {
            color: #7c3aed;
            text-decoration: none;
            font-weight: 600;
          }
          .footer a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <table role="presentation" aria-hidden="true" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center">
              <div class="container">
                <div class="header">
                  <div class="brand">Exarpro</div>
                  <h1 class="headline">Password reset code</h1>
                  <p class="subtitle">
                    We received a request to reset your Exarpro password. Use the secure code below within five minutes to continue.
                  </p>
                </div>
                <div class="card">
                  <p class="otp">${token}</p>
                  <div class="otp-label">Temporary reset code</div>
                </div>
                <div class="info">
                  If you didn’t request this reset, you can ignore this email and your password will stay the same.
                  <div class="note">
                    Need help? Visit <a href="${domain}/support" target="_blank" rel="noopener noreferrer">${domain}/support</a> or reply to this message.
                  </div>
                </div>
                <div class="footer">
                  <div>Sending IP: ${process.env.NEXT_PUBLIC_SENDING_IP ?? 'Transactional channel'}</div>
                  <div style="margin-top: 8px;">
                    ${businessAddress}
                  </div>
                  <div style="margin-top: 8px;">
                    View our <a href="${domain}/privacy">privacy policy</a>.
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await resend.emails.send({
    from: 'Exarpro<info@exar.online>',
    to: email,
    subject: 'Reset your Exarpro password',
    html: emailHTML,
    text: `We received a request to reset your Exarpro password. Your temporary code is ${token}. It expires in five minutes. Ignore this email if you did not request a reset.`,
  });
};
