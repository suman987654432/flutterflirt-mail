import { pool } from '../db.js';

async function addDomain() {
  try {
    const tRes = await pool.query('SELECT id FROM tenants LIMIT 1');
    const tenantId = tRes.rows[0].id;

    await pool.query(
      `INSERT INTO domains (tenant_id, name, dkim_selector, dmarc_policy, active)
       VALUES ($1, 'codeaddabot.in', 'ff2026', 'none', true)
       ON CONFLICT (name) DO NOTHING`,
      [tenantId]
    );

    console.log('Successfully added codeaddabot.in to database!');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

addDomain();

