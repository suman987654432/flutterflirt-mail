import nodemailer from 'nodemailer';

async function sendTestEmail() {
  console.log('--- FlutterFlirt Mail End-to-End Delivery Test ---');
  console.log('Connecting to local Postfix on localhost:25 ...');

  const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 25,
    secure: false,
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: 'admin@codeaddabot.in',
    to: 'naveen@flutterflirt.com',
    subject: '🔥 Real Test Mail - FlutterFlirt Mail Engine Working!',
    text: 'Hello Naveen,\n\nThis is a real live test email sent through Postfix, scanned by Rspamd, and stored into Dovecot Maildir!\n\nRegards,\nFlutterFlirt Engine',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #6366f1;">FlutterFlirt Mail Delivery Test</h2>
        <p>This is a <b>real email</b> delivered through your local container stack:</p>
        <ul>
          <li><b>MTA:</b> Postfix 3.7 (Port 25)</li>
          <li><b>Anti-Spam & DKIM:</b> Rspamd</li>
          <li><b>IMAP & Storage:</b> Dovecot 2.3 LMTP</li>
          <li><b>Database:</b> Neon PostgreSQL</li>
        </ul>
        <p style="color: #10b981; font-weight: bold;">Status: 100% Successfully Delivered!</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('SUCCESS! Mail Accepted by Postfix!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (err) {
    console.error('Mail delivery failed:', err.message);
  }
}

sendTestEmail();

