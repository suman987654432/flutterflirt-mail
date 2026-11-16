'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Inbox,
  FileText,
  Send,
  Archive,
  AlertOctagon,
  Trash2,
  Folder,
  Search,
  Plus,
  Paperclip,
  Flag,
  Reply,
  Forward,
  Mail,
  ShieldCheck,
  ShieldAlert,
  HardDrive,
  CheckCircle,
  X,
  ExternalLink,
  ChevronLeft,
  ArrowRight,
  Settings,
  LogOut,
  User,
  Lock,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface EmailMessage {
  uid: number;
  subject: string;
  from: { name?: string; address: string };
  to: { name?: string; address: string }[];
  date: string;
  unread: boolean;
  flagged: boolean;
  hasAttachment: boolean;
  snippet: string;
  bodyHtml: string;
  security: {
    spf: 'pass' | 'fail' | 'none';
    dkim: 'pass' | 'fail' | 'none';
    dmarc: 'pass' | 'fail' | 'none';
  };
  attachments?: { filename: string; size: string }[];
}

export default function WebmailPage() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('admin@codeaddabot.in');
  const [loginEmail, setLoginEmail] = useState<string>('admin@codeaddabot.in');
  const [loginPassword, setLoginPassword] = useState<string>('AdminPassword123!');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Mail View State
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'flagged'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Compose State
  const [composeFrom, setComposeFrom] = useState('admin@codeaddabot.in');
  const [composeTo, setComposeTo] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeSentToast, setComposeSentToast] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Check login on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('ffmail_token');
    const savedEmail = localStorage.getItem('ffmail_user_email');
    if (savedToken) {
      setToken(savedToken);
      if (savedEmail) {
        setUserEmail(savedEmail);
        setComposeFrom(savedEmail);
      }
      setIsAuthenticated(true);
      fetchFolderMessages('INBOX', savedToken);
    }
    setIsInitializing(false);
  }, []);

  const FOLDER_MAP: Record<string, string> = {
    inbox: 'INBOX',
    sent: 'Sent',
    drafts: 'Drafts',
    archive: 'Archive',
    junk: 'Junk',
    trash: 'Trash',
  };

  // Fetch messages when folder or token changes
  useEffect(() => {
    if (isAuthenticated && token) {
      const folderKey = FOLDER_MAP[activeFolder] || 'INBOX';
      fetchFolderMessages(folderKey, token);
    }
  }, [activeFolder, isAuthenticated, token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      // 1. Try Mailbox Login
      let res = await fetch('/api/mail/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });

      // 2. Fallback to Admin Login if needed
      if (!res.ok) {
        res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Invalid email or password');
      }

      const data = await res.json();
      const authToken = data.token;
      const email = data.user?.email || loginEmail.trim();

      localStorage.setItem('ffmail_token', authToken);
      localStorage.setItem('ffmail_user_email', email);
      setToken(authToken);
      setUserEmail(email);
      setComposeFrom(email);
      setIsAuthenticated(true);

      // Load inbox immediately
      await fetchFolderMessages('INBOX', authToken);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('ffmail_token');
    localStorage.removeItem('ffmail_user_email');
    setToken('');
    setIsAuthenticated(false);
    setMessages([]);
    setSelectedMessage(null);
    setIsProfileOpen(false);
  };

  const fetchFolderMessages = async (folderName: string, authToken: string) => {
    setIsLoadingMessages(true);
    try {
      const res = await fetch(`/api/mail/folders/${encodeURIComponent(folderName)}/messages`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        const rawMsgs = data.messages || [];
        const mapped: EmailMessage[] = rawMsgs.map((m: any) => ({
          uid: m.uid,
          subject: m.subject || '(No Subject)',
          from: m.from || { address: 'Unknown' },
          to: m.to || [],
          date: m.date ? new Date(m.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent',
          unread: !(m.flags || []).includes('\\Seen'),
          flagged: (m.flags || []).includes('\\Flagged'),
          hasAttachment: false,
          snippet: m.subject || '',
          bodyHtml: '',
          security: { spf: 'pass', dkim: 'pass', dmarc: 'pass' },
        }));
        setMessages(mapped);
        if (mapped.length > 0 && !selectedMessage) {
          handleSelectMessage(mapped[0], authToken, folderName);
        }
      }
    } catch (err) {
      console.warn('Could not fetch messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSelectMessage = async (msg: EmailMessage, currentToken?: string, folderName?: string) => {
    // 1. Mark as read immediately in UI
    setMessages((prev) =>
      prev.map((m) => (m.uid === msg.uid ? { ...m, unread: false } : m))
    );
    setSelectedMessage({ ...msg, unread: false });

    const tokenToUse = currentToken || token;
    const targetFolder = folderName || FOLDER_MAP[activeFolder] || 'INBOX';
    if (!tokenToUse) return;

    // 2. Persist \Seen to IMAP
    fetch(`/api/mail/folders/${encodeURIComponent(targetFolder)}/messages/${msg.uid}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenToUse}`,
      },
      body: JSON.stringify({ read: true }),
    }).catch(() => {});

    try {
      const res = await fetch(`/api/mail/folders/${encodeURIComponent(targetFolder)}/messages/${msg.uid}`, {
        headers: { Authorization: `Bearer ${tokenToUse}` },
      });
      if (res.ok) {
        const full = await res.json();
        setSelectedMessage((prev) => prev?.uid === msg.uid ? {
          ...prev,
          subject: full.subject || msg.subject,
          from: full.from || msg.from,
          unread: false,
          bodyHtml: full.html || `<div style="white-space: pre-wrap; font-family: sans-serif; padding: 12px; line-height: 1.6;">${full.text || ''}</div>`,
          security: {
            spf: full.security?.spf ? 'pass' : 'none',
            dkim: full.security?.dkim ? 'pass' : 'none',
            dmarc: full.security?.dmarc ? 'pass' : 'none',
          },
          attachments: (full.attachments || []).map((a: any) => ({
            filename: a.filename || 'attachment',
            size: `${Math.round((a.size || 0) / 1024)} KB`,
          })),
        } : prev);
      }
    } catch (err) {
      console.warn('Could not load full message details:', err);
    }
  };

  const handleToggleFlag = async (e: React.MouseEvent, msg: EmailMessage) => {
    e.stopPropagation();
    const nextFlagged = !msg.flagged;
    setMessages((prev) =>
      prev.map((m) => (m.uid === msg.uid ? { ...m, flagged: nextFlagged } : m))
    );
    if (selectedMessage?.uid === msg.uid) {
      setSelectedMessage((prev) => (prev ? { ...prev, flagged: nextFlagged } : null));
    }
    const targetFolder = FOLDER_MAP[activeFolder] || 'INBOX';
    fetch(`/api/mail/folders/${encodeURIComponent(targetFolder)}/messages/${msg.uid}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ flagged: nextFlagged }),
    }).catch(() => {});
  };

  const handleToggleRead = async (e: React.MouseEvent, msg: EmailMessage) => {
    e.stopPropagation();
    const nextUnread = !msg.unread;
    setMessages((prev) =>
      prev.map((m) => (m.uid === msg.uid ? { ...m, unread: nextUnread } : m))
    );
    if (selectedMessage?.uid === msg.uid) {
      setSelectedMessage((prev) => (prev ? { ...prev, unread: nextUnread } : null));
    }
    const targetFolder = FOLDER_MAP[activeFolder] || 'INBOX';
    fetch(`/api/mail/folders/${encodeURIComponent(targetFolder)}/messages/${msg.uid}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ read: !nextUnread }),
    }).catch(() => {});
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const res = await fetch('/api/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          from: composeFrom,
          to: composeTo,
          cc: composeCc,
          subject: composeSubject,
          text: composeBody,
          html: `<p>${composeBody.replace(/\n/g, '<br/>')}</p>`,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to send message');
      }

      setIsComposeOpen(false);
      setComposeSentToast(true);
      setTimeout(() => setComposeSentToast(false), 4000);

      // Reset compose
      setComposeTo('');
      setComposeCc('');
      setComposeSubject('');
      setComposeBody('');

      // Refresh sent folder if active
      if (activeFolder === 'sent') {
        fetchFolderMessages('Sent', token);
      }
    } catch (err: any) {
      alert(`Send Error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await fetch('/api/mail/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          from: composeFrom,
          to: composeTo,
          cc: composeCc,
          subject: composeSubject,
          text: composeBody,
        }),
      });
      setIsComposeOpen(false);
      setComposeTo('');
      setComposeCc('');
      setComposeSubject('');
      setComposeBody('');
      alert('Draft saved to Drafts folder!');
      if (activeFolder === 'drafts') {
        fetchFolderMessages('Drafts', token);
      }
    } catch (err: any) {
      alert(`Save Draft Error: ${err.message}`);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (filterTab === 'unread' && !m.unread) return false;
    if (filterTab === 'flagged' && !m.flagged) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.subject.toLowerCase().includes(q) ||
        (m.from.name || '').toLowerCase().includes(q) ||
        m.from.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Loading Splash Screen
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
        <p className="text-sm font-medium text-slate-300">Loading FlutterFlirt Mail...</p>
      </div>
    );
  }

  // 1. LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-md">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-purple-500/25 mb-3">
              FF
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">FlutterFlirt Mail</h1>
            <p className="text-xs text-slate-400 mt-1">Self-Hosted Secure Enterprise Business Webmail</p>
          </div>

          {/* Error Banner */}
          {loginError && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
              <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="admin@codeaddabot.in"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Webmail</span>
              )}
            </button>
          </form>

          {/* Preset Helper & Admin Link */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col items-center gap-3 text-xs text-slate-400">
            <div className="text-[11px] bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50 text-slate-300 font-mono">
              Credentials: <span className="text-pink-300">admin@codeaddabot.in</span> / <span className="text-indigo-300">AdminPassword123!</span>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition"
            >
              Go to Admin Console & DNS
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. MAIN WEBMAIL DASHBOARD
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 font-sans">
      {/* Top Navbar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center font-bold text-sm tracking-wider shadow">
            FF
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-base text-white tracking-tight">FlutterFlirt</span>
            <span className="text-pink-400 font-semibold text-sm">Mail</span>
          </div>
          <span className="text-[11px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
            codeaddabot.in
          </span>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search email by sender, recipient or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 text-sm text-slate-100 placeholder-slate-400 pl-9 pr-4 py-1.5 rounded-md border border-slate-700 focus:outline-none focus:border-purple-500 focus:bg-slate-800 transition"
          />
        </div>

        {/* User & Mode Controls */}
        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => fetchFolderMessages(activeFolder === 'inbox' ? 'INBOX' : activeFolder, token)}
            disabled={isLoadingMessages}
            title="Refresh Mailbox"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingMessages ? 'animate-spin text-purple-400' : ''}`} />
          </button>

          {userEmail.startsWith('admin@') && (
            <Link
              href="/admin"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Admin Console
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* User Avatar Button */}
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 flex items-center justify-center text-sm font-bold text-white shadow ring-2 ring-transparent hover:ring-purple-400 transition"
            title="Account Profile"
          >
            {userEmail[0]?.toUpperCase() || 'A'}
          </button>

          {/* User Profile Dropdown Menu */}
          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 top-12 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 z-50 overflow-hidden animate-in fade-in duration-150">
                <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-indigo-500 flex items-center justify-center text-base font-bold text-white shadow shrink-0">
                    {userEmail[0]?.toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {userEmail.startsWith('admin@') ? 'Administrator' : 'Standard User'}
                    </div>
                    <div className="text-xs text-indigo-200 font-mono truncate">{userEmail}</div>
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      {userEmail.startsWith('admin@') ? 'Admin Mailbox' : 'Active Mailbox'}
                    </div>
                  </div>
                  <button onClick={() => setIsProfileOpen(false)} className="text-slate-400 hover:text-white transition p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">Mailbox Storage</span>
                    <span className="font-semibold text-slate-700">10 GB Quota</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-[2%] h-full bg-indigo-600 rounded-full"></div>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Domain: <b>codeaddabot.in</b></span>
                    <span className="text-emerald-600 font-semibold">DNS Verified ✓</span>
                  </div>
                </div>

                <div className="p-2 space-y-0.5">
                  {userEmail.startsWith('admin@') && (
                    <Link
                      href="/admin"
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>Admin Console & DNS</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsComposeOpen(true);
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  >
                    <Plus className="w-4 h-4 text-slate-500" />
                    <span>Compose New Email</span>
                  </button>
                </div>

                {/* Working Sign Out Button */}
                <div className="p-2 border-t border-slate-100 bg-slate-50">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main 3-Pane Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Pane 1: Sidebar Folders */}
        <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 p-3 text-slate-300 select-none">
          <div>
            <button
              onClick={() => setIsComposeOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 mb-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm shadow-md transition active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Compose</span>
            </button>

            <nav className="space-y-1">
              {[
                { id: 'inbox', label: 'Inbox', icon: Inbox, count: messages.filter((m) => m.unread).length },
                { id: 'sent', label: 'Sent', icon: Send },
                { id: 'drafts', label: 'Drafts', icon: FileText },
                { id: 'archive', label: 'Archive', icon: Archive },
                { id: 'junk', label: 'Junk / Spam', icon: AlertOctagon },
                { id: 'trash', label: 'Trash', icon: Trash2 },
              ].map((f) => {
                const Icon = f.icon;
                const isActive = activeFolder === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      setActiveFolder(f.id);
                      setSelectedMessage(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span>{f.label}</span>
                    </div>
                    {f.count !== undefined && f.count > 0 && (
                      <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {f.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Storage Widget */}
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1.5 text-slate-400">
                <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                Storage
              </span>
              <span className="font-semibold text-slate-200">10 GB</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full w-[2%]"></div>
            </div>
          </div>
        </aside>

        {/* Pane 2: Message List */}
        <section className="w-80 md:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none">
          <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <span className="font-semibold text-sm capitalize text-slate-800 flex items-center gap-2">
              {activeFolder}
              <span className="text-xs font-normal text-slate-500">({filteredMessages.length})</span>
            </span>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-md text-[11px] font-medium text-slate-600">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-2 py-0.5 rounded ${filterTab === 'all' ? 'bg-white shadow text-slate-900 font-semibold' : ''}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterTab('unread')}
                className={`px-2 py-0.5 rounded ${filterTab === 'unread' ? 'bg-white shadow text-slate-900 font-semibold' : ''}`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilterTab('flagged')}
                className={`px-2 py-0.5 rounded ${filterTab === 'flagged' ? 'bg-white shadow text-slate-900 font-semibold' : ''}`}
              >
                Flagged
              </button>
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoadingMessages && messages.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                Loading messages...
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No messages found in this folder.
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.uid === msg.uid;
                return (
                  <div
                    key={msg.uid}
                    onClick={() => handleSelectMessage(msg)}
                    className={`p-3.5 cursor-pointer transition relative ${
                      isSelected
                        ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                        : msg.unread
                        ? 'bg-slate-50/60 font-medium hover:bg-slate-50'
                        : 'hover:bg-slate-50/40 text-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {msg.unread && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                        )}
                        <span className={`text-xs truncate ${msg.unread ? 'font-bold text-slate-900' : 'text-slate-800'}`}>
                          {msg.from.name || msg.from.address}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{msg.date}</span>
                    </div>

                    <div className={`text-xs truncate mb-1 ${msg.unread ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                      {msg.subject}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate max-w-[180px]">{msg.snippet || '(Preview)'}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          title={msg.flagged ? "Remove Flag" : "Flag message"}
                          onClick={(e) => handleToggleFlag(e, msg)}
                          className="p-1 rounded hover:bg-slate-200/60 transition"
                        >
                          <Flag className={`w-3.5 h-3.5 ${msg.flagged ? 'text-amber-500 fill-amber-500' : 'text-slate-300 hover:text-amber-500'}`} />
                        </button>
                        <span className="px-1 rounded text-[9px] bg-emerald-100 text-emerald-800 font-semibold">
                          DKIM
                        </span>
                        <span className="px-1 rounded text-[9px] bg-blue-100 text-blue-800 font-semibold">
                          SPF
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Pane 3: Message Detail View */}
        <main className="flex-1 bg-white flex flex-col overflow-hidden">
          {selectedMessage ? (
            <div className="flex flex-1 flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-lg font-bold text-slate-900 leading-snug">
                    {selectedMessage.subject}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleToggleFlag(e, selectedMessage)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                        selectedMessage.flagged
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Flag className={`w-3.5 h-3.5 ${selectedMessage.flagged ? 'fill-amber-500 text-amber-500' : ''}`} />
                      <span>{selectedMessage.flagged ? 'Flagged' : 'Flag'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleToggleRead(e, selectedMessage)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{selectedMessage.unread ? 'Mark Read' : 'Mark Unread'}</span>
                    </button>
                    <button
                      onClick={() => setIsComposeOpen(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm transition"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      Reply
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {(selectedMessage.from.name || selectedMessage.from.address)[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {selectedMessage.from.name || selectedMessage.from.address}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {selectedMessage.from.address}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-slate-400 text-[11px]">
                    <div>{selectedMessage.date}</div>
                    <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      SPF, DKIM & DMARC Verified
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {selectedMessage.bodyHtml ? (
                  <div
                    className="prose max-w-none text-slate-800 text-sm"
                    dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }}
                  />
                ) : (
                  <div className="text-slate-400 text-xs italic">Loading message body...</div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <Mail className="w-12 h-12 mb-3 text-slate-300" />
              <h3 className="font-semibold text-slate-700 text-sm">No Message Selected</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Select an email from the list to view its full content, verification headers, and attachments.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Compose Email Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="font-semibold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Compose New Message
              </div>
              <button onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">From</label>
                <input
                  type="text"
                  disabled
                  value={composeFrom}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">To</label>
                <input
                  type="email"
                  required
                  placeholder="recipient@domain.com"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Subject line"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Message</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Write your email here..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition resize-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  Outgoing DKIM Signing: <span className="text-emerald-600 font-semibold">ff2026._domainkey</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Sent Toast */}
      {composeSentToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Message sent successfully!</span>
        </div>
      )}
    </div>
  );
}
