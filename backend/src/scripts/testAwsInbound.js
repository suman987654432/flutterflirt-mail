import nodemailer from 'nodemailer';

async function testInboundDelivery() {
  console.log('--- Testing Inbound Delivery to AWS Server (13.207.129.73:25) ---');

  // Connect directly to the AWS Postfix server on port 25
  const transporter = nodemailer.createTransport({
    host: '13.207.129.73',
    port: 25,
    secure: false,
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: '"Suman Kumar" <sumanqaj9876@gmail.com>',
    to: 'admin@codeaddabot.in',
    subject: 'Live Inbound Delivery Verification from Gmail',
    text: 'Hello Admin!\n\nThis is a live test email delivered to AWS Server on Port 25 for admin@codeaddabot.in.\n\nAll mail storage and routing is active!',
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5;">Live Inbound Delivery Test ✓</h2>
        <p>This email was delivered directly to your AWS Postfix server on Port 25.</p>
        <p><strong>To:</strong> admin@codeaddabot.in</p>
        <p><strong>Status:</strong> Successfully Delivered to Dovecot Maildir!</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('SUCCESS: AWS Postfix Accepted Inbound Email!');
    console.log('Response:', info.response);
    console.log('Message ID:', info.messageId);
  } catch (err) {
    console.error('Error delivering to AWS:', err.message);
  }
}

testInboundDelivery();
