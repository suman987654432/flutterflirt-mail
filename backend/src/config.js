import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  jwtSecret: process.env.JWT_SECRET || 'flutterflirt-super-secret-jwt-key-change-in-prod',
  jwtExpiresIn: '7d',
  
  databaseUrl: process.env.DATABASE_URL || null,
  db: {
    connectionString: process.env.DATABASE_URL || undefined,
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'ffmail',
    password: process.env.DB_PASSWORD || 'ChangeThisSecretDBPass2026!',
    database: process.env.DB_NAME || 'flutterflirt_mail',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
  },

  imap: {
    host: process.env.IMAP_HOST || 'dovecot',
    port: parseInt(process.env.IMAP_PORT || '143', 10), // Internal plain/STARTTLS or 993 SSL
    secure: process.env.IMAP_SECURE === 'true',
    masterUser: process.env.DOVECOT_MASTER_USER || 'ffapi',
    masterPassword: process.env.DOVECOT_MASTER_PASSWORD || 'FlutterFlirtMasterSecret123!',
  },

  smtp: {
    host: process.env.SMTP_HOST || 'postfix',
    port: parseInt(process.env.SMTP_PORT || '25', 10),
    user: process.env.SMTP_USER || null,
    pass: process.env.SMTP_PASS || null,
    secure: process.env.SMTP_SECURE === 'true' || false,
  },

  dkim: {
    storagePath: process.env.DKIM_KEY_DIR || '/var/lib/rspamd/dkim',
    defaultSelector: 'ff2026',
  },

  platformDomain: process.env.PLATFORM_DOMAIN || 'mail.flutterflirt.com',
  dmarcEmail: process.env.DMARC_REPORT_EMAIL || 'dmarc-reports@flutterflirt.com',
};

