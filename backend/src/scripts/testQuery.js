import { pool } from '../db.js';

async function test() {
  try {
    const res = await pool.query(`
      SELECT d.*, t.name as tenant_name,
        COUNT(DISTINCT m.id)::int as mailbox_count,
        COUNT(DISTINCT a.id)::int as alias_count
      FROM domains d
      JOIN tenants t ON d.tenant_id = t.id
      LEFT JOIN mailboxes m ON m.domain_id = d.id
      LEFT JOIN aliases a ON a.domain_id = d.id
      GROUP BY d.id, t.name ORDER BY d.created_at DESC
    `);
    console.log('DOMAINS COUNT:', res.rows.length);
    console.log(res.rows);
  } catch (e) {
    console.error('SQL Error:', e.message);
  } finally {
    await pool.end();
  }
}
test();

