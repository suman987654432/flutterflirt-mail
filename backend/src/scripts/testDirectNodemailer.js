import dns from 'dns/promises';
import nodemailer from 'nodemailer';

async function testDirectNodemailer() {
  const to = 'sumanqaj9876@gmail.com';
  const from = 'admin@codeaddabot.in';
  const recipientDomain = to.split('@')[1];

  console.log(`1. Resolving MX records for ${recipientDomain} ...`);
  const mxRecords = await dns.resolveMx(recipientDomain);
  mxRecords.sort((a, b) => a.priority - b.priority);
  const targetMx = mxRecords[0].exchange;
  console.log(`   Found target MX: ${targetMx} (Priority: ${mxRecords[0].priority})`);

  console.log(`2. Connecting directly via Nodemailer to ${targetMx}:25 ...`);
  const transporter = nodemailer.createTransport({
    host: targetMx,
    port: 25,
    secure: false,
    tls: {
      rejectUnauthorized: false,
    },
    name: 'codeaddabot.in',
  });

  console.log('3. Sending email via pure Nodemailer...');
  try {
    const info = await transporter.sendMail({
      from: `"FlutterFlirt Mail Admin" <${from}>`,
      to,
      subject: '🚀 Pure Nodemailer Direct Delivery Test to Gmail',
      text: 'Hello,\n\nThis is a pure Nodemailer direct delivery email from admin@codeaddabot.in directly to your Gmail inbox!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #4f46e5;">FlutterFlirt Mail - Direct Nodemailer Delivery</h2>
          <p>This email was sent <b>directly to Google</b> using only Nodemailer!</p>
          <p><b>From:</b> admin@codeaddabot.in<br/><b>To:</b> ${to}</p>
          <p style="color: #10b981; font-weight: bold;">Status: Sent via direct MX connection!</p>
        </div>
      `,
    });

    console.log('SUCCESS! Google Accepted The Message:');
    console.log('Message ID:', info.messageId);
    console.log('Google Server Response:', info.response);
  } catch (err) {
    console.error('Google rejected the email. Reason:');
    console.error(err.message);
    if (err.response) {
      console.error('Server response:', err.response);
    }
  }
}

testDirectNodemailer();

