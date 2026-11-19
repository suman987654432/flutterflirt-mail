import nodemailer from 'nodemailer';
import MailComposer from 'nodemailer/lib/mail-composer/index.js';
import { config } from '../config.js';
import { ImapService } from './imapService.js';

export class MailerService {
  /**
   * Send mail over SMTP (Postfix submission)
   */
  static async sendMail({ from, to, cc, bcc, subject, html, text, attachments = [] }) {
    const isSecure = config.smtp.secure === true || parseInt(config.smtp.port, 10) === 465;
    const transportOptions = {
      host: config.smtp.host,
      port: parseInt(config.smtp.port, 10),
      secure: isSecure,
      tls: {
        rejectUnauthorized: false,
      },
    };

    if (config.smtp.user && config.smtp.pass) {
      transportOptions.auth = {
        user: config.smtp.user,
        pass: config.smtp.pass,
      };
    }

    const transporter = nodemailer.createTransport(transportOptions);

    // Format From address cleanly
    const fromAddress = from || 'admin@codeaddabot.in';
    const displayName = fromAddress.includes('@') ? fromAddress.split('@')[0] : 'Admin';
    
    console.log(`[Mailer] Sending mail via ${transportOptions.host}:${transportOptions.port} from ${fromAddress} to ${to}`);

    // Process HTML: Convert any embedded Base64 data URLs to standard RFC-compliant MIME CID inline attachments
    let processedHtml = html || '';
    const inlineAttachments = [];
    const base64Regex = /src=["']data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,([A-Za-z0-9+/=\s]+)["']/gi;
    let imgCount = 0;

    processedHtml = processedHtml.replace(base64Regex, (match, mimeType, base64Data) => {
      imgCount++;
      const cleanBase64 = base64Data.replace(/\s+/g, '');
      const cid = `img_cid_${Date.now()}_${imgCount}@codeaddabot.in`;
      const ext = (mimeType === 'jpeg' || mimeType === 'jpg') ? 'jpg' : mimeType === 'svg+xml' ? 'svg' : mimeType;
      const filename = `image_${imgCount}.${ext}`;
      const buffer = Buffer.from(cleanBase64, 'base64');

      inlineAttachments.push({
        filename,
        content: buffer,
        contentType: mimeType === 'jpg' ? 'image/jpeg' : `image/${mimeType}`,
        cid: cid,
        contentDisposition: 'inline',
      });

      return `src="cid:${cid}"`;
    });

    const mailOptions = {
      from: `"${displayName.toUpperCase()}" <${fromAddress}>`,
      replyTo: fromAddress,
      to,
      cc,
      bcc,
      subject,
      html: processedHtml,
      text,
      attachments: [
        ...attachments.map(att => ({
          filename: att.originalname || att.filename,
          content: att.buffer || att.content,
          contentType: att.mimetype || att.contentType,
        })),
        ...inlineAttachments,
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Successfully sent messageId: ${info.messageId}, response: ${info.response}`);

    // Save copy in 'Sent' folder via IMAP
    try {
      const client = ImapService.getClient(fromAddress);
      await client.connect();
      try {
        const composer = new MailComposer(mailOptions);
        const rawMessage = await composer.compile().build();
        try {
          await client.append('Sent', rawMessage, ['\\Seen']);
        } catch (appendErr) {
          // Auto-create Sent folder if not present for brand-new users
          await client.mailboxCreate('Sent');
          await client.append('Sent', rawMessage, ['\\Seen']);
        }
        console.log(`[Mailer] Successfully saved copy to ${fromAddress} Sent mailbox`);
      } catch (err) {
        console.warn(`[Mailer] Could not append to ${fromAddress} Sent folder:`, err.message);
      } finally {
        await client.logout().catch(() => {});
      }
    } catch (e) {
      console.warn('[Mailer] IMAP connection for Sent folder failed:', e.message);
    }

    return info;
  }
}

