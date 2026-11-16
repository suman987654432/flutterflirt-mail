import nodemailer from 'nodemailer';

async function sendLiveMail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'systemnotify00@gmail.com',
      pass: 'wyzhqdiksessqzji',
    },
  });

  const res = await transporter.sendMail({
    from: '"CodeAddaBot" <admin@codeaddabot.in>',
    replyTo: 'admin@codeaddabot.in',
    to: 'sumanqaj9876@gmail.com',
    subject: 'Pure Domain Test: admin@codeaddabot.in',
    text: 'Sent directly as admin@codeaddabot.in!',
  });

  console.log('Accepted by Google:', res.response);
}

sendLiveMail().catch(err => console.error('Failed:', err.message));
