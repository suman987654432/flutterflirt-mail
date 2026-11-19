'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import * as Accordion from '@radix-ui/react-accordion';
import {
  Mail,
  ShieldCheck,
  Server,
  Lock,
  Globe,
  Users,
  HardDrive,
  ArrowRight,
  ArrowLeft,
  Search,
  FileText,
  Inbox,
  Send,
  Trash2,
  Check,
  X,
  Menu,
  ChevronDown,
  ChevronRight,
  Smartphone,
  Shield,
  Terminal,
  Bold,
  Italic,
  Link as LinkIcon,
  Image as ImageIcon,
  Clock,
  Database,
  EyeOff,
  Zap,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Headphones,
  Play,
  RotateCcw,
  Activity,
  Calendar,
  CheckSquare,
  Bookmark,
  RefreshCw,
  Award,
  Layers,
  AtSign,
  KeyRound,
  Sliders,
  Star,
  PlayCircle,
  Building2,
  Rocket,
  Store,
  Share2,
  Plus,
  Paperclip,
  TrendingUp,
  CreditCard,
  UserCheck,
} from 'lucide-react';

/* ─── Currency Pricing Map ─── */
const PRICING_DATA = {
  USD: {
    symbol: '$',
    monthly: { starter: 12, business: 39, enterprise: 119 },
    annual: { starter: '9.60', business: '31.20', enterprise: '95.20' },
  },
  EUR: {
    symbol: '€',
    monthly: { starter: 11, business: 36, enterprise: 110 },
    annual: { starter: '8.80', business: '28.80', enterprise: '88.00' },
  },
  GBP: {
    symbol: '£',
    monthly: { starter: 10, business: 32, enterprise: 99 },
    annual: { starter: '8.00', business: '25.60', enterprise: '79.20' },
  },
};

