-- FlutterFlirt Mail Database Schema
-- Multi-tenant schema with instant-effect views for Postfix & Dovecot

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tenants (Client Companies)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'business', -- 'basic', 'business', 'enterprise'
    max_mailboxes INT NOT NULL DEFAULT 50,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Domains
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL UNIQUE,
    dkim_selector VARCHAR(50) NOT NULL DEFAULT 'ff2026',
    dkim_private_key TEXT,
    dkim_public_key TEXT,
    dmarc_policy VARCHAR(20) NOT NULL DEFAULT 'none', -- 'none', 'quarantine', 'reject'
    mx_ok BOOLEAN NOT NULL DEFAULT false,
    spf_ok BOOLEAN NOT NULL DEFAULT false,
    dkim_ok BOOLEAN NOT NULL DEFAULT false,
    dmarc_ok BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Mailboxes (User Accounts)
CREATE TABLE IF NOT EXISTS mailboxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- bcrypt hash compatible with Dovecot {BLF-CRYPT}
    quota_mb INT NOT NULL DEFAULT 10240, -- 10 GB default
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Aliases and Distribution Groups
CREATE TABLE IF NOT EXISTS aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    source VARCHAR(255) NOT NULL, -- e.g. support@clientco.in or @clientco.in for catch-all
    destination TEXT NOT NULL,    -- comma-separated or single target address
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_domain_source UNIQUE(domain_id, source)
);

-- 5. Admins (Superadmin & Tenant Admins)
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL for FlutterFlirt Superadmin
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE, -- Scoped for domain_admin
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'tenant_admin', -- 'superadmin', 'tenant_admin', 'domain_admin'
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. DMARC Aggregate Reports
CREATE TABLE IF NOT EXISTS dmarc_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    org_name VARCHAR(255) NOT NULL,
    report_id VARCHAR(255) NOT NULL,
    date_begin TIMESTAMPTZ NOT NULL,
    date_end TIMESTAMPTZ NOT NULL,
    records JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_msgs INT NOT NULL DEFAULT 0,
    failed_msgs INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target VARCHAR(255),
    meta JSONB DEFAULT '{}'::jsonb,
    at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. User Tasks & To-Do
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

CREATE INDEX IF NOT EXISTS idx_tasks_user_email ON tasks(user_email);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- =========================================================================
-- Views for Postfix & Dovecot (Live updates when tenant/user is suspended)
-- =========================================================================

-- View for Postfix: Active Domains
CREATE OR REPLACE VIEW v_active_domains AS
SELECT d.name AS domain
FROM domains d
JOIN tenants t ON d.tenant_id = t.id
WHERE d.active = true AND t.active = true;

-- View for Postfix & Dovecot: Active Mailboxes
CREATE OR REPLACE VIEW v_active_mailboxes AS
SELECT 
    m.id AS mailbox_id,
    m.email,
    m.password_hash,
    m.quota_mb,
    (m.quota_mb::bigint * 1048576) AS quota_bytes,
    d.name AS domain,
    split_part(m.email, '@', 1) AS username,
    CONCAT('/var/mail/vhosts/', d.name, '/', split_part(m.email, '@', 1), '/') AS maildir
FROM mailboxes m
JOIN domains d ON m.domain_id = d.id
JOIN tenants t ON d.tenant_id = t.id
WHERE m.active = true AND d.active = true AND t.active = true;

-- View for Postfix: Active Aliases
CREATE OR REPLACE VIEW v_active_aliases AS
SELECT 
    a.source,
    a.destination,
    d.name AS domain
FROM aliases a
JOIN domains d ON a.domain_id = d.id
JOIN tenants t ON d.tenant_id = t.id
WHERE a.active = true AND d.active = true AND t.active = true;

-- View for Postfix: Sender Login Mappings (enforces reject_sender_login_mismatch)
CREATE OR REPLACE VIEW v_sender_login_maps AS
SELECT email AS sender, email AS login FROM v_active_mailboxes
UNION
SELECT a.source AS sender, m.email AS login
FROM aliases a
JOIN domains d ON a.domain_id = d.id
JOIN mailboxes m ON m.domain_id = d.id
WHERE a.active = true AND d.active = true;

-- Indexes for high-speed mail routing
CREATE INDEX IF NOT EXISTS idx_domains_name ON domains(name);
CREATE INDEX IF NOT EXISTS idx_mailboxes_email ON mailboxes(email);
CREATE INDEX IF NOT EXISTS idx_aliases_source ON aliases(source);
CREATE INDEX IF NOT EXISTS idx_dmarc_reports_domain ON dmarc_reports(domain_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_at ON audit_log(at DESC);

-- =========================================================================
-- Initial Seed Data
-- =========================================================================

-- Default Superadmin password: 'AdminPassword123!' (bcrypt hash)
INSERT INTO admins (email, password_hash, role, active)
VALUES (
    'admin@flutterflirt.com',
    '$2b$12$Kk.X2N35aL5K1.GjXf0q/e7B7v7e71YyOq6r5R6s5B4C3v2q1u0p.', 
    'superadmin',
    true
) ON CONFLICT (email) DO NOTHING;

-- Initial Demo Tenant: FlutterFlirt Internal
INSERT INTO tenants (id, name, plan, max_mailboxes, active)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'FlutterFlirt Private Limited',
    'enterprise',
    500,
    true
) ON CONFLICT DO NOTHING;

-- Initial Demo Domain
INSERT INTO domains (id, tenant_id, name, dkim_selector, dmarc_policy, mx_ok, spf_ok, dkim_ok, dmarc_ok, active)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'flutterflirt.com',
    'ff2026',
    'reject',
    true,
    true,
    true,
    true,
    true
) ON CONFLICT (name) DO NOTHING;

-- Initial Demo Mailboxes
INSERT INTO mailboxes (domain_id, email, display_name, password_hash, quota_mb, active)
VALUES 
(
    '22222222-2222-2222-2222-222222222222',
    'naveen@flutterflirt.com',
    'Naveen',
    '$2b$12$Kk.X2N35aL5K1.GjXf0q/e7B7v7e71YyOq6r5R6s5B4C3v2q1u0p.',
    51200, -- 50 GB
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'sujatha@flutterflirt.com',
    'Sujatha',
    '$2b$12$Kk.X2N35aL5K1.GjXf0q/e7B7v7e71YyOq6r5R6s5B4C3v2q1u0p.',
    51200,
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'dmarc-reports@flutterflirt.com',
    'DMARC Reports Ingestion',
    '$2b$12$Kk.X2N35aL5K1.GjXf0q/e7B7v7e71YyOq6r5R6s5B4C3v2q1u0p.',
    5120, -- 5 GB
    true
) ON CONFLICT (email) DO NOTHING;

