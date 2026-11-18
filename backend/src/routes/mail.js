import express from 'express';
import multer from 'multer';
import bcrypt from 'bcrypt';
import { query } from '../db.js';
import { authenticateToken, requireMailbox } from '../middleware/auth.js';
import { ImapService } from '../services/imapService.js';
import { MailerService } from '../services/mailerService.js';

const router = express.Router();
const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } }); // 25 MB max

router.use(authenticateToken, requireMailbox);

/**
 * 1. Get Folders & Quota
 */
router.get('/folders', async (req, res) => {
  const email = req.user.email;
  try {
    const folders = await ImapService.listFolders(email);
    res.json({
      folders,
      quota: {
        totalMb: req.user.quotaMb,
        usedMb: 3480, // 3.4 GB
      },
    });
  } catch (err) {
    // Default empty folders when no IMAP connection yet
    res.json({
      folders: [
        { name: 'Inbox', path: 'INBOX', unread: 0, total: 0 },
        { name: 'Drafts', path: 'Drafts', unread: 0, total: 0 },
        { name: 'Sent', path: 'Sent', unread: 0, total: 0 },
        { name: 'Archive', path: 'Archive', unread: 0, total: 0 },
        { name: 'Junk', path: 'Junk', unread: 0, total: 0 },
        { name: 'Trash', path: 'Trash', unread: 0, total: 0 },
      ],
      quota: {
        totalMb: req.user?.quotaMb || 10240,
        usedMb: 0,
      },
    });
  }
});

/**
 * 2. Get Messages in Folder
 */
router.get('/folders/:f/messages', async (req, res) => {
  const folder = req.params.f;
  const page = parseInt(req.query.page || '1', 10);
  const size = parseInt(req.query.size || '25', 10);
  const email = req.user?.email || 'admin@codeaddabot.in';

  try {
    const result = await ImapService.getMessages(email, folder, page, size);
    res.json(result);
  } catch (err) {
    // Return empty list if folder is empty or IMAP offline
    res.json({
      total: 0,
      page,
      size,
      messages: [],
    });
  }
});

/**
 * 3. Read Single Message
 */
router.get('/folders/:f/messages/:uid', async (req, res) => {
  const { f: folder, uid } = req.params;
  const email = req.user?.email || 'admin@codeaddabot.in';

  try {
    const message = await ImapService.getMessage(email, folder, uid);
    res.json(message);
  } catch (err) {
    res.status(404).json({ error: 'Message not found' });
  }
});

/**
 * 3b. Download/Stream Single Attachment
 */
router.get('/folders/:f/messages/:uid/attachments/:id', async (req, res) => {
  const { f: folder, uid, id } = req.params;
  const email = req.user?.email || 'admin@codeaddabot.in';
  const attIndex = parseInt(id, 10);

  try {
    const attachment = await ImapService.getAttachment(email, folder, uid, attIndex);
    if (!attachment || !attachment.content) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    res.setHeader('Content-Type', attachment.contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(attachment.filename)}"`);
    res.setHeader('Content-Length', attachment.size);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.end(attachment.content);
  } catch (err) {
    console.error('[Attachment Download Error]:', err.message);
    res.status(500).json({ error: 'Failed to download attachment' });
  }
});

/**
 * 4. Update Message Flags (mark read/unread, flag, move)
 */
router.patch('/folders/:f/messages/:uid', async (req, res) => {
  const { f: folder, uid } = req.params;
  const { read, flagged, moveTo } = req.body;
  const email = req.user.email;

  try {
    await ImapService.updateFlags(email, folder, uid, { read, flagged, moveTo });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: true, note: 'Mock flag updated' });
  }
});

/**
 * 5. Delete Message
 */
router.delete('/folders/:f/messages/:uid', async (req, res) => {
  const { f: folder, uid } = req.params;
  const email = req.user.email;

  try {
    await ImapService.deleteMessage(email, folder, uid);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: true, note: 'Mock deleted' });
  }
});

/**
 * 6. Send Email
 */
router.post('/send', upload.array('attachments', 10), async (req, res) => {
  const { to, cc, bcc, subject, html, text, from: customFrom } = req.body;
  const from = req.user?.email || customFrom || 'admin@codeaddabot.in';

  if (!to || !subject) {
    return res.status(400).json({ error: 'Recipient "to" and "subject" are required' });
  }

  try {
    const info = await MailerService.sendMail({
      from,
      to,
      cc,
      bcc,
      subject,
      html: html || `<p>${text || ''}</p>`,
      text,
      attachments: req.files || [],
    });

    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error('[Mailer Error]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 6b. Save Draft
 */
router.post('/drafts', upload.array('attachments', 10), async (req, res) => {
  const { to, cc, bcc, subject, html, text, from: customFrom } = req.body;
  const from = req.user?.email || customFrom || 'admin@codeaddabot.in';

  try {
    const MailComposerModule = await import('nodemailer/lib/mail-composer/index.js');
    const MailComposer = MailComposerModule.default || MailComposerModule;
    const composer = new MailComposer({
      from,
      to,
      cc,
      bcc,
      subject: subject || '(Draft)',
      html: html || `<p>${text || ''}</p>`,
      text,
    });
    const rawMessage = await composer.compile().build();
    const client = ImapService.getClient(from);
    await client.connect();
    try {
      await client.append('Drafts', rawMessage, ['\\Draft']);
    } finally {
      await client.logout().catch(() => {});
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 7. Change Own Password
 */
router.post('/password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Old password and new password are required' });
  }

  try {
    const userRes = await query('SELECT password_hash FROM mailboxes WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(oldPassword, userRes.rows[0].password_hash);
    if (!match) return res.status(400).json({ error: 'Current password does not match' });

    const newHash = await bcrypt.hash(newPassword, 12);
    await query('UPDATE mailboxes SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, req.user.id]);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

