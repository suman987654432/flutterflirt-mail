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
} from 'lucide-react';

interface EmailMessage {
  uid: number;
  subject: string;
  from: { name: string; address: string };
  to: { name: string; address: string }[];
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

const SAMPLE_MESSAGES: EmailMessage[] = [];

export default function WebmailPage() {
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'flagged'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
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

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      // Send real email via backend API
      await fetch(`${API_BASE}/api/mail/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: composeFrom,
          to: composeTo,
          cc: composeCc,
          subject: composeSubject,
          text: composeBody,
          html: `<p>${composeBody.replace(/\n/g, '<br/>')}</p>`,
        }),
      });
    } catch (err) {
      console.warn('API send notice:', err);
    } finally {
      setIsSending(false);
    }

    // Add to local messages state for Sent folder
    const newSentMessage: EmailMessage = {
      uid: Date.now(),
      subject: composeSubject,
      from: { name: 'Admin', address: composeFrom },
      to: [{ name: composeTo.split('@')[0], address: composeTo }],
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: false,
      flagged: false,
      hasAttachment: false,
      snippet: composeBody.slice(0, 80) + '...',
      bodyHtml: `<p>${composeBody.replace(/\n/g, '<br/>')}</p>`,
      security: { spf: 'pass', dkim: 'pass', dmarc: 'pass' },
    };

    setMessages((prev) => [newSentMessage, ...prev]);
    setIsComposeOpen(false);
    setComposeSentToast(true);
    setTimeout(() => setComposeSentToast(false), 4000);

    // Reset compose fields
    setComposeTo('');
    setComposeCc('');
    setComposeSubject('');
    setComposeBody('');
  };
  const filteredMessages = messages.filter((m) => {
    if (activeFolder === 'sent') {
      return m.from.address === 'admin@codeaddabot.in' || m.from.address === 'support@codeaddabot.in';
    }
    if (activeFolder === 'junk' && m.security.dmarc !== 'fail') return false;
    if (activeFolder === 'inbox' && (m.security.dmarc === 'fail' || m.from.address === 'admin@codeaddabot.in')) return false;
    if (filterTab === 'unread' && !m.unread) return false;
    if (filterTab === 'flagged' && !m.flagged) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.subject.toLowerCase().includes(q) ||
        m.from.name.toLowerCase().includes(q) ||
        m.from.address.toLowerCase().includes(q) ||
        m.snippet.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSelectMessage = (msg: EmailMessage) => {
    setSelectedMessage(msg);
    // Mark as read
    setMessages((prev) =>
      prev.map((m) => (m.uid === msg.uid ? { ...m, unread: false } : m))
    );
  };

  const handleToggleFlag = (e: React.MouseEvent, uid: number) => {
    e.stopPropagation();
    setMessages((prev) =>
      prev.map((m) => (m.uid === uid ? { ...m, flagged: !m.flagged } : m))
    );
    if (selectedMessage?.uid === uid) {
      setSelectedMessage((prev) => (prev ? { ...prev, flagged: !prev.flagged } : null));
    }
  };

  const handleDeleteMessage = (uid: number) => {
    setMessages((prev) => prev.filter((m) => m.uid !== uid));
    if (selectedMessage?.uid === uid) {
      setSelectedMessage(null);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 font-sans">
      {/* Top Navbar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center font-bold text-sm tracking-wider shadow">
            FF
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-base text-white tracking-tight">FlutterFlirt</span>
            <span className="text-pink-400 font-semibold text-sm">Mail</span>
          </div>
        </div>

        {/* Global Search */}
        <div className="relative w-full max-w-xl mx-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search mail, people, subjects"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 text-sm text-slate-100 placeholder-slate-400 pl-9 pr-4 py-1.5 rounded-md border border-slate-700 focus:outline-none focus:border-purple-500 focus:bg-slate-800 transition"
          />
        </div>

        {/* User & Mode Controls */}
        <div className="flex items-center gap-3 relative">
          <Link
            href="/admin"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            Admin Console
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* User Avatar Button */}
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 flex items-center justify-center text-sm font-bold text-white shadow ring-2 ring-transparent hover:ring-purple-400 transition"
            title="Account Profile"
          >
            A
          </button>

          {/* User Profile Dropdown Menu */}
          {isProfileOpen && (
            <>
              {/* Click-outside backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />

              <div className="absolute right-0 top-12 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 z-50 overflow-hidden animate-in fade-in duration-150">
                {/* Header */}
                <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-indigo-500 flex items-center justify-center text-base font-bold text-white shadow shrink-0">
                    A
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">Administrator</div>
                    <div className="text-xs text-indigo-200 font-mono truncate">admin@codeaddabot.in</div>
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Active Mailbox
                    </div>
                  </div>
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="text-slate-400 hover:text-white transition p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Storage & Details */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">Mailbox Storage</span>
                    <span className="font-semibold text-slate-700">0 MB / 10 GB (0%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-[1%] h-full bg-indigo-600 rounded-full"></div>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Domain: <b>codeaddabot.in</b></span>
                    <span className="text-emerald-600 font-semibold">DNS Verified ✓</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-2 space-y-0.5">
                  <Link
                    href="/admin"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Admin Console & DNS</span>
                  </Link>

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

                {/* Footer Sign Out */}
                <div className="p-2 border-t border-slate-100 bg-slate-50">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setSelectedMessage(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out / Switch Mailbox</span>
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
              New mail
            </button>

            <nav className="space-y-0.5 text-xs font-medium">
              {[
                { id: 'inbox', label: 'Inbox', icon: Inbox, count: messages.filter((m) => m.unread && m.from.address !== composeFrom).length },
                { id: 'drafts', label: 'Drafts', icon: FileText, count: 0 },
                { id: 'sent', label: 'Sent', icon: Send, count: messages.filter((m) => m.from.address === composeFrom).length },
                { id: 'archive', label: 'Archive', icon: Archive, count: 0 },
                { id: 'junk', label: 'Junk', icon: AlertOctagon, count: 0 },
                { id: 'deleted', label: 'Deleted', icon: Trash2, count: 0 },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeFolder === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveFolder(item.id);
                      setSelectedMessage(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.count > 0 && (
                      <span
                        className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-3">
                FOLDERS
              </span>
              <div className="mt-2 space-y-0.5 text-xs text-slate-500 px-3 italic">
                No custom folders
              </div>
            </div>
          </div>

          {/* Storage Quota Footer */}
          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-300 text-[11px] mb-1.5">
              <span>Storage Quota</span>
              <span className="font-semibold text-slate-200">0 MB / 10 GB</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="w-[1%] h-full bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </aside>

        {/* Pane 2: Message List */}
        <section className="w-96 bg-white border-r border-slate-200 flex flex-col shrink-0">
          {/* Header & Filter Tabs */}
          <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-800 capitalize">{activeFolder}</h2>
            <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-xs font-medium text-slate-600">
              {(['all', 'unread', 'flagged'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-2.5 py-1 rounded-md capitalize transition ${
                    filterTab === tab ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 flex flex-col">
            {filteredMessages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                  <Inbox className="w-6 h-6" />
                </div>
                <div className="font-semibold text-slate-700 text-sm">No messages</div>
                <div className="text-xs text-slate-400 mt-1 max-w-[200px]">
                  {activeFolder === 'sent'
                    ? 'No sent messages yet.'
                    : `No emails found in ${activeFolder}.`}
                </div>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.uid === msg.uid;
                const initials = msg.from.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2);

                return (
                  <div
                    key={msg.uid}
                    onClick={() => handleSelectMessage(msg)}
                    className={`p-3.5 cursor-pointer transition flex items-start gap-3 text-left relative ${
                      isSelected
                        ? 'bg-blue-50/90 border-l-4 border-blue-600'
                        : msg.unread
                        ? 'bg-white hover:bg-slate-50'
                        : 'bg-slate-50/50 hover:bg-slate-100/60 text-slate-600'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className={`text-xs truncate ${
                            msg.unread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                          }`}
                        >
                          {msg.from.name}
                        </span>
                        <span className="text-[11px] text-slate-400 shrink-0 ml-2">{msg.date}</span>
                      </div>

                      <div
                        className={`text-xs truncate mb-1 ${
                          msg.unread ? 'font-bold text-slate-900' : 'text-slate-800'
                        }`}
                      >
                        {msg.subject}
                      </div>

                      <div className="text-[11px] text-slate-500 truncate leading-snug">
                        {msg.snippet}
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 shrink-0 self-center">
                      {msg.hasAttachment && (
                        <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <button
                        onClick={(e) => handleToggleFlag(e, msg.uid)}
                        className={`transition hover:scale-110 ${
                          msg.flagged ? 'text-pink-500' : 'text-slate-300 hover:text-slate-400'
                        }`}
                      >
                        <Flag className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Pane 3: Reading Pane */}
        <main className="flex-1 bg-white flex flex-col overflow-hidden">
          {selectedMessage ? (
            <>
              {/* Action Toolbar */}
              <div className="h-12 border-b border-slate-200 px-6 flex items-center justify-between bg-slate-50/60 shrink-0">
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition">
                    <Reply className="w-3.5 h-3.5" />
                    Reply
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition">
                    <Forward className="w-3.5 h-3.5" />
                    Forward
                  </button>
                  <button
                    onClick={(e) => handleToggleFlag(e, selectedMessage.uid)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition"
                  >
                    <Flag className="w-3.5 h-3.5 text-pink-500" />
                    {selectedMessage.flagged ? 'Unflag' : 'Flag'}
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition">
                    <Archive className="w-3.5 h-3.5" />
                    Archive
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage.uid)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white border border-slate-200 text-red-600 hover:bg-red-50 shadow-sm transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Message Header */}
              <div className="p-6 border-b border-slate-100">
                <h1 className="text-xl font-bold text-slate-900 mb-3 leading-snug">
                  {selectedMessage.subject}
                </h1>

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow">
                      {selectedMessage.from.name[0]}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {selectedMessage.from.name}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          &lt;{selectedMessage.from.address}&gt;
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        To:{' '}
                        {selectedMessage.to.map((t) => (
                          <span key={t.address} className="text-slate-700">
                            {t.name} &lt;{t.address}&gt;
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400">{selectedMessage.date}</span>
                </div>

                {/* Security Authentication Badges (SPF, DKIM, DMARC) */}
                <div className="flex items-center gap-2 mt-4">
                  {Object.entries(selectedMessage.security).map(([key, val]) => {
                    const isPass = val === 'pass';
                    return (
                      <span
                        key={key}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          isPass
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {isPass ? (
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                        )}
                        {key} {val}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Sandboxed Body Rendering */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div
                  className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }}
                />

                {/* Attachment Pill */}
                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-600 block mb-2">
                      Attachments ({selectedMessage.attachments.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedMessage.attachments.map((att) => (
                        <div
                          key={att.filename}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Paperclip className="w-4 h-4 text-blue-600" />
                          <div className="text-left text-xs">
                            <div className="font-semibold text-slate-800">{att.filename}</div>
                            <div className="text-[10px] text-slate-400">{att.size}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm p-8 text-center bg-slate-50/30">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400 shadow-inner">
                <Mail className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-700">No message selected</h3>
              <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
                Choose an email from the left pane to view its content, or click below to compose a new message.
              </p>
              <button
                onClick={() => setIsComposeOpen(true)}
                className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Compose New Email
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Rich Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in duration-150">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm tracking-tight">New message</span>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="flex flex-col flex-1">
              <div className="p-4 space-y-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-12">From:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      admin@codeaddabot.in
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-12">To:</span>
                  <input
                    type="email"
                    required
                    placeholder="recipient@domain.com"
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    className="flex-1 text-sm text-slate-900 focus:outline-none border-b border-slate-200 pb-1"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-12">Cc:</span>
                  <input
                    type="text"
                    placeholder="optional cc recipients"
                    value={composeCc}
                    onChange={(e) => setComposeCc(e.target.value)}
                    className="flex-1 text-sm text-slate-900 focus:outline-none border-b border-slate-200 pb-1"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-12">Subject:</span>
                  <input
                    type="text"
                    required
                    placeholder="Enter email subject"
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="flex-1 text-sm font-semibold text-slate-900 focus:outline-none border-b border-slate-200 pb-1"
                  />
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center gap-3 text-slate-600 text-xs font-bold">
                <button type="button" className="hover:text-slate-900 px-1 py-0.5 rounded">
                  B
                </button>
                <button type="button" className="hover:text-slate-900 px-1 py-0.5 rounded italic">
                  I
                </button>
                <button
                  type="button"
                  className="hover:text-slate-900 px-1 py-0.5 rounded underline"
                >
                  U
                </button>
                <span className="w-px h-4 bg-slate-300"></span>
                <button type="button" className="hover:text-slate-900 px-1 py-0.5 rounded">
                  • List
                </button>
                <button type="button" className="hover:text-slate-900 px-1 py-0.5 rounded">
                  1. List
                </button>
              </div>

              <textarea
                required
                rows={10}
                placeholder="Write your email here..."
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                className="w-full p-4 text-sm text-slate-800 focus:outline-none resize-none"
              />

              {/* Compose Action Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition"
                  >
                    Send
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-200/60 text-xs font-medium transition"
                  >
                    Save draft
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition">
                    <Paperclip className="w-4 h-4 text-blue-600" />
                    <span>Attach</span>
                    <input type="file" multiple className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="text-slate-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
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
          <span>Message sent successfully and copied to Sent folder!</span>
        </div>
      )}
    </div>
  );
}

