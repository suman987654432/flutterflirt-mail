import nodemailer from 'nodemailer';

async function testNaveen() {
  const transporter = nodemailer.createTransport({
    host: '13.207.129.73',
    port: 25,
    secure: false,
    tls: { rejectUnauthorized: false },
  });

  try {
    const info = await transporter.sendMail({
      from: 'sumanqaj9876@gmail.com',
      to: 'naveen@flutterflirt.com',
      subject: 'Test delivery to naveen',
      text: 'Testing',
    });
    console.log('Naveen result:', info.response);
  } catch (e) {
    console.log('Naveen error:', e.message);
  }
}
testNaveen();
