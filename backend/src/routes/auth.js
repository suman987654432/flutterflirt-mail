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
    const cleanEmail = email.toLowerCase().trim();

    let result = await query(
      `SELECT a.id, a.email, a.password_hash, a.role, a.tenant_id, a.domain_id, a.active, 
              t.name as tenant_name, d.name as domain_name
       FROM admins a
       LEFT JOIN tenants t ON a.tenant_id = t.id
       LEFT JOIN domains d ON a.domain_id = d.id
       WHERE a.email = $1`,
      [cleanEmail]
    );

    // Fallback: If not in admins table, check mailboxes table for admin@ addresses
    if (result.rows.length === 0 && cleanEmail.startsWith('admin@')) {
      const mbRes = await query(
        `SELECT m.id, m.email, m.password_hash, 
                CASE 
                  WHEN d.name = 'codeaddabot.in' OR d.name = 'flutterflirt.com' THEN 'superadmin' 
                  ELSE 'domain_admin' 
                END as role,
                d.tenant_id, d.id as domain_id, m.active, t.name as tenant_name, d.name as domain_name
         FROM mailboxes m
         JOIN domains d ON m.domain_id = d.id
         JOIN tenants t ON d.tenant_id = t.id
         WHERE m.email = $1`,
        [cleanEmail]
      );
      if (mbRes.rows.length > 0) {
        result = mbRes;
      }
    }

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials. Only administrative accounts can access the Admin Console.' });
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

    // Determine domain_id if not set but user is domain_admin or tied to a domain
    let domainId = admin.domain_id;
    let domainName = admin.domain_name;
    if (!domainId && admin.role === 'domain_admin') {
      const emailDomain = cleanEmail.split('@')[1];
      if (emailDomain) {
        const domLookup = await query('SELECT id, name FROM domains WHERE name = $1', [emailDomain]);
        if (domLookup.rows.length > 0) {
          domainId = domLookup.rows[0].id;
          domainName = domLookup.rows[0].name;
        }
      }
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        tenantId: admin.tenant_id,
        tenantName: admin.tenant_name,
        domainId: domainId || null,
        domainName: domainName || null,
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
        domainId: domainId || null,
        domainName: domainName || null,
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: err.message || 'Internal server error during authentication' });
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
    const cleanEmail = email.toLowerCase().trim();
    const result = await query(
      `SELECT m.id, m.email, m.display_name, m.password_hash, m.quota_mb, m.active, d.name as domain_name, d.tenant_id
       FROM mailboxes m
       JOIN domains d ON m.domain_id = d.id
       JOIN tenants t ON d.tenant_id = t.id
       WHERE m.email = $1 AND d.active = true AND t.active = true`,
      [cleanEmail]
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

    // Check if this mailbox user is also an admin in the admins table
    const adminCheck = await query(
      `SELECT role FROM admins WHERE email = $1 AND active = true`,
      [cleanEmail]
    );

    const isSystemAdmin = mailbox.email.startsWith('admin@');
    let userRole = 'user';
    let userType = 'mailbox';

    if (isSystemAdmin) {
      userRole = 'superadmin';
      userType = 'admin';
    } else if (adminCheck.rows.length > 0) {
      userRole = adminCheck.rows[0].role || 'tenant_admin';
      userType = 'admin';
    }

    const token = jwt.sign(
      {
        id: mailbox.id,
        email: mailbox.email,
        displayName: mailbox.display_name,
        quotaMb: mailbox.quota_mb,
        domain: mailbox.domain_name,
        tenantId: mailbox.tenant_id,
        type: userType,
        role: userRole,
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
    res.status(500).json({ error: err.message || 'Internal server error during mailbox login' });
  }
});

export default router;

