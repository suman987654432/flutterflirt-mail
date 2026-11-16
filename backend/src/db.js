import dns from 'dns/promises';
import pkg from 'pg';
const { Pool } = pkg;
import { config } from './config.js';

let poolInstance = null;

export const getPool = async () => {
  if (poolInstance) return poolInstance;

  if (config.databaseUrl) {
    try {
      const url = new URL(config.databaseUrl);
      const originalHost = url.hostname;
      
      // Resolve to IPv4 to bypass Windows Docker IPv6 unreachable bug
      let ip = originalHost;
      try {
        const addresses = await dns.resolve4(originalHost);
        if (addresses && addresses.length > 0) {
          ip = addresses[0];
        }
      } catch (err) {
        console.warn('[DB] Could not resolve IPv4, falling back to hostname:', err.message);
      }

      poolInstance = new Pool({
        host: ip,
        port: parseInt(url.port || '5432', 10),
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.replace(/^\//, ''),
        ssl: {
          servername: originalHost,
          rejectUnauthorized: false,
        },
        connectionTimeoutMillis: 20000,
        idleTimeoutMillis: 30000,
      });
    } catch (e) {
      console.error('[DB] Failed to parse DATABASE_URL, using fallback:', e.message);
      poolInstance = new Pool(config.db);
    }
  } else {
    poolInstance = new Pool(config.db);
  }

  poolInstance.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err.message);
  });

  return poolInstance;
};

// Initial synchronous pool
export const pool = new Pool(
  config.databaseUrl
    ? {
        connectionString: config.databaseUrl,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 20000,
      }
    : config.db
);

export const query = async (text, params) => {
  const p = await getPool();
  return p.query(text, params);
};
