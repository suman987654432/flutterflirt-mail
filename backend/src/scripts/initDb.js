import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function initDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('ERROR: DATABASE_URL is not set in environment or .env file');
    process.exit(1);
  }

  console.log('Connecting to Neon PostgreSQL database...');
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    console.log('Connected to Neon PostgreSQL successfully!');

    const sqlPath = path.resolve(__dirname, '../../../db/init.sql');
    console.log(`Reading SQL schema from: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing database schema and seed initialization...');
    await client.query(sql);

    console.log('SUCCESS! All tables, views, and initial seed data created in Neon DB:');
    
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);
    console.log('Tables created:');
    tablesRes.rows.forEach(r => console.log(`  - ${r.table_name}`));

    const viewsRes = await client.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public';
    `);
    console.log('Views created:');
    viewsRes.rows.forEach(r => console.log(`  - ${r.table_name}`));

    client.release();
    await pool.end();
    console.log('Database initialization complete!');
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
}

initDatabase();

