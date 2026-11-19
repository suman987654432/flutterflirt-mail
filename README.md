# FlutterFlirt Mail 📬

> A modern, self-hosted, multi-tenant business email platform built specifically for FlutterFlirt clients.  
> Provides SMTP, IMAP, automated DKIM/SPF/DMARC, a responsive Next.js Webmail, and an interactive Admin Console.

---

## 🏗 Architecture Overview

The system is composed of containerized microservices running on a private Docker bridge network:

```
                                  [ INTERNET ]
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           │ Port 25, 465, 587          │ Port 993, 143              │ Port 80, 443
           ▼                            ▼                            ▼
      ┌─────────┐                  ┌─────────┐                  ┌─────────┐
      │ Postfix │◄─── LMTP:24 ────►│ Dovecot │                  │  Nginx  │
      │  (SMTP) │                  │ (IMAP)  │                  │ (Proxy) │
      └────┬────┘                  └────┬────┘                  └────┬────┘
           │ Milter:11332               │                            │
           ▼                            │ Maildir Storage            ├──────► Next.js Frontend (:3000)
      ┌─────────┐                       ▼                            │         • Webmail (/)
      │ Rspamd  │              /var/mail/vhosts/                     │         • Admin Console (/admin)
      │ + Redis │                                                    │
      └─────────┘                       ▲                            └──────► Express API (:8080)
           ▲                            │                                      • /api/admin/*
           │                            │                                      • /api/mail/*
           └────────────┬───────────────┴───────────────┐                      • DMARC Ingestion Worker
                        │                               │
                        ▼                               ▼
                 ┌───────────────┐              ┌───────────────┐
                 │  PostgreSQL   │              │ DKIM Key Store│
                 │ (Multi-Tenant)│              │  /var/lib/    │
                 └───────────────┘              └───────────────┘
```

---

## 🛠 Tech Stack

* **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons, TypeScript
* **Backend API**: Node.js 20, Express, ImapFlow, Nodemailer, AdmZip, xml2js
* **Database**: PostgreSQL 16 (Multi-tenant views `v_active_domains`, `v_active_mailboxes`, `v_sender_login_maps`)
* **SMTP (MTA)**: Postfix 3.7 + PostgreSQL mappings + SASL auth
* **IMAP & Storage**: Dovecot 2.3 + LMTP + Sieve spam routing + Dovecot Master User (`*ffapi`)
* **Spam & Security**: Rspamd + Redis (dynamic DKIM signing & SPF/DKIM/DMARC checks)
* **Reverse Proxy**: Nginx + Let's Encrypt HTTPS

---

## 📁 Repository Structure

```text
flutterflirt-mail/
├── docker-compose.yml          # Orchestrates all 7 services
├── .env.example                # Shared environment variable templates
├── db/
│   └── init.sql                # Complete PostgreSQL tables, views, and seed data
├── postfix/
│   ├── Dockerfile
│   ├── main.cf, master.cf      # SMTP configurations
│   └── pgsql-*.cf              # Dynamic SQL routing lookups
├── dovecot/
│   ├── Dockerfile
│   ├── dovecot.conf            # IMAP, LMTP, and Master User config
│   ├── dovecot-sql.conf.ext    # User and password database queries
│   └── sieve/default.sieve     # Auto-moves spam to Junk
├── rspamd/
│   └── local.d/                # DKIM signing, Redis & Milter header configs
├── backend/
│   ├── package.json
│   ├── Dockerfile
│   └── src/
│       ├── index.js            # Express server
│       ├── routes/             # Admin, Mail, Auth, and Autoconfig routes
│       ├── services/           # DKIM key generation, DNS checking, IMAP, Nodemailer
│       └── workers/            # DMARC aggregate XML report parser worker
├── frontend/
│   ├── package.json
│   ├── Dockerfile
│   └── app/
│       ├── page.tsx            # Webmail UI (3-pane responsive layout)
│       └── admin/page.tsx      # Admin Console UI (DNS verify, DMARC analytics)
└── nginx/
    └── ffmail.conf             # Production HTTPS reverse proxy
```

---

## 🚀 Quick Start (Production / Docker)

### 1. Configure Environment
```bash
cp .env.example .env
# Edit .env with your production passwords and public IP
```

### 2. Launch All Services
```bash
docker compose up -d --build
```

### 3. Access Interfaces
* **Webmail**: `http://localhost:3000` 
* **Admin Console**: `http://localhost:3000/admin` 
* **API Health**: `http://localhost:8080/health`

---

## 💻 Local Development (Frontend & Backend)

### Run Backend
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:8080
```

### Run Frontend
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
```

---

## 🔒 Security Highlights

1. **Dovecot Master User (`user@domain*ffapi`)**:
   The Webmail API uses internal master user credentials to open user mailboxes without ever caching or storing plain text passwords.
2. **Strict Sender Login Policy (`reject_sender_login_mismatch`)**:
   Users can only send emails from their verified email address or aliases they belong to.
3. **Sandboxed Email Viewer**:
   Incoming HTML emails render in an isolated, script-disabled sandbox preventing cross-site scripting (XSS).
4. **Automated DMARC Ingestion**:
   Aggregate reports from Google, Yahoo, and Zoho are unpacked and analyzed every 10 minutes to detect domain spoofing in real time.

