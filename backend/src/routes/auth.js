import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { config } from '../config.js';

const router = express.Router();

async function verifyHash(password, storedHash) {
  if (!storedHash || !password) return false;
  const cleanHash = storedHash.replace(/^{BLF-CRYPT}/i, '');
  try {
    if (await bcrypt.compare(password, cleanHash)) return true;
  } catch (e) {}
  if (cleanHash.startsWith('$2y$')) {
    try {
      if (await bcrypt.compare(password, cleanHash.replace('$2y$', '$2a$'))) return true;
      if (await bcrypt.compare(password, cleanHash.replace('$2y$', '$2b$'))) return true;
    } catch (e) {}
  }
  return false;
}

/**
 * Admin Login (/api/admin/login)
 */
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await query(
      `SELECT a.id, a.email, a.password_hash, a.role, a.tenant_id, a.active, t.name as tenant_name
       FROM admins a
       LEFT JOIN tenants t ON a.tenant_id = t.id
       WHERE a.email = $1`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];
    if (!admin.active) {
      return res.status(403).json({ error: 'Admin account is suspended' });
    }

    // Check bcrypt / BLF-CRYPT hash
    const match = await verifyHash(password, admin.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        tenantId: admin.tenant_id,
        tenantName: admin.tenant_name,
        type: 'admin',
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      token,
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        tenantId: admin.tenant_id,
        tenantName: admin.tenant_name,
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

/**
 * Webmail User Login (/api/mail/login)
 */
router.post('/mail/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await query(
      `SELECT m.id, m.email, m.display_name, m.password_hash, m.quota_mb, m.active, d.name as domain_name
       FROM mailboxes m
       JOIN domains d ON m.domain_id = d.id
       JOIN tenants t ON d.tenant_id = t.id
       WHERE m.email = $1 AND d.active = true AND t.active = true`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const mailbox = result.rows[0];
    if (!mailbox.active) {
      return res.status(403).json({ error: 'Mailbox is inactive or suspended' });
    }

    const match = await verifyHash(password, mailbox.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        id: mailbox.id,
        email: mailbox.email,
        displayName: mailbox.display_name,
        quotaMb: mailbox.quota_mb,
        domain: mailbox.domain_name,
        type: 'mailbox',
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      token,
      user: {
        id: mailbox.id,
        email: mailbox.email,
        displayName: mailbox.display_name,
        quotaMb: mailbox.quota_mb,
        domain: mailbox.domain_name,
      },
    });
  } catch (err) {
    console.error('Mailbox login error:', err);
    res.status(500).json({ error: 'Internal server error during mailbox login' });
  }
});

export default router;

