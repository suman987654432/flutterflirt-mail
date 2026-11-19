import nodemailer from 'nodemailer';
import { config } from '../config.js';

async function sendTestEmail() {
  console.log('--- Sending Test Mail as admin@codeaddabot.in via Resend SMTP ---');

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  const mailOptions = {
    from: '"CodeAddaBot Admin" <admin@codeaddabot.in>',
    replyTo: 'admin@codeaddabot.in',
    to: 'sumanqaj9876@gmail.com',
    subject: 'Verification: Mail from admin@codeaddabot.in',
    text: 'Hello Suman!\n\nThis is a verification email sent directly from admin@codeaddabot.in.\n\nAll configurations, DNS records, and Nodemailer integration are fully working!',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; border: 1px solid #e0e7ff; border-radius: 12px; max-width: 580px; background: #ffffff;">
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <h2 style="color: #4338ca; margin: 0;">CodeAddaBot Official Mail</h2>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          Hi <b>Suman</b>,
        </p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          Yeh email aapke domain <b>codeaddabot.in</b> se bheja gaya hai!
        </p>
        <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4f46e5;">
          <p style="margin: 4px 0; font-size: 14px;"><b>Sender Address:</b> admin@codeaddabot.in</p>
          <p style="margin: 4px 0; font-size: 14px;"><b>Reply-To:</b> admin@codeaddabot.in</p>
          <p style="margin: 4px 0; font-size: 14px;"><b>Recipient:</b> sumanqaj9876@gmail.com</p>
          <p style="margin: 4px 0; font-size: 14px;"><b>Status:</b> <span style="color: #16a34a; font-weight: bold;">100% Verified Delivery ✓</span></p>
        </div>
        <p style="color: #64748b; font-size: 13px;">
          Sent using FlutterFlirt Mail Architecture with Nodemailer Engine.
        </p>
      </div>
    `,
  };

  const result = await transporter.sendMail(mailOptions);
  console.log('SUCCESS! Google Accepted The Email.');
  console.log('Response:', result.response);
  console.log('Message ID:', result.messageId);
}

sendTestEmail().catch((err) => console.error('Send Error:', err.message));

