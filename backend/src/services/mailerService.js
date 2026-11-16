import nodemailer from 'nodemailer';
import MailComposer from 'nodemailer/lib/mail-composer/index.js';
import { config } from '../config.js';
import { ImapService } from './imapService.js';

export class MailerService {
  /**
   * Send mail over SMTP (Postfix submission)
   */
  static async sendMail({ from, to, cc, bcc, subject, html, text, attachments = [] }) {
    const transportOptions = {
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
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

    const mailOptions = {
      from: `"${displayName.toUpperCase()}" <${fromAddress}>`,
      replyTo: fromAddress,
      to,
      cc,
      bcc,
      subject,
      html,
      text,
      attachments: attachments.map(att => ({
        filename: att.originalname || att.filename,
        content: att.buffer || att.content,
        contentType: att.mimetype || att.contentType,
      })),
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

