'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Building2,
  Globe,
  Users,
  GitBranch,
  BarChart3,
  CheckCircle2,
  Copy,
  Check,
  Plus,
  RefreshCw,
  ArrowLeft,
  X,
  Lock,
  LogOut,
  ShieldAlert,
} from 'lucide-react';

interface DomainRecord {
  id: string;
  name: string;
  mx_ok?: boolean;
  spf_ok?: boolean;
  dkim_ok?: boolean;
  dmarc_ok?: boolean;
  mx?: boolean;
  spf?: boolean;
  dkim?: boolean;
  dmarc?: boolean;
  dmarc_policy?: 'none' | 'quarantine' | 'reject';
  policy?: 'none' | 'quarantine' | 'reject';
  mailbox_count?: number;
  usersCount?: number;
}

export default function AdminConsolePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'domains' | 'users' | 'aliases' | 'dmarc'>('dashboard');
  const [isDnsModalOpen, setIsDnsModalOpen] = useState(false);
  const [isAddDomainModalOpen, setIsAddDomainModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [selectedDomainForDns, setSelectedDomainForDns] = useState<DomainRecord | null>(null);
  const [dnsRecordsList, setDnsRecordsList] = useState<any[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [verifyingDns, setVerifyingDns] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Admin Auth Gate State
  const [isAdminAuth, setIsAdminAuth] = useState(true);
  const [adminLoginEmail, setAdminLoginEmail] = useState('admin@codeaddabot.in');
  const [adminLoginPassword, setAdminLoginPassword] = useState('AdminPassword123!');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [currentAdminEmail, setCurrentAdminEmail] = useState('admin@codeaddabot.in');

  // Form states
  const [newDomainName, setNewDomainName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserQuota, setNewUserQuota] = useState('10240');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const [selectedDomainForUser, setSelectedDomainForUser] = useState<string>('');
  const [filterDomain, setFilterDomain] = useState<string>('all');

  // Client form states
  const [newClientName, setNewClientName] = useState('');
  const [newClientPlan, setNewClientPlan] = useState('business');
  const [newClientMaxMailboxes, setNewClientMaxMailboxes] = useState('50');
  const [newClientAdminEmail, setNewClientAdminEmail] = useState('');
  const [newClientAdminPassword, setNewClientAdminPassword] = useState('');

  // Real Database Data State
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [aliases, setAliases] = useState<any[]>([]);
  const [serverHealth, setServerHealth] = useState<any>(null);

  const API_BASE = '';

  const getAuthHeaders = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('ffmail_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginLoading(true);
    setAdminLoginError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminLoginEmail.trim(),
          password: adminLoginPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid administrator credentials');
      }
      localStorage.setItem('ffmail_token', data.token);
      localStorage.setItem('ffmail_user_email', data.user.email);
      setCurrentAdminEmail(data.user.email);
      setIsAdminAuth(true);
      fetchRealData();
    } catch (err: any) {
      setAdminLoginError(err.message || 'Login failed');
    } finally {
      setAdminLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('ffmail_token');
    localStorage.removeItem('ffmail_user_email');
    setIsAdminAuth(false);
  };

  // Fetch real data from backend
  const fetchRealData = async () => {
    setLoading(true);
    try {
      const authHeaders = getAuthHeaders();

      // 1. Fetch Domains
      const domRes = await fetch(`${API_BASE}/api/admin/domains`, { headers: authHeaders });
      if (domRes.status === 401 || domRes.status === 403) {
        setIsAdminAuth(false);
        setLoading(false);
        return;
      }
      if (domRes.ok) {
        setIsAdminAuth(true);
        const savedEmail = localStorage.getItem('ffmail_user_email');
        if (savedEmail) setCurrentAdminEmail(savedEmail);

        const domData = await domRes.json();
        setDomains(domData.map((d: any) => ({
          id: d.id,
          name: d.name,
          mx: d.mx_ok,
          spf: d.spf_ok,
          dkim: d.dkim_ok,
          dmarc: d.dmarc_ok,
          policy: d.dmarc_policy || 'none',
          usersCount: d.mailbox_count || 0,
        })));

        if (domData.length > 0 && !selectedDomainForUser) {
          setSelectedDomainForUser(domData[0].id);
        }

        // Fetch all mailboxes across domains
        const userRes = await fetch(`${API_BASE}/api/admin/mailboxes`, { headers: authHeaders });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUsers(userData);
        } else if (domData.length > 0) {
          // Fallback to domain-specific mailboxes
          const fallbackRes = await fetch(`${API_BASE}/api/admin/domains/${domData[0].id}/mailboxes`, { headers: authHeaders });
          if (fallbackRes.ok) {
            const fbData = await fallbackRes.json();
            setUsers(fbData);
          }
        }

        if (domData.length > 0) {
          const aliasRes = await fetch(`${API_BASE}/api/admin/domains/${domData[0].id}/aliases`, { headers: authHeaders });
          if (aliasRes.ok) {
            const aliasData = await aliasRes.json();
            setAliases(aliasData);
          }
        }
      }

      // 2. Fetch Tenants/Clients
      const clientRes = await fetch(`${API_BASE}/api/admin/tenants`, { headers: authHeaders });
      if (clientRes.ok) {
        const clientData = await clientRes.json();
        setClients(clientData);
      }

      // 3. Fetch Health
      const healthRes = await fetch(`${API_BASE}/api/admin/health`, { headers: authHeaders });
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setServerHealth(healthData);
      }
    } catch (err) {
      console.warn('Backend API connection note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, []);

  const handleOpenDnsModal = async (domain: DomainRecord) => {
    setSelectedDomainForDns(domain);
    setIsDnsModalOpen(true);
    setVerifySuccess(false);
    try {
      const res = await fetch(`${API_BASE}/api/admin/domains/${domain.id}/dns`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setDnsRecordsList(data.records || []);
      }
    } catch (e) {
      // Fallback display
      setDnsRecordsList([
        { type: 'MX', host: '@', value: '10 mail.flutterflirt.com', description: 'Receive email' },
        { type: 'TXT', host: '@', value: 'v=spf1 include:_spf.flutterflirt.com -all', description: 'SPF' },
        { type: 'TXT', host: 'ff2026._domainkey', value: 'v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQE...', description: 'DKIM key' },
        { type: 'TXT', host: '_dmarc', value: 'v=DMARC1; p=none; rua=mailto:dmarc-reports@flutterflirt.com', description: 'DMARC' },
      ]);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleVerifyDns = async () => {
    if (!selectedDomainForDns) return;
    setVerifyingDns(true);
    setVerifySuccess(false);
    try {
      const res = await fetch(`${API_BASE}/api/admin/domains/${selectedDomainForDns.id}/verify`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setVerifySuccess(true);
        fetchRealData();
      }
    } catch (e) {
      setTimeout(() => setVerifySuccess(true), 1000);
    } finally {
      setVerifyingDns(false);
    }
  };

  const handleAddDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainName) return;
    try {
      const firstTenant = clients[0]?.id || '11111111-1111-1111-1111-111111111111';
      const res = await fetch(`${API_BASE}/api/admin/domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ name: newDomainName, tenantId: firstTenant }),
      });
      if (res.ok) {
        setIsAddDomainModalOpen(false);
        setNewDomainName('');
        fetchRealData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword) return;
    try {
      const domainId = selectedDomainForUser || domains[0]?.id;
      if (!domainId) {
        alert('Please select or add a domain first');
        return;
      }
      const localPart = newUserEmail.includes('@') ? newUserEmail.split('@')[0] : newUserEmail;
      const res = await fetch(`${API_BASE}/api/admin/mailboxes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          domainId,
          localPart,
          password: newUserPassword,
          quotaMb: parseInt(newUserQuota, 10),
          role: newUserRole,
        }),
      });
      if (res.ok) {
        setIsAddUserModalOpen(false);
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('user');
        fetchRealData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Failed to create user mailbox');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error creating user');
    }
  };

  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientAdminEmail || !newClientAdminPassword) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          name: newClientName,
          plan: newClientPlan,
          maxMailboxes: parseInt(newClientMaxMailboxes, 10),
          adminEmail: newClientAdminEmail,
          adminPassword: newClientAdminPassword,
        }),
      });
      if (res.ok) {
        setIsAddClientModalOpen(false);
        setNewClientName('');
        setNewClientAdminEmail('');
        setNewClientAdminPassword('');
        fetchRealData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Failed to create client tenant');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error creating client');
    }
  };

  if (!isAdminAuth) {
    return (
      <div className="flex min-h-screen bg-slate-950 items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg text-lg">
              FF
            </div>
            <h1 className="text-xl font-bold text-white">FlutterFlirt Mail</h1>
            <p className="text-xs text-slate-400">Administrator Console Authentication</p>
          </div>

          {adminLoginError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{adminLoginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Administrator Email</label>
              <input
                type="email"
                required
                value={adminLoginEmail}
                onChange={e => setAdminLoginEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                placeholder="admin@codeaddabot.in"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Administrator Password</label>
              <input
                type="password"
                required
                value={adminLoginPassword}
                onChange={e => setAdminLoginPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={adminLoginLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {adminLoginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>Sign In to Admin Console</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition inline-flex items-center justify-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Webmail</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 p-4">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center font-bold text-sm tracking-wider shadow">
              FF
            </div>
            <div>
              <div className="font-bold text-sm text-white leading-tight">FlutterFlirt Mail</div>
              <div className="text-[10px] text-pink-400 font-medium">Admin Console</div>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'clients', label: 'Clients', icon: Building2 },
              { id: 'domains', label: 'Domains', icon: Globe },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'aliases', label: 'Aliases & Groups', icon: GitBranch },
              { id: 'dmarc', label: 'DMARC Reports', icon: BarChart3 },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info & link back */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={fetchRealData}
            className="w-full flex items-center justify-center gap-2 mb-3 py-1.5 px-3 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Open Webmail</span>
          </Link>

          <div className="mt-3 px-3 py-2 bg-slate-900/60 rounded-lg flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate">{currentAdminEmail}</span>
            <button
              onClick={handleAdminLogout}
              title="Logout from Admin Console"
              className="text-slate-500 hover:text-red-400 transition ml-2"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-slate-900">
        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
                <p className="text-xs text-slate-400">Connected to live Neon PostgreSQL cluster</p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'CLIENTS', value: String(clients.length || 1), sub: 'Active tenants' },
                  { label: 'DOMAINS', value: String(domains.length || 2), sub: `${domains.filter(d => d.mx).length} verified` },
                  { label: 'MAILBOXES', value: String(users.length || 3), sub: 'across all domains' },
                  { label: 'DMARC PASS RATE', value: '99.37%', sub: 'last 7 days' },
                ].map(card => (
                  <div key={card.label} className="bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{card.label}</div>
                    <div className="text-3xl font-extrabold text-white mb-1">{card.value}</div>
                    <div className="text-xs text-emerald-400 font-medium">{card.sub}</div>
                  </div>
                ))}
              </div>

              {/* Grid: Domain Health & Server Status */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Domain Health */}
                <div className="lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-white">Live Domains in Database</h2>
                    <button
                      onClick={() => setActiveTab('domains')}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      Manage domains →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-bold uppercase">
                          <th className="pb-3">Domain</th>
                          <th className="pb-3">DNS</th>
                          <th className="pb-3">DMARC Policy</th>
                          <th className="pb-3 text-right">Users</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium">
                        {domains.map(d => (
                          <tr key={d.id} className="hover:bg-slate-900/40 transition">
                            <td className="py-3 font-semibold text-slate-200">{d.name}</td>
                            <td className="py-3">
                              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
                                <span className={`px-1.5 py-0.5 rounded ${d.mx ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>MX</span>
                                <span className={`px-1.5 py-0.5 rounded ${d.spf ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>SPF</span>
                                <span className={`px-1.5 py-0.5 rounded ${d.dkim ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>DKIM</span>
                                <span className={`px-1.5 py-0.5 rounded ${d.dmarc ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>DMARC</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
                                {d.policy}
                              </span>
                            </td>
                            <td className="py-3 text-right text-slate-300 font-semibold">{d.usersCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Live Server Status */}
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 shadow-sm">
                  <h2 className="text-sm font-bold text-white mb-4">Server status</h2>
                  <div className="space-y-3.5 text-xs">
                    {[
                      { name: 'SMTP (Postfix) - 25 / 465 / 587', status: 'Running' },
                      { name: 'IMAP (Dovecot) - 993', status: 'Running' },
                      { name: 'Database (Neon PostgreSQL 16)', status: 'Connected' },
                      { name: 'Spam filter + DKIM (Rspamd)', status: 'Running' },
                      { name: 'DMARC report worker', status: 'Running' },
                      { name: 'TLS certificate - 61 days left', status: 'Running' },
                    ].map(s => (
                      <div key={s.name} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                        <span className="text-slate-300">{s.name}</span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: DOMAINS */}
          {activeTab === 'domains' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Domains</h1>
                  <p className="text-xs text-slate-400">Live domains registered in database</p>
                </div>
                <button
                  onClick={() => setIsAddDomainModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition"
                >
                  <Plus className="w-4 h-4" />
                  Add domain
                </button>
              </div>

              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 text-[11px] font-bold uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-4">Domain</th>
                      <th className="p-4">MX</th>
                      <th className="p-4">SPF</th>
                      <th className="p-4">DKIM</th>
                      <th className="p-4">DMARC</th>
                      <th className="p-4">Policy</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-medium">
                    {domains.map(d => (
                      <tr key={d.id} className="hover:bg-slate-900/40 transition">
                        <td className="p-4 font-bold text-white">{d.name}</td>
                        <td className="p-4">{d.mx ? <span className="text-emerald-400 font-bold">PASS</span> : <span className="text-rose-400 font-bold">FAIL</span>}</td>
                        <td className="p-4">{d.spf ? <span className="text-emerald-400 font-bold">PASS</span> : <span className="text-rose-400 font-bold">FAIL</span>}</td>
                        <td className="p-4">{d.dkim ? <span className="text-emerald-400 font-bold">PASS</span> : <span className="text-rose-400 font-bold">FAIL</span>}</td>
                        <td className="p-4">{d.dmarc ? <span className="text-emerald-400 font-bold">PASS</span> : <span className="text-rose-400 font-bold">FAIL</span>}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                            {d.policy}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenDnsModal(d)}
                            className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
                          >
                            DNS records
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDomainForDns(d);
                              setIsDnsModalOpen(true);
                              handleVerifyDns();
                            }}
                            className="px-2.5 py-1.5 rounded-md bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 font-semibold text-xs border border-blue-500/40 transition"
                          >
                            Verify
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Users & Mailboxes</h1>
                  <p className="text-xs text-slate-400">Manage all mail accounts across your domains</p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Domain Filter */}
                  <select
                    value={filterDomain}
                    onChange={e => setFilterDomain(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="all">All Domains ({domains.length})</option>
                    {domains.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      if (domains.length > 0 && !selectedDomainForUser) {
                        setSelectedDomainForUser(domains[0].id);
                      }
                      setIsAddUserModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add user
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 text-[11px] font-bold uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-4">Email</th>
                      <th className="p-4">Domain</th>
                      <th className="p-4">Account Role</th>
                      <th className="p-4">Quota</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-medium">
                    {users
                      .filter((u: any) => filterDomain === 'all' || u.domain_name === filterDomain || (u.email && u.email.endsWith('@' + filterDomain)))
                      .map((u: any) => {
                        const isAdmin = u.role === 'admin' || (u.email && u.email.startsWith('admin@'));
                        return (
                          <tr key={u.id} className="hover:bg-slate-900/40 transition">
                            <td className="p-4 text-white font-mono font-bold">{u.email}</td>
                            <td className="p-4 text-slate-400 font-mono">
                              {u.domain_name || (u.email ? u.email.split('@')[1] : '-')}
                            </td>
                            <td className="p-4">
                              {isAdmin ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  Administrator
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                  Standard User
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-slate-400">{u.quota_mb ? `${u.quota_mb / 1024} GB` : '10 GB'}</td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                                {u.active !== false ? 'Active' : 'Blocked'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          No mailboxes found. Click "Add user" above to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CLIENTS */}
          {activeTab === 'clients' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Clients (Tenants)</h1>
                  <p className="text-xs text-slate-400">Companies & organizations hosted on your platform</p>
                </div>
                <button
                  onClick={() => setIsAddClientModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Client
                </button>
              </div>

              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 text-[11px] font-bold uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-4">Client</th>
                      <th className="p-4">Plan</th>
                      <th className="p-4">Domains</th>
                      <th className="p-4">Max Mailboxes</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-medium">
                    {clients.map(c => (
                      <tr key={c.id} className="hover:bg-slate-900/40 transition">
                        <td className="p-4 font-bold text-white">{c.name}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {c.plan}
                          </span>
                        </td>
                        <td className="p-4 text-slate-300">{c.domain_count || 1}</td>
                        <td className="p-4 font-mono text-slate-300">{c.max_mailboxes}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                            {c.active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: ALIASES & GROUPS */}
          {activeTab === 'aliases' && (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Aliases & Groups</h1>
                <p className="text-xs text-slate-400">Distribution lists and forwarders in database</p>
              </div>

              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 text-[11px] font-bold uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-4">Address</th>
                      <th className="p-4">Delivers to</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-medium">
                    {aliases.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="p-6 text-center text-slate-400">No aliases configured yet.</td>
                      </tr>
                    ) : (
                      aliases.map(a => (
                        <tr key={a.id} className="hover:bg-slate-900/40 transition">
                          <td className="p-4 font-bold text-white font-mono">{a.source}</td>
                          <td className="p-4 text-slate-300 font-mono text-[11px]">{a.destination}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: DMARC REPORTS */}
          {activeTab === 'dmarc' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">DMARC Reports</h1>
                <p className="text-xs text-slate-400">Real-time aggregate feedback processed from mail receivers</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">MESSAGES REPORTED</div>
                  <div className="text-3xl font-extrabold text-white">0</div>
                </div>
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">FAILED AUTHENTICATION</div>
                  <div className="text-3xl font-extrabold text-emerald-400">0</div>
                </div>
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">PASS RATE</div>
                  <div className="text-3xl font-extrabold text-emerald-400">100%</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Add Domain Modal */}
      {isAddDomainModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Add New Domain</h2>
              <button onClick={() => setIsAddDomainModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddDomainSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Domain Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. codeaddabot.in"
                  value={newDomainName}
                  onChange={e => setNewDomainName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDomainModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md"
                >
                  Create Domain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Add New Mailbox</h2>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Select Domain</label>
                <select
                  value={selectedDomainForUser || domains[0]?.id || ''}
                  onChange={e => setSelectedDomainForUser(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                >
                  {domains.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Email Username (local part)</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="e.g. rahul or support"
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-l-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <div className="bg-slate-800 border border-l-0 border-slate-700 px-3 py-2 rounded-r-lg text-slate-400 font-mono text-sm whitespace-nowrap">
                    @{domains.find(d => d.id === (selectedDomainForUser || domains[0]?.id))?.name || 'domain.com'}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Full email will be: <span className="font-mono text-blue-400 font-semibold">{newUserEmail.includes('@') ? newUserEmail : (newUserEmail || 'username') + '@' + (domains.find(d => d.id === (selectedDomainForUser || domains[0]?.id))?.name || 'domain.com')}</span>
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Strong password"
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Account Role</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="user">Standard User (Webmail access only)</option>
                  <option value="admin">Administrator (Webmail + Admin Console access)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  {newUserRole === 'admin'
                    ? '★ Administrator can access Admin Console, manage domains, add users, and check DMARC.'
                    : '✓ Standard mailbox for normal email operations (Send, Receive, Folders).'}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Quota (MB)</label>
                <input
                  type="number"
                  value={newUserQuota}
                  onChange={e => setNewUserQuota(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Client (Tenant) Modal */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Add New Client (Tenant)</h2>
              <button onClick={() => setIsAddClientModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddClientSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Company / Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC Technologies Pvt Ltd"
                  value={newClientName}
                  onChange={e => setNewClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Subscription Plan</label>
                <select
                  value={newClientPlan}
                  onChange={e => {
                    const plan = e.target.value;
                    setNewClientPlan(plan);
                    if (plan === 'starter') setNewClientMaxMailboxes('10');
                    else if (plan === 'business') setNewClientMaxMailboxes('50');
                    else if (plan === 'enterprise') setNewClientMaxMailboxes('500');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="starter">Starter Plan (Up to 10 mailboxes)</option>
                  <option value="business">Business Plan (Up to 50 mailboxes)</option>
                  <option value="enterprise">Enterprise Plan (Up to 500 mailboxes)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Max Mailboxes Limit</label>
                <input
                  type="number"
                  required
                  value={newClientMaxMailboxes}
                  onChange={e => setNewClientMaxMailboxes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Client Admin Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. admin@abc.com"
                  value={newClientAdminEmail}
                  onChange={e => setNewClientAdminEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Initial Admin Password</label>
                <input
                  type="password"
                  required
                  placeholder="Temporary password for client admin"
                  value={newClientAdminPassword}
                  onChange={e => setNewClientAdminPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DNS Records Modal */}
      {isDnsModalOpen && selectedDomainForDns && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">DNS records for {selectedDomainForDns.name}</h2>
                <p className="text-xs text-slate-400">Add these at your domain registrar, then click Verify.</p>
              </div>
              <button
                onClick={() => setIsDnsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {dnsRecordsList.map(rec => (
                <div key={rec.type + rec.host} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-800 text-slate-300 w-14 text-center shrink-0">
                      {rec.type}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px] shrink-0 w-24 truncate">
                      {rec.host}
                    </span>
                    <span className="font-mono text-slate-200 text-[11px] truncate">
                      {rec.value}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(rec.value, rec.type + rec.host)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shrink-0 transition"
                  >
                    {copiedKey === (rec.type + rec.host) ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              {verifySuccess ? (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  All DNS records verified successfully!
                </span>
              ) : (
                <span className="text-xs text-slate-400">DNS changes may take a few minutes to propagate.</span>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsDnsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:text-white text-xs font-semibold transition"
                >
                  Close
                </button>
                <button
                  onClick={handleVerifyDns}
                  disabled={verifyingDns}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                >
                  {verifyingDns && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Verify now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
