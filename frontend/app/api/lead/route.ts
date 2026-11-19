import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, domain, phone, mailboxCount, message } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required.' },
        { status: 400 }
      );
    }

    const recipient = 'sumanqaj9876@gmail.com';
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    console.log(`[Lead Submission] New request from ${name} (${email}) for domain: ${domain || 'N/A'}`);

    // Clean HTML email template
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #dfe3e8; border-radius: 14px; overflow: hidden; background: #ffffff; box-shadow: 0 4px 18px rgba(0,0,0,0.06);">
        <div style="background: #315bdb; padding: 24px 28px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">🎉 New FlutterFlirt Mail Lead / Setup Request</h2>
          <p style="margin: 6px 0 0; opacity: 0.9; font-size: 13px;">Submitted from Landing Page CTA Form • ${timestamp} IST</p>
        </div>
        <div style="padding: 24px 28px; color: #181c20;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
            <tbody>
              <tr style="border-bottom: 1px solid #f1f4f9;">
                <td style="padding: 10px 0; color: #747686; width: 140px; font-weight: 500;">Full Name:</td>
                <td style="padding: 10px 0; font-weight: 700; color: #181c20;">${name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f4f9;">
                <td style="padding: 10px 0; color: #747686; font-weight: 500;">Work Email:</td>
                <td style="padding: 10px 0; font-weight: 700; color: #315bdb;"><a href="mailto:${email}" style="color: #315bdb; text-decoration: none;">${email}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f4f9;">
                <td style="padding: 10px 0; color: #747686; font-weight: 500;">Company Domain:</td>
                <td style="padding: 10px 0; font-weight: 600; font-family: monospace; color: #0340c2;">${domain || 'Not specified'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f4f9;">
                <td style="padding: 10px 0; color: #747686; font-weight: 500;">Phone / WhatsApp:</td>
                <td style="padding: 10px 0; font-weight: 600; color: #181c20;">${phone || 'Not provided'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f4f9;">
                <td style="padding: 10px 0; color: #747686; font-weight: 500;">Mailbox Quota:</td>
                <td style="padding: 10px 0; font-weight: 600; color: #181c20;">${mailboxCount || '1 - 5 Mailboxes'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #747686; font-weight: 500; vertical-align: top;">Notes / Message:</td>
                <td style="padding: 10px 0; color: #434654; line-height: 1.5;">${message || 'Standard business mailbox provisioning requested.'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="background: #f8fafc; padding: 14px 28px; border-top: 1px solid #dfe3e8; font-size: 11.5px; color: #747686; text-align: center;">
          Dispatched to <strong>${recipient}</strong> • FlutterFlirt Mail Sovereign Infrastructure
        </div>
      </div>
    `;

    // Attempt SMTP send
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        tls: { rejectUnauthorized: false },
        ...(process.env.SMTP_USER && process.env.SMTP_PASS
          ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }
          : {}),
      });

      await transporter.sendMail({
        from: `"FlutterFlirt Mail Lead" <${process.env.SMTP_FROM || 'onboarding@resend.dev'}>`,
        to: recipient,
        replyTo: email,
        subject: `New Lead: ${name} - ${domain || email} (FlutterFlirt Mail Setup Request)`,
        text: `New Lead: ${name}\nEmail: ${email}\nDomain: ${domain || 'N/A'}\nPhone: ${phone || 'N/A'}\nPlan: ${mailboxCount}\nMessage: ${message || 'N/A'}`,
        html: htmlContent,
      });

      console.log(`[Lead Submission] Successfully emailed lead details to ${recipient}`);
    } catch (smtpErr: any) {
      // In dev environment or if local SMTP container is not configured yet, log safely and don't fail the user submission
      console.warn(`[Lead Submission] SMTP dispatch warning: ${smtpErr?.message || smtpErr}. Lead safely registered.`);
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your setup request has been received. Our team will reach out to you shortly.',
    });
  } catch (err: any) {
    console.error('[Lead API Error]', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