/* ─── FAQ List (Top 5 Focused Questions) ─── */
const FAQS = [
  {
    q: 'What is FlutterFlirt Mail and how is it sovereign?',
    a: 'FlutterFlirt Mail is a dedicated business email hosting platform developed by FlutterFlirt Private Limited. Unlike public shared mail services, it operates on high-performance NVMe infrastructure with strict tenant isolation, zero ad surveillance, and 100% data ownership.',
  },
  {
    q: 'Can I keep my existing business domain and registrar?',
    a: 'Yes, absolutely. You do not need to transfer your domain registration. Keep your domain with Cloudflare, GoDaddy, Namecheap, or any provider, and simply copy the verified DNS records (MX, SPF, 2048-bit DKIM, and DMARC).',
  },
  {
    q: 'Can our team access emails on iPhone, Android, and Outlook?',
    a: 'Yes. FlutterFlirt Mail provides a blazing-fast responsive browser Webmail interface, as well as standard encrypted IMAP (port 993 SSL/TLS) and SMTP (port 587 STARTTLS) sync for Apple Mail, Outlook, and mobile apps.',
  },
  {
    q: 'How do I provision and manage employee mailboxes?',
    a: 'Through the Centralized Admin Console, an administrator can create employee mailboxes with one click, assign storage quotas, configure forwarding aliases (like sales@ or support@), and enforce enterprise password security.',
  },
  {
    q: 'How quickly can our business get started?',
    a: 'In under 10 minutes. Simply submit the setup request form below or choose your mailbox plan. Our team will verify your domain DNS records and help you get your business mail live without downtime.',
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Inbound Lead Form State (dispatches to sumanqaj9876@gmail.com)
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    domain: '',
    phone: '',
    mailboxCount: 'Starter (1 - 5 Mailboxes)',
    message: '',
  });
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name.trim() || !leadForm.email.trim()) {
      setLeadError('Please fill in your name and email.');
      return;
    }
    setLeadLoading(true);
    setLeadError(null);

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLeadSubmitted(true);
      } else {
        setLeadError(data.error || 'Could not submit request. Please try again.');
      }
    } catch (err: any) {
      console.warn('Lead dispatch note:', err);
      setLeadSubmitted(true);
    } finally {
      setLeadLoading(false);
    }
  };

  // Hero interactive card states
  const [heroUser, setHeroUser] = useState('sarah');
  const [heroDomain, setHeroDomain] = useState('yourcompany.com');
  const [heroName, setHeroName] = useState('Sarah Jenkins');

  // Interactive Webmail Showcase State
  const [showcaseTab, setShowcaseTab] = useState<'inbox' | 'todo' | 'calendar' | 'contacts'>('inbox');
  const [showcaseEmailFolder, setShowcaseEmailFolder] = useState<'inbox' | 'starred' | 'sent' | 'drafts' | 'trash'>('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<number>(1);
  const [webmailSidebarOpen, setWebmailSidebarOpen] = useState(false);
  const [mobileReadingPane, setMobileReadingPane] = useState(false);
  const [showcaseComposeOpen, setShowcaseComposeOpen] = useState(false);
  const [showcaseComposeTo, setShowcaseComposeTo] = useState('partners@venturecapital.io');
  const [showcaseComposeSubject, setShowcaseComposeSubject] = useState('Q3 Sovereign Infrastructure & Compliance Signoff');
  const [showcaseComposeBody, setShowcaseComposeBody] = useState('Hi Team,\n\nOur FlutterFlirt Mail cluster migration has completed with 100% 2048-bit DKIM and SPF pass.');
  const [showcaseToast, setShowcaseToast] = useState<string | null>(null);

  // Interactive Tasks
  const [showcaseTasks, setShowcaseTasks] = useState([
    { id: 1, title: 'Verify Cloudflare DKIM 2048-bit TXT record', completed: true, priority: 'high', dueDate: 'Today' },
    { id: 2, title: 'Provision marketing team mailboxes (@yourcompany.com)', completed: false, priority: 'high', dueDate: 'Today' },
    { id: 3, title: 'Sync executive Outlook & iPhone IMAP profiles', completed: false, priority: 'medium', dueDate: 'Tomorrow' },
    { id: 4, title: 'Configure sales@ and support@ forwarding aliases', completed: false, priority: 'low', dueDate: 'Friday' },
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');

  const triggerShowcaseToast = (msg: string) => {
    setShowcaseToast(msg);
    setTimeout(() => setShowcaseToast(null), 3500);
  };

  const handleToggleTask = (id: number) => {
    setShowcaseTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddShowcaseTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setShowcaseTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: newTaskInput.trim(),
        completed: false,
        priority: 'medium',
        dueDate: 'Today',
      },
    ]);
    setNewTaskInput('');
    triggerShowcaseToast('✓ Task created successfully');
  };

  const pricing = PRICING_DATA[currency];
  const isAnnual = billingCycle === 'annual';

  return (
    <div className="min-h-screen bg-[#f6f9fe] text-[#181c20] font-sans antialiased selection:bg-[#315bdb] selection:text-white overflow-x-hidden w-full">

      {/* ═══════════════════════════════════════════════════════════
          HEADER / STICKY NAVBAR
      ═══════════════════════════════════════════════════════════ */}
      <header className="fixed top-0 w-full z-50 bg-[#f6f9fe]/85 backdrop-blur-xl border-b border-[#dfe3e8] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/landing" className="flex items-center">
            <img
              src="/logo.png"
              alt="FlutterFlirt Mail"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[#434654]">
            {[
              { label: 'Product', href: '#showcase' },
              { label: 'Features', href: '#features' },
              { label: 'Security', href: '#security' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'FAQ', href: '#faq' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="hover:text-[#315bdb] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/"
              className="text-[14px] font-medium text-[#434654] hover:text-[#315bdb] px-3.5 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <a
              href="#get-started"
              className="inline-flex items-center justify-center text-[14px] bg-[#315bdb] text-white font-medium px-4 py-2 rounded-lg shadow-[0_0_12px_rgba(49,91,219,0.3)] hover:bg-[#274bb7] transition-all active:scale-[0.98]"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#434654] hover:bg-slate-200/60 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-[#dfe3e8] px-6 py-5 space-y-2.5 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            {['Product', 'Features', 'Security', 'Pricing', 'FAQ'].map((item) => (
              <a
                key={item}
                href={item === 'Product' ? '#showcase' : `#${item.toLowerCase()}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg text-[15px] font-semibold text-[#181c20] hover:bg-[#cad6ff]/30 hover:text-[#315bdb] transition-colors"
              >
                {item}
              </a>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl border border-[#dfe3e8] text-[13.5px] font-semibold text-[#181c20] hover:bg-slate-50 transition-colors"
              >
                Sign In to Webmail
              </Link>
              <a
                href="#get-started"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl bg-[#315bdb] text-[13.5px] font-bold text-white shadow-md hover:bg-[#274bb7] transition-all"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="w-full pt-16">

        {/* ═══════════════════════════════════════════════════════════
            1. HERO SECTION (Perfect Balanced & Equal Split)
        ═══════════════════════════════════════════════════════════ */}
        <section className="relative w-full pt-12 pb-20 lg:pt-20 lg:pb-28 px-6 lg:px-12 overflow-hidden bg-[#f6f9fe]">
          {/* Ambient Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-[#315bdb]/10 via-[#dae2ff]/30 to-transparent blur-3xl pointer-events-none -z-10" />
          <div className="absolute -top-24 right-10 w-96 h-96 bg-[#315bdb]/20 rounded-full blur-[120px] pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">

              {/* Left Column: Perfectly Proportioned Executive Copy */}
              <div className="lg:col-span-6 flex flex-col justify-between items-start text-left w-full space-y-6 lg:space-y-0">
                {/* Top Block: Status, Heading, Paragraph */}
                <div className="space-y-4 w-full">
                  {/* Status Pill */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f1f4f9] border border-[#dfe3e8]/80 shadow-xs">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                    </span>
                    <span className="font-mono text-[11px] text-[#0340c2] font-bold uppercase tracking-wider">
                      SOVEREIGN BUSINESS EMAIL • 99.9% UPTIME SLA
                    </span>
                  </div>

                  {/* Headline - Balanced Typography */}
                  <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#181c20] tracking-tight leading-[1.16]">
                    Secure, Private, and{' '}
                    <span className="whitespace-nowrap">Ad-Free</span>
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0340c2] via-[#315bdb] to-[#515e80]">
                      Business Email for Your Domain
                    </span>
                  </h1>

                  {/* Supporting Subtitle */}
                  <p className="text-[15.5px] text-[#515e80] leading-relaxed font-normal">
                    Create custom domain email addresses (<span className="font-mono text-[#181c20] font-medium">you@yourcompany.com</span>) with guaranteed in-box deliverability, dedicated sovereign servers, and zero ad surveillance.
                  </p>
                </div>

                {/* Middle Block: Feature Proofs */}
                <div className="space-y-2.5 text-[13.5px] w-full py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="text-[#181c20]">
                      <strong>100% In-Box Delivery:</strong> Pre-configured SPF, 2048-bit DKIM &amp; DMARC
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#cad6ff] text-[#315bdb] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="text-[#181c20]">
                      <strong>Multi-Device Sync:</strong> Fast Webmail, Outlook, Apple Mail &amp; mobile
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="text-[#181c20]">
                      <strong>100% Private &amp; Sovereign:</strong> Zero tracking, zero ads, zero AI training
                    </span>
                  </div>
                </div>

                {/* Bottom Block: CTAs and Trust Badges */}
                <div className="space-y-3.5 w-full">
                  {/* Action CTA Row */}
                  <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
                    <a
                      href="#get-started"
                      className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#315bdb] text-white text-[14.5px] font-semibold shadow-[0_4px_16px_rgba(49,91,219,0.28)] hover:bg-[#274bb7] transition-all active:scale-[0.98]"
                    >
                      <span>Get Started Free</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </a>
                    <a
                      href="#showcase"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white text-[#181c20] border border-[#dfe3e8] text-[14.5px] font-semibold shadow-xs hover:bg-[#ebeef3] transition-all"
                    >
                      <PlayCircle className="w-4 h-4 text-[#315bdb]" />
                      <span>Interactive Demo</span>
                    </a>
                  </div>

                  {/* Micro-Trust Signals */}
                  <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 pt-1 text-[#515e80] text-[12px]">
                    <div className="flex items-center gap-1">
                      <span className="flex text-amber-500 font-bold">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        ))}
                      </span>
                      <span className="font-semibold text-[#181c20] ml-1">4.9/5</span> Enterprise Trust
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>100% Ad-Free</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1 text-[#315bdb] font-medium">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Instant DNS Assistant</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Equal-Height Interactive Terminal Mockup */}
              <div className="lg:col-span-6 relative w-full h-full flex flex-col">
                {/* Soft ambient glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#315bdb]/15 via-[#cad6ff]/30 to-[#b6c4ff]/30 rounded-2xl blur-xl -z-10" />

                {/* Main Card Container */}
                <div className="bg-white rounded-2xl border border-[#dfe3e8] shadow-2xl overflow-hidden text-left flex flex-col justify-between h-full">
                  {/* Card Header Bar */}
                  <div className="h-11 bg-[#e5e8ed] border-b border-[#dfe3e8] px-5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                      <span className="font-mono text-[11px] text-[#434654] font-medium ml-2">
                        terminal.flutterflirt.com
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> TLS 1.3 Active
                      </span>
                      <span className="text-[#747686] text-[10px] hidden sm:inline">2048-Bit</span>
                    </div>
                  </div>

                  {/* Card Content Body - Perfectly Balanced Equal Layout */}
                  <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 space-y-3.5">
                    {/* Priority Email Dispatch Banner */}
                    <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-blue-50/90 to-[#cad6ff]/30 rounded-xl border border-[#cad6ff]/80 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#315bdb] text-white flex items-center justify-center shadow-xs shrink-0">
                          <ShieldCheck className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-[#0340c2] text-[11px] uppercase tracking-wider">Priority Email Dispatch</div>
                          <div className="text-[10.5px] text-[#515e80]">DKIM Sealed • Zero Third-Party Interception</div>
                        </div>
                      </div>
                      <span className="shrink-0 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold rounded-full border border-emerald-200">
                        100% Ad-Free
                      </span>
                    </div>

                    {/* Account Owner Chip */}
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#315bdb] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                          {heroUser ? heroUser.slice(0, 2).toUpperCase() : 'SJ'}
                        </div>
                        <span className="font-semibold text-slate-800">{heroName || 'Sarah Jenkins'}</span>
                        <span className="text-slate-400 hidden sm:inline">• Director of Ops</span>
                      </div>
                      <span className="font-mono text-emerald-700 font-bold text-[10.5px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> DNS Ready
                      </span>
                    </div>

                    {/* Interactive Email Builder Input */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-[#515e80]">
                        <span className="uppercase tracking-wider">Configure Custom Mailbox</span>
                        <span className="text-slate-400 font-mono text-[10.5px]">Instant Allocation</span>
                      </div>

                      {/* Unified Sleek Input Bar */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center rounded-xl border border-[#dfe3e8] bg-[#f8fafc] p-1 focus-within:border-[#315bdb] focus-within:ring-2 focus-within:ring-[#315bdb]/15 focus-within:bg-white transition-all gap-1">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 flex-1 bg-white sm:bg-transparent rounded-lg sm:rounded-none border sm:border-0 border-slate-200">
                          <AtSign className="w-3.5 h-3.5 text-[#315bdb] shrink-0" />
                          <input
                            type="text"
                            value={heroUser}
                            onChange={(e) => setHeroUser(e.target.value.toLowerCase().trim())}
                            placeholder="username"
                            className="w-full bg-transparent font-mono text-[13px] font-semibold text-[#181c20] focus:outline-none"
                          />
                        </div>
                        <span className="hidden sm:inline text-slate-400 font-mono font-medium px-1 text-xs">@</span>
                        <div className="flex items-center justify-between px-2.5 py-1.5 flex-1 bg-white sm:bg-transparent rounded-lg sm:rounded-none border sm:border-0 border-slate-200">
                          <input
                            type="text"
                            value={heroDomain}
                            onChange={(e) => setHeroDomain(e.target.value.toLowerCase().trim())}
                            placeholder="company.com"
                            className="w-full bg-transparent font-mono text-[13px] font-bold text-[#0340c2] focus:outline-none"
                          />
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" strokeWidth={3} />
                        </div>
                      </div>
                    </div>

                    {/* Live Generated Mailbox Card */}
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#315bdb]/5 via-[#cad6ff]/15 to-white border border-[#cad6ff] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#315bdb] text-white flex items-center justify-center font-bold text-[12px] shadow-xs shrink-0">
                          {heroUser ? heroUser.slice(0, 2).toUpperCase() : 'FF'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-mono text-[13px] sm:text-[14px] font-bold text-[#181c20] truncate">
                            {heroUser || 'sarah'}@{heroDomain || 'yourcompany.com'}
                          </div>
                          <div className="text-[11px] text-[#515e80] flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active &amp; Ready
                            </span>
                            <span>•</span>
                            <span>Primary Alias</span>
                          </div>
                        </div>
                      </div>
                      <span className="shrink-0 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full font-mono text-[10px] font-bold border border-emerald-200">
                        100% In-Box
                      </span>
                    </div>

                    {/* Clean Horizontal Specs Row */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-[#f8fafc] border border-slate-200/80">
                        <div className="text-[9.5px] uppercase text-[#747686] font-semibold tracking-wider">Storage</div>
                        <div className="text-[12px] font-bold text-[#181c20] mt-0.5">50 GB NVMe</div>
                      </div>
                      <div className="p-2 rounded-xl bg-[#f8fafc] border border-slate-200/80">
                        <div className="text-[9.5px] uppercase text-[#747686] font-semibold tracking-wider">Encryption</div>
                        <div className="text-[12px] font-bold text-[#181c20] mt-0.5">TLS 1.3 Strict</div>
                      </div>
                      <div className="p-2 rounded-xl bg-[#f8fafc] border border-slate-200/80">
                        <div className="text-[9.5px] uppercase text-[#747686] font-semibold tracking-wider">Privacy</div>
                        <div className="text-[12px] font-bold text-emerald-700 mt-0.5">Zero Ads</div>
                      </div>
                    </div>

                    {/* Launch Action Button */}
                    <a
                      href="#get-started"
                      className="w-full py-3 bg-[#315bdb] hover:bg-[#274bb7] text-white rounded-xl text-[14px] font-semibold transition-all active:scale-[0.98] shadow-[0_4px_16px_rgba(49,91,219,0.28)] flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <span>Create Business Mailbox</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </a>

                    {/* Sleek Sub-Seal Information */}
                    <div className="pt-2 border-t border-[#dfe3e8]/70 flex items-center justify-between text-[10.5px] font-mono text-[#747686]">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>SPF, 2048-bit DKIM &amp; DMARC Enforced</span>
                      </div>
                      <span className="text-slate-400">99.9% Uptime</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            2. PRODUCT SHOWCASE (Live Animated Interactive Webmail Client)
        ═══════════════════════════════════════════════════════════ */}
        <section id="showcase" className="relative w-full py-24 px-6 lg:px-12 bg-white overflow-hidden">
          {/* Animated Ambient Glows */}
          <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-gradient-to-tr from-[#315bdb]/15 via-sky-300/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '7s' }} />
          <div className="absolute bottom-10 -right-32 w-[600px] h-[600px] bg-gradient-to-bl from-purple-500/15 via-[#315bdb]/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '9s' }} />

          <div className="max-w-7xl mx-auto space-y-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8edff] text-[#0340c2] font-mono text-[11px] mb-2.5 font-bold border border-[#cad6ff]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#315bdb] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#315bdb]" />
                </span>
                <span>INTERACTIVE WEBMAIL</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#181c20] mb-2 tracking-tight">
                Designed for Your Entire Email Workflow.
              </h2>
              <p className="text-[14.5px] text-[#515e80] max-w-md mx-auto leading-relaxed">
                Test drive the live webmail client. Click any folder, task, or compose message.
              </p>
            </div>

            {/* Interactive Desktop Webmail Simulator Container with Glowing Animated Rim */}
            <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-r from-[#315bdb]/40 via-[#60a5fa]/60 to-[#a855f7]/40 shadow-[0_20px_50px_rgba(49,91,219,0.15)] transition-all">
              <div className="rounded-2xl bg-white overflow-hidden text-left border border-slate-200">
                {/* App Titlebar */}
                <div className="h-12 bg-[#ebeef3] border-b border-[#dfe3e8] px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 select-none">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Hamburger Button for Mobile Simulator Drawer */}
                    <button
                      onClick={() => setWebmailSidebarOpen(!webmailSidebarOpen)}
                      className="sm:hidden p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5"
                      aria-label="Toggle Webmail Navigation"
                      title="Open Webmail Menu"
                    >
                      {webmailSidebarOpen ? <X className="w-3.5 h-3.5 text-rose-600" /> : <Menu className="w-3.5 h-3.5 text-[#315bdb]" />}
                      <span className="text-[11px] font-bold text-slate-700">Menu</span>
                    </button>

                    <div className="hidden xs:flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                    </div>

                    <span className="font-mono text-[11px] text-[#434654] font-medium ml-1 truncate max-w-[130px] xs:max-w-none">
                      webmail — {heroUser || 'sarah'}@{heroDomain || 'yourcompany.com'}
                    </span>
                  </div>

                  {/* Pulsing Live Simulator Indicator */}
                  <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-mono font-bold border border-emerald-300 shadow-xs">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                    </span>
                    <span>LIVE SIMULATOR ACTIVE</span>
                  </div>

                  {/* Right Quick Controls */}
                  <div className="flex items-center gap-2 text-slate-600 shrink-0">
                    <button
                      onClick={() => triggerShowcaseToast('✓ All mailboxes and DNS records synced in real time.')}
                      className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Refresh Mailbox"
                    >
                      <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <div className="h-4 w-px bg-slate-300" />
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#315bdb] text-white flex items-center justify-center font-bold text-[10px] sm:text-[11px]">
                        {heroUser ? heroUser.slice(0, 2).toUpperCase() : 'SJ'}
                      </div>
                      <span className="font-semibold text-[11.5px] sm:text-[12.5px] text-[#181c20] hidden md:inline">
                        {heroName || 'Sarah Jenkins'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Webmail Interface Workspace */}
                <div className="grid grid-cols-12 min-h-[580px] bg-white relative overflow-hidden">

                  {/* ── MOBILE SLIDE-IN DRAWER (HAMBURGER MENU) ── */}
                  {webmailSidebarOpen && (
                    <div className="sm:hidden absolute inset-0 z-30 bg-slate-900/50 backdrop-blur-xs flex animate-in fade-in duration-150">
                      <div className="w-[84%] max-w-[290px] bg-[#f8fafc] h-full p-4 border-r border-[#dfe3e8] shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
                        <div className="space-y-4">
                          {/* Drawer Header */}
                          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-[#315bdb] flex items-center justify-center text-white font-bold text-xs">
                                FF
                              </div>
                              <span className="font-bold text-[13.5px] text-[#181c20]">Mail Navigation</span>
                            </div>
                            <button
                              onClick={() => setWebmailSidebarOpen(false)}
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Compose Button */}
                          <button
                            onClick={() => {
                              setShowcaseComposeOpen(true);
                              setWebmailSidebarOpen(false);
                            }}
                            className="w-full py-2.5 px-4 rounded-xl bg-[#315bdb] hover:bg-[#274bb7] text-white text-[13.5px] font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>New Message</span>
                          </button>

                          {/* Mail Folders */}
                          <div className="space-y-1">
                            <div className="px-2 pb-1 text-[10.5px] uppercase tracking-wider font-bold text-slate-400">
                              Mail Folders
                            </div>

                            {[
                              { id: 'inbox' as const, label: 'Inbox', icon: Inbox, badge: '3', defaultEmailId: 1 },
                              { id: 'starred' as const, label: 'Starred', icon: Star, badge: '2', defaultEmailId: 1 },
                              { id: 'sent' as const, label: 'Sent Mail', icon: Send, badge: '1', defaultEmailId: 4 },
                              { id: 'drafts' as const, label: 'Drafts', icon: FileText, badge: '1', defaultEmailId: 5 },
                              { id: 'trash' as const, label: 'Trash', icon: Trash2, badge: '1', defaultEmailId: 6 },
                            ].map((folder) => {
                              const isActive = showcaseTab === 'inbox' && showcaseEmailFolder === folder.id;
                              return (
                                <button
                                  key={folder.id}
                                  onClick={() => {
                                    setShowcaseTab('inbox');
                                    setShowcaseEmailFolder(folder.id);
                                    setSelectedEmailId(folder.defaultEmailId);
                                    setMobileReadingPane(false);
                                    setWebmailSidebarOpen(false);
                                  }}
                                  className={`w-full px-3 py-2.5 rounded-lg text-[13px] font-medium flex items-center justify-between transition-colors cursor-pointer ${isActive
                                    ? 'bg-[#cad6ff]/50 text-[#0340c2] font-semibold'
                                    : 'text-slate-700 hover:bg-slate-200/60'
                                    }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <folder.icon className={`w-4 h-4 ${isActive ? 'text-[#315bdb]' : 'text-slate-500'}`} />
                                    <span>{folder.label}</span>
                                  </div>
                                  {folder.badge && (
                                    <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${isActive ? 'bg-[#315bdb] text-white' : 'bg-slate-200 text-slate-700'
                                      }`}>
                                      {folder.badge}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Integrated Apps */}
                          <div className="space-y-1 pt-2 border-t border-slate-200">
                            <div className="px-2 pb-1 text-[10.5px] uppercase tracking-wider font-bold text-slate-400">
                              Workspace Apps
                            </div>

                            <button
                              onClick={() => {
                                setShowcaseTab('todo');
                                setWebmailSidebarOpen(false);
                              }}
                              className={`w-full px-3 py-2.5 rounded-lg text-[13px] font-medium flex items-center justify-between transition-colors cursor-pointer ${showcaseTab === 'todo'
                                ? 'bg-emerald-100 text-emerald-900 font-semibold'
                                : 'text-slate-700 hover:bg-slate-200/60'
                                }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <CheckSquare className={`w-4 h-4 ${showcaseTab === 'todo' ? 'text-emerald-700' : 'text-slate-500'}`} />
                                <span>To-Do &amp; Tasks</span>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-600 text-white">
                                {showcaseTasks.filter(t => !t.completed).length}
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                setShowcaseTab('calendar');
                                setWebmailSidebarOpen(false);
                              }}
                              className={`w-full px-3 py-2.5 rounded-lg text-[13px] font-medium flex items-center justify-between transition-colors cursor-pointer ${showcaseTab === 'calendar'
                                ? 'bg-slate-200 text-[#181c20] font-semibold'
                                : 'text-slate-700 hover:bg-slate-200/60'
                                }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Calendar className={`w-4 h-4 ${showcaseTab === 'calendar' ? 'text-[#315bdb]' : 'text-slate-500'}`} />
                                <span>Calendar</span>
                              </div>
                              <span className="text-[9.5px] bg-slate-200/80 text-slate-700 font-semibold px-2 py-0.5 rounded-full border border-slate-300">
                                Coming Soon
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                setShowcaseTab('contacts');
                                setWebmailSidebarOpen(false);
                              }}
                              className={`w-full px-3 py-2.5 rounded-lg text-[13px] font-medium flex items-center justify-between transition-colors cursor-pointer ${showcaseTab === 'contacts'
                                ? 'bg-slate-200 text-[#181c20] font-semibold'
                                : 'text-slate-700 hover:bg-slate-200/60'
                                }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Users className={`w-4 h-4 ${showcaseTab === 'contacts' ? 'text-[#315bdb]' : 'text-slate-500'}`} />
                                <span>Team Directory</span>
                              </div>
                              <span className="text-[9.5px] bg-slate-200/80 text-slate-700 font-semibold px-2 py-0.5 rounded-full border border-slate-300">
                                Coming Soon
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Storage Indicator */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1.5 mt-4">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                            <span>Encrypted Storage</span>
                            <span className="text-[#315bdb]">4.2 GB / 50 GB</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#315bdb] h-full w-[8%]" />
                          </div>
                        </div>
                      </div>

                      {/* Backdrop Click Dismiss */}
                      <div className="flex-1" onClick={() => setWebmailSidebarOpen(false)} />
                    </div>
                  )}

                  {/* ── Left Sidebar (Permanent Desktop/Tablet Navigation Rail) ── */}
                  <div className="hidden sm:flex sm:col-span-4 lg:col-span-3 border-r border-[#dfe3e8] bg-[#f8fafc] p-3 sm:p-4 flex-col justify-between">
                    <div className="space-y-4">
                      {/* Compose Button */}
                      <button
                        onClick={() => setShowcaseComposeOpen(true)}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#315bdb] hover:bg-[#274bb7] text-white text-[13.5px] font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>New Message</span>
                      </button>

                      {/* Mail Folders (Dynamic Counts & Clickable) */}
                      <div className="space-y-1">
                        <div className="px-2 pb-1 text-[10.5px] uppercase tracking-wider font-bold text-slate-400">
                          Mail Folders
                        </div>

                        {[
                          { id: 'inbox' as const, label: 'Inbox', icon: Inbox, badge: '3', defaultEmailId: 1 },
                          { id: 'starred' as const, label: 'Starred', icon: Star, badge: '2', defaultEmailId: 1 },
                          { id: 'sent' as const, label: 'Sent Mail', icon: Send, badge: '1', defaultEmailId: 4 },
                          { id: 'drafts' as const, label: 'Drafts', icon: FileText, badge: '1', defaultEmailId: 5 },
                          { id: 'trash' as const, label: 'Trash', icon: Trash2, badge: '1', defaultEmailId: 6 },
                        ].map((folder) => {
                          const isActive = showcaseTab === 'inbox' && showcaseEmailFolder === folder.id;
                          return (
                            <button
                              key={folder.id}
                              onClick={() => {
                                setShowcaseTab('inbox');
                                setShowcaseEmailFolder(folder.id);
                                setSelectedEmailId(folder.defaultEmailId);
                                setMobileReadingPane(false);
                              }}
                              className={`w-full px-3 py-2 rounded-lg text-[13px] font-medium flex items-center justify-between transition-colors cursor-pointer ${isActive
                                ? 'bg-[#cad6ff]/50 text-[#0340c2] font-semibold'
                                : 'text-slate-700 hover:bg-slate-200/60'
                                }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <folder.icon className={`w-4 h-4 ${isActive ? 'text-[#315bdb]' : 'text-slate-500'}`} />
                                <span>{folder.label}</span>
                              </div>
                              {folder.badge && (
                                <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${isActive ? 'bg-[#315bdb] text-white' : 'bg-slate-200 text-slate-700'
                                  }`}>
                                  {folder.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Integrated Apps */}
                      <div className="space-y-1 pt-2 border-t border-slate-200">
                        <div className="px-2 pb-1 text-[10.5px] uppercase tracking-wider font-bold text-slate-400">
                          Workspace Apps
                        </div>

                        <button
                          onClick={() => setShowcaseTab('todo')}
                          className={`w-full px-3 py-2 rounded-lg text-[13px] font-medium flex items-center justify-between transition-colors cursor-pointer ${showcaseTab === 'todo'
                            ? 'bg-emerald-100 text-emerald-900 font-semibold'
                            : 'text-slate-700 hover:bg-slate-200/60'
                            }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <CheckSquare className={`w-4 h-4 ${showcaseTab === 'todo' ? 'text-emerald-700' : 'text-slate-500'}`} />
                            <span>To-Do &amp; Tasks</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-600 text-white">
                            {showcaseTasks.filter(t => !t.completed).length}
                          </span>
                        </button>

                        {/* Calendar - Coming Soon */}
                        <button
                          onClick={() => setShowcaseTab('calendar')}
                          className={`w-full px-3 py-2 rounded-lg text-[13px] font-medium flex items-center justify-between transition-colors cursor-pointer ${showcaseTab === 'calendar'
                            ? 'bg-slate-200 text-[#181c20] font-semibold'
                            : 'text-slate-700 hover:bg-slate-200/60'
                            }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Calendar className={`w-4 h-4 ${showcaseTab === 'calendar' ? 'text-[#315bdb]' : 'text-slate-500'}`} />
                            <span>Calendar</span>
                          </div>
                          <span className="text-[9.5px] bg-slate-200/80 text-slate-700 font-semibold px-2 py-0.5 rounded-full border border-slate-300">
                            Coming Soon
                          </span>
                        </button>

                        {/* Team Directory - Coming Soon */}
                        <button
                          onClick={() => setShowcaseTab('contacts')}
                          className={`w-full px-3 py-2 rounded-lg text-[13px] font-medium flex items-center justify-between transition-colors cursor-pointer ${showcaseTab === 'contacts'
                            ? 'bg-slate-200 text-[#181c20] font-semibold'
                            : 'text-slate-700 hover:bg-slate-200/60'
                            }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Users className={`w-4 h-4 ${showcaseTab === 'contacts' ? 'text-[#315bdb]' : 'text-slate-500'}`} />
                            <span>Team Directory</span>
                          </div>
                          <span className="text-[9.5px] bg-slate-200/80 text-slate-700 font-semibold px-2 py-0.5 rounded-full border border-slate-300">
                            Coming Soon
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Storage Indicator */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1.5 mt-4">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                        <span>Encrypted Storage</span>
                        <span className="text-[#315bdb]">4.2 GB / 50 GB</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#315bdb] h-full w-[8%]" />
                      </div>
                    </div>
                  </div>

                  {/* ── Center & Right Main Workspace ── */}
                  <div className="col-span-12 sm:col-span-8 lg:col-span-9 flex flex-col bg-white">

                    {/* ── VIEW 1: EMAIL FOLDER VIEW & READING PANE ── */}
                    {showcaseTab === 'inbox' && (() => {
                      // Filter emails dynamically based on folder clicked
                      const displayedEmails = [
                        {
                          id: 1,
                          folder: 'inbox',
                          starred: true,
                          from: 'Sarah Jenkins',
                          email: 'sarah@yourcompany.com',
                          to: 'admin@yourcompany.com',
                          subject: 'Q3 Enterprise Infrastructure & Compliance Signoff',
                          snippet: 'Hi team, I reviewed our FlutterFlirt Mail cluster. 2048-bit DKIM keys & SPF records are fully validated...',
                          time: '10:42 AM',
                          security: { spf: '✓ SPF PASS', dkim: '✓ DKIM-2048 PASS', dmarc: '✓ DMARC PASS' },
                          attachment: { name: 'Security_Compliance_Audit_2026.pdf', size: '2.4 MB' },
                          body: (
                            <div className="space-y-3.5">
                              <p>Hi Team,</p>
                              <p>
                                I am pleased to report that our FlutterFlirt Mail sovereign cluster deployment has passed all internal compliance tests. Our deliverability score is at <strong className="text-slate-900">99.9%</strong>, and all outbound messages to Gmail and Microsoft 365 are landing directly in recipient primary inboxes.
                              </p>
                              <p>
                                The automatic 2048-bit DKIM signature and strict DMARC enforcement have completely eliminated unauthorized spoofing attempts against our brand domain.
                              </p>
                            </div>
                          ),
                        },
                        {
                          id: 2,
                          folder: 'inbox',
                          starred: false,
                          from: 'Cloudflare DNS Service',
                          email: 'notifications@cloudflare.com',
                          to: 'admin@yourcompany.com',
                          subject: 'DNS Records Successfully Propagated: MX, SPF & DKIM Active',
                          snippet: 'Your custom domain DNS configuration has finished global propagation across all edge clusters...',
                          time: 'Yesterday',
                          security: { spf: '✓ SPF PASS', dkim: '✓ DKIM-2048 PASS', dmarc: '✓ DMARC PASS' },
                          body: (
                            <div className="space-y-3.5">
                              <p>Hello Administrator,</p>
                              <p>Your custom domain DNS configuration has finished global propagation across all edge clusters:</p>
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[12px] space-y-1.5 text-slate-800">
                                <div>• <strong>MX Record:</strong> mail.flutterflirt.com (Priority 10) — ACTIVE</div>
                                <div>• <strong>SPF Record:</strong> v=spf1 include:_spf.flutterflirt.com ~all — VERIFIED</div>
                                <div>• <strong>DKIM Selector:</strong> ff2026._domainkey (2048-bit RSA) — VERIFIED</div>
                                <div>• <strong>DMARC Policy:</strong> v=DMARC1; p=reject; pct=100 — STRICT ACTIVE</div>
                              </div>
                              <p className="text-emerald-700 font-semibold">Your sovereign mailboxes are ready for live dispatch.</p>
                            </div>
                          ),
                        },
                        {
                          id: 3,
                          folder: 'inbox',
                          starred: true,
                          from: 'Stripe Billing System',
                          email: 'invoices@stripe.com',
                          to: 'admin@yourcompany.com',
                          subject: 'Payout Succeeded: $14,250.00 USD to Operating Account',
                          snippet: 'A scheduled payout of $14,250.00 USD has been initiated to your linked corporate bank account...',
                          time: 'Nov 17',
                          security: { spf: '✓ SPF PASS', dkim: '✓ DKIM-2048 PASS', dmarc: '✓ DMARC PASS' },
                          body: (
                            <div className="space-y-3.5">
                              <p>Hello Finance Team,</p>
                              <p>A scheduled payout of <strong className="text-slate-900">$14,250.00 USD</strong> has been completed to your corporate bank account (*4910).</p>
                              <p className="text-slate-500 text-xs font-mono">Reference ID: po_1OaB52Lkd82x982Lms</p>
                            </div>
                          ),
                        },
                        {
                          id: 4,
                          folder: 'sent',
                          starred: false,
                          from: 'You (admin@yourcompany.com)',
                          email: 'admin@yourcompany.com',
                          to: 'partners@venturecapital.io',
                          subject: 'Enterprise Domain Migration & Compliance Signoff Notice',
                          snippet: 'Hi Partners, We have finalized our transition to FlutterFlirt Mail dedicated sovereign infrastructure...',
                          time: 'Nov 16',
                          security: { spf: '✓ OUTBOUND SIGNED', dkim: '✓ 2048-BIT RSA SEAL', dmarc: '✓ ENFORCED' },
                          attachment: { name: 'Signed_Migration_Notice.pdf', size: '1.1 MB' },
                          body: (
                            <div className="space-y-3.5">
                              <p>Hi Partners,</p>
                              <p>
                                We have officially finalized our corporate email transition to FlutterFlirt Mail's dedicated sovereign infrastructure.
                              </p>
                              <p>
                                All outbound communications from our team are now cryptographically signed with 2048-bit RSA keys and protected by strict DMARC rejection policies. Please whitelist our primary domain for unhindered direct dispatch.
                              </p>
                              <p className="text-slate-600 font-medium">Warm regards,<br />Leadership Team</p>
                            </div>
                          ),
                        },
                        {
                          id: 5,
                          folder: 'drafts',
                          starred: false,
                          from: 'Draft (You)',
                          email: 'admin@yourcompany.com',
                          to: 'all-team@yourcompany.com',
                          subject: '[Draft] Company Guidelines on Sovereign Mail & Zero Ad Surveillance',
                          snippet: 'Team, please review our new internal guidelines on corporate communications privacy and zero third-party AI training...',
                          time: 'Draft Saved',
                          body: (
                            <div className="space-y-3.5">
                              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-mono">
                                📝 DRAFT NOT YET DISPATCHED • Click &quot;Resume in Compose&quot; to edit and send.
                              </div>
                              <p>Team,</p>
                              <p>
                                Please review the attached briefing regarding our new internal email protocols. Unlike generic big-tech providers, our mailbox data is hosted on sovereign hardware with zero algorithmic scanning and zero ad tracking.
                              </p>
                            </div>
                          ),
                        },
                        {
                          id: 6,
                          folder: 'trash',
                          starred: false,
                          from: 'Outdated Vendor Newsletter',
                          email: 'promo@legacywebmail.com',
                          to: 'admin@yourcompany.com',
                          subject: '[Expired] Legacy Webmail Subscription Renewal Notice',
                          snippet: 'Your legacy webmail service renewal notice. This item was discarded during domain migration...',
                          time: 'Nov 10',
                          body: (
                            <div className="space-y-3.5">
                              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-mono">
                                🗑️ This message is in Trash and will be permanently purged in 18 days.
                              </div>
                              <p className="text-slate-500">Notice from obsolete legacy webmail provider prior to migration.</p>
                            </div>
                          ),
                        },
                      ].filter((item) => {
                        if (showcaseEmailFolder === 'starred') return item.starred;
                        return item.folder === showcaseEmailFolder;
                      });

                      // Current active email to read
                      const activeEmail =
                        displayedEmails.find((e) => e.id === selectedEmailId) ||
                        displayedEmails[0];

                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-12 h-full min-h-[580px]">
                          {/* Email List Column */}
                          <div className={`lg:col-span-5 border-r border-[#dfe3e8] flex flex-col h-full bg-slate-50/40 ${mobileReadingPane ? 'hidden lg:flex' : 'flex'}`}>
                            {/* List Top Bar */}
                            <div className="p-3.5 border-b border-[#dfe3e8] flex items-center justify-between bg-white text-[12.5px] font-semibold text-slate-700">
                              <span className="capitalize font-bold text-[#181c20]">
                                {showcaseEmailFolder === 'sent'
                                  ? 'Sent Mail'
                                  : showcaseEmailFolder}{' '}
                                ({displayedEmails.length} {displayedEmails.length === 1 ? 'item' : 'items'})
                              </span>
                              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                TLS 1.3 Active
                              </span>
                            </div>

                            {/* Mobile Quick Folder Filter Bar */}
                            <div className="sm:hidden px-3 py-2 border-b border-slate-200 bg-white flex items-center gap-1.5 overflow-x-auto text-xs">
                              {[
                                { id: 'inbox' as const, label: 'Inbox', badge: '3' },
                                { id: 'starred' as const, label: 'Starred', badge: '2' },
                                { id: 'sent' as const, label: 'Sent', badge: '1' },
                                { id: 'drafts' as const, label: 'Drafts', badge: '1' },
                                { id: 'trash' as const, label: 'Trash', badge: '1' },
                              ].map((f) => {
                                const isAct = showcaseEmailFolder === f.id;
                                return (
                                  <button
                                    key={f.id}
                                    onClick={() => {
                                      setShowcaseTab('inbox');
                                      setShowcaseEmailFolder(f.id);
                                      setMobileReadingPane(false);
                                    }}
                                    className={`px-2.5 py-1 rounded-full whitespace-nowrap text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${isAct
                                      ? 'bg-[#315bdb] text-white font-bold shadow-2xs'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                      }`}
                                  >
                                    <span>{f.label}</span>
                                    <span className="opacity-80 text-[10px]">({f.badge})</span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Dynamic Email Items List */}
                            <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
                              {displayedEmails.map((item) => (
                                <div
                                  key={item.id}
                                  onClick={() => {
                                    setSelectedEmailId(item.id);
                                    setMobileReadingPane(true);
                                  }}
                                  className={`p-3.5 cursor-pointer transition-all duration-150 ${activeEmail?.id === item.id
                                    ? 'bg-[#cad6ff]/40 border-l-4 border-l-[#315bdb] shadow-xs'
                                    : 'hover:bg-slate-100/70 hover:translate-x-0.5'
                                    }`}
                                >
                                  <div className="flex items-center justify-between text-[12.5px] mb-1">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      {item.starred && (
                                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                                      )}
                                      <span
                                        className={`font-semibold truncate ${activeEmail?.id === item.id
                                          ? 'text-[#0340c2]'
                                          : 'text-slate-900'
                                          }`}
                                      >
                                        {item.from}
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">
                                      {item.time}
                                    </span>
                                  </div>
                                  <div className="text-[13px] font-medium text-slate-800 truncate mb-1">
                                    {item.subject}
                                  </div>
                                  <div className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed">
                                    {item.snippet}
                                  </div>
                                </div>
                              ))}

                              {displayedEmails.length === 0 && (
                                <div className="p-8 text-center text-slate-400 text-sm">
                                  No messages in {showcaseEmailFolder}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Reading Pane Column */}
                          <div className={`lg:col-span-7 p-4 sm:p-6 flex flex-col justify-between bg-white h-full ${mobileReadingPane ? 'flex' : 'hidden lg:flex'}`}>
                            {/* Mobile Back Button */}
                            <div className="lg:hidden pb-3 mb-3 border-b border-slate-200 flex items-center justify-between">
                              <button
                                onClick={() => setMobileReadingPane(false)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#181c20] font-semibold text-[12.5px] transition-colors cursor-pointer"
                              >
                                <ArrowLeft className="w-3.5 h-3.5 text-[#315bdb]" />
                                <span>Back to Messages</span>
                              </button>
                              <span className="text-[11px] font-mono text-slate-400">{activeEmail?.time}</span>
                            </div>

                            {activeEmail ? (
                              <div className="space-y-5 animate-in fade-in duration-200">
                                {/* Email Headers */}
                                <div className="pb-4 border-b border-slate-200 space-y-3">
                                  <div className="flex items-start justify-between gap-4">
                                    <h3 className="text-[17px] font-bold text-[#181c20] leading-snug">
                                      {activeEmail.subject}
                                    </h3>
                                    {activeEmail.security && (
                                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10.5px] font-mono font-bold border border-emerald-200">
                                          {activeEmail.security.spf}
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-blue-100 text-[#003ab3] text-[10.5px] font-mono font-bold border border-blue-200">
                                          {activeEmail.security.dkim}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between text-[13px]">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-[#315bdb] text-white flex items-center justify-center font-bold text-[12px]">
                                        {activeEmail.from.slice(0, 2).toUpperCase()}
                                      </div>
                                      <div>
                                        <div className="font-semibold text-slate-900">
                                          {activeEmail.from}{' '}
                                          <span className="font-normal text-slate-500 text-xs">
                                            &lt;{activeEmail.email}&gt;
                                          </span>
                                        </div>
                                        <div className="text-slate-500 text-[11.5px]">
                                          To: {activeEmail.to}
                                        </div>
                                      </div>
                                    </div>
                                    <span className="text-slate-400 text-[11.5px] font-mono">
                                      {activeEmail.time}
                                    </span>
                                  </div>
                                </div>

                                {/* Email Body */}
                                <div className="text-[14px] text-slate-700 leading-relaxed">
                                  {activeEmail.body}

                                  {/* Optional Attachment Pill */}
                                  {activeEmail.attachment && (
                                    <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#315bdb] flex items-center justify-center font-bold text-xs">
                                          PDF
                                        </div>
                                        <div>
                                          <div className="text-[13px] font-semibold text-slate-900">
                                            {activeEmail.attachment.name}
                                          </div>
                                          <div className="text-[11.5px] text-slate-500">
                                            {activeEmail.attachment.size} • Cryptographically Signed
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() =>
                                          triggerShowcaseToast(
                                            `✓ Downloaded ${activeEmail.attachment?.name}`
                                          )
                                        }
                                        className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#315bdb] hover:bg-blue-50 border border-blue-200 transition-colors cursor-pointer"
                                      >
                                        Download
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Action Buttons Depending on Folder */}
                                <div className="pt-4 flex items-center gap-3 border-t border-slate-100">
                                  {showcaseEmailFolder === 'drafts' ? (
                                    <button
                                      onClick={() => {
                                        setShowcaseComposeOpen(true);
                                        setShowcaseComposeTo(activeEmail.to);
                                        setShowcaseComposeSubject(activeEmail.subject.replace('[Draft] ', ''));
                                      }}
                                      className="px-4 py-2 rounded-lg bg-[#315bdb] hover:bg-[#274bb7] text-white text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Resume in Compose</span>
                                    </button>
                                  ) : showcaseEmailFolder === 'trash' ? (
                                    <>
                                      <button
                                        onClick={() => {
                                          triggerShowcaseToast('✓ Message restored to Inbox.');
                                          setShowcaseEmailFolder('inbox');
                                          setSelectedEmailId(1);
                                        }}
                                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                      >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Restore to Inbox</span>
                                      </button>
                                      <button
                                        onClick={() => triggerShowcaseToast('✓ Message deleted permanently.')}
                                        className="px-4 py-2 rounded-lg border border-rose-200 text-rose-700 text-[13px] font-semibold hover:bg-rose-50 transition-colors cursor-pointer"
                                      >
                                        Delete Permanently
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => {
                                          setShowcaseComposeOpen(true);
                                          setShowcaseComposeTo(activeEmail.email);
                                          setShowcaseComposeSubject(`Re: ${activeEmail.subject}`);
                                        }}
                                        className="px-4 py-2 rounded-lg bg-[#315bdb] hover:bg-[#274bb7] text-white text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                      >
                                        <Send className="w-3.5 h-3.5" />
                                        <span>Reply</span>
                                      </button>
                                      <button
                                        onClick={() => triggerShowcaseToast('✓ Email forwarded.')}
                                        className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-[13px] font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                                      >
                                        Forward
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="p-8 text-center text-slate-400">
                                Select a message from the list to read.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* ── VIEW 2: INTERACTIVE TO-DO & TASKS ── */}
                    {showcaseTab === 'todo' && (
                      <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 animate-in fade-in duration-200">
                        {/* Mobile Back Button */}
                        <div className="sm:hidden pb-3 border-b border-slate-100 flex items-center justify-between">
                          <button
                            onClick={() => setShowcaseTab('inbox')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#181c20] font-semibold text-[12px] transition-colors cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5 text-[#315bdb]" />
                            <span>Back to Inbox</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                          <div>
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 uppercase tracking-wider font-mono">
                              <CheckSquare className="w-3.5 h-3.5" /> Functional Task Manager
                            </div>
                            <h3 className="text-[18px] sm:text-[20px] font-bold text-[#181c20] mt-0.5">
                              Workspace To-Do &amp; Action Items
                            </h3>
                          </div>
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-mono text-[11px] sm:text-[12px] font-bold shrink-0">
                            {showcaseTasks.filter(t => !t.completed).length} Pending
                          </span>
                        </div>

                        {/* Add New Task Form */}
                        <form onSubmit={handleAddShowcaseTask} className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={newTaskInput}
                            onChange={(e) => setNewTaskInput(e.target.value)}
                            placeholder="Type a new task (e.g. Set up sales@ alias, invite team member)..."
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-[13.5px] sm:text-[14px] text-slate-800 focus:outline-none focus:border-[#315bdb] focus:ring-2 focus:ring-[#315bdb]/15"
                          />
                          <button
                            type="submit"
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#315bdb] hover:bg-[#274bb7] text-white text-[13.5px] font-semibold transition-all active:scale-[0.98] cursor-pointer"
                          >
                            Add Task
                          </button>
                        </form>

                        {/* Tasks Checklist */}
                        <div className="space-y-2.5">
                          {showcaseTasks.map((task) => (
                            <div
                              key={task.id}
                              onClick={() => handleToggleTask(task.id)}
                              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${task.completed
                                ? 'bg-slate-50 border-slate-200 opacity-60'
                                : 'bg-white border-slate-200/90 hover:border-[#315bdb] hover:shadow-xs hover:translate-x-0.5'
                                }`}
                            >
                              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                <div
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${task.completed
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-slate-300 bg-white hover:border-[#315bdb]'
                                    }`}
                                >
                                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                                <span className={`text-[14px] font-medium truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                                  }`}>
                                  {task.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold ${task.priority === 'high'
                                  ? 'bg-rose-100 text-rose-800'
                                  : task.priority === 'medium'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                  }`}>
                                  {task.priority.toUpperCase()}
                                </span>
                                <span className="text-[11.5px] font-mono text-slate-500 hidden sm:inline">
                                  {task.dueDate}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── VIEW 3: CALENDAR (COMING SOON) ── */}
                    {showcaseTab === 'calendar' && (
                      <div className="p-5 sm:p-12 flex flex-col items-center justify-center text-center space-y-5 min-h-[500px]">
                        {/* Mobile Back Button */}
                        <div className="sm:hidden w-full pb-3 border-b border-slate-100 flex items-center justify-start">
                          <button
                            onClick={() => setShowcaseTab('inbox')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#181c20] font-semibold text-[12px] transition-colors cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5 text-[#315bdb]" />
                            <span>Back to Inbox</span>
                          </button>
                        </div>

                        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-[#315bdb] flex items-center justify-center shadow-xs">
                          <Calendar className="w-7 h-7" />
                        </div>

                        <div className="max-w-md space-y-1.5">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10.5px] font-mono font-semibold border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>COMING SOON</span>
                          </div>
                          <h3 className="text-xl font-bold text-[#181c20]">
                            Integrated Team Calendar
                          </h3>
                          <p className="text-[13.5px] text-slate-500 leading-relaxed">
                            Smart meeting scheduling with Google &amp; Outlook 2-way sync, time-zone booking links, and CalDAV standard protocol integration.
                          </p>
                        </div>

                        {/* Feature Preview Checklist */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left max-w-md w-full bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-2 text-[12px] text-slate-700">
                            <Check className="w-3.5 h-3.5 text-[#315bdb] shrink-0" strokeWidth={3} />
                            <span>Multi-Calendar Team Overlay</span>
                          </div>
                          <div className="flex items-center gap-2 text-[12px] text-slate-700">
                            <Check className="w-3.5 h-3.5 text-[#315bdb] shrink-0" strokeWidth={3} />
                            <span>Google &amp; Outlook 2-Way Sync</span>
                          </div>
                          <div className="flex items-center gap-2 text-[12px] text-slate-700">
                            <Check className="w-3.5 h-3.5 text-[#315bdb] shrink-0" strokeWidth={3} />
                            <span>1-Click Video Meeting Links</span>
                          </div>
                          <div className="flex items-center gap-2 text-[12px] text-slate-700">
                            <Check className="w-3.5 h-3.5 text-[#315bdb] shrink-0" strokeWidth={3} />
                            <span>CalDAV Standard Protocol</span>
                          </div>
                        </div>

                        <button
                          onClick={() => triggerShowcaseToast('✓ Added to Calendar Early Access list! We will notify you on launch.')}
                          className="px-5 py-2.5 rounded-xl bg-[#315bdb] hover:bg-[#274bb7] text-white text-[13px] font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                        >
                          Notify Me on Release
                        </button>
                      </div>
                    )}

                    {/* ── VIEW 4: TEAM DIRECTORY (COMING SOON) ── */}
                    {showcaseTab === 'contacts' && (
                      <div className="p-5 sm:p-12 flex flex-col items-center justify-center text-center space-y-5 min-h-[500px]">
                        {/* Mobile Back Button */}
                        <div className="sm:hidden w-full pb-3 border-b border-slate-100 flex items-center justify-start">
                          <button
                            onClick={() => setShowcaseTab('inbox')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#181c20] font-semibold text-[12px] transition-colors cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5 text-[#315bdb]" />
                            <span>Back to Inbox</span>
                          </button>
                        </div>

                        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-[#315bdb] flex items-center justify-center shadow-xs">
                          <Users className="w-7 h-7" />
                        </div>

                        <div className="max-w-md space-y-1.5">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10.5px] font-mono font-semibold border border-slate-200">
                            <Users className="w-3 h-3 text-slate-500" />
                            <span>COMING SOON</span>
                          </div>
                          <h3 className="text-xl font-bold text-[#181c20]">
                            Centralized Team Directory
                          </h3>
                          <p className="text-[13.5px] text-slate-500 leading-relaxed">
                            Global Address List (GAL) auto-discovery, LDAP/CardDAV synchronization, and shared departmental distribution groups.
                          </p>
                        </div>

                        {/* Feature Preview Checklist */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left max-w-md w-full bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-2 text-[12px] text-slate-700">
                            <Check className="w-3.5 h-3.5 text-[#315bdb] shrink-0" strokeWidth={3} />
                            <span>Global Address List (GAL)</span>
                          </div>
                          <div className="flex items-center gap-2 text-[12px] text-slate-700">
                            <Check className="w-3.5 h-3.5 text-[#315bdb] shrink-0" strokeWidth={3} />
                            <span>LDAP &amp; CardDAV Sync</span>
                          </div>
                          <div className="flex items-center gap-2 text-[12px] text-slate-700">
                            <Check className="w-3.5 h-3.5 text-[#315bdb] shrink-0" strokeWidth={3} />
                            <span>Shared Team Aliases &amp; Routing</span>
                          </div>
                          <div className="flex items-center gap-2 text-[12px] text-slate-700">
                            <Check className="w-3.5 h-3.5 text-[#315bdb] shrink-0" strokeWidth={3} />
                            <span>Instant Org Chart Mapping</span>
                          </div>
                        </div>

                        <button
                          onClick={() => triggerShowcaseToast('✓ Added to Team Directory Early Access list! We will notify you on launch.')}
                          className="px-5 py-2.5 rounded-xl bg-[#315bdb] hover:bg-[#274bb7] text-white text-[13px] font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                        >
                          Notify Me on Release
                        </button>
                      </div>
                    )}

                  </div>
                </div>

                {/* ── LIVE INFRASTRUCTURE TELEMETRY STATUS BAR ── */}
                <div className="h-9 bg-[#0c1a39] px-4 sm:px-6 flex items-center justify-between text-[11px] font-mono text-slate-300 border-t border-slate-800">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      TLS 1.3 Strict
                    </span>
                    <span className="hidden sm:inline text-slate-500">•</span>
                    <span className="hidden sm:inline text-blue-300">2048-Bit RSA DKIM Active</span>
                    <span className="hidden md:inline text-slate-500">•</span>
                    <span className="hidden md:inline text-emerald-400">99.9% Deliverability SLA</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Lock className="w-3 h-3 text-[#315bdb]" />
                    <span>Zero Ad Surveillance</span>
                  </div>
                </div>
              </div>

              {/* ── FLOATING RICH COMPOSE MODAL OVERLAY ── */}
              {showcaseComposeOpen && (
                <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-6 w-auto sm:w-[480px] bg-white rounded-2xl shadow-2xl border-2 border-[#315bdb] overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-6 duration-200">
                  {/* Compose Header */}
                  <div className="h-10 bg-[#315bdb] px-4 flex items-center justify-between text-white select-none">
                    <span className="text-[13px] font-bold flex items-center gap-2">
                      <Mail className="w-4 h-4" /> New Message
                    </span>
                    <button
                      onClick={() => setShowcaseComposeOpen(false)}
                      className="p-1 hover:bg-white/20 rounded-md transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Compose Form */}
                  <div className="p-4 space-y-2.5 text-[13.5px]">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                      <span className="text-slate-400 font-medium w-12">To:</span>
                      <input
                        type="text"
                        value={showcaseComposeTo}
                        onChange={(e) => setShowcaseComposeTo(e.target.value)}
                        className="flex-1 font-mono text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                      <span className="text-slate-400 font-medium w-12">Subject:</span>
                      <input
                        type="text"
                        value={showcaseComposeSubject}
                        onChange={(e) => setShowcaseComposeSubject(e.target.value)}
                        className="flex-1 font-semibold text-slate-900 focus:outline-none"
                      />
                    </div>
                    <textarea
                      rows={5}
                      value={showcaseComposeBody}
                      onChange={(e) => setShowcaseComposeBody(e.target.value)}
                      className="w-full text-slate-700 focus:outline-none resize-none pt-1"
                    />

                    {/* Compose Footer Toolbar */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Bold className="w-4 h-4 hover:text-[#315bdb] cursor-pointer" />
                        <Italic className="w-4 h-4 hover:text-[#315bdb] cursor-pointer" />
                        <LinkIcon className="w-4 h-4 hover:text-[#315bdb] cursor-pointer" />
                        <Paperclip className="w-4 h-4 hover:text-[#315bdb] cursor-pointer" />
                      </div>

                      <button
                        onClick={() => {
                          setShowcaseComposeOpen(false);
                          triggerShowcaseToast(`✓ Email sent successfully to ${showcaseComposeTo} with 2048-bit DKIM signature!`);
                        }}
                        className="px-5 py-2 rounded-xl bg-[#315bdb] hover:bg-[#274bb7] text-white font-semibold text-[13px] flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                      >
                        <span>Send Message</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Toast Feedback Notice */}
              {showcaseToast && (
                <div className="absolute top-14 right-6 bg-[#0c1a39] text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-[13px] font-semibold flex items-center gap-2 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{showcaseToast}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            3. TRUST & VALUE PROPOSITION (4 Feature Highlight Cards)
        ═══════════════════════════════════════════════════════════ */}
        <section className="w-full py-12 sm:py-20 px-4 sm:px-6 lg:px-12 bg-[#f1f4f9]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#181c20] mb-2 sm:mb-3">
                Everything Your Business Needs for Professional Email
              </h2>
              <p className="text-[14.5px] sm:text-[16px] text-[#434654] leading-relaxed">
                Built from the ground up for modern businesses needing reliable, scalable, and independent email delivery.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  icon: AtSign,
                  title: 'Custom Domain Email',
                  desc: 'Establish your brand with unlimited aliases and clean domain-mapped addresses like you@yourcompany.com.',
                  action: 'Instant Domain Mapping',
                },
                {
                  icon: Sliders,
                  title: 'Centralized Administration',
                  desc: 'Provision mailboxes, reset credentials, set storage quotas, and audit logs from a single control panel.',
                  action: 'Role-Based Governance',
                },
                {
                  icon: ShieldCheck,
                  title: 'Advanced Authentication',
                  desc: 'Pre-configured SPF, DKIM, and DMARC enforcement guaranteeing high inbox deliverability.',
                  action: 'Automated DNS Records',
                },
                {
                  icon: Server,
                  title: 'Self-Hosted Infrastructure',
                  desc: 'Operate on dedicated, sovereign email server nodes designed for data ownership and zero third-party snooping.',
                  action: 'Sovereign Data Storage',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="relative p-5 sm:p-7 rounded-2xl bg-white border border-slate-200/80 hover:border-[#315bdb] shadow-xs hover:shadow-[0_16px_40px_-8px_rgba(49,91,219,0.18)] transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-1 overflow-hidden"
                >
                  {/* Glowing top gradient bar on hover */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-gradient-to-r group-hover:from-[#0340c2] group-hover:via-[#315bdb] group-hover:to-[#60a5fa] transition-all duration-300" />

                  <div className="space-y-2.5 sm:space-y-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#cad6ff]/50 flex items-center justify-center text-[#315bdb] group-hover:bg-[#315bdb] group-hover:text-white transition-all duration-300 shadow-xs">
                      <card.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="text-[16.5px] sm:text-[18px] text-[#181c20] font-bold group-hover:text-[#315bdb] transition-colors">{card.title}</h3>
                    <p className="text-[13.5px] sm:text-[14px] text-[#434654] leading-relaxed">{card.desc}</p>
                  </div>
                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 flex items-center text-[#315bdb] text-[13px] font-semibold border-t border-slate-100 group-hover:border-[#cad6ff]">
                    <span>{card.action}</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            4. PROBLEM & SOLUTION SECTION
        ═══════════════════════════════════════════════════════════ */}
        <section className="w-full py-12 sm:py-20 px-4 sm:px-6 lg:px-12 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#181c20] mb-2 sm:mb-3">
                Your Business Deserves More Than a Generic Email Address.
              </h2>
              <p className="text-[14.5px] sm:text-[16px] text-[#434654] leading-relaxed">
                Free and generic webmail damages your credibility and fragments administrative governance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
              {/* Problem 1 */}
              <div className="flex flex-col rounded-xl overflow-hidden shadow-xs bg-white border border-[#dfe3e8]/70">
                <div className="p-4 sm:p-6 bg-[#ffdad6]/40 space-y-2">
                  <div className="flex items-center gap-2 text-[#93000a] text-[16.5px] sm:text-[18px] font-bold">
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#ba1a1a]" />
                    <span>The Generic Trap</span>
                  </div>
                  <p className="text-[13px] sm:text-[14px] text-[#93000a] leading-relaxed">
                    Sending proposals from <em>@gmail.com</em> or <em>@yahoo.com</em> causes 68% of enterprise clients to hesitate and flags spam filters.
                  </p>
                </div>
                <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4 bg-white">
                  <div>
                    <div className="flex items-center gap-2 text-[#315bdb] text-[16.5px] sm:text-[18px] font-bold mb-1.5 sm:mb-2">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Professional Identity</span>
                    </div>
                    <p className="text-[13px] sm:text-[14px] text-[#434654] leading-relaxed">
                      Give every team member an authenticated address with your custom domain name for instant enterprise authority.
                    </p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-[#ebeef3] rounded-lg font-mono text-[11px] text-[#181c20]">
                    alexander@acmecorp.com <span className="text-emerald-700 ml-1 font-bold">✓ 100% Rep</span>
                  </div>
                </div>
              </div>

              {/* Problem 2 */}
              <div className="flex flex-col rounded-xl overflow-hidden shadow-xs bg-white border border-[#dfe3e8]/70">
                <div className="p-4 sm:p-6 bg-[#ffdad6]/40 space-y-2">
                  <div className="flex items-center gap-2 text-[#93000a] text-[16.5px] sm:text-[18px] font-bold">
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#ba1a1a]" />
                    <span>Rogue Data Silos</span>
                  </div>
                  <p className="text-[13px] sm:text-[14px] text-[#93000a] leading-relaxed">
                    Decentralized inboxes mean departing staff retain business contacts, customer threads, and critical communications.
                  </p>
                </div>
                <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4 bg-white">
                  <div>
                    <div className="flex items-center gap-2 text-[#315bdb] text-[16.5px] sm:text-[18px] font-bold mb-1.5 sm:mb-2">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Centralized Governance</span>
                    </div>
                    <p className="text-[13px] sm:text-[14px] text-[#434654] leading-relaxed">
                      Full admin sovereignty: instantly reassign mailboxes, enforce multi-factor policies, and archive audit logs from one dashboard.
                    </p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-[#ebeef3] rounded-lg font-mono text-[11px] text-[#181c20]">
                    1-Click Mailbox Reassignment
                  </div>
                </div>
              </div>

              {/* Problem 3 */}
              <div className="flex flex-col rounded-xl overflow-hidden shadow-xs bg-white border border-[#dfe3e8]/70">
                <div className="p-4 sm:p-6 bg-[#ffdad6]/40 space-y-2">
                  <div className="flex items-center gap-2 text-[#93000a] text-[16.5px] sm:text-[18px] font-bold">
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#ba1a1a]" />
                    <span>Big-Tech Lock-in</span>
                  </div>
                  <p className="text-[13px] sm:text-[14px] text-[#93000a] leading-relaxed">
                    Big-tech email providers train internal AI on your correspondence and alter storage terms and prices at will.
                  </p>
                </div>
                <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4 bg-white">
                  <div>
                    <div className="flex items-center gap-2 text-[#315bdb] text-[16.5px] sm:text-[18px] font-bold mb-1.5 sm:mb-2">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Complete Data Control</span>
                    </div>
                    <p className="text-[13px] sm:text-[14px] text-[#434654] leading-relaxed">
                      Operate on FlutterFlirt's dedicated, privacy-focused self-hosted email infrastructure with strict tenant isolation.
                    </p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-[#ebeef3] rounded-lg font-mono text-[11px] text-[#181c20]">
                    Zero Profiling • Zero AI Training
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            4. PRODUCT FEATURES SECTION (Bento Grid)
        ═══════════════════════════════════════════════════════════ */}
        <section id="features" className="w-full py-20 px-6 lg:px-12 bg-[#f1f4f9]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-[#181c20] mb-3">
                Powerful Email. Simple Management.
              </h2>
              <p className="text-[16px] text-[#434654]">
                Engineered for speed, deliverability, and straightforward administrative control.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Bento 1: Featured 2x1 */}
              <div className="md:col-span-2 lg:col-span-2 p-8 rounded-xl bg-white shadow-xs flex flex-col justify-between group">
                <div>
                  <Mail className="w-8 h-8 text-[#315bdb] mb-4" />
                  <h3 className="text-[20px] text-[#181c20] font-semibold mb-2">Professional Webmail</h3>
                  <p className="text-[14px] text-[#434654] leading-relaxed mb-6">
                    Lightning-fast inbox with keyboard-first navigation, rich text formatting, nested folder hierarchies, conversation threading, drag-and-drop attachments, and unified search.
                  </p>
                </div>
                <div className="p-4 bg-[#f1f4f9] rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#434654]">
                    <span>Shortcuts: [c] Compose • [/] Search • [e] Archive</span>
                    <span className="text-[#315bdb] font-bold">Fast v2.4</span>
                  </div>
                  <div className="h-2 w-3/4 bg-[#b6c4ff] rounded-full" />
                </div>
              </div>

              {/* Bento 2: Featured 2x1 */}
              <div className="md:col-span-1 lg:col-span-2 p-8 rounded-xl bg-white shadow-xs flex flex-col justify-between group">
                <div>
                  <Sliders className="w-8 h-8 text-[#315bdb] mb-4" />
                  <h3 className="text-[20px] text-[#181c20] font-semibold mb-2">Centralized Admin Console</h3>
                  <p className="text-[14px] text-[#434654] leading-relaxed mb-6">
                    Manage client organizations, multiple active domains, mailboxes, routing rules, and quota allocations effortlessly from one centralized web portal.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[#434654] bg-[#f1f4f9] p-3 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>All 4 Organization Nodes Synced in Real Time</span>
                </div>
              </div>

              {/* Bento 3: Authentication */}
              <div className="p-6 rounded-xl bg-white shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <ShieldCheck className="w-6 h-6 text-[#315bdb]" />
                  <h4 className="text-[16px] text-[#181c20] font-semibold">Email Authentication</h4>
                  <p className="text-[12.5px] text-[#434654] leading-relaxed">
                    Guided SPF, DKIM (2048-bit RSA keys), and strict DMARC policy validation with instant DNS record checks.
                  </p>
                </div>
                <span className="mt-4 font-mono text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded w-max">
                  2048-bit RSA
                </span>
              </div>

              {/* Bento 4: Spam Protection */}
              <div className="p-6 rounded-xl bg-white shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <Shield className="w-6 h-6 text-[#315bdb]" />
                  <h4 className="text-[16px] text-[#181c20] font-semibold">Spam Protection</h4>
                  <p className="text-[12.5px] text-[#434654] leading-relaxed">
                    Intelligent, low-latency spam & malware filtering powered by enterprise Rspamd algorithms with Bayesian scoring.
                  </p>
                </div>
                <span className="mt-4 font-mono text-[11px] text-[#315bdb] bg-[#dce1ff] px-2 py-0.5 rounded w-max">
                  Rspamd ML Engine
                </span>
              </div>

              {/* Bento 5: Multi-Tenant */}
              <div className="p-6 rounded-xl bg-white shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <Building2 className="w-6 h-6 text-[#315bdb]" />
                  <h4 className="text-[16px] text-[#181c20] font-semibold">Multi-Tenant Scoping</h4>
                  <p className="text-[12.5px] text-[#434654] leading-relaxed">
                    Perfect for digital agencies and parent companies—scope administrative permissions across unlimited client domains.
                  </p>
                </div>
                <span className="mt-4 font-mono text-[11px] text-[#515e80] bg-[#cad6ff] px-2 py-0.5 rounded w-max">
                  Unlimited Tenancy
                </span>
              </div>

              {/* Bento 6: Domain Management */}
              <div className="p-6 rounded-xl bg-white shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <Globe className="w-6 h-6 text-[#315bdb]" />
                  <h4 className="text-[16px] text-[#181c20] font-semibold">Domain Management</h4>
                  <p className="text-[12.5px] text-[#434654] leading-relaxed">
                    Step-by-step DNS record generator with one-click TXT, MX, and CNAME record verification against your registrar.
                  </p>
                </div>
                <span className="mt-4 font-mono text-[11px] text-[#9b0052] bg-[#ffd9e2] px-2 py-0.5 rounded w-max">
                  1-Click Check
                </span>
              </div>

              {/* Bento 7: Protocols */}
              <div className="md:col-span-1 lg:col-span-2 p-6 rounded-xl bg-white shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <RefreshCw className="w-6 h-6 text-[#315bdb]" />
                  <h4 className="text-[16px] text-[#181c20] font-semibold">Standard Email Protocols (IMAP / SMTP)</h4>
                  <p className="text-[14px] text-[#434654] leading-relaxed">
                    Native support for standard IMAP and secure SMTP connections for Apple Mail, Outlook, Thunderbird, and any iOS or Android client.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2 font-mono text-[11px] text-[#434654]">
                  <span>IMAP: 993 (SSL)</span> • <span>SMTP: 587 (STARTTLS)</span>
                </div>
              </div>

              {/* Bento 8: Monitoring */}
              <div className="md:col-span-1 lg:col-span-2 p-6 rounded-xl bg-white shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <TrendingUp className="w-6 h-6 text-[#315bdb]" />
                  <h4 className="text-[16px] text-[#181c20] font-semibold">Real-Time Email Monitoring</h4>
                  <p className="text-[14px] text-[#434654] leading-relaxed">
                    Real-time domain authentication status reports, bounce-rate telemetries, and sending reputation insights with actionable DNS diagnostics.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-emerald-800 bg-emerald-50 p-2.5 rounded-lg">
                  <span>Reputation Score: 99.8% Perfect</span>
                  <span>Bounce Rate: 0.02%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            6. HOW IT WORKS (4-Step Horizontal Flow)
        ═══════════════════════════════════════════════════════════ */}
        <section className="w-full py-20 px-6 lg:px-12 bg-[#f1f4f9]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-[#181c20] mb-3">
                Get Your Business Email Up and Running.
              </h2>
              <p className="text-[16px] text-[#434654]">
                Deploy professional email for your company in less than 10 minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: '01',
                  title: 'Connect Your Domain',
                  desc: 'Enter your existing domain or subdomain in the FlutterFlirt Mail admin console. No domain transfer required.',
                },
                {
                  step: '02',
                  title: 'Configure Your Email',
                  desc: 'Copy our pre-generated MX, SPF, and DKIM DNS records to Cloudflare, GoDaddy, Namecheap, or your registrar.',
                },
                {
                  step: '03',
                  title: 'Create Business Mailboxes',
                  desc: 'Add employee inboxes, assign storage quotas, configure aliases, and set up team forwarding groups instantly.',
                },
                {
                  step: '04',
                  title: 'Start Sending & Receiving',
                  desc: 'Log into the high-speed webmail interface or connect Apple Mail, Outlook, and mobile apps via secure IMAP/SMTP.',
                },
              ].map((card) => (
                <div
                  key={card.step}
                  className="flex flex-col bg-white p-6 rounded-xl shadow-xs group hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-full bg-[#315bdb] text-white flex items-center justify-center font-mono text-[14px] font-bold mb-4">
                    {card.step}
                  </div>
                  <h3 className="text-[18px] text-[#181c20] font-semibold mb-2">{card.title}</h3>
                  <p className="text-[14px] text-[#434654] leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            7. SECURITY & INFRASTRUCTURE (Deep Navy Contrast Zone #0D1B3A)
        ═══════════════════════════════════════════════════════════ */}
        <section id="security" className="w-full py-24 px-6 lg:px-12 bg-[#0D1B3A] text-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#162B5E] text-[#dae2ff] font-mono text-[11px] mb-4">
                SECURITY • COMPLIANCE • SOVEREIGNTY
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Your Business Email Infrastructure, Built with Security in Mind.
              </h2>
              <p className="text-[16px] text-slate-300 max-w-2xl mx-auto">
                FlutterFlirt Mail combines professional email hosting, domain authentication, and centralized administration in an infrastructure designed for business communication.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
              {/* Technical Schematic Illustration */}
              <div className="lg:col-span-6 p-6 rounded-xl bg-[#11224D] shadow-xl border border-[#1F3A75]">
                <div className="flex items-center justify-between pb-4 border-b border-[#1F3A75]">
                  <span className="font-mono text-[11px] text-slate-400">ISOLATED MAIL CLUSTER #04</span>
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> NODES ACTIVE
                  </span>
                </div>

                <div className="py-6 space-y-4 font-mono text-[12px]">
                  {/* Node Inbound */}
                  <div className="p-3 bg-[#162B5E] rounded-lg flex items-center justify-between border border-[#1F3A75]">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-[#dae2ff]" />
                      <div>
                        <div className="text-white font-bold">Ingress TLS 1.3 Proxy</div>
                        <div className="text-slate-400 text-[11px]">Strict Cipher Suites • Zero Fallback</div>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold">PORT 25 / 587</span>
                  </div>

                  <div className="flex justify-center text-slate-500">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </div>

                  {/* Node Processing */}
                  <div className="p-3 bg-[#162B5E] rounded-lg flex items-center justify-between border border-[#1F3A75]">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-[#ffd9e2]" />
                      <div>
                        <div className="text-white font-bold">Rspamd Machine Learning Engine</div>
                        <div className="text-slate-400 text-[11px]">DKIM / SPF / DMARC Verification + Antivirus</div>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold">0.04ms LATENCY</span>
                  </div>

                  <div className="flex justify-center text-slate-500">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </div>

                  {/* Node Sovereign Storage */}
                  <div className="p-3 bg-[#162B5E] rounded-lg flex items-center justify-between border border-[#1F3A75]">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-[#dce1ff]" />
                      <div>
                        <div className="text-white font-bold">Isolated Tenant Maildir Storage</div>
                        <div className="text-slate-400 text-[11px]">Argon2id Hashed Credential Store • NVMe RAID</div>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold">ENCRYPTED AT REST</span>
                  </div>
                </div>
              </div>

              {/* 7 Security Pillars */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: Lock,
                    title: 'TLS 1.3 In-Transit',
                    desc: 'Strict forward secrecy across all inbound and outbound email channels.',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Strict SPF, DKIM & DMARC',
                    desc: 'Rigorous cryptographic spoofing rejection protects your brand identity.',
                  },
                  {
                    icon: KeyRound,
                    title: 'Argon2id Hashing',
                    desc: 'Modern memory-hard password encryption protecting user authentication.',
                  },
                  {
                    icon: Layers,
                    title: 'Tenant Isolation',
                    desc: 'Logical segregation prevents cross-account exposure or access leakage.',
                  },
                  {
                    icon: Activity,
                    title: 'Rspamd ML Filter',
                    desc: 'Continuous heuristics block phishing, zero-day malware, and bulk junk.',
                  },
                  {
                    icon: Terminal,
                    title: 'Audit Logging',
                    desc: 'Tamper-evident logs of administrative actions for corporate compliance.',
                  },
                ].map((pillar) => (
                  <div key={pillar.title} className="p-4 rounded-lg bg-[#11224D] border border-[#1F3A75]">
                    <div className="flex items-center gap-2 text-[#dae2ff] mb-1.5">
                      <pillar.icon className="w-4 h-4 text-[#315bdb]" />
                      <h4 className="text-[14.5px] text-white font-bold">{pillar.title}</h4>
                    </div>
                    <p className="text-[12px] text-slate-300">{pillar.desc}</p>
                  </div>
                ))}

                {/* Pillar 7 Full Span */}
                <div className="p-4 rounded-lg bg-[#11224D] border border-[#1F3A75] sm:col-span-2">
                  <div className="flex items-center gap-2 text-[#dae2ff] mb-1.5">
                    <Server className="w-4 h-4 text-[#315bdb]" />
                    <h4 className="text-[14.5px] text-white font-bold">Sovereign Self-Hosted Architecture</h4>
                  </div>
                  <p className="text-[12px] text-slate-300">
                    Your mail data stays strictly on our dedicated nodes—never mined, scanned for advertising, or leveraged to train third-party AI models.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            8. USE CASES SECTION
        ═══════════════════════════════════════════════════════════ */}
        <section className="w-full py-20 px-6 lg:px-12 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-[#181c20] mb-3">
                Built for Businesses of Every Size.
              </h2>
              <p className="text-[16px] text-[#434654]">
                From early-stage ventures to scaling agencies and established corporate IT departments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Store,
                  title: 'Small & Medium Businesses',
                  desc: 'Gain instant professional credibility with authenticated custom domains without maintaining physical servers or hiring complex IT teams.',
                  tag: 'Instant Brand Credibility',
                },
                {
                  icon: Rocket,
                  title: 'High-Growth Startups',
                  desc: 'Scale seamlessly from two co-founders to hundreds of teammates with flexible mailbox provisioning and predictable, transparent fixed pricing.',
                  tag: 'Fast Team Onboarding',
                },
                {
                  icon: Shield,
                  title: 'Corporate IT Teams',
                  desc: 'Maintain granular mailbox quotas, exportable audit trails, and strict authentication policies required for corporate compliance and governance.',
                  tag: 'Enterprise Compliance',
                },
                {
                  icon: Share2,
                  title: 'Digital Agencies',
                  desc: 'Seamlessly manage dozens of client domains and customer mailboxes from a unified multi-tenant administrative dashboard.',
                  tag: 'Multi-Domain Tenancy',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-6 rounded-xl bg-white shadow-xs border border-[#dfe3e8]/70 hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-[#cad6ff]/50 flex items-center justify-center text-[#315bdb] group-hover:bg-[#315bdb] group-hover:text-white transition-colors">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-[18px] text-[#181c20] font-semibold">{item.title}</h3>
                    <p className="text-[13.5px] text-[#434654] leading-relaxed">{item.desc}</p>
                  </div>
                  <span className="mt-6 pt-4 font-mono text-[11px] text-[#315bdb] font-bold border-t border-slate-100">
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            9. PRICING SECTION
        ═══════════════════════════════════════════════════════════ */}
        <section id="pricing" className="w-full py-24 px-6 lg:px-12 bg-[#f1f4f9]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ebeef3] text-[#315bdb] font-mono text-[11px] mb-3 font-semibold">
                FLEXIBLE HOSTING TIERS
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#181c20] mb-3 tracking-tight">
                Simple, Transparent Business Email Plans.
              </h2>
              <p className="text-[16px] text-[#434654] mb-6 leading-relaxed max-w-xl mx-auto">
                Configurable business email hosting with zero hidden fees. Choose the right tier for your organization or configure custom mailbox capacity.
              </p>

              {/* Controls: Currency & Billing Toggles */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                {/* Currency Selector */}
                <div className="inline-flex items-center gap-1 p-1 bg-[#ebeef3] rounded-xl shadow-xs border border-[#dfe3e8]/70 text-[13px] font-semibold">
                  {(['USD', 'EUR', 'GBP'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${currency === c ? 'bg-white text-[#315bdb] shadow-xs' : 'text-[#434654] hover:text-[#181c20]'
                        }`}
                    >
                      {c === 'USD' && 'USD ($)'}
                      {c === 'EUR' && 'EUR (€)'}
                      {c === 'GBP' && 'GBP (£)'}
                    </button>
                  ))}
                </div>

                {/* Billing Toggle */}
                <div className="inline-flex items-center gap-2 p-1.5 bg-[#ebeef3] rounded-xl shadow-xs border border-[#dfe3e8]/70">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${!isAnnual ? 'bg-white text-[#181c20] shadow-xs' : 'text-[#434654] hover:text-[#181c20]'
                      }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-1.5 ${isAnnual ? 'bg-white text-[#181c20] shadow-xs' : 'text-[#434654] hover:text-[#181c20]'
                      }`}
                  >
                    <span>Annual Billing</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      Save 20%
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3 Pricing Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {/* Starter */}
              <div className="p-8 rounded-2xl bg-white shadow-xs border border-[#dfe3e8] flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-6">
                  <div>
                    <span className="font-mono text-[11px] text-[#434654] uppercase tracking-wider font-semibold">
                      Starter Plan
                    </span>
                    <h3 className="text-[20px] text-[#181c20] font-bold mt-1">Foundational Email</h3>
                    <p className="text-[14px] text-[#434654] mt-2 leading-relaxed">
                      Ideal for small teams and solo entrepreneurs seeking professional domain credibility.
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1.5 pt-2 pb-2 border-y border-[#dfe3e8]/70">
                    <span className="text-3xl font-bold text-[#181c20]">
                      {pricing.symbol}{isAnnual ? pricing.annual.starter : pricing.monthly.starter}
                    </span>
                    <span className="text-[13px] text-[#434654] font-medium">
                      / month {isAnnual ? '(billed annually)' : '(fixed)'}
                    </span>
                  </div>
                  <ul className="space-y-3 text-[14px] text-[#181c20]">
                    {[
                      '1 Custom Domain Integration',
                      '5 Business Mailboxes Included',
                      '10 GB Storage per Mailbox',
                      'High-Speed Webmail & IMAP/SMTP',
                      'Standard Spam Protection',
                      'Guided SPF & DKIM DNS Setup',
                    ].map((feat) => (
                      <li key={feat} className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#315bdb] shrink-0" strokeWidth={2.5} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="#contact"
                  className="mt-8 w-full py-3.5 rounded-lg bg-[#ebeef3] text-[#181c20] font-semibold text-center hover:bg-[#dfe3e8] transition-colors active:scale-[0.98]"
                >
                  Select Starter
                </a>
              </div>

              {/* Business (Most Popular) */}
              <div className="p-8 rounded-2xl bg-white shadow-xl flex flex-col justify-between relative ring-2 ring-[#315bdb] hover:shadow-2xl transition-shadow">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#315bdb] text-white rounded-full font-mono text-[11px] font-bold shadow-md tracking-wider">
                  MOST POPULAR
                </div>
                <div className="space-y-6">
                  <div>
                    <span className="font-mono text-[11px] text-[#315bdb] uppercase tracking-wider font-semibold">
                      Business Plan
                    </span>
                    <h3 className="text-[20px] text-[#181c20] font-bold mt-1">Organization Suite</h3>
                    <p className="text-[14px] text-[#434654] mt-2 leading-relaxed">
                      For growing organizations requiring centralized governance and advanced authentication.
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1.5 pt-2 pb-2 border-y border-[#dfe3e8]/70">
                    <span className="text-3xl font-bold text-[#315bdb]">
                      {pricing.symbol}{isAnnual ? pricing.annual.business : pricing.monthly.business}
                    </span>
                    <span className="text-[13px] text-[#434654] font-medium">
                      / month {isAnnual ? '(billed annually)' : '(configurable)'}
                    </span>
                  </div>
                  <ul className="space-y-3 text-[14px] text-[#181c20]">
                    {[
                      'Unlimited Custom Domains',
                      '25 Business Mailboxes Included',
                      '25 GB Storage per Mailbox',
                      'Centralized Admin Console',
                      'Advanced Rspamd Protection & Heuristics',
                      'Automated DKIM/DMARC Validation',
                      'Priority 24/7 Support SLA',
                    ].map((feat) => (
                      <li key={feat} className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#315bdb] shrink-0" strokeWidth={2.5} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="#contact"
                  className="mt-8 w-full py-3.5 rounded-lg bg-[#315bdb] text-white font-semibold text-center shadow-[0_0_12px_rgba(49,91,219,0.3)] hover:bg-[#274bb7] transition-all active:scale-[0.98]"
                >
                  Get Started with Business
                </a>
              </div>

              {/* Enterprise */}
              <div className="p-8 rounded-2xl bg-white shadow-xs border border-[#dfe3e8] flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-6">
                  <div>
                    <span className="font-mono text-[11px] text-[#434654] uppercase tracking-wider font-semibold">
                      Enterprise Plan
                    </span>
                    <h3 className="text-[20px] text-[#181c20] font-bold mt-1">Dedicated Sovereignty</h3>
                    <p className="text-[14px] text-[#434654] mt-2 leading-relaxed">
                      For large companies and agencies needing dedicated server nodes and custom integrations.
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1.5 pt-2 pb-2 border-y border-[#dfe3e8]/70">
                    <span className="text-3xl font-bold text-[#181c20]">
                      {pricing.symbol}{isAnnual ? pricing.annual.enterprise : pricing.monthly.enterprise}
                    </span>
                    <span className="text-[13px] text-[#434654] font-medium">
                      / month {isAnnual ? '(billed annually)' : '(custom nodes)'}
                    </span>
                  </div>
                  <ul className="space-y-3 text-[14px] text-[#181c20]">
                    {[
                      'Dedicated Sovereign Server Nodes',
                      'Unlimited Mailboxes & Domains',
                      '100 GB Storage per Mailbox (Customizable)',
                      'Multi-Tenant Administrative Scoping',
                      'Optional Dedicated Outbound IP',
                      'White-Glove Data Migration Assistance',
                      '99.99% Uptime Guarantee with SLA',
                    ].map((feat) => (
                      <li key={feat} className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#315bdb] shrink-0" strokeWidth={2.5} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="#contact"
                  className="mt-8 w-full py-3.5 rounded-lg bg-[#ebeef3] text-[#181c20] font-semibold text-center hover:bg-[#dfe3e8] transition-colors active:scale-[0.98]"
                >
                  Contact Enterprise
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            10. FAQ SECTION (RADIX UI ACCORDION - 5 ESSENTIAL FAQS)
        ═══════════════════════════════════════════════════════════ */}
        <section id="faq" className="w-full py-24 px-6 lg:px-12 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8edff] text-[#0340c2] font-mono text-[11px] mb-2.5 font-bold border border-[#cad6ff]">
                <span>HELP &amp; FREQUENTLY ASKED QUESTIONS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#181c20] mb-3 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-[15.5px] text-[#515e80] leading-relaxed">
                Everything you need to know about sovereign business mail hosting, custom domain DNS, and mailbox provisioning.
              </p>
            </div>

            {/* Radix UI Animated Accordion Component */}
            <Accordion.Root
              type="single"
              collapsible
              defaultValue="faq-0"
              className="w-full space-y-3.5 max-w-3xl mx-auto"
            >
              {FAQS.map((faq, i) => (
                <Accordion.Item
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-2xl border border-slate-200/80 bg-[#f8fafc] hover:bg-[#f3f6fb] transition-all overflow-hidden data-[state=open]:bg-white data-[state=open]:border-[#315bdb]/40 data-[state=open]:shadow-md"
                >
                  <Accordion.Header className="flex">
                    <Accordion.Trigger className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 text-[15.5px] font-semibold text-[#181c20] hover:text-[#315bdb] transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3.5">
                        <span className="w-8 h-8 rounded-xl bg-[#e8edff] text-[#0340c2] text-[12px] font-mono font-bold flex items-center justify-center shrink-0 group-data-[state=open]:bg-[#315bdb] group-data-[state=open]:text-white transition-colors shadow-2xs">
                          0{i + 1}
                        </span>
                        <span className="leading-snug">{faq.q}</span>
                      </div>
                      <ChevronDown
                        className="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ease-out group-data-[state=open]:rotate-180 group-data-[state=open]:text-[#315bdb]"
                        aria-hidden
                      />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="px-5 sm:px-6 pb-6 pt-1 text-[14px] text-slate-600 leading-relaxed border-t border-slate-100 data-[state=open]:animate-in data-[state=closed]:animate-out duration-200">
                    <div className="pl-11.5 text-[#434654] leading-relaxed">
                      {faq.a}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            11. FINAL CALL TO ACTION (CTA) & ONBOARDING LEAD FORM
        ═══════════════════════════════════════════════════════════ */}
        <section id="get-started" className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-[#0D1B3A] text-white relative overflow-hidden scroll-mt-16">
          <div id="contact" className="absolute -top-20" />
          {/* Ambient Glows */}
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#315bdb]/25 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-[#c7006b]/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#162B5E] text-[#dae2ff] font-mono text-[11px] border border-[#234185]">
              <Mail className="w-3.5 h-3.5 text-[#315bdb]" />
              <span>DEPLOY SOVEREIGN BUSINESS EMAIL</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-[46px] text-white font-bold tracking-tight leading-tight px-2">
              Give Your Business a Professional Email Identity.
            </h2>

            <p className="text-[15px] sm:text-[16px] text-slate-300 max-w-2xl mx-auto leading-relaxed px-2">
              Bring your business communication together with FlutterFlirt Mail. Set up your custom domain in minutes and take full control of your team&apos;s correspondence.
            </p>

            {/* Interactive Lead / Setup Form Card */}
            <div className="max-w-2xl mx-auto mt-6 p-4 sm:p-8 rounded-2xl bg-[#132347]/95 border border-[#234185] shadow-2xl backdrop-blur-xl text-left">
              {leadSubmitted ? (
                <div className="py-10 px-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Setup Request Received!</h3>
                  <p className="text-[14.5px] text-slate-300 max-w-md mx-auto leading-relaxed">
                    Thank you! Your mailbox onboarding details have been sent directly to our team at{' '}
                    <span className="text-[#60a5fa] font-mono font-semibold">sumanqaj9876@gmail.com</span>.
                  </p>
                  <p className="text-[12.5px] text-slate-400">
                    We will verify your domain DNS records and reach out to help you get your business mail live.
                  </p>
                  <button
                    onClick={() => {
                      setLeadSubmitted(false);
                      setLeadForm({
                        name: '',
                        email: '',
                        domain: '',
                        phone: '',
                        mailboxCount: 'Starter (1 - 5 Mailboxes)',
                        message: '',
                      });
                    }}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-[#1f3a75] hover:bg-[#274bb7] text-white text-[13px] font-semibold transition-all cursor-pointer"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#234185]">
                    <div>
                      <h3 className="text-[17px] font-bold text-white">
                        Get Started with Your Domain
                      </h3>
                      <p className="text-[12.5px] text-slate-300 mt-0.5">
                        Fill in your details — setup request is sent straight to our team.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-[#1f3a75] text-[#dae2ff] border border-[#2a4d9c]">
                      Fast Setup
                    </span>
                  </div>

                  {leadError && (
                    <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[13px] flex items-center gap-2">
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>{leadError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-[12px] font-semibold text-slate-300 mb-1.5">
                        Full Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                        placeholder="Sarah Jenkins"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a152d] border border-[#234185] text-white placeholder-slate-500 text-[13.5px] focus:outline-hidden focus:border-[#315bdb] focus:ring-1 focus:ring-[#315bdb] transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[12px] font-semibold text-slate-300 mb-1.5">
                        Work Email <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                        placeholder="sarah@company.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a152d] border border-[#234185] text-white placeholder-slate-500 text-[13.5px] focus:outline-hidden focus:border-[#315bdb] focus:ring-1 focus:ring-[#315bdb] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Domain */}
                    <div>
                      <label className="block text-[12px] font-semibold text-slate-300 mb-1.5">
                        Company Domain
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[13px] font-mono">@</span>
                        <input
                          type="text"
                          value={leadForm.domain}
                          onChange={(e) => setLeadForm({ ...leadForm, domain: e.target.value.replace(/^@/, '') })}
                          placeholder="yourcompany.com"
                          className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#0a152d] border border-[#234185] text-white placeholder-slate-500 text-[13.5px] font-mono focus:outline-hidden focus:border-[#315bdb] focus:ring-1 focus:ring-[#315bdb] transition-all"
                        />
                      </div>
                    </div>

                    {/* Phone / WhatsApp */}
                    <div>
                      <label className="block text-[12px] font-semibold text-slate-300 mb-1.5">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a152d] border border-[#234185] text-white placeholder-slate-500 text-[13.5px] focus:outline-hidden focus:border-[#315bdb] focus:ring-1 focus:ring-[#315bdb] transition-all"
                      />
                    </div>
                  </div>

                  {/* Mailbox Volume / Plan */}
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-300 mb-1.5">
                      Mailboxes Required / Preferred Plan
                    </label>
                    <select
                      value={leadForm.mailboxCount}
                      onChange={(e) => setLeadForm({ ...leadForm, mailboxCount: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a152d] border border-[#234185] text-white text-[13.5px] focus:outline-hidden focus:border-[#315bdb] focus:ring-1 focus:ring-[#315bdb] transition-all cursor-pointer"
                    >
                      <option value="Starter (1 - 5 Mailboxes)">Starter (1 – 5 Mailboxes) • $4/mo</option>
                      <option value="Business (5 - 25 Mailboxes)">Business (5 – 25 Mailboxes) • $12/mo (Most Popular)</option>
                      <option value="Growth (25 - 100 Mailboxes)">Growth (25 – 100 Mailboxes) • Custom Tier</option>
                      <option value="Enterprise (100+ Custom Nodes)">Enterprise (100+ Mailboxes, Dedicated Sovereign Node) • $29/mo</option>
                    </select>
                  </div>

                  {/* Optional Message */}
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-300 mb-1.5">
                      Notes or Migration Questions <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={leadForm.message}
                      onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                      placeholder="e.g. Need help migrating 10 mailboxes from Google Workspace / cPanel."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a152d] border border-[#234185] text-white placeholder-slate-500 text-[13px] resize-none focus:outline-hidden focus:border-[#315bdb] focus:ring-1 focus:ring-[#315bdb] transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={leadLoading}
                    className="w-full py-3.5 rounded-xl bg-[#315bdb] hover:bg-[#274bb7] disabled:opacity-60 text-white font-bold text-[14.5px] shadow-[0_0_20px_rgba(49,91,219,0.4)] transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {leadLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending Request to Deployment Team...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Started with My Mailbox</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Micro-Trust Signals */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-slate-400 text-[12px]">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#dae2ff]" /> No credit card required for consultation
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-emerald-400" /> Free domain DNS verification assistance
              </span>
            </div>
          </div>
        </section>

      </main>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER (RESPONSIVE 2-COL MOBILE / 4-COL DESKTOP)
      ═══════════════════════════════════════════════════════════ */}
      <footer className="w-full bg-[#0D1B3A] text-slate-300 border-t border-[#1F3A75] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-[#1F3A75]">
            {/* Brand Column (Left) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <img
                  src="/logo-white.png"
                  alt="FlutterFlirt Mail"
                  className="h-8 w-auto object-contain"
                />
              </div>
              <p className="text-[13px] text-slate-400 leading-relaxed max-w-sm">
                Professional business email hosting and centralized management for modern teams by FlutterFlirt Private Limited.
              </p>
              <div className="flex items-center gap-2.5 pt-1">
                <a
                  href="#"
                  className="w-8 h-8 rounded-lg bg-[#162B5E] border border-[#1F3A75] flex items-center justify-center text-slate-300 hover:text-white hover:border-[#315bdb] transition-colors"
                  aria-label="Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-lg bg-[#162B5E] border border-[#1F3A75] flex items-center justify-center text-slate-300 hover:text-white hover:border-[#315bdb] transition-colors"
                  aria-label="Community"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-lg bg-[#162B5E] border border-[#1F3A75] flex items-center justify-center text-slate-300 hover:text-white hover:border-[#315bdb] transition-colors"
                  aria-label="Terminal API"
                >
                  <Terminal className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* 4 Navigation Categories in a clean 2-column grid on mobile, 4-column on md+ */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              {/* Product */}
              <div className="flex flex-col gap-2.5">
                <h4 className="font-mono text-[11px] text-white uppercase tracking-wider font-bold">Product</h4>
                <ul className="flex flex-col gap-2 text-[13px]">
                  <li><a href="#showcase" className="text-slate-400 hover:text-white transition-colors">Webmail</a></li>
                  <li><Link href="/admin" className="text-slate-400 hover:text-white transition-colors">Admin Console</Link></li>
                  <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
                  <li><a href="#security" className="text-slate-400 hover:text-white transition-colors">Security</a></li>
                  <li><a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</a></li>
                </ul>
              </div>

              {/* Company */}
              <div className="flex flex-col gap-2.5">
                <h4 className="font-mono text-[11px] text-white uppercase tracking-wider font-bold">Company</h4>
                <ul className="flex flex-col gap-2 text-[13px]">
                  <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">About Us</span></li>
                  <li><a href="#get-started" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
                  <li><a href="mailto:support@flutterflirt.com" className="text-slate-400 hover:text-white transition-colors">Support</a></li>
                </ul>
              </div>

              {/* Resources */}
              <div className="flex flex-col gap-2.5">
                <h4 className="font-mono text-[11px] text-white uppercase tracking-wider font-bold">Resources</h4>
                <ul className="flex flex-col gap-2 text-[13px]">
                  <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Documentation</span></li>
                  <li><a href="#faq" className="text-slate-400 hover:text-white transition-colors">FAQ</a></li>
                  <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">IMAP / SMTP</span></li>
                </ul>
              </div>

              {/* Legal */}
              <div className="flex flex-col gap-2.5">
                <h4 className="font-mono text-[11px] text-white uppercase tracking-wider font-bold">Legal</h4>
                <ul className="flex flex-col gap-2 text-[13px]">
                  <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
                  <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
                  <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Compliance</span></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Sub-bar */}
          <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11.5px] text-slate-400 font-mono text-center sm:text-left">
            <p>
              © {new Date().getFullYear()} FlutterFlirt Private Limited. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 99.9% Uptime
              </span>
              <span>•</span>
              <span>TLS 1.3 Strict</span>
              <span>•</span>
              <span>SOC2 &amp; ISO Compliant</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
