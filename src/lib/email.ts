import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  const domain = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  
  const emailHTML = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html dir="ltr" lang="en">
      <head>
        <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
        <meta name="x-apple-disable-message-reformatting" />
        <style>
          body {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            color: #1e293b;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            overflow: hidden;
          }
          .header-section {
            background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          .logo {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          .tagline {
            font-size: 14px;
            opacity: 0.9;
            font-weight: 400;
          }
          .content-section {
            padding: 40px 30px;
          }
          .title {
            color: #1e293b;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 16px;
            text-align: center;
          }
          .description {
            color: #64748b;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 32px;
            text-align: center;
          }
          .otp-container {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin: 32px 0;
          }
          .otp-code {
            font-size: 42px;
            font-weight: 700;
            color: #8b5cf6;
            letter-spacing: 12px;
            margin: 0;
            font-family: 'Courier New', monospace;
          }
          .otp-label {
            color: #64748b;
            font-size: 14px;
            margin-top: 8px;
            font-weight: 500;
          }
          .expiry-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 12px 16px;
            margin: 24px 0;
            text-align: center;
          }
          .expiry-text {
            color: #92400e;
            font-size: 14px;
            font-weight: 500;
            margin: 0;
          }
          .security-note {
            background: #f0fdf4;
            border: 1px solid #22c55e;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
          }
          .security-text {
            color: #166534;
            font-size: 14px;
            line-height: 1.5;
            margin: 0;
          }
          .footer {
            background: #f8fafc;
            padding: 24px 30px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
          }
          .footer-text {
            color: #64748b;
            font-size: 12px;
            line-height: 1.5;
            margin: 0;
          }
          .footer-link {
            color: #8b5cf6;
            text-decoration: none;
            font-weight: 500;
          }
          .footer-link:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header-section">
            <div class="logo">RoohX</div>
            <div class="tagline">Crypto Trading Made Simple</div>
          </div>
          
          <div class="content-section">
            <h1 class="title">🔐 Verify Your Account</h1>
            <p class="description">
              Welcome to RoohX! To complete your registration and start trading, please enter the verification code below.
            </p>
            
            <div class="otp-container">
              <div class="otp-code">${token}</div>
              <div class="otp-label">Your 4-digit verification code</div>
            </div>
            
            <div class="expiry-note">
              <p class="expiry-text">⏰ This code expires in 5 minutes for your security</p>
            </div>
            
            <div class="security-note">
              <p class="security-text">
                <strong>Security Notice:</strong> RoohX will never ask you to share your password, credit card, or banking information via email. 
                If you didn't request this code, please ignore this email.
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              © 2024 RoohX. All rights reserved. | 
              <a href="${domain}/privacy" class="footer-link">Privacy Policy</a> | 
              <a href="${domain}/support" class="footer-link">Support</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await resend.emails.send({
    from: "RoohX <onboarding@resend.dev>",
    to: email,
    subject: "🔐 Verify your RoohX account",
    html: emailHTML,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const domain = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  
  const emailHTML = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html dir="ltr" lang="en">
      <head>
        <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
        <meta name="x-apple-disable-message-reformatting" />
        <style>
          body {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            color: #1e293b;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            overflow: hidden;
          }
          .header-section {
            background: linear-gradient(135deg, #ef4444 0%, #f97316 50%, #eab308 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          .logo {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          .tagline {
            font-size: 14px;
            opacity: 0.9;
            font-weight: 400;
          }
          .content-section {
            padding: 40px 30px;
          }
          .title {
            color: #1e293b;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 16px;
            text-align: center;
          }
          .description {
            color: #64748b;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 32px;
            text-align: center;
          }
          .otp-container {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin: 32px 0;
          }
          .otp-code {
            font-size: 42px;
            font-weight: 700;
            color: #ef4444;
            letter-spacing: 12px;
            margin: 0;
            font-family: 'Courier New', monospace;
          }
          .otp-label {
            color: #64748b;
            font-size: 14px;
            margin-top: 8px;
            font-weight: 500;
          }
          .expiry-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 12px 16px;
            margin: 24px 0;
            text-align: center;
          }
          .expiry-text {
            color: #92400e;
            font-size: 14px;
            font-weight: 500;
            margin: 0;
          }
          .security-note {
            background: #fef2f2;
            border: 1px solid #fca5a5;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
          }
          .security-text {
            color: #991b1b;
            font-size: 14px;
            line-height: 1.5;
            margin: 0;
          }
          .footer {
            background: #f8fafc;
            padding: 24px 30px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
          }
          .footer-text {
            color: #64748b;
            font-size: 12px;
            line-height: 1.5;
            margin: 0;
          }
          .footer-link {
            color: #ef4444;
            text-decoration: none;
            font-weight: 500;
          }
          .footer-link:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header-section">
            <div class="logo">RoohX</div>
            <div class="tagline">Crypto Trading Made Simple</div>
          </div>
          
          <div class="content-section">
            <h1 class="title">🔑 Reset Your Password</h1>
            <p class="description">
              We received a request to reset your password. Use the code below to create a new password for your account.
            </p>
            
            <div class="otp-container">
              <div class="otp-code">${token}</div>
              <div class="otp-label">Your 4-digit reset code</div>
            </div>
            
            <div class="expiry-note">
              <p class="expiry-text">⏰ This code expires in 5 minutes for your security</p>
            </div>
            
            <div class="security-note">
              <p class="security-text">
                <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. 
                Your password will remain unchanged.
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              © 2024 RoohX. All rights reserved. | 
              <a href="${domain}/privacy" class="footer-link">Privacy Policy</a> | 
              <a href="${domain}/support" class="footer-link">Support</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await resend.emails.send({
    from: "RoohX <onboarding@resend.dev>",
    to: email,
    subject: "🔑 Reset your RoohX password",
    html: emailHTML,
  });
};
