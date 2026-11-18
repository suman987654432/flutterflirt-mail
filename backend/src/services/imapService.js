import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { config } from '../config.js';

function normalizeFolder(folder) {
  if (!folder) return 'INBOX';
  const lower = folder.toLowerCase();
  if (lower === 'inbox') return 'INBOX';
  if (lower === 'sent') return 'Sent';
  if (lower === 'drafts') return 'Drafts';
  if (lower === 'trash') return 'Trash';
  if (lower === 'junk') return 'Junk';
  if (lower === 'archive') return 'Archive';
  return folder;
}

// In-memory cache for parsed message bodies: key = `${email}:${folder}:${uid}`
const parsedMessageCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE_ENTRIES = 300;

function getCachedMessage(key) {
  const item = parsedMessageCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    parsedMessageCache.delete(key);
    return null;
  }
  return item;
}

function setCachedMessage(key, clientPayload, rawAttachments) {
  if (parsedMessageCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = parsedMessageCache.keys().next().value;
    if (oldestKey) parsedMessageCache.delete(oldestKey);
  }
  parsedMessageCache.set(key, {
    clientPayload,
    rawAttachments,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export function invalidateMessageCache(email, folder, uid) {
  if (uid) {
    parsedMessageCache.delete(`${email}:${folder}:${uid}`);
  } else {
    const prefix = `${email}:${folder}:`;
    for (const k of parsedMessageCache.keys()) {
      if (k.startsWith(prefix)) parsedMessageCache.delete(k);
    }
  }
}

export class ImapService {
  /**
   * Creates an authenticated ImapFlow client using Dovecot Master User
   */
  static getClient(email) {
    const authUser = `${email}*${config.imap.masterUser}`;
    const client = new ImapFlow({
      host: config.imap.host,
      port: config.imap.port,
      secure: config.imap.secure,
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: authUser,
        pass: config.imap.masterPassword,
      },
      logger: false,
    });
    // Prevent unhandled error event crashes
    client.on('error', (err) => {
      console.warn(`[IMAP Client Warning (${email})]:`, err.message);
    });
    return client;
  }

  /**
   * Retrieves list of folders and unread counts
   */
  static async listFolders(email) {
    const client = this.getClient(email);
    try {
      await client.connect();
      const list = await client.list();
      const folders = [];

      for (const item of list) {
        let status = { messages: 0, unseen: 0 };
        try {
          status = await client.status(item.path, { messages: true, unseen: true });
        } catch (e) {
          // ignore status read errors on non-selectable folders
        }
        folders.push({
          name: item.name,
          path: item.path,
          specialUse: item.specialUse,
          total: status.messages || 0,
          unread: status.unseen || 0,
        });
      }
      return folders;
    } catch (err) {
      console.warn(`[ImapService.listFolders]: ${email} -`, err.message);
      return [
        { name: 'Inbox', path: 'INBOX', unread: 0, total: 0 },
        { name: 'Drafts', path: 'Drafts', unread: 0, total: 0 },
        { name: 'Sent', path: 'Sent', unread: 0, total: 0 },
        { name: 'Archive', path: 'Archive', unread: 0, total: 0 },
        { name: 'Junk', path: 'Junk', unread: 0, total: 0 },
        { name: 'Trash', path: 'Trash', unread: 0, total: 0 },
      ];
    } finally {
      await client.logout().catch(() => {});
    }
  }

  /**
   * Paged message listing
   */
  static async getMessages(email, folder = 'INBOX', page = 1, size = 25) {
    const client = this.getClient(email);
    try {
      await client.connect();
      const lock = await client.getMailboxLock(normalizeFolder(folder));
      try {
        const total = client.mailbox?.exists || 0;
        if (total === 0) return { total: 0, page, size, messages: [] };

        const startSeq = Math.max(1, total - (page * size) + 1);
        const endSeq = Math.max(1, total - ((page - 1) * size));

        const messages = [];
        for await (const msg of client.fetch(`${startSeq}:${endSeq}`, {
          envelope: true,
          flags: true,
          internalDate: true,
          size: true,
          uid: true,
        })) {
          messages.unshift({
            uid: msg.uid,
            seq: msg.seq,
            subject: msg.envelope.subject || '(No Subject)',
            from: msg.envelope.from?.[0] ? { name: msg.envelope.from[0].name, address: msg.envelope.from[0].address } : { address: 'unknown' },
            to: (msg.envelope.to || []).map(t => ({ name: t.name, address: t.address })),
            date: msg.envelope.date || msg.internalDate,
            flags: Array.from(msg.flags || []),
            size: msg.size,
          });
        }
        return { total, page, size, messages };
      } finally {
        lock.release();
      }
    } catch (err) {
      console.warn(`[ImapService.getMessages]: ${email} ${folder} -`, err.message);
      return { total: 0, page, size, messages: [] };
    } finally {
      await client.logout().catch(() => {});
    }
  }

  /**
   * Read single full message, parsing body, attachments & auth headers
   */
  static async getMessage(email, folder, uid) {
    const cacheKey = `${email}:${folder}:${uid}`;
    const cached = getCachedMessage(cacheKey);
    if (cached) {
      return cached.clientPayload;
    }

    const client = this.getClient(email);
    await client.connect();
    try {
      const lock = await client.getMailboxLock(normalizeFolder(folder));
      try {
        const msg = await client.fetchOne(uid, { source: true, flags: true, envelope: true }, { uid: true });
        if (!msg || !msg.source) throw new Error('Message not found');
        const parsed = await simpleParser(msg.source);

        // Extract Authentication-Results
        const authResults = parsed.headers.get('authentication-results');
        const authHeader = typeof authResults === 'string' ? authResults : (authResults?.value || '');

        const spfPass = authHeader.includes('spf=pass');
        const dkimPass = authHeader.includes('dkim=pass');
        const dmarcPass = authHeader.includes('dmarc=pass');

        let bodyHtml = parsed.html || parsed.textAsHtml || `<pre>${parsed.text || ''}</pre>`;

        // Format and process attachments
        const rawAttachments = [];
        const attachmentsList = (parsed.attachments || []).map((att, idx) => {
          const rawCid = (att.cid || '').replace(/^<|>$/g, '').trim();
          const mime = att.contentType || 'application/octet-stream';
          const isInline = !!att.related || att.contentDisposition === 'inline' || !!rawCid;
          const attSize = att.size || (att.content ? att.content.length : 0);

          // For inline images or small attachments (<= 500KB), generate dataUrl for instant display
          let dataUrl = '';
          if (isInline || attSize <= 500 * 1024) {
            const b64 = att.content ? att.content.toString('base64') : '';
            dataUrl = `data:${mime};base64,${b64}`;
          }

          const downloadUrl = `/api/mail/folders/${encodeURIComponent(folder)}/messages/${uid}/attachments/${idx}`;

          rawAttachments.push({
            id: idx,
            filename: att.filename || `attachment-${idx + 1}`,
            contentType: mime,
            size: attSize,
            content: att.content,
          });

          return {
            id: idx,
            filename: att.filename || `attachment-${idx + 1}`,
            contentType: mime,
            size: attSize,
            cid: rawCid,
            isInline,
            dataUrl,
            downloadUrl,
          };
        });

        // Resolve inline CID images directly inside bodyHtml so all browsers render them
        if (bodyHtml && attachmentsList.length > 0) {
          attachmentsList.forEach((att) => {
            if (att.cid && att.dataUrl) {
              const escapedCid = att.cid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const pattern = new RegExp(`src=["']cid:<?${escapedCid}>?["']`, 'gi');
              bodyHtml = bodyHtml.replace(pattern, `src="${att.dataUrl}"`);
            }
          });
        }

        const clientPayload = {
          uid: parseInt(uid, 10),
          subject: parsed.subject || '(No Subject)',
          from: parsed.from?.value?.[0] || { address: 'unknown' },
          to: parsed.to?.value || [],
          cc: parsed.cc?.value || [],
          date: parsed.date,
          html: bodyHtml,
          text: parsed.text,
          security: {
            spf: spfPass ? 'pass' : (authHeader.includes('spf=fail') ? 'fail' : 'none'),
            dkim: dkimPass ? 'pass' : (authHeader.includes('dkim=fail') ? 'fail' : 'none'),
            dmarc: dmarcPass ? 'pass' : (authHeader.includes('dmarc=fail') ? 'fail' : 'none'),
            rawAuthResults: authHeader,
          },
          attachments: attachmentsList,
        };

        // Cache in memory for instant subsequent loads
        setCachedMessage(cacheKey, clientPayload, rawAttachments);

        return clientPayload;
      } finally {
        lock.release();
      }
    } finally {
      await client.logout().catch(() => {});
    }
  }

  /**
   * Retrieves an attachment by index
   */
  static async getAttachment(email, folder, uid, attachmentIndex) {
    const cacheKey = `${email}:${folder}:${uid}`;
    let cached = getCachedMessage(cacheKey);
    if (!cached) {
      await this.getMessage(email, folder, uid);
      cached = getCachedMessage(cacheKey);
    }
    if (cached && cached.rawAttachments && cached.rawAttachments[attachmentIndex]) {
      return cached.rawAttachments[attachmentIndex];
    }
    return null;
  }

  /**
   * Update message flags (read/unread, flagged, move)
   */
  static async updateFlags(email, folder, uid, updates) {
    const client = this.getClient(email);
    await client.connect();
    try {
      const lock = await client.getMailboxLock(normalizeFolder(folder));
      try {
        if (updates.read !== undefined) {
          if (updates.read) {
            await client.messageFlagsAdd({ uid: String(uid) }, ['\\Seen'], { uid: true });
          } else {
            await client.messageFlagsRemove({ uid: String(uid) }, ['\\Seen'], { uid: true });
          }
        }
        if (updates.flagged !== undefined) {
          if (updates.flagged) {
            await client.messageFlagsAdd({ uid: String(uid) }, ['\\Flagged'], { uid: true });
          } else {
            await client.messageFlagsRemove({ uid: String(uid) }, ['\\Flagged'], { uid: true });
          }
        }
        if (updates.moveTo) {
          await client.messageMove({ uid: String(uid) }, updates.moveTo, { uid: true });
          invalidateMessageCache(email, folder, uid);
          invalidateMessageCache(email, updates.moveTo, uid);
        }
        return { success: true };
      } finally {
        lock.release();
      }
    } finally {
      await client.logout().catch(() => {});
    }
  }

  /**
   * Delete message (moves to Trash or expunges)
   */
  static async deleteMessage(email, folder, uid) {
    invalidateMessageCache(email, folder, uid);
    const client = this.getClient(email);
    await client.connect();
    try {
      const lock = await client.getMailboxLock(normalizeFolder(folder));
      try {
        if (folder.toUpperCase() === 'TRASH' || folder.toUpperCase() === 'DELETED') {
          // Permanently expunge
          await client.messageDelete({ uid: String(uid) }, { uid: true });
        } else {
          // Move to Trash
          await client.messageMove({ uid: String(uid) }, 'Trash', { uid: true });
        }
        return { success: true };
      } finally {
        lock.release();
      }
    } finally {
      await client.logout().catch(() => {});
    }
  }
}

