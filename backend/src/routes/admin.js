import express from 'express';
import bcrypt from 'bcrypt';
import { query } from '../db.js';
import { authenticateToken, requireAdmin, requireSuperadmin } from '../middleware/auth.js';
import { DkimService } from '../services/dkimService.js';
import { DnsService } from '../services/dnsService.js';

const router = express.Router();
router.use(authenticateToken, requireAdmin);

/**
 * Audit log helper
 */
async function auditLog(actor, action, target, meta = {}) {
  try {
    await query(
      'INSERT INTO audit_log (actor, action, target, meta) VALUES ($1, $2, $3, $4)',
      [actor, action, target, JSON.stringify(meta)]
    );
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
}

/**
 * 1. Health Status
 */
router.get('/health', async (req, res) => {
  const status = {
    smtp: { status: 'running', port: 25 },
    imap: { status: 'running', port: 993 },
    rspamd: { status: 'running', port: 11332 },
    database: { status: 'connected' },
    tlsCertificate: { valid: true, daysLeft: 61, domain: 'mail.flutterflirt.com' },
  };

  try {
    const dbTest = await query('SELECT NOW()');
    status.database.currentTime = dbTest.rows[0].now;
  } catch (e) {
    status.database.status = 'error';
    status.database.error = e.message;
  }

  res.json(status);
});

/**
 * 2. Tenants (Superadmin only)
 */
router.get('/tenants', requireSuperadmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT t.*, 
        COUNT(DISTINCT d.id)::int as domain_count,
        COUNT(DISTINCT m.id)::int as mailbox_count
       FROM tenants t
       LEFT JOIN domains d ON d.tenant_id = t.id
       LEFT JOIN mailboxes m ON m.domain_id = d.id
       GROUP BY t.id
       ORDER BY t.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/tenants', requireSuperadmin, async (req, res) => {
  const { name, plan = 'business', maxMailboxes = 50, adminEmail, adminPassword } = req.body;
  if (!name || !adminEmail || !adminPassword) {
    return res.status(400).json({ error: 'Name, adminEmail, and adminPassword are required' });
  }

  try {
    const client = await query('BEGIN');
    const tenantRes = await query(
      'INSERT INTO tenants (name, plan, max_mailboxes, active) VALUES ($1, $2, $3, true) RETURNING *',
      [name, plan, maxMailboxes]
    );
    const tenant = tenantRes.rows[0];

    // Create client admin account
    const hash = await bcrypt.hash(adminPassword, 12);
    await query(
      'INSERT INTO admins (tenant_id, email, password_hash, role, active) VALUES ($1, $2, $3, $4, true)',
      [tenant.id, adminEmail.toLowerCase().trim(), hash, 'tenant_admin']
    );

    await query('COMMIT');
    await auditLog(req.user.email, 'CREATE_TENANT', tenant.id, { name, adminEmail });

    res.status(201).json(tenant);
  } catch (err) {
    await query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

router.patch('/tenants/:id', requireSuperadmin, async (req, res) => {
  const { id } = req.params;
  const { name, plan, maxMailboxes, active } = req.body;

  try {
    const updates = [];
    const values = [id];
    let counter = 2;

    if (name !== undefined) { updates.push(`name = $${counter++}`); values.push(name); }
    if (plan !== undefined) { updates.push(`plan = $${counter++}`); values.push(plan); }
    if (maxMailboxes !== undefined) { updates.push(`max_mailboxes = $${counter++}`); values.push(maxMailboxes); }
    if (active !== undefined) { updates.push(`active = $${counter++}`); values.push(active); }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    const sql = `UPDATE tenants SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`;
    const result = await query(sql, values);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tenant not found' });

    await auditLog(req.user.email, 'UPDATE_TENANT', id, req.body);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3. Domains
 */
router.get('/domains', async (req, res) => {
  try {
    let sql = `
      SELECT d.*, t.name as tenant_name,
        COUNT(DISTINCT m.id)::int as mailbox_count,
        COUNT(DISTINCT a.id)::int as alias_count
      FROM domains d
      JOIN tenants t ON d.tenant_id = t.id
      LEFT JOIN mailboxes m ON m.domain_id = d.id
      LEFT JOIN aliases a ON a.domain_id = d.id
    `;
    const params = [];

    // Scope restrictions
    if (req.user.role === 'domain_admin') {
      sql += ' WHERE d.id = $1';
      params.push(req.user.domainId);
    } else if (req.user.role === 'tenant_admin') {
      sql += ' WHERE d.tenant_id = $1';
      params.push(req.user.tenantId);
    }
    sql += ' GROUP BY d.id, t.name ORDER BY d.created_at DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('GET /domains query error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/domains', async (req, res) => {
  if (req.user.role === 'domain_admin') {
    return res.status(403).json({ error: 'Domain administrators cannot add new domains. Please contact your system superadmin.' });
  }

  const { name, tenantId } = req.body;
  const targetTenantId = req.user.role === 'superadmin' ? (tenantId || req.user.tenantId) : req.user.tenantId;

  if (!name || !targetTenantId) {
    return res.status(400).json({ error: 'Domain name and tenantId are required' });
  }

  const cleanDomain = name.toLowerCase().trim();

  try {
    // Generate 2048-bit DKIM Key
    const dkim = DkimService.generateKeys(cleanDomain);

    const result = await query(
      `INSERT INTO domains (tenant_id, name, dkim_selector, dkim_private_key, dkim_public_key, dmarc_policy)
       VALUES ($1, $2, $3, $4, $5, 'none') RETURNING *`,
      [targetTenantId, cleanDomain, dkim.selector, dkim.privateKey, dkim.publicKey]
    );

    const domain = result.rows[0];
    const dnsRecords = DnsService.getRequiredRecords(cleanDomain, dkim.selector, dkim.publicKey, 'none');

    await auditLog(req.user.email, 'ADD_DOMAIN', domain.id, { domain: cleanDomain });

    res.status(201).json({
      domain,
      dnsRecords,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/domains/:id/dns', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM domains WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Domain not found' });
    const domain = result.rows[0];

    // Scope check
    if (req.user.role === 'domain_admin' && domain.id !== req.user.domainId) {
      return res.status(403).json({ error: 'Unauthorized access to this domain' });
    }
    if (req.user.role === 'tenant_admin' && domain.tenant_id !== req.user.tenantId) {
      return res.status(403).json({ error: 'Unauthorized access to this domain' });
    }

    const records = DnsService.getRequiredRecords(
      domain.name,
      domain.dkim_selector,
      domain.dkim_public_key,
      domain.dmarc_policy
    );

    res.json({ domain, records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/domains/:id/verify', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM domains WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Domain not found' });
    const domain = result.rows[0];

    if (req.user.role === 'domain_admin' && domain.id !== req.user.domainId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (req.user.role === 'tenant_admin' && domain.tenant_id !== req.user.tenantId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const liveStatus = await DnsService.verifyDomain(domain.name, domain.dkim_selector);

    // Update domain table
    await query(
      `UPDATE domains SET mx_ok = $1, spf_ok = $2, dkim_ok = $3, dmarc_ok = $4, updated_at = NOW()
       WHERE id = $5`,
      [liveStatus.mx, liveStatus.spf, liveStatus.dkim, liveStatus.dmarc, id]
    );

    res.json({
      domainId: id,
      name: domain.name,
      status: liveStatus,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/domains/:id/dmarc', async (req, res) => {
  const { id } = req.params;
  const { policy } = req.body; // 'none', 'quarantine', 'reject'

  if (!['none', 'quarantine', 'reject'].includes(policy)) {
    return res.status(400).json({ error: 'Invalid DMARC policy. Must be none, quarantine, or reject' });
  }

  try {
    const checkDom = await query('SELECT id, tenant_id FROM domains WHERE id = $1', [id]);
    if (checkDom.rows.length === 0) return res.status(404).json({ error: 'Domain not found' });
    if (req.user.role === 'domain_admin' && checkDom.rows[0].id !== req.user.domainId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (req.user.role === 'tenant_admin' && checkDom.rows[0].tenant_id !== req.user.tenantId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await query(
      'UPDATE domains SET dmarc_policy = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [policy, id]
    );

    await auditLog(req.user.email, 'UPDATE_DMARC_POLICY', id, { policy });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/domains/:id/dmarc-reports', async (req, res) => {
  const { id } = req.params;
  try {
    const checkDom = await query('SELECT id, tenant_id FROM domains WHERE id = $1', [id]);
    if (checkDom.rows.length === 0) return res.status(404).json({ error: 'Domain not found' });
    if (req.user.role === 'domain_admin' && checkDom.rows[0].id !== req.user.domainId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (req.user.role === 'tenant_admin' && checkDom.rows[0].tenant_id !== req.user.tenantId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const reportsRes = await query(
      `SELECT * FROM dmarc_reports WHERE domain_id = $1 ORDER BY date_end DESC LIMIT 50`,
      [id]
    );

    const totalsRes = await query(
      `SELECT 
        COALESCE(SUM(total_msgs), 0)::int as total_messages,
        COALESCE(SUM(failed_msgs), 0)::int as failed_messages
       FROM dmarc_reports WHERE domain_id = $1`,
      [id]
    );

    const totals = totalsRes.rows[0];
    const passRate = totals.total_messages > 0 
      ? (((totals.total_messages - totals.failed_messages) / totals.total_messages) * 100).toFixed(2)
      : '100.00';

    res.json({
      summary: {
        totalMessages: totals.total_messages,
        failedAuthentication: totals.failed_messages,
        passRate: `${passRate}%`,
      },
      reports: reportsRes.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4. Mailboxes (Users)
 */
router.get('/mailboxes', async (req, res) => {
  const { domainId } = req.query;
  try {
    let sql = `
      SELECT m.id, m.domain_id, d.name as domain_name, m.email, m.display_name, m.quota_mb, m.active, m.created_at,
             CASE WHEN a.email IS NOT NULL THEN 'admin' ELSE 'user' END as role
      FROM mailboxes m
      JOIN domains d ON m.domain_id = d.id
      LEFT JOIN admins a ON a.email = m.email
    `;
    const params = [];
    const conditions = [];

    // Scope enforcement
    if (req.user.role === 'domain_admin') {
      conditions.push(`m.domain_id = $${params.length + 1}`);
      params.push(req.user.domainId);
    } else if (req.user.role === 'tenant_admin') {
      conditions.push(`d.tenant_id = $${params.length + 1}`);
      params.push(req.user.tenantId);
    }

    if (domainId) {
      if (req.user.role === 'domain_admin' && domainId !== req.user.domainId) {
        return res.status(403).json({ error: 'Unauthorized to view mailboxes for this domain' });
      }
      conditions.push(`m.domain_id = $${params.length + 1}`);
      params.push(domainId);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY m.created_at DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/domains/:id/mailboxes', async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.role === 'domain_admin' && id !== req.user.domainId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (req.user.role === 'tenant_admin') {
      const checkDom = await query('SELECT tenant_id FROM domains WHERE id = $1', [id]);
      if (checkDom.rows.length === 0 || checkDom.rows[0].tenant_id !== req.user.tenantId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }
    const result = await query(
      `SELECT id, email, display_name, quota_mb, active, created_at, updated_at
       FROM mailboxes WHERE domain_id = $1 ORDER BY email ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/mailboxes', async (req, res) => {
  const { domainId, localPart, displayName, password, quotaMb = 10240, role = 'user' } = req.body;
  if (!domainId || !localPart || !password) {
    return res.status(400).json({ error: 'domainId, localPart, and password are required' });
  }

  // Scope verification
  if (req.user.role === 'domain_admin' && domainId !== req.user.domainId) {
    return res.status(403).json({ error: 'Unauthorized. You can only create mailboxes in your own domain.' });
  }

  try {
    // 1. Fetch domain and tenant plan limits
    const domRes = await query(
      `SELECT d.name as domain_name, t.id as tenant_id, t.max_mailboxes,
        COUNT(m.id)::int as current_mailboxes
       FROM domains d
       JOIN tenants t ON d.tenant_id = t.id
       LEFT JOIN domains d2 ON d2.tenant_id = t.id
       LEFT JOIN mailboxes m ON m.domain_id = d2.id
       WHERE d.id = $1
       GROUP BY d.name, t.id, t.max_mailboxes`,
      [domainId]
    );

    if (domRes.rows.length === 0) return res.status(404).json({ error: 'Domain not found' });
    const domInfo = domRes.rows[0];

    if (req.user.role === 'tenant_admin' && domInfo.tenant_id !== req.user.tenantId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (domInfo.current_mailboxes >= domInfo.max_mailboxes) {
      return res.status(400).json({
        error: `Plan limit reached. Maximum ${domInfo.max_mailboxes} mailboxes allowed for this account.`,
      });
    }

    const email = `${localPart.toLowerCase().trim()}@${domInfo.domain_name}`;
    const hash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO mailboxes (domain_id, email, display_name, password_hash, quota_mb, active)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING id, email, display_name, quota_mb, active, created_at`,
      [domainId, email, displayName || localPart, hash, quotaMb]
    );

    // If role is admin, also register in admins table with appropriate scope
    if (role === 'admin') {
      const assignedRole = req.user.role === 'superadmin' ? 'tenant_admin' : 'domain_admin';
      await query(
        `INSERT INTO admins (tenant_id, domain_id, email, password_hash, role, active)
         VALUES ($1, $2, $3, $4, $5, true)
         ON CONFLICT (email) DO UPDATE SET password_hash = $4, role = $5, domain_id = $2`,
        [domInfo.tenant_id, domainId, email, hash, assignedRole]
      );
    }

    await auditLog(req.user.email, 'CREATE_MAILBOX', result.rows[0].id, { email });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/mailboxes/:id', async (req, res) => {
  const { id } = req.params;
  const { displayName, password, quotaMb, active } = req.body;

  try {
    // Scope check
    const mbCheck = await query(
      'SELECT m.id, m.domain_id, d.tenant_id FROM mailboxes m JOIN domains d ON m.domain_id = d.id WHERE m.id = $1',
      [id]
    );
    if (mbCheck.rows.length === 0) return res.status(404).json({ error: 'Mailbox not found' });
    if (req.user.role === 'domain_admin' && mbCheck.rows[0].domain_id !== req.user.domainId) {
      return res.status(403).json({ error: 'Unauthorized to modify this mailbox' });
    }
    if (req.user.role === 'tenant_admin' && mbCheck.rows[0].tenant_id !== req.user.tenantId) {
      return res.status(403).json({ error: 'Unauthorized to modify this mailbox' });
    }

    const updates = [];
    const values = [id];
    let counter = 2;

    if (displayName !== undefined) { updates.push(`display_name = $${counter++}`); values.push(displayName); }
    if (quotaMb !== undefined) { updates.push(`quota_mb = $${counter++}`); values.push(quotaMb); }
    if (active !== undefined) { updates.push(`active = $${counter++}`); values.push(active); }
    if (password) {
      const hash = await bcrypt.hash(password, 12);
      updates.push(`password_hash = $${counter++}`);
      values.push(hash);
    }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    const sql = `UPDATE mailboxes SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING id, email, display_name, quota_mb, active`;
    const result = await query(sql, values);

    await auditLog(req.user.email, 'UPDATE_MAILBOX', id, { active, quotaMb });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/mailboxes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Scope check
    const mbCheck = await query(
      'SELECT m.id, m.domain_id, d.tenant_id FROM mailboxes m JOIN domains d ON m.domain_id = d.id WHERE m.id = $1',
      [id]
    );
    if (mbCheck.rows.length === 0) return res.status(404).json({ error: 'Mailbox not found' });
    if (req.user.role === 'domain_admin' && mbCheck.rows[0].domain_id !== req.user.domainId) {
      return res.status(403).json({ error: 'Unauthorized to delete this mailbox' });
    }
    if (req.user.role === 'tenant_admin' && mbCheck.rows[0].tenant_id !== req.user.tenantId) {
      return res.status(403).json({ error: 'Unauthorized to delete this mailbox' });
    }

    const result = await query('DELETE FROM mailboxes WHERE id = $1 RETURNING email', [id]);
    await auditLog(req.user.email, 'DELETE_MAILBOX', id, { email: result.rows[0].email });
    res.json({ success: true, message: 'Mailbox deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 5. Aliases & Groups
 */
router.get('/domains/:id/aliases', async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.role === 'domain_admin' && id !== req.user.domainId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (req.user.role === 'tenant_admin') {
      const checkDom = await query('SELECT tenant_id FROM domains WHERE id = $1', [id]);
      if (checkDom.rows.length === 0 || checkDom.rows[0].tenant_id !== req.user.tenantId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    const result = await query(
      'SELECT * FROM aliases WHERE domain_id = $1 ORDER BY source ASC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/aliases', async (req, res) => {
  const { domainId, source, destination } = req.body;
  if (!domainId || !source || !destination) {
    return res.status(400).json({ error: 'domainId, source, and destination are required' });
  }

  try {
    if (req.user.role === 'domain_admin' && domainId !== req.user.domainId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (req.user.role === 'tenant_admin') {
      const checkDom = await query('SELECT tenant_id FROM domains WHERE id = $1', [domainId]);
      if (checkDom.rows.length === 0 || checkDom.rows[0].tenant_id !== req.user.tenantId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    const result = await query(
      `INSERT INTO aliases (domain_id, source, destination, active)
       VALUES ($1, $2, $3, true) RETURNING *`,
      [domainId, source.toLowerCase().trim(), destination.toLowerCase().trim()]
    );

    await auditLog(req.user.email, 'CREATE_ALIAS', result.rows[0].id, { source, destination });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/aliases/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const alCheck = await query(
      'SELECT a.id, a.domain_id, d.tenant_id FROM aliases a JOIN domains d ON a.domain_id = d.id WHERE a.id = $1',
      [id]
    );
    if (alCheck.rows.length === 0) return res.status(404).json({ error: 'Alias not found' });
    if (req.user.role === 'domain_admin' && alCheck.rows[0].domain_id !== req.user.domainId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (req.user.role === 'tenant_admin' && alCheck.rows[0].tenant_id !== req.user.tenantId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await query('DELETE FROM aliases WHERE id = $1 RETURNING source', [id]);
    await auditLog(req.user.email, 'DELETE_ALIAS', id, { source: result.rows[0].source });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

