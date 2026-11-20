import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import mailRoutes from './routes/mail.js';
import taskRoutes from './routes/tasks.js';
import autoconfigRoutes from './routes/autoconfig.js';
import { DmarcWorker } from './workers/dmarcWorker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and Logging Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Allows iframe sandboxing for email bodies
}));
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter for authentication routes (Temporarily commented out)
/*
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});
*/

// Mount Routes
app.use('/api', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/.well-known', autoconfigRoutes);
app.use('/', autoconfigRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    service: 'FlutterFlirt Mail Backend API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[API Error]:', err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start Server
app.listen(config.port, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(` FlutterFlirt Mail Engine API listening on port ${config.port}`);
  console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===================================================`);

  // Auto-verify and add domain_id to admins table if missing, and ensure tasks table exists
  import('./db.js').then(async ({ query }) => {
    try {
      await query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS domain_id UUID REFERENCES domains(id) ON DELETE SET NULL;`);
      await query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          user_email VARCHAR(255) NOT NULL,
          title VARCHAR(500) NOT NULL,
          completed BOOLEAN NOT NULL DEFAULT false,
          important BOOLEAN NOT NULL DEFAULT false,
          due_date VARCHAR(50),
          priority VARCHAR(20) DEFAULT 'medium',
          notes TEXT,
          source_email_uid INT,
          source_email_subject VARCHAR(500),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      console.log('[DB] Schema verified: admins.domain_id and tasks table exist.');
    } catch (e) {
      console.warn('[DB] Schema check notice:', e.message);
    }
  }).catch(() => {});

  // Start background DMARC Report Worker
  DmarcWorker.start(10);
});

