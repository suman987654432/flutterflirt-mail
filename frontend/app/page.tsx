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
  Menu,
  Settings,
  LogOut,
  User,
  Lock,
  RefreshCw,
  Loader2,
  Calendar,
  Users,
  Grid,
  ChevronDown,
  CornerUpLeft,
  CornerUpRight,
  Filter,
  CheckSquare,
  Bell,
  HelpCircle,
  MoreHorizontal,
  ChevronRight,
  Minus,
  Maximize2,
  Minimize2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Link2,
  Smile,
  Image,
  PenTool,
  MoreVertical,
  RemoveFormatting,
  Type,
  Pencil,
  Palette,
  Download,
  File,
  Star,
  Check,
  Clock,
  Sparkles,
  Database,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Tag,
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
  attachments?: {
    id?: number;
    filename: string;
    size: string;
    contentType?: string;
    dataUrl?: string;
    isInline?: boolean;
  }[];
}

interface UserTask {
  id: string;
  userId?: string;
  userEmail?: string;
  title: string;
  completed: boolean;
  important: boolean;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
  createdAt: string;
  sourceEmailUid?: number;
  sourceEmailSubject?: string;
}

// Google Docs / Outlook style palette constants (Exact match to user's design)
const PALETTE_GRAYSCALE = [
  '#000000',
  '#434343',
  '#666666',
  '#999999',
  '#b7b7b7',
  '#cccccc',
  '#efefef',
];

const PALETTE_HUES = [
  '#ff0000',
  '#ff9900',
  '#ffff00',
  '#00ff00',
  '#00ffff',
  '#0000ff',
  '#9900ff',
  '#ff00ff',
];

const PALETTE_MATRIX = [
  ['#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc'],
  ['#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6', '#d5a6bd'],
  ['#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8e7cc3', '#c27ba0'],
  ['#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3d85c6', '#674ea7', '#a64d79'],
  ['#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#0b5394', '#351c75', '#741b47'],
  ['#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#073763', '#20124d', '#4c1130'],
];

const DRIVE_FILES = [
  { id: '1', name: 'Q4 Business Strategy & Review.pdf', type: 'pdf', size: '2.4 MB', date: 'Nov 15, 2026' },
  { id: '2', name: 'FlutterFlirt Mail System Architecture.docx', type: 'doc', size: '840 KB', date: 'Nov 12, 2026' },
  { id: '3', name: 'Company Presentation Deck.pptx', type: 'slide', size: '5.1 MB', date: 'Nov 10, 2026' },
  { id: '4', name: 'Financial Model 2026-27.xlsx', type: 'sheet', size: '1.2 MB', date: 'Nov 08, 2026' },
  { id: '5', name: 'Brand Assets & Media Kit.zip', type: 'pdf', size: '14.8 MB', date: 'Oct 29, 2026' },
];

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);

  // Compose State (Modern Rich Floating Window)
  const [composeFrom, setComposeFrom] = useState('admin@codeaddabot.in');
  const [composeTo, setComposeTo] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [composeBcc, setComposeBcc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeSentToast, setComposeSentToast] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [composeWindowMode, setComposeWindowMode] = useState<'normal' | 'minimized' | 'fullscreen'>('normal');
  const [showFormatBar, setShowFormatBar] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<{ file?: File; name: string; size: string }[]>([]);
  const editorRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [currentTextColor, setCurrentTextColor] = useState('#d93025');
  const [currentBgColor, setCurrentBgColor] = useState('#ffff00');
  const customColorInputRef = React.useRef<HTMLInputElement>(null);

  // Universal Toast Notification (Replaces window.alert completely)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // 1. Insert Link Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  // 2. Insert Photo Modal State (Upload & URL)
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoTab, setPhotoTab] = useState<'upload' | 'url'>('upload');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  // 3. Google Drive Modal State
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [driveSearch, setDriveSearch] = useState('');
  const [selectedDriveFile, setSelectedDriveFile] = useState<string | null>(null);

  // 4. Confidential Mode State
  const [showConfidentialModal, setShowConfidentialModal] = useState(false);
  const [isConfidential, setIsConfidential] = useState(false);
  const [confidentialExpiry, setConfidentialExpiry] = useState('1 week');
  const [confidentialPasscode, setConfidentialPasscode] = useState<'none' | 'sms'>('none');

  // 5. Signature State
  const [showSignatureMenu, setShowSignatureMenu] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [savedSignature, setSavedSignature] = useState('');
  const [customSignatureInput, setCustomSignatureInput] = useState('');

  // 6. Schedule Send & More Menus
  const [showScheduleMenu, setShowScheduleMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // 7. Coming Soon Modal State (Calendar, Groups & Contacts)
  const [comingSoonModal, setComingSoonModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    icon: 'calendar' | 'users' | 'todo';
    phase: string;
    features: string[];
  } | null>(null);

  // 8. Real Functional To-Do & Tasks State (PostgreSQL Backed with Strict User Isolation)
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState<'today' | 'tomorrow' | 'none'>('today');
  const [newTaskImportant, setNewTaskImportant] = useState(false);
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [taskFilter, setTaskFilter] = useState<'all' | 'today' | 'important' | 'high' | 'email' | 'completed'>('all');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [editingTaskPriority, setEditingTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const handleStartEdit = (task: UserTask) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
    setEditingTaskPriority(task.priority || 'medium');
  };

  const handleSaveEdit = async (taskId: string) => {
    if (!editingTaskTitle.trim()) return;
    const newTitle = editingTaskTitle.trim();
    const newPriority = editingTaskPriority;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, title: newTitle, priority: newPriority } : t))
    );
    setEditingTaskId(null);

    try {
      const activeToken = token || localStorage.getItem('ffmail_token');
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({ title: newTitle, priority: newPriority }),
      });
      showToast('Task updated.', 'success');
    } catch (err) {
      console.error('[Tasks DB] Error updating task title:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTaskTitle('');
  };

  // Load tasks from backend PostgreSQL database
  const fetchTasksFromDb = async (authToken?: string) => {
    const activeToken = authToken || token || (typeof window !== 'undefined' ? localStorage.getItem('ffmail_token') : null);
    if (!activeToken) return;
    setIsTasksLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.tasks)) {
          setTasks(data.tasks);
          try {
            const currentEmail = userEmail || localStorage.getItem('ffmail_user_email') || 'me';
            localStorage.setItem(`ffmail_tasks_${currentEmail}`, JSON.stringify(data.tasks));
          } catch { }
        }
      }
    } catch (err) {
      console.error('[Tasks DB] Failed to fetch tasks:', err);
    } finally {
      setIsTasksLoading(false);
    }
  };

  const handleAddTask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const title = newTaskTitle.trim();
    const dueDate = newTaskDueDate === 'today' ? 'Today' : newTaskDueDate === 'tomorrow' ? 'Tomorrow' : undefined;
    const important = newTaskImportant;
    const priority = newTaskPriority;

    // Reset input immediately for instant responsiveness
    setNewTaskTitle('');
    setNewTaskDueDate('today');
    setNewTaskImportant(false);
    setNewTaskPriority('medium');

    // Optimistic task
    const tempId = `temp-${Date.now()}`;
    const optimisticTask: UserTask = {
      id: tempId,
      title,
      completed: false,
      important,
      dueDate,
      priority,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [optimisticTask, ...prev]);

    try {
      const activeToken = token || localStorage.getItem('ffmail_token');
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          title,
          important,
          dueDate,
          priority,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.task) {
          setTasks((prev) => prev.map((t) => (t.id === tempId ? data.task : t)));
          showToast('Task saved to database.', 'success');
          return;
        }
      }
      showToast('Task added.', 'success');
    } catch (err) {
      console.error('[Tasks DB] Error creating task:', err);
      showToast('Task saved locally.', 'info');
    }
  };

  const handleToggleTaskComplete = async (taskId: string) => {
    const current = tasks.find((t) => t.id === taskId);
    if (!current) return;
    const nextCompleted = !current.completed;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: nextCompleted } : t))
    );

    try {
      const activeToken = token || localStorage.getItem('ffmail_token');
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({ completed: nextCompleted }),
      });
    } catch (err) {
      console.error('[Tasks DB] Error toggling complete:', err);
    }
  };

  const handleToggleTaskImportant = async (taskId: string) => {
    const current = tasks.find((t) => t.id === taskId);
    if (!current) return;
    const nextImportant = !current.important;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, important: nextImportant } : t))
    );

    try {
      const activeToken = token || localStorage.getItem('ffmail_token');
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({ important: nextImportant }),
      });
    } catch (err) {
      console.error('[Tasks DB] Error toggling important:', err);
    }
  };

  const handleToggleTaskPriority = async (taskId: string, newPriority: 'high' | 'medium' | 'low') => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t))
    );
    try {
      const activeToken = token || localStorage.getItem('ffmail_token');
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({ priority: newPriority }),
      });
    } catch (err) {
      console.error('[Tasks DB] Error updating priority:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast('Task deleted.', 'info');

    try {
      const activeToken = token || localStorage.getItem('ffmail_token');
      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
    } catch (err) {
      console.error('[Tasks DB] Error deleting task:', err);
    }
  };

  const handleCreateTaskFromEmail = async (msg: EmailMessage) => {
    const title = `Follow up: ${msg.subject || '(no subject)'}`;
    const dueDate = 'Today';
    const important = true;
    const priority = 'high';

    const tempId = `temp-${Date.now()}`;
    const optimisticTask: UserTask = {
      id: tempId,
      title,
      completed: false,
      important,
      dueDate,
      priority,
      createdAt: new Date().toISOString(),
      sourceEmailUid: msg.uid,
      sourceEmailSubject: msg.subject,
    };
    setTasks((prev) => [optimisticTask, ...prev]);
    setIsTaskPanelOpen(true);

    try {
      const activeToken = token || localStorage.getItem('ffmail_token');
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          title,
          important,
          dueDate,
          priority,
          sourceEmailUid: msg.uid,
          sourceEmailSubject: msg.subject,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.task) {
          setTasks((prev) => prev.map((t) => (t.id === tempId ? data.task : t)));
        }
      }
      showToast('Email linked & saved to Tasks database!', 'success');
    } catch (err) {
      console.error('[Tasks DB] Error creating task from email:', err);
      showToast('Added email to To-Do tasks!', 'success');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (taskSearchQuery.trim()) {
      const q = taskSearchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchSubject = task.sourceEmailSubject?.toLowerCase().includes(q);
      if (!matchTitle && !matchSubject) return false;
    }
    if (taskFilter === 'today') return task.dueDate === 'Today' && !task.completed;
    if (taskFilter === 'important') return task.important && !task.completed;
    if (taskFilter === 'high') return task.priority === 'high' && !task.completed;
    if (taskFilter === 'email') return Boolean(task.sourceEmailSubject) && !task.completed;
    if (taskFilter === 'completed') return task.completed;
    return true;
  });

  // Check login on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('ffmail_token');
    const savedEmail = localStorage.getItem('ffmail_user_email');
    const savedSig = localStorage.getItem('ffmail_signature');
    if (savedSig) {
      setSavedSignature(savedSig);
      setCustomSignatureInput(savedSig);
    }

    // Load cached tasks if available, then sync with PostgreSQL database
    const cachedTasks = savedEmail ? localStorage.getItem(`ffmail_tasks_${savedEmail}`) : localStorage.getItem('ffmail_tasks');
    if (cachedTasks) {
      try {
        setTasks(JSON.parse(cachedTasks));
      } catch { }
    }

    if (savedToken) {
      setToken(savedToken);
      if (savedEmail) {
        setUserEmail(savedEmail);
        setComposeFrom(savedEmail);
      }
      setIsAuthenticated(true);
      fetchFolderMessages('INBOX', savedToken);
      fetchTasksFromDb(savedToken);
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

      // 2. Fallback to Admin Login only if mailbox login returned 401 (e.g. system admin)
      if (res.status === 401) {
        const adminRes = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
        });
        if (adminRes.ok) {
          res = adminRes;
        }
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }

      const authToken = data.token;
      const email = data.user?.email || loginEmail.trim();

      localStorage.setItem('ffmail_token', authToken);
      localStorage.setItem('ffmail_user_email', email);
      setToken(authToken);
      setUserEmail(email);
      setComposeFrom(email);
      setIsAuthenticated(true);

      // Load inbox and tasks from database immediately
      await fetchFolderMessages('INBOX', authToken);
      fetchTasksFromDb(authToken);
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
    }).catch(() => { });

    try {
      const res = await fetch(`/api/mail/folders/${encodeURIComponent(targetFolder)}/messages/${msg.uid}`, {
        headers: { Authorization: `Bearer ${tokenToUse}` },
      });
      if (res.ok) {
        const full = await res.json();
        const cleanSnippet = (full.text || '').replace(/\s+/g, ' ').trim().slice(0, 90);
        setMessages((prev) =>
          prev.map((m) => (m.uid === msg.uid ? { ...m, snippet: cleanSnippet || m.snippet } : m))
        );
        let processedHtml = full.html || `<div style="white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; padding: 12px; line-height: 1.6; color: #201f1e;">${full.text || ''}</div>`;

        // Format attachments
        const formattedAttachments = (full.attachments || []).map((a: any, idx: number) => ({
          id: a.id ?? idx,
          filename: a.filename || `attachment-${idx + 1}`,
          size: typeof a.size === 'number' ? `${Math.round(a.size / 1024)} KB` : (a.size || ''),
          contentType: a.contentType || 'application/octet-stream',
          dataUrl: a.dataUrl || '',
          isInline: !!a.isInline,
        }));

        // Client-side safety: resolve any inline CID images
        formattedAttachments.forEach((att: any) => {
          if (att.cid && att.dataUrl) {
            const cleanCid = att.cid.replace(/^<|>$/g, '');
            const pattern = new RegExp(`src=["']cid:<?${cleanCid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}>?["']`, 'gi');
            processedHtml = processedHtml.replace(pattern, `src="${att.dataUrl}"`);
          }
        });

        // Strip ugly broken "Inserted photo" alt text
        processedHtml = processedHtml.replace(/alt=["']Inserted photo["']/gi, 'alt=""');

        setSelectedMessage((prev) => prev?.uid === msg.uid ? {
          ...prev,
          snippet: cleanSnippet || prev.snippet,
          subject: full.subject || msg.subject,
          from: full.from || msg.from,
          unread: false,
          bodyHtml: processedHtml,
          security: {
            spf: full.security?.spf ? 'pass' : 'none',
            dkim: full.security?.dkim ? 'pass' : 'none',
            dmarc: full.security?.dmarc ? 'pass' : 'none',
          },
          attachments: formattedAttachments,
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
    }).catch(() => { });
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
    }).catch(() => { });
  };

  const handleDeleteMessage = async (msg: EmailMessage) => {
    if (!msg) return;
    const uidToDelete = msg.uid;
    const targetFolder = FOLDER_MAP[activeFolder] || 'INBOX';

    // 1. Optimistically remove from UI
    const remaining = messages.filter((m) => m.uid !== uidToDelete);
    setMessages(remaining);

    // 2. Select next email if deleted was selected
    if (selectedMessage?.uid === uidToDelete) {
      if (remaining.length > 0) {
        handleSelectMessage(remaining[0]);
      } else {
        setSelectedMessage(null);
      }
    }

    // 3. Inform backend
    try {
      await fetch(`/api/mail/folders/${encodeURIComponent(targetFolder)}/messages/${uidToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.warn('Failed to delete message on backend:', err);
    }
  };

  const formatText = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      setComposeBody(editorRef.current.innerHTML);
    }
  };

  const applyHighlightColor = (color: string) => {
    setCurrentBgColor(color);
    if (color === 'transparent') {
      try {
        document.execCommand('backColor', false, 'transparent');
      } catch { }
    } else {
      try {
        document.execCommand('hiliteColor', false, color);
      } catch {
        document.execCommand('backColor', false, color);
      }
    }
    if (editorRef.current) {
      editorRef.current.focus();
      setComposeBody(editorRef.current.innerHTML);
    }
    setShowColorPicker(false);
  };

  const applyTextColor = (color: string) => {
    setCurrentTextColor(color);
    formatText('foreColor', color);
    setShowColorPicker(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newAttachments = files.map((file) => ({
        file,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
      showToast(`Attached ${files.length} file(s).`, 'success');
    }
  };

  // 1. Insert Link Handlers
  const handleOpenLinkModal = () => {
    const sel = window.getSelection();
    const selText = sel ? sel.toString() : '';
    setLinkText(selText);
    setLinkUrl('');
    setShowLinkModal(true);
  };

  const handleApplyLink = () => {
    if (!linkUrl.trim()) {
      showToast('Please enter a valid web URL.', 'error');
      return;
    }
    const href = linkUrl.startsWith('http://') || linkUrl.startsWith('https://') || linkUrl.startsWith('mailto:')
      ? linkUrl
      : `https://${linkUrl}`;
    const display = linkText.trim() || linkUrl.trim();
    const linkHtml = `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: #0b57d0; text-decoration: underline;">${display}</a>`;
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, linkHtml);
      setComposeBody(editorRef.current.innerHTML);
    }
    setShowLinkModal(false);
    setLinkText('');
    setLinkUrl('');
    showToast('Link inserted.', 'success');
  };

  // 2. Insert Photo Handlers (Upload file & Web URL with Professional Card, S/M/L and Cut option)
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawDataUrl = event.target?.result as string;
        // Optimize image resolution so base64 string is only ~35KB, preventing Gmail's 102KB clipping
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            setPhotoPreview(compressed);
          } else {
            setPhotoPreview(rawDataUrl);
          }
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const cleanEmailHtml = (rawHtml: string) => {
    if (typeof window === 'undefined') return rawHtml;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, 'text/html');
      doc.querySelectorAll('.ffmail-img-wrapper').forEach((wrapper) => {
        const img = wrapper.querySelector('img');
        if (img) {
          const cleanImg = doc.createElement('img');
          cleanImg.src = img.src;
          cleanImg.alt = img.alt || '';
          cleanImg.setAttribute(
            'style',
            'max-width: 100%; max-height: 500px; border-radius: 8px; display: block; margin: 10px 0;'
          );
          wrapper.replaceWith(cleanImg);
        }
      });
      return doc.body.innerHTML;
    } catch {
      return rawHtml;
    }
  };

  const handleApplyPhoto = () => {
    const src = photoTab === 'upload' ? photoPreview : photoUrl;
    if (!src) {
      showToast('Please upload an image file or provide an image URL.', 'error');
      return;
    }
    // Also add original photo file to attachments list so it's delivered as a full attachment!
    if (photoTab === 'upload' && photoFile) {
      setAttachments((prev) => [
        ...prev,
        {
          file: photoFile,
          name: photoFile.name,
          size: (photoFile.size / 1024).toFixed(1) + ' KB',
        },
      ]);
    }

    const imgHtml = `
      <div class="ffmail-img-wrapper" contenteditable="false" style="display:inline-block; position:relative; margin:10px 0; max-width:340px; border:1px solid #dadce0; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08); background:#ffffff; user-select:none; vertical-align:top;">
        <div style="display:flex; align-items:center; justify-content:space-between; padding:6px 10px; background:#f8fafd; border-bottom:1px solid #edebe9; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:11px; color:#444746;">
          <div style="display:flex; align-items:center; gap:5px; font-weight:600; color:#1f1f1f;">
            <span>🖼️</span>
            <span>Photo</span>
          </div>
          <div style="display:flex; align-items:center; gap:4px;">
            <button type="button" class="ffmail-img-size-btn" data-size="200px" style="background:#e8f0fe; color:#0b57d0; border:1px solid #c2e7ff; border-radius:4px; padding:2px 6px; font-size:10px; font-weight:600; cursor:pointer;" title="Small size (200px)">S</button>
            <button type="button" class="ffmail-img-size-btn" data-size="340px" style="background:#e8f0fe; color:#0b57d0; border:1px solid #c2e7ff; border-radius:4px; padding:2px 6px; font-size:10px; font-weight:600; cursor:pointer;" title="Medium size (340px)">M</button>
            <button type="button" class="ffmail-img-size-btn" data-size="500px" style="background:#e8f0fe; color:#0b57d0; border:1px solid #c2e7ff; border-radius:4px; padding:2px 6px; font-size:10px; font-weight:600; cursor:pointer;" title="Large size (500px)">L</button>
            <button type="button" class="ffmail-img-cut-btn" style="background:#fce8e6; color:#c5221f; border:1px solid #f8b4af; border-radius:4px; padding:2px 8px; font-size:11px; font-weight:600; cursor:pointer; margin-left:4px; display:inline-flex; align-items:center; gap:2px;" title="Cut / Remove image">✕ Cut</button>
          </div>
        </div>
        <div style="padding:6px; background:#fdfdfd; display:flex; align-items:center; justify-content:center;">
          <img src="${src}" alt="Inserted photo" style="display:block; max-width:100%; max-height:280px; object-fit:contain; border-radius:6px;" />
        </div>
      </div><br/>
    `;
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, imgHtml);
      setComposeBody(editorRef.current.innerHTML);
    }
    setShowPhotoModal(false);
    setPhotoPreview(null);
    setPhotoUrl('');
    setPhotoFile(null);
    showToast('Photo inserted and attached.', 'success');
  };

  // 3. Google Drive Handler
  const handleInsertDriveFile = (file: typeof DRIVE_FILES[0]) => {
    const chipHtml = `
      <div style="display:inline-flex; align-items:center; gap:8px; background:#f0f4f9; border:1px solid #c2e7ff; padding:6px 12px; border-radius:8px; margin:6px 0; font-family:sans-serif; text-decoration:none; color:#0b57d0;">
        <span style="font-size:16px;">📁</span>
        <span style="font-weight:600; font-size:12px; color:#1f1f1f;">${file.name}</span>
        <span style="font-size:11px; color:#5f6368;">(${file.size} - Google Drive)</span>
      </div><br/>
    `;
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, chipHtml);
      setComposeBody(editorRef.current.innerHTML);
    }
    setShowDriveModal(false);
    setSelectedDriveFile(null);
    showToast(`Attached Google Drive file: ${file.name}`, 'success');
  };

  // 4. Signature Handlers
  const handleInsertSignature = () => {
    const sigText = savedSignature || `Best regards,\n${userEmail.split('@')[0]}\nFlutterFlirt Mail`;
    const sigHtml = `<br/><br/><div style="color: #444746; font-size: 13px; font-family: sans-serif; border-top: 1px solid #e0e0e0; padding-top: 8px; margin-top: 12px;">--<br/>${sigText.replace(/\n/g, '<br/>')}</div>`;
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, sigHtml);
      setComposeBody(editorRef.current.innerHTML);
    }
    setShowSignatureMenu(false);
    showToast('Signature inserted!', 'success');
  };

  const handleSaveCustomSignature = () => {
    localStorage.setItem('ffmail_signature', customSignatureInput);
    setSavedSignature(customSignatureInput);
    setShowSignatureModal(false);
    setShowSignatureMenu(false);
    showToast('Signature updated and saved!', 'success');
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!composeTo.trim()) {
      showToast('Please specify at least one recipient in the To field.', 'error');
      return;
    }
    setIsSending(true);

    const htmlContent = cleanEmailHtml(editorRef.current?.innerHTML || composeBody);
    const textContent = editorRef.current?.innerText || editorRef.current?.textContent || composeBody;

    const formData = new FormData();
    formData.append('from', composeFrom);
    formData.append('to', composeTo);
    if (composeCc) formData.append('cc', composeCc);
    if (composeBcc) formData.append('bcc', composeBcc);
    formData.append('subject', composeSubject || '(no subject)');
    formData.append('text', textContent);
    formData.append('html', htmlContent);

    // Append attachments
    attachments.forEach((att) => {
      if (att.file) {
        formData.append('attachments', att.file);
      }
    });

    try {
      const res = await fetch('/api/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to send message');
      }

      setIsComposeOpen(false);
      setComposeWindowMode('normal');
      setComposeSentToast(true);
      setTimeout(() => setComposeSentToast(false), 4000);

      // Reset compose
      setComposeTo('');
      setComposeCc('');
      setComposeBcc('');
      setShowCc(false);
      setShowBcc(false);
      setComposeSubject('');
      setComposeBody('');
      setAttachments([]);
      setIsConfidential(false);
      if (editorRef.current) editorRef.current.innerHTML = '';

      // Refresh sent folder if active
      if (activeFolder === 'sent') {
        fetchFolderMessages('Sent', token);
      }
    } catch (err: any) {
      showToast(`Send Error: ${err.message}`, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleReplyToMessage = (msg: EmailMessage) => {
    setComposeTo(msg.from.address);
    setComposeSubject(msg.subject.toLowerCase().startsWith('re:') ? msg.subject : `Re: ${msg.subject}`);
    const quoteHtml = `<br/><br/><div style="border-left: 2px solid #ccc; padding-left: 8px; color: #555;">On ${msg.date}, ${msg.from.name || msg.from.address} &lt;${msg.from.address}&gt; wrote:<br/>${msg.bodyHtml || msg.snippet}</div>`;
    setComposeBody(quoteHtml);
    if (editorRef.current) {
      editorRef.current.innerHTML = quoteHtml;
    }
    setIsComposeOpen(true);
    setComposeWindowMode('normal');
  };

  const handleForwardMessage = (msg: EmailMessage) => {
    setComposeTo('');
    setComposeSubject(msg.subject.toLowerCase().startsWith('fwd:') ? msg.subject : `Fwd: ${msg.subject}`);
    const fwdHtml = `<br/><br/><div style="border-left: 2px solid #0078d4; padding-left: 8px; color: #555;">---------- Forwarded message ---------<br/>From: ${msg.from.name || msg.from.address} &lt;${msg.from.address}&gt;<br/>Date: ${msg.date}<br/>Subject: ${msg.subject}<br/><br/>${msg.bodyHtml || msg.snippet}</div>`;
    setComposeBody(fwdHtml);
    if (editorRef.current) {
      editorRef.current.innerHTML = fwdHtml;
    }
    setIsComposeOpen(true);
    setComposeWindowMode('normal');
  };

  const handleSaveDraft = async () => {
    try {
      const htmlContent = cleanEmailHtml(editorRef.current?.innerHTML || composeBody);
      const textContent = editorRef.current?.innerText || editorRef.current?.textContent || composeBody;

      const formData = new FormData();
      formData.append('from', composeFrom);
      formData.append('to', composeTo);
      if (composeCc) formData.append('cc', composeCc);
      if (composeBcc) formData.append('bcc', composeBcc);
      formData.append('subject', composeSubject);
      formData.append('text', textContent);
      formData.append('html', htmlContent);

      attachments.forEach((att) => {
        if (att.file) {
          formData.append('attachments', att.file);
        }
      });

      await fetch('/api/mail/drafts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      setIsComposeOpen(false);
      setComposeTo('');
      setComposeCc('');
      setComposeBcc('');
      setComposeSubject('');
      setComposeBody('');
      setAttachments([]);
      setIsConfidential(false);
      if (editorRef.current) editorRef.current.innerHTML = '';
      showToast('Draft saved to Drafts folder!', 'success');
      if (activeFolder === 'drafts') {
        fetchFolderMessages('Drafts', token);
      }
    } catch (err: any) {
      showToast(`Save Draft Error: ${err.message}`, 'error');
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

  // 1. LOGIN SCREEN (MICROSOFT OUTLOOK 365 STYLE)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f3f2f1] flex flex-col items-center justify-center p-4 font-sans select-none">
        <div className="w-full max-w-md bg-white border border-[#edebe9] rounded-lg shadow-xl p-8 sm:p-10">
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded bg-[#0078d4] flex items-center justify-center text-white shadow-sm font-bold text-base">
              FF
            </div>
            <div>
              <div className="text-xl font-semibold text-[#201f1e] leading-tight">FlutterFlirt Mail</div>
              <div className="text-xs text-[#605e5c]">Secure Enterprise Business Webmail</div>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-[#201f1e] mb-1">Sign in</h1>
          <p className="text-xs text-[#605e5c] mb-6">Use your business email account</p>

          {/* Error Banner */}
          {loginError && (
            <div className="mb-5 p-3 rounded bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700">
              <AlertOctagon className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#323130] mb-1.5">Email address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-white border border-[#8a8886] rounded px-3 py-2 text-xs text-[#201f1e] placeholder-[#a19f9d] focus:outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] transition"
                  placeholder="admin@codeaddabot.in"
                />
                <Mail className="w-4 h-4 text-[#8a8886] absolute right-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#323130] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-white border border-[#8a8886] rounded px-3 py-2 text-xs text-[#201f1e] placeholder-[#a19f9d] focus:outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] transition"
                  placeholder="••••••••"
                />
                <Lock className="w-4 h-4 text-[#8a8886] absolute right-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full mt-2 py-2.5 px-4 rounded bg-[#0078d4] hover:bg-[#106ebe] text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Next / Sign in</span>
              )}
            </button>
          </form>

          {/* Quick Credential Helper */}
          <div className="mt-6 pt-5 border-t border-[#edebe9] flex flex-col items-center gap-2 text-xs text-[#605e5c]">
            <div className="text-[11px] bg-[#f8f9fa] px-3 py-1.5 rounded border border-[#edebe9] text-[#323130] font-mono">
              admin@codeaddabot.in / AdminPassword123!
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-[#0078d4] hover:underline transition mt-1"
            >
              Admin Console & DNS Settings
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. MAIN WEBMAIL DASHBOARD (MICROSOFT OUTLOOK 365 ENTERPRISE STYLE)
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#faf9f8] font-sans text-[#201f1e]">
      {/* 1. Outlook Top Header Bar (Microsoft Blue #0078d4) */}
      <header className="h-12 bg-[#0078d4] text-white flex items-center justify-between px-2 sm:px-3 z-30 shrink-0 shadow-sm select-none relative">
        {/* Left: Mobile Menu Hamburger + Outlook Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          {/* Mobile Drawer Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-1.5 rounded hover:bg-white/15 text-white transition flex items-center justify-center shrink-0"
            title="Open folders menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            type="button"
            className="hidden sm:flex p-1.5 rounded hover:bg-white/15 text-white/95 transition items-center justify-center shrink-0"
            title="App launcher"
          >
            <Grid className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded bg-white/20 flex items-center justify-center font-bold text-xs tracking-wider text-white shrink-0">
              FF
            </div>
            <span className="font-semibold text-sm sm:text-base text-white tracking-tight truncate">
              FlutterFlirt Mail
            </span>
          </div>
        </div>

        {/* Center: Desktop Global Search Bar with Ctrl+E */}
        <div className="hidden md:flex items-center flex-1 max-w-xl mx-4 lg:mx-6 relative">
          <Search className="w-4 h-4 text-[#605e5c] absolute left-3 top-2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search email by sender, recipient or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f3f2f1] text-[13px] text-[#201f1e] placeholder-[#605e5c] pl-9 pr-14 py-1.5 rounded-md border border-transparent hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-white focus:border-white shadow-sm transition"
          />
          <span className="absolute right-3 top-1.5 text-[10px] text-[#605e5c] bg-white/70 px-1.5 py-0.5 rounded border border-[#edebe9] font-mono pointer-events-none">
            Ctrl+E
          </span>
        </div>

        {/* Mobile Fullscreen Search Overlay */}
        {isMobileSearchActive && (
          <div className="absolute inset-0 bg-[#0078d4] z-40 flex items-center px-2 gap-2 animate-in fade-in duration-100 md:hidden">
            <Search className="w-4 h-4 text-white/80 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-white/20 text-white placeholder-white/70 text-sm px-3 py-1.5 rounded-md focus:outline-none focus:bg-white focus:text-[#201f1e] focus:placeholder-[#605e5c]"
            />
            <button
              type="button"
              onClick={() => {
                setIsMobileSearchActive(false);
                setSearchQuery('');
              }}
              className="p-1.5 text-white hover:bg-white/15 rounded shrink-0"
              title="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Right: Quick Action Icons & User Avatar */}
        <div className="flex items-center gap-0.5 sm:gap-1 relative shrink-0">
          {/* Mobile Search Icon Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileSearchActive(true)}
            className="md:hidden p-1.5 rounded-full hover:bg-white/15 text-white transition"
            title="Search"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          <button
            onClick={() => fetchFolderMessages(activeFolder === 'inbox' ? 'INBOX' : activeFolder, token)}
            disabled={isLoadingMessages}
            title="Sync / Refresh Mailbox"
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/15 text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingMessages ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            title="Notifications"
            className="hidden sm:flex p-2 rounded-full hover:bg-white/15 text-white transition"
          >
            <Bell className="w-4 h-4" />
          </button>

          {userEmail.startsWith('admin@') && (
            <Link
              href="/admin"
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/15 text-white transition"
              title="Admin Console & DNS Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          )}

          {/* User Avatar Circle */}
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="ml-1 sm:ml-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#5c2d91] hover:bg-[#4a2377] text-white flex items-center justify-center text-xs font-bold ring-2 ring-white/70 hover:ring-white transition shadow-sm"
            title="Account Profile"
          >
            {userEmail[0]?.toUpperCase() || 'A'}
          </button>

          {/* User Profile Dropdown Menu */}
          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 top-12 mt-1 w-80 bg-white rounded-lg shadow-2xl border border-[#edebe9] text-[#201f1e] z-50 overflow-hidden animate-in fade-in duration-150">
                <div className="p-4 bg-[#f8f9fa] border-b border-[#edebe9] flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#0078d4] flex items-center justify-center text-base font-bold text-white shadow shrink-0">
                    {userEmail[0]?.toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate text-[#201f1e]">
                      {userEmail.startsWith('admin@') ? 'Administrator' : 'Standard User'}
                    </div>
                    <div className="text-xs text-[#605e5c] font-mono truncate">{userEmail}</div>
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {userEmail.startsWith('admin@') ? 'Admin Mailbox' : 'Active Mailbox'}
                    </div>
                  </div>
                  <button onClick={() => setIsProfileOpen(false)} className="text-[#605e5c] hover:text-[#201f1e] transition p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 border-b border-[#edebe9] bg-white">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[#605e5c] font-medium">Mailbox Storage</span>
                    <span className="font-semibold text-[#201f1e]">10 GB Quota</span>
                  </div>
                  <div className="w-full h-2 bg-[#edebe9] rounded-full overflow-hidden">
                    <div className="w-[2%] h-full bg-[#0078d4] rounded-full"></div>
                  </div>
                  <div className="mt-2 text-[11px] text-[#605e5c] flex items-center justify-between">
                    <span>Domain: <b>codeaddabot.in</b></span>
                    <span className="text-emerald-600 font-semibold">DNS Verified ✓</span>
                  </div>
                </div>

                <div className="p-2 space-y-0.5 bg-white">
                  {userEmail.startsWith('admin@') && (
                    <Link
                      href="/admin"
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#201f1e] hover:bg-[#f3f2f1] rounded transition"
                    >
                      <Settings className="w-4 h-4 text-[#605e5c]" />
                      <span>Admin Console & DNS</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsComposeOpen(true);
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#201f1e] hover:bg-[#f3f2f1] rounded transition"
                  >
                    <Plus className="w-4 h-4 text-[#605e5c]" />
                    <span>New Mail</span>
                  </button>
                </div>

                {/* Sign Out Button */}
                <div className="p-2 border-t border-[#edebe9] bg-[#faf9f8]">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded transition"
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

      {/* Main Layout (Outlook App Rail + Folders + Message List + Reading Canvas) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Column 0: Outlook Slim Left App Rail (48px) - Desktop (lg+) only */}
        <aside className="hidden lg:flex w-12 bg-[#f3f2f1] border-r border-[#edebe9] flex-col justify-between items-center py-2 shrink-0 select-none">
          <div className="flex flex-col items-center gap-2 w-full">
            {/* Active Mail Icon with Outlook Blue Accent */}
            <div className="relative w-full flex justify-center py-1">
              <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#0078d4] rounded-r"></div>
              <button
                type="button"
                title="Mail"
                className="p-2 rounded hover:bg-[#edebe9] text-[#0078d4] transition"
              >
                <Mail className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar (Coming Soon) */}
            <button
              type="button"
              onClick={() => {
                setComingSoonModal({
                  isOpen: true,
                  title: 'Calendar & Scheduling',
                  subtitle: 'Seamlessly schedule meetings and sync events with your team',
                  icon: 'calendar',
                  phase: 'Phase 3 (Roadmap)',
                  features: [
                    'Personal & team shared calendars',
                    'CalDAV sync with iPhone, Android & Outlook',
                    'One-click meeting invites & .ics event RSVP',
                    'Timezone conversion & smart availability scheduling',
                  ],
                });
              }}
              title="Calendar (Coming Soon)"
              className="p-2 rounded hover:bg-[#edebe9] text-[#605e5c] hover:text-[#201f1e] transition relative group"
            >
              <Calendar className="w-5 h-5" />
              <span className="absolute left-full ml-2 px-2 py-1 bg-[#201f1e] text-white text-[11px] rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                Calendar (Coming Soon)
              </span>
            </button>

            {/* People & Groups (Coming Soon) */}
            <button
              type="button"
              onClick={() => {
                setComingSoonModal({
                  isOpen: true,
                  title: 'People, Groups & Contacts',
                  subtitle: 'Centralized address book and team distribution lists',
                  icon: 'users',
                  phase: 'Phase 3 (Roadmap)',
                  features: [
                    'Company-wide contact directory & custom groups',
                    'CardDAV contact sync with iOS & Android devices',
                    'Team distribution lists (sales@, support@, team@)',
                    'Smart contact search and automatic email auto-complete',
                  ],
                });
              }}
              title="People & Groups (Coming Soon)"
              className="p-2 rounded hover:bg-[#edebe9] text-[#605e5c] hover:text-[#201f1e] transition relative group"
            >
              <Users className="w-5 h-5" />
              <span className="absolute left-full ml-2 px-2 py-1 bg-[#201f1e] text-white text-[11px] rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                People & Groups (Coming Soon)
              </span>
            </button>

            {/* To Do / Tasks (Real Functional) */}
            <button
              type="button"
              onClick={() => setIsTaskPanelOpen(!isTaskPanelOpen)}
              title="To-Do & Tasks"
              className={`p-2 rounded hover:bg-[#edebe9] text-[#605e5c] hover:text-[#201f1e] transition relative group ${
                isTaskPanelOpen ? 'bg-[#edebe9] text-[#0078d4]' : ''
              }`}
            >
              <CheckSquare className="w-5 h-5" />
              {tasks.filter((t) => !t.completed).length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#0078d4] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {tasks.filter((t) => !t.completed).length}
                </span>
              )}
              <span className="absolute left-full ml-2 px-2 py-1 bg-[#201f1e] text-white text-[11px] rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                To-Do & Tasks ({tasks.filter((t) => !t.completed).length})
              </span>
            </button>
          </div>

          {/* Bottom Settings Icon */}
          <div className="w-full flex justify-center">
            {userEmail.startsWith('admin@') ? (
              <Link
                href="/admin"
                title="Settings & Admin"
                className="p-2 rounded hover:bg-[#edebe9] text-[#605e5c] hover:text-[#201f1e] transition"
              >
                <Settings className="w-5 h-5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                title="Settings"
                className="p-2 rounded hover:bg-[#edebe9] text-[#605e5c] hover:text-[#201f1e] transition"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>
        </aside>

        {/* Column 1: Outlook Folder Tree Pane (~240px) - Desktop / Tablet (md+) only */}
        <aside className="hidden md:flex w-56 lg:w-60 bg-[#f8f9fa] border-r border-[#edebe9] flex-col justify-between shrink-0 p-3 select-none text-[#201f1e]">
          <div>
            {/* Outlook Signature "+ New mail" Blue Button */}
            <button
              onClick={() => setIsComposeOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3.5 mb-3 rounded-full bg-[#0078d4] hover:bg-[#106ebe] text-white text-[13px] font-semibold shadow-sm transition active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>New mail</span>
            </button>

            {/* Folders Section */}
            <div>
              <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-[#605e5c] uppercase tracking-wider">
                <span>Folders</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#a19f9d]" />
              </div>

              <nav className="mt-1 space-y-0.5">
                {[
                  { id: 'inbox', label: 'Inbox', icon: Inbox, count: messages.filter((m) => m.unread).length },
                  { id: 'drafts', label: 'Drafts', icon: FileText },
                  { id: 'sent', label: 'Sent Items', icon: Send },
                  { id: 'archive', label: 'Archive', icon: Archive },
                  { id: 'junk', label: 'Junk Email', icon: AlertOctagon },
                  { id: 'trash', label: 'Deleted Items', icon: Trash2 },
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
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] transition ${isActive
                        ? 'bg-[#edebe9] font-semibold text-[#201f1e]'
                        : 'text-[#323130] hover:bg-[#edebe9]'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#0078d4]' : 'text-[#605e5c]'}`} />
                        <span>{f.label}</span>
                      </div>
                      {f.count !== undefined && f.count > 0 && (
                        <span className="text-[#0078d4] font-bold text-[11px] px-1.5 py-0.2 rounded-full bg-[#0078d4]/10">
                          {f.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Sidebar Storage Widget */}
          <div className="p-2.5 bg-white rounded-lg border border-[#edebe9]">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1.5 text-[#605e5c] font-medium">
                <HardDrive className="w-3.5 h-3.5 text-[#0078d4]" />
                Mailbox Quota
              </span>
              <span className="font-semibold text-[#201f1e]">10 GB</span>
            </div>
            <div className="w-full bg-[#edebe9] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#0078d4] h-full rounded-full w-[2%]"></div>
            </div>
          </div>
        </aside>

        {/* Column 2: Outlook Message List Pane (Full width on mobile when no email selected, hidden on mobile when reading) */}
        <section className={`${selectedMessage ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 bg-white border-r border-[#edebe9] flex-col shrink-0 select-none`}>
          {/* Header with Focused / Other (Unread / Flagged) Tabs */}
          <div className="border-b border-[#edebe9] bg-white">
            <div className="p-3 pb-1.5 flex items-center justify-between">
              <span className="font-bold text-base text-[#201f1e] capitalize flex items-center gap-2">
                {activeFolder === 'trash' ? 'Deleted Items' : activeFolder === 'junk' ? 'Junk Email' : activeFolder}
                <span className="text-xs font-normal text-[#605e5c]">({filteredMessages.length})</span>
              </span>

              {/* Filter Dropdown Button */}
              <div className="flex items-center gap-1 text-xs text-[#605e5c] hover:text-[#201f1e] cursor-pointer transition">
                <Filter className="w-3.5 h-3.5" />
                <span className="font-medium">Filter</span>
              </div>
            </div>

            {/* Outlook Focused / Other / Unread Tab Bar */}
            <div className="flex items-center px-3 gap-5 text-xs font-semibold text-[#605e5c]">
              <button
                onClick={() => setFilterTab('all')}
                className={`pb-2 transition relative ${filterTab === 'all'
                  ? 'text-[#201f1e] font-bold'
                  : 'hover:text-[#201f1e]'
                  }`}
              >
                <span>Focused</span>
                {filterTab === 'all' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0078d4] rounded-t"></span>
                )}
              </button>

              <button
                onClick={() => setFilterTab('unread')}
                className={`pb-2 transition relative ${filterTab === 'unread'
                  ? 'text-[#201f1e] font-bold'
                  : 'hover:text-[#201f1e]'
                  }`}
              >
                <span>Unread</span>
                {filterTab === 'unread' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0078d4] rounded-t"></span>
                )}
              </button>

              <button
                onClick={() => setFilterTab('flagged')}
                className={`pb-2 transition relative ${filterTab === 'flagged'
                  ? 'text-[#201f1e] font-bold'
                  : 'hover:text-[#201f1e]'
                  }`}
              >
                <span>Flagged</span>
                {filterTab === 'flagged' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0078d4] rounded-t"></span>
                )}
              </button>
            </div>
          </div>

          {/* Email Row List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#edebe9]">
            {isLoadingMessages && messages.length === 0 ? (
              <div className="p-8 text-center text-[#605e5c] text-xs">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0078d4]" />
                Loading messages...
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-[#605e5c] text-xs">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#605e5c]" />
                No messages found in this folder.
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.uid === msg.uid;
                return (
                  <div
                    key={msg.uid}
                    onClick={() => handleSelectMessage(msg)}
                    className={`group p-3 cursor-pointer transition relative ${isSelected
                      ? 'bg-[#f0f6ff] border-l-[3.5px] border-[#0078d4]'
                      : msg.unread
                        ? 'bg-white font-medium hover:bg-[#f3f2f1]'
                        : 'bg-white hover:bg-[#f3f2f1] text-[#323130]'
                      }`}
                  >
                    {/* Row 1: Sender Name & Date */}
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {msg.unread && (
                          <span className="w-2 h-2 rounded-full bg-[#0078d4] shrink-0" />
                        )}
                        <span className={`text-[13px] truncate ${msg.unread ? 'font-bold text-[#201f1e]' : 'font-medium text-[#323130]'}`}>
                          {msg.from.name || msg.from.address}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#605e5c] shrink-0 font-normal">{msg.date}</span>
                    </div>

                    {/* Row 2: Subject Line */}
                    <div className={`text-[12.5px] truncate mb-0.5 ${msg.unread ? 'font-semibold text-[#201f1e]' : 'text-[#323130]'}`}>
                      {msg.subject.match(/^re:\s*/i) ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#f3f2f1] text-[#605e5c] border border-[#edebe9]">
                            Re
                          </span>
                          <span className="truncate">{msg.subject.replace(/^re:\s*/i, '')}</span>
                        </span>
                      ) : (
                        msg.subject
                      )}
                    </div>

                    {/* Row 3: Snippet & Hover Quick Actions */}
                    <div className="flex items-center justify-between text-[11px] text-[#605e5c]">
                      <span className="truncate max-w-[220px] text-[#605e5c]">
                        {msg.snippet && msg.snippet !== msg.subject ? msg.snippet : (msg.subject.match(/^re:\s*/i) ? '' : msg.snippet)}
                      </span>
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          title="Delete message"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMessage(msg);
                          }}
                          className="p-1 rounded hover:bg-red-50 text-[#605e5c] hover:text-red-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title={msg.flagged ? "Remove Flag" : "Flag message"}
                          onClick={(e) => handleToggleFlag(e, msg)}
                          className="p-1 rounded hover:bg-[#edebe9] transition"
                        >
                          <Flag className={`w-3.5 h-3.5 ${msg.flagged ? 'text-amber-500 fill-amber-500' : 'text-[#605e5c] hover:text-amber-500'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Column 3: Outlook Reading Canvas (Full width on mobile when reading, hidden on mobile when viewing list) */}
        <main className={`${selectedMessage ? 'flex' : 'hidden md:flex'} flex-1 bg-white flex-col overflow-hidden`}>
          {selectedMessage ? (
            <div className="flex flex-1 flex-col h-full overflow-hidden">
              {/* Outlook Command Ribbon Toolbar */}
              <div className="px-3 sm:px-4 py-1.5 border-b border-[#edebe9] bg-[#faf9f8] flex items-center justify-between gap-2 shrink-0 select-none overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedMessage(null)}
                    className="md:hidden inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-[#edebe9] hover:bg-[#e1dfdd] text-[#201f1e] transition mr-1 shrink-0"
                    title="Back to inbox"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReplyToMessage(selectedMessage)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-[#0078d4] hover:bg-[#106ebe] text-white shadow-sm transition shrink-0"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleForwardMessage(selectedMessage)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded hover:bg-[#edebe9] text-[#201f1e] transition shrink-0"
                  >
                    <Forward className="w-3.5 h-3.5 text-[#605e5c]" />
                    <span>Forward</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteMessage(selectedMessage)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded hover:bg-red-50 text-red-600 transition shrink-0"
                    title="Delete message"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Delete</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleToggleRead(e, selectedMessage)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded hover:bg-[#edebe9] text-[#201f1e] transition shrink-0"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#605e5c]" />
                    <span>{selectedMessage.unread ? 'Mark Read' : 'Mark Unread'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleToggleFlag(e, selectedMessage)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition shrink-0 ${selectedMessage.flagged
                      ? 'bg-amber-50 text-amber-700'
                      : 'hover:bg-[#edebe9] text-[#201f1e]'
                      }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${selectedMessage.flagged ? 'fill-amber-500 text-amber-500' : 'text-[#605e5c]'}`} />
                    <span>{selectedMessage.flagged ? 'Flagged' : 'Flag'}</span>
                  </button>
                </div>

                <div className="text-right text-[#605e5c] text-xs font-medium shrink-0">
                  {selectedMessage.date}
                </div>
              </div>

              {/* Message Header & Content Scroll Canvas */}
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                  {/* Subject Title */}
                  <div className="border-b border-[#edebe9] pb-3 flex items-center gap-2.5">
                    {selectedMessage.subject.match(/^re:\s*/i) && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#f3f2f1] text-[#605e5c] border border-[#edebe9] shrink-0">
                        Re
                      </span>
                    )}
                    <h1 className="text-lg sm:text-xl font-bold text-[#201f1e] leading-snug">
                      {selectedMessage.subject.replace(/^re:\s*/i, '')}
                    </h1>
                  </div>

                  {/* Sender & Recipient Metadata Card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Outlook 365 Initial Avatar Circle */}
                      <div className="w-10 h-10 rounded-full bg-[#0078d4] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                        {(selectedMessage.from.name || selectedMessage.from.address)[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-[#201f1e] text-sm truncate">
                            {selectedMessage.from.name || selectedMessage.from.address}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Verified
                          </span>
                        </div>
                        <div className="text-xs text-[#605e5c] font-mono mt-0.5 flex items-center gap-2 truncate">
                          <span>&lt;{selectedMessage.from.address}&gt;</span>
                          <span className="text-[#a19f9d]">•</span>
                          <span className="text-[#605e5c] font-sans">to me</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Body Canvas */}
                  <div className="pt-2">
                    {selectedMessage.bodyHtml ? (
                      <div
                        className="prose prose-slate max-w-none text-[#201f1e] text-sm leading-relaxed break-words overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }}
                      />
                    ) : (
                      <div className="text-[#605e5c] text-xs italic">Loading message body...</div>
                    )}
                  </div>

                  {/* Attachments Section (Outlook / Gmail Style) */}
                  {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-[#edebe9]">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-[#0078d4]" />
                          <span className="text-xs font-semibold text-[#201f1e]">
                            Attachments ({selectedMessage.attachments.length})
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {selectedMessage.attachments.map((att, idx) => {
                          const isImg = att.contentType?.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(att.filename);
                          return (
                            <div
                              key={idx}
                              className="group relative flex items-center gap-2.5 p-2.5 rounded-lg border border-[#e1dfdd] bg-[#faf9f8] hover:bg-[#f3f2f1] hover:border-[#c8c6c4] transition shadow-xs"
                            >
                              {/* Thumbnail or File Icon */}
                              {isImg && att.dataUrl ? (
                                <div className="w-12 h-12 rounded-md overflow-hidden bg-white border border-[#edebe9] shrink-0 flex items-center justify-center">
                                  <img
                                    src={att.dataUrl}
                                    alt={att.filename}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-md bg-[#e1dfdd] flex items-center justify-center text-[#605e5c] shrink-0">
                                  <FileText className="w-6 h-6 text-[#0078d4]" />
                                </div>
                              )}

                              {/* Filename & Size */}
                              <div className="min-w-0 flex-1">
                                <div
                                  className="text-xs font-medium text-[#201f1e] truncate"
                                  title={att.filename}
                                >
                                  {att.filename}
                                </div>
                                <div className="text-[11px] text-[#605e5c] mt-0.5">
                                  {att.size || 'Attachment'}
                                </div>
                              </div>

                              {/* Download Link/Button */}
                              {att.dataUrl && (
                                <a
                                  href={att.dataUrl}
                                  download={att.filename}
                                  className="p-1.5 rounded-md hover:bg-[#edebe9] text-[#605e5c] hover:text-[#0078d4] transition shrink-0"
                                  title={`Download ${att.filename}`}
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Outlook Bottom Quick Action Buttons */}
                  <div className="mt-8 pt-4 border-t border-[#edebe9] flex items-center gap-2.5 flex-wrap">
                    <button
                      onClick={() => handleReplyToMessage(selectedMessage)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-[#8a8886] hover:bg-[#f3f2f1] text-[#201f1e] text-xs font-semibold shadow-sm transition"
                    >
                      <Reply className="w-3.5 h-3.5 text-[#605e5c]" />
                      <span>Reply</span>
                    </button>
                    <button
                      onClick={() => handleForwardMessage(selectedMessage)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-[#8a8886] hover:bg-[#f3f2f1] text-[#201f1e] text-xs font-semibold shadow-sm transition"
                    >
                      <Forward className="w-3.5 h-3.5 text-[#605e5c]" />
                      <span>Forward</span>
                    </button>
                    <button
                      onClick={() => handleCreateTaskFromEmail(selectedMessage)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-[#0078d4] hover:bg-blue-50 text-[#0078d4] text-xs font-semibold shadow-sm transition"
                      title="Convert this email into a To-Do reminder"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-[#0078d4]" />
                      <span>Add to To-Do</span>
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(selectedMessage)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold shadow-sm transition"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#605e5c] p-8 text-center select-none">
              <Mail className="w-12 h-12 mb-3 text-[#a19f9d]" />
              <h3 className="font-semibold text-[#201f1e] text-sm">Select an item to read</h3>
              <p className="text-xs text-[#605e5c] mt-1 max-w-xs">
                Click on any email from your inbox to preview its content here.
              </p>
            </div>
          )}
        </main>

        {/* Mobile Floating Compose Action Button */}
        {!selectedMessage && (
          <button
            type="button"
            onClick={() => setIsComposeOpen(true)}
            className="md:hidden fixed bottom-6 right-5 z-40 w-14 h-14 rounded-full bg-[#0078d4] hover:bg-[#106ebe] text-white shadow-2xl flex items-center justify-center active:scale-95 transition"
            title="New mail"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Mobile Drawer (Slide-Over for Folders & Navigation) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer Content */}
          <div className="relative w-72 max-w-[80vw] bg-[#f8f9fa] h-full shadow-2xl flex flex-col justify-between p-4 z-10 animate-in slide-in-from-left duration-200 select-none">
            <div>
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#edebe9]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-[#0078d4] text-white flex items-center justify-center font-bold text-xs">
                    FF
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#201f1e] leading-tight">FlutterFlirt Mail</div>
                    <div className="text-[11px] text-[#605e5c] truncate max-w-[150px]">{userEmail}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[#edebe9] text-[#605e5c] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Compose Button */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsComposeOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 mb-4 rounded-full bg-[#0078d4] hover:bg-[#106ebe] text-white text-[13px] font-semibold shadow-sm transition active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>New mail</span>
              </button>

              {/* Folders Navigation */}
              <div className="px-2 py-1 text-[11px] font-bold text-[#605e5c] uppercase tracking-wider mb-1">
                Folders
              </div>
              <nav className="space-y-0.5">
                {[
                  { id: 'inbox', label: 'Inbox', icon: Inbox, count: messages.filter((m) => m.unread).length },
                  { id: 'drafts', label: 'Drafts', icon: FileText },
                  { id: 'sent', label: 'Sent Items', icon: Send },
                  { id: 'archive', label: 'Archive', icon: Archive },
                  { id: 'junk', label: 'Junk Email', icon: AlertOctagon },
                  { id: 'trash', label: 'Deleted Items', icon: Trash2 },
                ].map((f) => {
                  const Icon = f.icon;
                  const isActive = activeFolder === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => {
                        setActiveFolder(f.id);
                        setSelectedMessage(null);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition ${isActive
                        ? 'bg-[#edebe9] font-semibold text-[#201f1e]'
                        : 'text-[#323130] hover:bg-[#edebe9]'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#0078d4]' : 'text-[#605e5c]'}`} />
                        <span>{f.label}</span>
                      </div>
                      {f.count !== undefined && f.count > 0 && (
                        <span className="text-[#0078d4] font-bold text-[11px] px-1.5 py-0.2 rounded-full bg-[#0078d4]/10">
                          {f.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Workspace Coming Soon on Mobile */}
              <div className="mt-3 pt-2 border-t border-[#edebe9]">
                <div className="px-2 py-1 text-[11px] font-bold text-[#605e5c] uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Workspace</span>
                  <span className="text-[10px] bg-blue-100 text-[#0078d4] font-semibold px-1.5 py-0.2 rounded-full">Coming Soon</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setComingSoonModal({
                      isOpen: true,
                      title: 'Calendar & Scheduling',
                      subtitle: 'Seamlessly schedule meetings and sync events with your team',
                      icon: 'calendar',
                      phase: 'Phase 3 (Roadmap)',
                      features: [
                        'Personal & team shared calendars',
                        'CalDAV sync with iPhone, Android & Outlook',
                        'One-click meeting invites & .ics event RSVP',
                      ],
                    });
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] text-[#323130] hover:bg-[#edebe9] transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-[#0078d4]" />
                    <span>Calendar</span>
                  </div>
                  <span className="text-[10px] text-[#a19f9d] font-medium">Soon</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setComingSoonModal({
                      isOpen: true,
                      title: 'People, Groups & Contacts',
                      subtitle: 'Centralized address book and team distribution lists',
                      icon: 'users',
                      phase: 'Phase 3 (Roadmap)',
                      features: [
                        'Company-wide contact directory & custom groups',
                        'CardDAV contact sync with iOS & Android devices',
                        'Team distribution lists (sales@, support@, team@)',
                      ],
                    });
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] text-[#323130] hover:bg-[#edebe9] transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-[#0078d4]" />
                    <span>Contacts & Groups</span>
                  </div>
                  <span className="text-[10px] text-[#a19f9d] font-medium">Soon</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsTaskPanelOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] text-[#323130] hover:bg-[#edebe9] transition"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4 text-[#0078d4]" />
                    <span>To-Do & Tasks</span>
                  </div>
                  {tasks.filter((t) => !t.completed).length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0078d4] text-white">
                      {tasks.filter((t) => !t.completed).length}
                    </span>
                  )}
                </button>
              </div>

              {/* Admin Link if admin */}
              {userEmail.startsWith('admin@') && (
                <div className="mt-3 pt-2 border-t border-[#edebe9]">
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[#201f1e] hover:bg-[#edebe9] transition font-medium"
                  >
                    <Settings className="w-4 h-4 text-[#605e5c]" />
                    <span>Admin Console & DNS</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Bottom Mailbox Quota & Sign Out */}
            <div className="pt-3 border-t border-[#edebe9] space-y-3">
              <div className="p-3 bg-white rounded-lg border border-[#edebe9]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 text-[#605e5c] font-medium">
                    <HardDrive className="w-4 h-4 text-[#0078d4]" />
                    Mailbox Quota
                  </span>
                  <span className="font-semibold text-[#201f1e]">10 GB</span>
                </div>
                <div className="w-full bg-[#edebe9] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#0078d4] h-full rounded-full w-[2%]"></div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition border border-rose-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modern Rich Floating Compose Window (Matches Second Image) */}
      {isComposeOpen && (
        <>
          {/* Minimized Docked Bar */}
          {composeWindowMode === 'minimized' ? (
            <div
              onClick={() => setComposeWindowMode('normal')}
              className="fixed bottom-0 right-6 sm:right-16 w-64 h-10 bg-white border border-[#dadce0] rounded-t-lg shadow-xl flex items-center justify-between px-3 cursor-pointer z-50 hover:bg-[#f8fafd] transition select-none"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="w-4 h-4 text-[#0b57d0] shrink-0" />
                <span className="text-xs font-semibold text-[#1f1f1f] truncate">
                  {composeSubject.trim() || 'New Message'}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 text-[#444746]" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  title="Restore window"
                  onClick={() => setComposeWindowMode('normal')}
                  className="p-1 rounded hover:bg-slate-200/60"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Close"
                  onClick={() => setIsComposeOpen(false)}
                  className="p-1 rounded hover:bg-slate-200/60"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`fixed z-50 bg-white shadow-2xl border border-[#dadce0] flex flex-col overflow-hidden transition-all duration-200 ${composeWindowMode === 'fullscreen'
                ? 'inset-0 sm:inset-8 rounded-none sm:rounded-xl'
                : 'inset-0 sm:inset-auto sm:bottom-0 sm:right-12 sm:w-[620px] sm:h-[600px] rounded-none sm:rounded-t-xl'
                }`}
            >
              {/* Window Header */}
              <div className="px-4 py-2.5 bg-[#f2f6fc] border-b border-[#dadce0] flex items-center justify-between select-none">
                <span className="font-semibold text-sm text-[#1f1f1f] truncate">
                  {composeSubject.trim() || 'New Message'}
                </span>
                <div className="flex items-center gap-1 text-[#444746]">
                  {/* Minimize */}
                  <button
                    type="button"
                    title="Minimize"
                    onClick={() => setComposeWindowMode('minimized')}
                    className="p-1.5 rounded hover:bg-[#e0e5ed] transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  {/* Expand / Restore */}
                  <button
                    type="button"
                    title={composeWindowMode === 'fullscreen' ? 'Exit Fullscreen' : 'Fullscreen'}
                    onClick={() =>
                      setComposeWindowMode(composeWindowMode === 'fullscreen' ? 'normal' : 'fullscreen')
                    }
                    className="p-1.5 rounded hover:bg-[#e0e5ed] transition"
                  >
                    {composeWindowMode === 'fullscreen' ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {/* Close */}
                  <button
                    type="button"
                    title="Save & Close"
                    onClick={() => setIsComposeOpen(false)}
                    className="p-1.5 rounded hover:bg-[#e0e5ed] transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Form Fields Header */}
              <div className="flex flex-col text-sm text-[#1f1f1f]">
                {/* Recipients Row: To + Cc / Bcc buttons */}
                <div className="flex items-center px-4 py-2 border-b border-[#f1f3f4] gap-2">
                  <span className="text-[#444746] font-medium w-8 shrink-0">To</span>
                  <input
                    type="email"
                    required
                    placeholder="Recipients"
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    className="flex-1 bg-transparent py-0.5 text-sm text-[#1f1f1f] placeholder-[#747775] focus:outline-none"
                  />
                  <div className="flex items-center gap-2 shrink-0 text-sm font-medium text-[#444746] select-none">
                    {!showCc && (
                      <button
                        type="button"
                        onClick={() => setShowCc(true)}
                        className="hover:text-[#0b57d0] hover:underline"
                      >
                        Cc
                      </button>
                    )}
                    {!showBcc && (
                      <button
                        type="button"
                        onClick={() => setShowBcc(true)}
                        className="hover:text-[#0b57d0] hover:underline"
                      >
                        Bcc
                      </button>
                    )}
                  </div>
                </div>

                {/* Optional Cc Row */}
                {showCc && (
                  <div className="flex items-center px-4 py-1.5 border-b border-[#f1f3f4] gap-2">
                    <span className="text-[#444746] font-medium w-8 shrink-0">Cc</span>
                    <input
                      type="email"
                      placeholder="Cc recipients"
                      value={composeCc}
                      onChange={(e) => setComposeCc(e.target.value)}
                      className="flex-1 bg-transparent py-0.5 text-sm text-[#1f1f1f] placeholder-[#747775] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowCc(false);
                        setComposeCc('');
                      }}
                      className="text-[#747775] hover:text-[#1f1f1f] p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Optional Bcc Row */}
                {showBcc && (
                  <div className="flex items-center px-4 py-1.5 border-b border-[#f1f3f4] gap-2">
                    <span className="text-[#444746] font-medium w-8 shrink-0">Bcc</span>
                    <input
                      type="email"
                      placeholder="Bcc recipients"
                      value={composeBcc}
                      onChange={(e) => setComposeBcc(e.target.value)}
                      className="flex-1 bg-transparent py-0.5 text-sm text-[#1f1f1f] placeholder-[#747775] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowBcc(false);
                        setComposeBcc('');
                      }}
                      className="text-[#747775] hover:text-[#1f1f1f] p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Subject Row */}
                <div className="flex items-center px-4 py-2 border-b border-[#dadce0]">
                  <input
                    type="text"
                    placeholder="Subject"
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="w-full bg-transparent py-0.5 text-sm font-medium text-[#1f1f1f] placeholder-[#747775] focus:outline-none"
                  />
                </div>
              </div>

              {/* Message Body Canvas (ContentEditable for Live Rich Text WYSIWYG) */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                {/* Confidential Mode Active Banner */}
                {isConfidential && (
                  <div className="mb-3 px-3 py-2 bg-[#e8f0fe] border border-[#d3e3fd] rounded-lg flex items-center justify-between text-xs text-[#041e49] shrink-0">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-[#0b57d0]" />
                      <span>
                        Confidential mode: Content expires in <b>{confidentialExpiry}</b>. Forwarding and copying disabled.
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setShowConfidentialModal(true)}
                        className="text-[#0b57d0] font-semibold hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsConfidential(false);
                          showToast('Confidential mode disabled', 'info');
                        }}
                        className="text-[#5f6368] hover:text-rose-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => setComposeBody(e.currentTarget.innerHTML)}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    // 1. Cut button click (Top right on image)
                    const cutBtn = target.closest('.ffmail-img-cut-btn');
                    if (cutBtn) {
                      e.preventDefault();
                      e.stopPropagation();
                      const wrapper = cutBtn.closest('.ffmail-img-wrapper');
                      if (wrapper) {
                        wrapper.remove();
                        if (editorRef.current) setComposeBody(editorRef.current.innerHTML);
                        showToast('Image cut / removed.', 'info');
                      }
                      return;
                    }
                    // 2. Resize buttons click (S, M, L)
                    const sizeBtn = target.closest('.ffmail-img-size-btn') as HTMLElement;
                    if (sizeBtn) {
                      e.preventDefault();
                      e.stopPropagation();
                      const size = sizeBtn.getAttribute('data-size');
                      const wrapper = sizeBtn.closest('.ffmail-img-wrapper') as HTMLElement;
                      if (wrapper && size) {
                        wrapper.style.maxWidth = size;
                        const img = wrapper.querySelector('img');
                        if (img) {
                          img.style.maxHeight = size === '200px' ? '180px' : size === '340px' ? '280px' : '420px';
                        }
                        if (editorRef.current) setComposeBody(editorRef.current.innerHTML);
                        showToast(`Image resized to ${size}`, 'info');
                      }
                    }
                  }}
                  className="flex-1 min-h-[160px] outline-none text-xs leading-relaxed text-[#1f1f1f] font-sans"
                  style={{ wordBreak: 'break-word' }}
                />

                {/* Attachments Pills */}
                {attachments.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#f1f3f4] flex flex-wrap gap-2">
                    {attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-[#f2f6fc] border border-[#d3e3fd] text-[#0b57d0] px-2.5 py-1 rounded text-[11px] font-medium"
                      >
                        <Paperclip className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">{att.name}</span>
                        <span className="text-[#747775]">({att.size})</span>
                        <button
                          type="button"
                          onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                          className="hover:text-red-500 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rich Text Formatting Toolbar (Responsive on Mobile with Touch Scroll) */}
              {showFormatBar && (
                <div
                  className="mx-2 sm:mx-3 mb-2 px-2 py-1 bg-[#edf2fa] border border-[#d3e3fd] rounded-lg flex items-center gap-1 sm:gap-1 text-[#444746] text-xs select-none relative overflow-x-auto no-scrollbar touch-pan-x"
                >
                  {/* Font Family Select */}
                  <select
                    onChange={(e) => formatText('fontName', e.target.value)}
                    className="shrink-0 bg-transparent hover:bg-white/80 rounded px-1.5 py-0.5 text-[11px] font-medium focus:outline-none cursor-pointer max-w-[85px] sm:max-w-none truncate"
                    defaultValue="Sans-Serif"
                  >
                    <option value="Arial, sans-serif">Sans Serif</option>
                    <option value="Georgia, serif">Serif</option>
                    <option value="'Courier New', monospace">Fixed Width</option>
                    <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                    <option value="Verdana, sans-serif">Verdana</option>
                  </select>

                  <div className="w-[1px] h-3.5 bg-[#c4c7c5] mx-0.5 shrink-0"></div>

                  {/* Font Size Select */}
                  <select
                    onChange={(e) => formatText('fontSize', e.target.value)}
                    className="shrink-0 bg-transparent hover:bg-white/80 rounded px-1.5 py-0.5 text-[11px] font-medium focus:outline-none cursor-pointer max-w-[70px] sm:max-w-none truncate"
                    defaultValue="3"
                  >
                    <option value="1">Small</option>
                    <option value="3">Normal</option>
                    <option value="5">Large</option>
                    <option value="7">Huge</option>
                  </select>

                  <div className="w-[1px] h-3.5 bg-[#c4c7c5] mx-0.5 shrink-0"></div>

                  {/* Bold */}
                  <button
                    type="button"
                    title="Bold (Ctrl+B)"
                    onClick={() => formatText('bold')}
                    className="shrink-0 p-1.5 sm:p-1 rounded hover:bg-white/80 font-bold"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>

                  {/* Italic */}
                  <button
                    type="button"
                    title="Italic (Ctrl+I)"
                    onClick={() => formatText('italic')}
                    className="shrink-0 p-1.5 sm:p-1 rounded hover:bg-white/80 italic"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>

                  {/* Underline */}
                  <button
                    type="button"
                    title="Underline (Ctrl+U)"
                    onClick={() => formatText('underline')}
                    className="shrink-0 p-1.5 sm:p-1 rounded hover:bg-white/80 underline"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>

                  {/* Strikethrough */}
                  <button
                    type="button"
                    title="Strikethrough"
                    onClick={() => formatText('strikeThrough')}
                    className="shrink-0 p-1.5 sm:p-1 rounded hover:bg-white/80"
                  >
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-[1px] h-3.5 bg-[#c4c7c5] mx-0.5 shrink-0"></div>

                  {/* Color Palette Triggers (Text & Background Color) */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    {/* 1. Font Color Button (A ▾) */}
                    <button
                      type="button"
                      title="Text color"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className={`px-1.5 py-1 flex items-center gap-0.5 rounded transition ${showColorPicker ? 'bg-[#d3e3fd] text-[#041e49]' : 'hover:bg-white/90 text-[#201f1e]'
                        }`}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-bold text-xs leading-none text-[#201f1e]">A</span>
                        <span
                          className="w-3.5 h-[3px] rounded-full mt-0.5"
                          style={{ backgroundColor: currentTextColor }}
                        />
                      </div>
                      <ChevronDown className="w-2.5 h-2.5 text-[#444746]" />
                    </button>

                    {/* 2. Highlight Color Button (✏️ ▾) */}
                    <button
                      type="button"
                      title="Highlight color"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className={`px-1.5 py-1 flex items-center gap-0.5 rounded transition ${showColorPicker ? 'bg-[#d3e3fd]' : 'hover:bg-white/90'
                        }`}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Pencil className="w-3.5 h-3.5 text-[#444746]" />
                        <span
                          className="w-3.5 h-[2.5px] rounded-full mt-0.5"
                          style={{ backgroundColor: currentBgColor === 'transparent' ? '#0078d4' : currentBgColor }}
                        />
                      </div>
                      <ChevronDown className="w-2.5 h-2.5 text-[#444746]" />
                    </button>
                  </div>

                  {/* Dual-Column Professional Color Popover (Exact Match to User's Uploaded Image) */}
                  {showColorPicker && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowColorPicker(false)}
                      />
                      <div className="absolute bottom-full mb-2 left-0 sm:left-4 right-0 sm:right-auto mx-1 sm:mx-0 bg-white border border-[#dadce0] rounded-xl shadow-2xl p-3 sm:p-4 z-50 select-none animate-in fade-in zoom-in-95 duration-150 max-h-[75vh] overflow-y-auto">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                          {/* Left Column: Background colour */}
                          <div>
                            <div className="text-sm font-normal text-[#202124] mb-3">
                              Background colour
                            </div>

                            {/* Grayscale Row (7 squares) */}
                            <div className="flex items-center gap-[3px] mb-1.5">
                              {PALETTE_GRAYSCALE.map((color, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  title={color}
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => applyHighlightColor(color)}
                                  className={`w-[17px] h-[17px] rounded-[2px] transition hover:scale-125 cursor-pointer ${color === '#efefef' || color === '#ffffff' ? 'border border-[#dadce0]' : ''
                                    }`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>

                            {/* Saturated Rainbow Row (8 squares) */}
                            <div className="flex items-center gap-[3px] mb-1.5">
                              {PALETTE_HUES.map((color, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  title={color}
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => applyHighlightColor(color)}
                                  className="w-[17px] h-[17px] rounded-[2px] transition hover:scale-125 cursor-pointer"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>

                            {/* Matrix (8 columns x 6 rows) */}
                            <div className="flex flex-col gap-[3px]">
                              {PALETTE_MATRIX.map((row, rIdx) => (
                                <div key={rIdx} className="flex items-center gap-[3px]">
                                  {row.map((color, cIdx) => (
                                    <button
                                      key={cIdx}
                                      type="button"
                                      title={color}
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => applyHighlightColor(color)}
                                      className="w-[17px] h-[17px] rounded-[2px] transition hover:scale-125 cursor-pointer"
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Right Column: Text colour */}
                          <div>
                            <div className="text-sm font-normal text-[#202124] mb-3">
                              Text colour
                            </div>

                            {/* Grayscale Row (7 squares) */}
                            <div className="flex items-center gap-[3px] mb-1.5">
                              {PALETTE_GRAYSCALE.map((color, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  title={color}
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => applyTextColor(color)}
                                  className={`w-[17px] h-[17px] rounded-[2px] transition hover:scale-125 cursor-pointer ${color === '#efefef' || color === '#ffffff' ? 'border border-[#dadce0]' : ''
                                    }`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>

                            {/* Saturated Rainbow Row (8 squares) */}
                            <div className="flex items-center gap-[3px] mb-1.5">
                              {PALETTE_HUES.map((color, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  title={color}
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => applyTextColor(color)}
                                  className="w-[17px] h-[17px] rounded-[2px] transition hover:scale-125 cursor-pointer"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>

                            {/* Matrix (8 columns x 6 rows) */}
                            <div className="flex flex-col gap-[3px]">
                              {PALETTE_MATRIX.map((row, rIdx) => (
                                <div key={rIdx} className="flex items-center gap-[3px]">
                                  {row.map((color, cIdx) => (
                                    <button
                                      key={cIdx}
                                      type="button"
                                      title={color}
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => applyTextColor(color)}
                                      className="w-[17px] h-[17px] rounded-[2px] transition hover:scale-125 cursor-pointer"
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="w-[1px] h-3.5 bg-[#c4c7c5] mx-0.5 shrink-0"></div>

                  {/* Align Left */}
                  <button
                    type="button"
                    title="Align Left"
                    onClick={() => formatText('justifyLeft')}
                    className="shrink-0 p-1 rounded hover:bg-white/80"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>

                  {/* Align Center */}
                  <button
                    type="button"
                    title="Align Center"
                    onClick={() => formatText('justifyCenter')}
                    className="shrink-0 p-1 rounded hover:bg-white/80"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>

                  {/* Align Right */}
                  <button
                    type="button"
                    title="Align Right"
                    onClick={() => formatText('justifyRight')}
                    className="shrink-0 p-1 rounded hover:bg-white/80"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-[1px] h-3.5 bg-[#c4c7c5] mx-0.5 shrink-0"></div>

                  {/* Numbered List */}
                  <button
                    type="button"
                    title="Numbered List"
                    onClick={() => formatText('insertOrderedList')}
                    className="shrink-0 p-1 rounded hover:bg-white/80"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>

                  {/* Bulleted List */}
                  <button
                    type="button"
                    title="Bulleted List"
                    onClick={() => formatText('insertUnorderedList')}
                    className="shrink-0 p-1 rounded hover:bg-white/80"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>

                  {/* Quote */}


                  {/* Remove Formatting */}
                  <button
                    type="button"
                    title="Clear Formatting"
                    onClick={() => formatText('removeFormat')}
                    className="shrink-0 p-1 rounded hover:bg-white/80"
                  >
                    <RemoveFormatting className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Bottom Action Bar (Image 2 style) */}
              <div className="px-4 py-2.5 border-t border-[#dadce0] bg-white flex items-center justify-between select-none relative">
                {/* Left: Send Button + Action Icons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Send Button with Split Dropdown */}
                  <div className="relative inline-flex rounded-full shadow-sm">
                    <button
                      type="button"
                      disabled={isSending}
                      onClick={() => handleSendMessage()}
                      className="bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-semibold px-4 py-2 rounded-l-full flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>Send</span>
                      )}
                    </button>
                    <button
                      type="button"
                      title="Schedule send"
                      className="bg-[#0b57d0] hover:bg-[#0842a0] text-white px-2 py-2 rounded-r-full border-l border-blue-600 transition"
                      onClick={() => setShowScheduleMenu(!showScheduleMenu)}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Schedule Send Dropdown Menu */}
                    {showScheduleMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowScheduleMenu(false)} />
                        <div className="absolute bottom-11 left-0 bg-white border border-[#dadce0] rounded-xl shadow-2xl py-2 z-50 w-56 text-xs text-[#202124] animate-in fade-in zoom-in-95 duration-100">
                          <div className="px-3 py-1.5 text-[11px] font-semibold text-[#5f6368] uppercase tracking-wider">
                            Schedule send
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowScheduleMenu(false);
                              showToast('Message scheduled for tomorrow morning (8:00 AM)', 'info');
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-[#f1f3f4] flex items-center justify-between transition"
                          >
                            <span>Tomorrow morning</span>
                            <span className="text-[11px] text-[#5f6368]">8:00 AM</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowScheduleMenu(false);
                              showToast('Message scheduled for tomorrow afternoon (1:00 PM)', 'info');
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-[#f1f3f4] flex items-center justify-between transition"
                          >
                            <span>Tomorrow afternoon</span>
                            <span className="text-[11px] text-[#5f6368]">1:00 PM</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowScheduleMenu(false);
                              showToast('Message scheduled for Monday morning (8:00 AM)', 'info');
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-[#f1f3f4] flex items-center justify-between transition"
                          >
                            <span>Monday morning</span>
                            <span className="text-[11px] text-[#5f6368]">8:00 AM</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* T Toggle Format Bar (Image Style) */}
                  <button
                    type="button"
                    title="Formatting options"
                    onClick={() => setShowFormatBar(!showFormatBar)}
                    className={`w-7 h-7 rounded-full transition flex items-center justify-center ${showFormatBar ? 'bg-[#d3e3fd] text-[#0b57d0]' : 'hover:bg-[#f1f3f4] text-[#444746]'
                      }`}
                  >
                    <span className="font-serif text-sm font-semibold leading-none">T</span>
                  </button>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* 1. Attachment Paperclip */}
                  <button
                    type="button"
                    title="Attach files"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#444746] transition"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* 2. Insert Link (Professional Dialog) */}
                  <button
                    type="button"
                    title="Insert link (Ctrl+K)"
                    onClick={handleOpenLinkModal}
                    className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#444746] transition"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>

                  {/* 3. Insert Emoji (Categorized Popup) */}
                  <div className="relative">
                    <button
                      type="button"
                      title="Insert emoji"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`p-2 rounded-full transition ${showEmojiPicker ? 'bg-[#d3e3fd] text-[#0b57d0]' : 'hover:bg-[#f1f3f4] text-[#444746]'
                        }`}
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    {showEmojiPicker && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
                        <div className="absolute bottom-11 left-0 bg-white border border-[#dadce0] rounded-xl shadow-2xl p-3 z-50 w-64 select-none animate-in fade-in zoom-in-95 duration-100">
                          <div className="text-[11px] font-semibold text-[#5f6368] mb-2 uppercase tracking-wider">
                            Popular Emojis
                          </div>
                          <div className="grid grid-cols-6 gap-1 place-items-center">
                            {[
                              '😊', '😂', '👍', '❤️', '🎉', '🔥',
                              '✨', '💼', '🚀', '🙏', '💯', '👏',
                              '🤝', '⭐', '💡', '✅', '📌', '✉️',
                              '😃', '🥳', '🙌', '🎯', '💪', '👌',
                            ].map((emo) => (
                              <button
                                key={emo}
                                type="button"
                                className="text-lg hover:scale-130 transition p-1.5 rounded hover:bg-[#f1f3f4]"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  formatText('insertText', emo);
                                  setShowEmojiPicker(false);
                                }}
                              >
                                {emo}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* 4. Google Drive (Authentic SVG Logo & Drive Picker Modal) */}
                  <button
                    type="button"
                    title="Insert files using Google Drive"
                    onClick={() => setShowDriveModal(true)}
                    className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#444746] transition flex items-center justify-center"
                  >
                    <svg
                      className="w-[18px] h-[18px] text-[#444746]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2.5a2 2 0 0 1 1.73 1l7.5 13a2 2 0 0 1-1.73 3H4.5a2 2 0 0 1-1.73-3l7.5-13a2 2 0 0 1 1.73-1z" />
                      <path d="M12 8.5l3.8 6.5H8.2L12 8.5z" />
                    </svg>
                  </button>

                  {/* 5. Insert Photo (Upload from computer & Web address URL) */}
                  <button
                    type="button"
                    title="Insert photo"
                    onClick={() => setShowPhotoModal(true)}
                    className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#444746] transition"
                  >
                    <Image className="w-4 h-4" />
                  </button>

                  {/* 6. Toggle Confidential Mode / Lock */}
                  <button
                    type="button"
                    title="Toggle confidential mode"
                    onClick={() => setShowConfidentialModal(true)}
                    className={`p-2 rounded-full transition ${isConfidential ? 'bg-[#d3e3fd] text-[#0b57d0]' : 'hover:bg-[#f1f3f4] text-[#444746]'
                      }`}
                  >
                    <Lock className="w-4 h-4" />
                  </button>

                  {/* 7. Insert Signature (Dropdown Menu & Manage Dialog) */}
                  <div className="relative">
                    <button
                      type="button"
                      title="Insert signature"
                      onClick={() => setShowSignatureMenu(!showSignatureMenu)}
                      className={`p-2 rounded-full transition ${showSignatureMenu ? 'bg-[#d3e3fd] text-[#0b57d0]' : 'hover:bg-[#f1f3f4] text-[#444746]'
                        }`}
                    >
                      <PenTool className="w-4 h-4" />
                    </button>

                    {showSignatureMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowSignatureMenu(false)} />
                        <div className="absolute bottom-11 left-0 bg-white border border-[#dadce0] rounded-xl shadow-2xl py-2 z-50 w-56 text-xs text-[#202124] animate-in fade-in zoom-in-95 duration-100">
                          <div className="px-3 py-1.5 text-[11px] font-semibold text-[#5f6368] uppercase tracking-wider">
                            Signature
                          </div>
                          <button
                            type="button"
                            onClick={handleInsertSignature}
                            className="w-full text-left px-4 py-2 hover:bg-[#f1f3f4] flex items-center gap-2 transition"
                          >
                            <PenTool className="w-3.5 h-3.5 text-[#0b57d0]" />
                            <span>Insert {savedSignature ? 'Custom' : 'Default'} Signature</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowSignatureMenu(false);
                              setShowSignatureModal(true);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-[#f1f3f4] flex items-center gap-2 border-t border-[#edebe9] text-[#5f6368] hover:text-[#1f1f1f] transition"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <span>Manage Signatures...</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* 8. More Options Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      title="More options"
                      onClick={() => setShowMoreMenu(!showMoreMenu)}
                      className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#444746] transition"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {showMoreMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                        <div className="absolute bottom-11 left-0 bg-white border border-[#dadce0] rounded-xl shadow-2xl py-1.5 z-50 w-48 text-xs text-[#202124] animate-in fade-in zoom-in-95 duration-100">
                          <button
                            type="button"
                            onClick={() => {
                              setShowMoreMenu(false);
                              handleSaveDraft();
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-[#f1f3f4] flex items-center gap-2 transition"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#5f6368]" />
                            <span>Save as draft</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowMoreMenu(false);
                              showToast('Spell check: No errors found.', 'success');
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-[#f1f3f4] flex items-center gap-2 transition"
                          >
                            <CheckSquare className="w-3.5 h-3.5 text-[#5f6368]" />
                            <span>Check spelling</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowMoreMenu(false);
                              showToast('Read receipt will be requested.', 'info');
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-[#f1f3f4] flex items-center gap-2 transition"
                          >
                            <Mail className="w-3.5 h-3.5 text-[#5f6368]" />
                            <span>Request read receipt</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Discard Draft Trash Button */}
                <button
                  type="button"
                  title="Discard draft"
                  onClick={() => {
                    setIsComposeOpen(false);
                    setComposeTo('');
                    setComposeCc('');
                    setComposeBcc('');
                    setShowCc(false);
                    setShowBcc(false);
                    setComposeSubject('');
                    setComposeBody('');
                    setAttachments([]);
                    setIsConfidential(false);
                    if (editorRef.current) editorRef.current.innerHTML = '';
                    showToast('Draft discarded.', 'info');
                  }}
                  className="p-2 rounded-full hover:bg-rose-50 text-[#444746] hover:text-rose-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* -------------------- MODALS & DIALOGS (Zero Browser Alerts) -------------------- */}

      {/* 1. Insert Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-[#dadce0] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 select-none">
            <div className="px-5 py-3.5 border-b border-[#dadce0] flex items-center justify-between bg-[#f8fafd]">
              <h3 className="text-sm font-semibold text-[#202124] flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#0b57d0]" />
                <span>Insert link</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-[#5f6368] hover:text-[#202124] p-1 rounded-full hover:bg-gray-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#444746] mb-1.5">
                  Text to display
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. FlutterFlirt Mail or Click here"
                  className="w-full px-3 py-2 border border-[#dadce0] rounded-lg text-xs text-[#1f1f1f] focus:outline-none focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#444746] mb-1.5">
                  Web address (URL)
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://codeaddabot.in"
                  className="w-full px-3 py-2 border border-[#dadce0] rounded-lg text-xs text-[#1f1f1f] focus:outline-none focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0]"
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-[#f8fafd] border-t border-[#dadce0] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-1.5 text-xs font-medium text-[#444746] hover:bg-[#eaeef4] rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyLink}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0b57d0] hover:bg-[#0842a0] rounded-lg transition shadow-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Insert Photo Modal (Upload file & Web URL) */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-[#dadce0] w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 select-none">
            <div className="px-5 py-3.5 border-b border-[#dadce0] flex items-center justify-between bg-[#f8fafd]">
              <h3 className="text-sm font-semibold text-[#202124] flex items-center gap-2">
                <Image className="w-4 h-4 text-[#0b57d0]" />
                <span>Insert photo</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowPhotoModal(false);
                  setPhotoPreview(null);
                  setPhotoUrl('');
                }}
                className="text-[#5f6368] hover:text-[#202124] p-1 rounded-full hover:bg-gray-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs: Upload / Web URL */}
            <div className="flex border-b border-[#dadce0] px-5 pt-2 bg-[#f8fafd]">
              <button
                type="button"
                onClick={() => setPhotoTab('upload')}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${photoTab === 'upload'
                  ? 'border-[#0b57d0] text-[#0b57d0]'
                  : 'border-transparent text-[#5f6368] hover:text-[#1f1f1f]'
                  }`}
              >
                Upload from computer
              </button>
              <button
                type="button"
                onClick={() => setPhotoTab('url')}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${photoTab === 'url'
                  ? 'border-[#0b57d0] text-[#0b57d0]'
                  : 'border-transparent text-[#5f6368] hover:text-[#1f1f1f]'
                  }`}
              >
                Web address (URL)
              </button>
            </div>

            <div className="p-5">
              {photoTab === 'upload' ? (
                <div>
                  <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    onChange={handlePhotoFileChange}
                    className="hidden"
                  />
                  {!photoPreview ? (
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="border-2 border-dashed border-[#c4c7c5] hover:border-[#0b57d0] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition bg-[#f8fafd] hover:bg-[#f0f4f9]"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#d3e3fd] text-[#0b57d0] flex items-center justify-center mb-3">
                        <Image className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-[#1f1f1f] mb-1">
                        Choose photo to upload
                      </p>
                      <p className="text-[11px] text-[#5f6368]">
                        Supports PNG, JPG, GIF, WebP, SVG
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden border border-[#dadce0] max-h-56 flex items-center justify-center bg-gray-50 p-2">
                        <img src={photoPreview} alt="Preview" className="max-h-52 object-contain rounded" />
                        <button
                          type="button"
                          onClick={() => setPhotoPreview(null)}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="text-xs text-[#0b57d0] font-medium hover:underline"
                      >
                        Change photo
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#444746] mb-1.5">
                      Paste image URL
                    </label>
                    <input
                      type="text"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://example.com/photo.png"
                      className="w-full px-3 py-2 border border-[#dadce0] rounded-lg text-xs text-[#1f1f1f] focus:outline-none focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0]"
                    />
                  </div>
                  {photoUrl && (
                    <div className="rounded-lg overflow-hidden border border-[#dadce0] p-2 bg-gray-50 max-h-48 flex items-center justify-center">
                      <img
                        src={photoUrl}
                        alt="URL Preview"
                        onError={() => showToast('Unable to preview image from URL', 'error')}
                        className="max-h-44 object-contain rounded"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-[#f8fafd] border-t border-[#dadce0] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPhotoModal(false);
                  setPhotoPreview(null);
                  setPhotoUrl('');
                }}
                className="px-4 py-1.5 text-xs font-medium text-[#444746] hover:bg-[#eaeef4] rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyPhoto}
                disabled={photoTab === 'upload' ? !photoPreview : !photoUrl}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0b57d0] hover:bg-[#0842a0] rounded-lg transition shadow-sm disabled:opacity-40"
              >
                Insert Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Google Drive Picker Modal */}
      {showDriveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-[#dadce0] w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150 select-none flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-[#dadce0] flex items-center justify-between bg-[#f8fafd]">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-[#0b57d0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2.5a2 2 0 0 1 1.73 1l7.5 13a2 2 0 0 1-1.73 3H4.5a2 2 0 0 1-1.73-3l7.5-13a2 2 0 0 1 1.73-1z" />
                  <path d="M12 8.5l3.8 6.5H8.2L12 8.5z" />
                </svg>
                <span className="text-sm font-semibold text-[#202124]">Insert files using Google Drive</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDriveModal(false)}
                className="text-[#5f6368] hover:text-[#202124] p-1 rounded-full hover:bg-gray-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search & Tabs */}
            <div className="p-4 border-b border-[#dadce0] bg-[#f8fafd] space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#5f6368]" />
                <input
                  type="text"
                  placeholder="Search in Drive..."
                  value={driveSearch}
                  onChange={(e) => setDriveSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#dadce0] rounded-full text-xs text-[#1f1f1f] focus:outline-none focus:border-[#0b57d0]"
                />
              </div>
              <div className="flex gap-4 text-xs font-semibold text-[#5f6368]">
                <span className="text-[#0b57d0] border-b-2 border-[#0b57d0] pb-1 cursor-pointer">Recent</span>
                <span className="hover:text-[#1f1f1f] cursor-pointer">My Drive</span>
                <span className="hover:text-[#1f1f1f] cursor-pointer">Shared with me</span>
              </div>
            </div>

            {/* Files List */}
            <div className="p-4 overflow-y-auto flex-1 divide-y divide-gray-100">
              {DRIVE_FILES.filter((f) => f.name.toLowerCase().includes(driveSearch.toLowerCase())).map((file) => (
                <div
                  key={file.id}
                  onClick={() => setSelectedDriveFile(file.id === selectedDriveFile ? null : file.id)}
                  className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition ${selectedDriveFile === file.id
                    ? 'bg-[#d3e3fd]/40 border border-[#0b57d0]'
                    : 'hover:bg-gray-50 border border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {file.type === 'pdf' ? '📄' : file.type === 'doc' ? '📝' : file.type === 'sheet' ? '📊' : '📑'}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-[#1f1f1f]">{file.name}</p>
                      <p className="text-[11px] text-[#5f6368]">{file.size} • {file.date}</p>
                    </div>
                  </div>
                  {selectedDriveFile === file.id && (
                    <CheckCircle className="w-4 h-4 text-[#0b57d0]" />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 bg-[#f8fafd] border-t border-[#dadce0] flex items-center justify-between">
              <span className="text-[11px] text-[#5f6368]">
                Insert as: <b className="text-[#1f1f1f]">Drive link</b>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDriveModal(false)}
                  className="px-4 py-1.5 text-xs font-medium text-[#444746] hover:bg-[#eaeef4] rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedDriveFile}
                  onClick={() => {
                    const file = DRIVE_FILES.find((f) => f.id === selectedDriveFile);
                    if (file) handleInsertDriveFile(file);
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0b57d0] hover:bg-[#0842a0] rounded-lg transition shadow-sm disabled:opacity-40"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Confidential Mode Modal */}
      {showConfidentialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-[#dadce0] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 select-none">
            <div className="px-5 py-3.5 border-b border-[#dadce0] flex items-center justify-between bg-[#f8fafd]">
              <h3 className="text-sm font-semibold text-[#202124] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0b57d0]" />
                <span>Confidential mode</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowConfidentialModal(false)}
                className="text-[#5f6368] hover:text-[#202124] p-1 rounded-full hover:bg-gray-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-[#444746] leading-relaxed">
                Recipients won&apos;t have the option to forward, copy, print, or download this email.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1.5">
                  Set expiration
                </label>
                <select
                  value={confidentialExpiry}
                  onChange={(e) => setConfidentialExpiry(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dadce0] rounded-lg text-xs text-[#1f1f1f] bg-white focus:outline-none focus:border-[#0b57d0]"
                >
                  <option value="1 day">Expires in 1 day</option>
                  <option value="1 week">Expires in 1 week</option>
                  <option value="1 month">Expires in 1 month</option>
                  <option value="3 months">Expires in 3 months</option>
                  <option value="5 years">Expires in 5 years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1.5">
                  Require passcode
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-[#444746] cursor-pointer">
                    <input
                      type="radio"
                      name="passcode"
                      checked={confidentialPasscode === 'none'}
                      onChange={() => setConfidentialPasscode('none')}
                      className="text-[#0b57d0] focus:ring-0"
                    />
                    <span>No SMS passcode (all passcodes generated automatically)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-[#444746] cursor-pointer">
                    <input
                      type="radio"
                      name="passcode"
                      checked={confidentialPasscode === 'sms'}
                      onChange={() => setConfidentialPasscode('sms')}
                      className="text-[#0b57d0] focus:ring-0"
                    />
                    <span>SMS passcode (recipients receive passcode by SMS)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-[#f8fafd] border-t border-[#dadce0] flex items-center justify-between">
              {isConfidential ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsConfidential(false);
                    setShowConfidentialModal(false);
                    showToast('Confidential mode disabled', 'info');
                  }}
                  className="text-xs text-rose-600 font-medium hover:underline"
                >
                  Remove confidential mode
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfidentialModal(false)}
                  className="px-4 py-1.5 text-xs font-medium text-[#444746] hover:bg-[#eaeef4] rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsConfidential(true);
                    setShowConfidentialModal(false);
                    showToast(`Confidential mode set (${confidentialExpiry})`, 'success');
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0b57d0] hover:bg-[#0842a0] rounded-lg transition shadow-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Signature Settings Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-[#dadce0] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 select-none">
            <div className="px-5 py-3.5 border-b border-[#dadce0] flex items-center justify-between bg-[#f8fafd]">
              <h3 className="text-sm font-semibold text-[#202124] flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#0b57d0]" />
                <span>Manage Signature</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSignatureModal(false)}
                className="text-[#5f6368] hover:text-[#202124] p-1 rounded-full hover:bg-gray-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <label className="block text-xs font-semibold text-[#444746]">
                Your Email Signature
              </label>
              <textarea
                rows={5}
                value={customSignatureInput}
                onChange={(e) => setCustomSignatureInput(e.target.value)}
                placeholder={`Best regards,\n${userEmail.split('@')[0]}\nFlutterFlirt Mail\ncodeaddabot.in`}
                className="w-full px-3 py-2 border border-[#dadce0] rounded-lg text-xs text-[#1f1f1f] focus:outline-none focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] font-sans resize-none"
              />
              <p className="text-[11px] text-[#5f6368]">
                This signature will be appended to the bottom of all outgoing messages when you click Insert Signature.
              </p>
            </div>

            <div className="px-5 py-3 bg-[#f8fafd] border-t border-[#dadce0] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSignatureModal(false)}
                className="px-4 py-1.5 text-xs font-medium text-[#444746] hover:bg-[#eaeef4] rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCustomSignature}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0b57d0] hover:bg-[#0842a0] rounded-lg transition shadow-sm"
              >
                Save Signature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Coming Soon Feature Modal (Calendar, People & Groups, To-Do) */}
      {comingSoonModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#dadce0] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 select-none">
            {/* Header with Pattern / Color Background */}
            <div className="px-6 pt-6 pb-4 bg-gradient-to-br from-[#f8fafd] to-[#edf2fa] border-b border-[#dadce0] relative">
              <button
                type="button"
                onClick={() => setComingSoonModal(null)}
                className="absolute top-4 right-4 text-[#5f6368] hover:text-[#202124] p-1.5 rounded-full hover:bg-black/5 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-[#0078d4] text-white flex items-center justify-center shadow-md">
                  {comingSoonModal.icon === 'calendar' && <Calendar className="w-6 h-6" />}
                  {comingSoonModal.icon === 'users' && <Users className="w-6 h-6" />}
                  {comingSoonModal.icon === 'todo' && <CheckSquare className="w-6 h-6" />}
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-blue-100 text-[#0078d4]">
                    🚀 Coming Soon • {comingSoonModal.phase}
                  </span>
                  <h3 className="text-base font-bold text-[#202124] mt-1">
                    {comingSoonModal.title}
                  </h3>
                </div>
              </div>
              <p className="text-xs text-[#5f6368] mt-2 leading-relaxed">
                {comingSoonModal.subtitle}
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="p-6 space-y-3 bg-white">
              <div className="text-[11px] font-bold text-[#5f6368] uppercase tracking-wider mb-2">
                What to expect:
              </div>
              <div className="space-y-2.5">
                {comingSoonModal.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[#3c4043]">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                      ✓
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#f8fafd] border-t border-[#dadce0] flex items-center justify-between">
              <span className="text-[11px] text-[#70757a]">
                FlutterFlirt Mail Roadmap
              </span>
              <button
                type="button"
                onClick={() => {
                  setComingSoonModal(null);
                  showToast('Thanks for your interest! We will notify you when this feature launches.', 'success');
                }}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-lg transition shadow-sm active:scale-95"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Modern Professional To-Do & Tasks Modal Dialog */}
      {isTaskPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => {
              handleCancelEdit();
              setIsTaskPanelOpen(false);
            }}
          />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Top Header */}
            <div className="px-6 py-4 bg-[#0078d4] text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs border border-white/20 shadow-xs">
                  <CheckSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">Tasks & To-Do</h3>
                  <p className="text-xs text-white/80">
                    {tasks.filter((t) => !t.completed).length} pending • {tasks.filter((t) => t.completed).length} completed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Search Bar in Header */}
                <div className="relative hidden sm:block">
                  <Search className="w-3.5 h-3.5 text-white/70 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={taskSearchQuery}
                    onChange={(e) => setTaskSearchQuery(e.target.value)}
                    className="w-44 bg-white/15 hover:bg-white/20 focus:bg-white focus:text-[#1e293b] focus:placeholder-slate-400 text-white placeholder-white/70 text-xs rounded-lg pl-8 pr-3 py-1.5 transition outline-hidden border border-white/20"
                  />
                  {taskSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setTaskSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fetchTasksFromDb()}
                  title="Refresh tasks from database"
                  className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95"
                >
                  <RefreshCw className={`w-4 h-4 ${isTasksLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCancelEdit();
                    setIsTaskPanelOpen(false);
                  }}
                  title="Close"
                  className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {tasks.length > 0 && (
              <div className="bg-slate-100 h-1.5 w-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300 ease-out"
                  style={{
                    width: `${Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100)}%`,
                  }}
                />
              </div>
            )}

            {/* Filter Tabs & Quick Views */}
            <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Tasks', icon: null, count: tasks.length },
                { id: 'today', label: 'Today', icon: <Clock className="w-3.5 h-3.5" />, count: tasks.filter((t) => t.dueDate === 'Today' && !t.completed).length },
                { id: 'important', label: 'Important', icon: <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />, count: tasks.filter((t) => t.important && !t.completed).length },
                { id: 'high', label: 'High Priority', icon: <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />, count: tasks.filter((t) => t.priority === 'high' && !t.completed).length },
                { id: 'email', label: 'From Email', icon: <Mail className="w-3.5 h-3.5 text-[#0078d4]" />, count: tasks.filter((t) => t.sourceEmailSubject && !t.completed).length },
                { id: 'completed', label: 'Completed', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />, count: tasks.filter((t) => t.completed).length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTaskFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0 ${
                    taskFilter === tab.id
                      ? 'bg-[#0078d4] text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {tab.icon && (
                    <span className={taskFilter === tab.id ? '[&_svg]:text-white [&_svg]:fill-white' : ''}>
                      {tab.icon}
                    </span>
                  )}
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        taskFilter === tab.id
                          ? 'bg-white/25 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Add Task Card Form (Zero Ugly Double Borders!) */}
            <div className="p-5 bg-white border-b border-slate-200 shadow-xs">
              <form onSubmit={handleAddTask} className="border border-slate-200 focus-within:border-[#0078d4] focus-within:ring-2 focus-within:ring-[#0078d4]/15 rounded-xl bg-slate-50/50 p-3 transition">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0">
                    <Plus className="w-3 h-3 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Add a task, e.g. 'Review quarterly sales deck'..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                    className="w-full bg-transparent border-0 outline-hidden ring-0 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-0 p-0"
                  />
                  <button
                    type="button"
                    onClick={() => setNewTaskImportant(!newTaskImportant)}
                    title={newTaskImportant ? 'Important (Flagged)' : 'Mark as Important'}
                    className={`p-1.5 rounded-lg transition shrink-0 ${
                      newTaskImportant ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${newTaskImportant ? 'fill-amber-400' : ''}`} />
                  </button>
                  <button
                    type="submit"
                    disabled={!newTaskTitle.trim()}
                    className="px-4 py-1.5 bg-[#0078d4] hover:bg-[#106ebe] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold rounded-lg transition active:scale-95 shadow-xs shrink-0"
                  >
                    Add Task
                  </button>
                </div>

                {/* Inline Chips (Due Date & Priority) */}
                <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-200/60 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Due Date Chips */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Due:</span>
                      <button
                        type="button"
                        onClick={() => setNewTaskDueDate(newTaskDueDate === 'today' ? 'none' : 'today')}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition ${
                          newTaskDueDate === 'today'
                            ? 'bg-blue-100 text-[#0078d4] font-semibold border border-blue-200'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewTaskDueDate(newTaskDueDate === 'tomorrow' ? 'none' : 'tomorrow')}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition ${
                          newTaskDueDate === 'tomorrow'
                            ? 'bg-blue-100 text-[#0078d4] font-semibold border border-blue-200'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Tomorrow
                      </button>
                    </div>

                    {/* Priority Selector */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 ml-1 sm:ml-3">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>Priority:</span>
                      {(['low', 'medium', 'high'] as const).map((p) => {
                        const isSelected = newTaskPriority === p;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setNewTaskPriority(p)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                              isSelected
                                ? p === 'high'
                                  ? 'bg-red-50 text-red-700 border border-red-300 shadow-xs'
                                  : p === 'medium'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-xs'
                                  : 'bg-slate-100 text-slate-800 border border-slate-300 shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                p === 'high'
                                  ? 'bg-red-500'
                                  : p === 'medium'
                                  ? 'bg-amber-500'
                                  : 'bg-slate-400'
                              }`}
                            />
                            {p === 'high' ? 'High' : p === 'medium' ? 'Medium' : 'Low'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    Press <kbd className="px-1 py-0.5 bg-slate-200 text-slate-600 rounded text-[9px] font-sans">Enter ↵</kbd> to add
                  </span>
                </div>
              </form>
            </div>

            {/* Task Items List Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-2.5 max-h-[46vh] bg-[#fafbfc]">
              {isTasksLoading && tasks.length === 0 ? (
                <div className="py-8 space-y-2.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200">
                      <div className="w-5 h-5 bg-slate-200 rounded-full"></div>
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 bg-slate-200 rounded w-2/3"></div>
                        <div className="h-2.5 bg-slate-100 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="py-14 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0078d4] flex items-center justify-center mx-auto mb-3 border border-blue-100 shadow-xs">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    {taskSearchQuery ? 'No tasks match your search' : 'No tasks in this view'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                    {taskFilter === 'completed'
                      ? 'No completed tasks yet. Finish a task above to see it here.'
                      : 'Add your first task above, or convert any email directly into a task.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Active Tasks List */}
                  {filteredTasks
                    .filter((t) => (taskFilter === 'completed' ? true : !t.completed))
                    .map((task) => (
                      <div
                        key={task.id}
                        className={`group flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-150 ${
                          task.completed
                            ? 'bg-slate-50 border-slate-200 opacity-60'
                            : task.priority === 'high' || task.important
                            ? 'bg-white border-l-4 border-l-red-500 border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300'
                            : task.priority === 'medium'
                            ? 'bg-white border-l-4 border-l-amber-400 border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300'
                            : 'bg-white border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300'
                        }`}
                      >
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => handleToggleTaskComplete(task.id)}
                          className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all shrink-0 ${
                            task.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                              : 'border-slate-300 hover:border-[#0078d4] hover:bg-blue-50'
                          }`}
                        >
                          {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>

                        {/* Task Content / Inline Edit Form */}
                        <div className="flex-1 min-w-0">
                          {editingTaskId === task.id ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleSaveEdit(task.id);
                              }}
                              className="space-y-2 w-full"
                            >
                              <input
                                type="text"
                                value={editingTaskTitle}
                                onChange={(e) => setEditingTaskTitle(e.target.value)}
                                autoFocus
                                className="w-full bg-white border border-[#0078d4] rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden shadow-xs"
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 font-medium">Priority:</span>
                                {(['low', 'medium', 'high'] as const).map((p) => {
                                  const isSelected = editingTaskPriority === p;
                                  return (
                                    <button
                                      key={p}
                                      type="button"
                                      onClick={() => setEditingTaskPriority(p)}
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                                        isSelected
                                          ? p === 'high'
                                            ? 'bg-red-50 text-red-700 border border-red-300'
                                            : p === 'medium'
                                            ? 'bg-amber-50 text-amber-800 border border-amber-300'
                                            : 'bg-slate-100 text-slate-800 border border-slate-300'
                                          : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                                      }`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          p === 'high'
                                            ? 'bg-red-500'
                                            : p === 'medium'
                                            ? 'bg-amber-500'
                                            : 'bg-slate-400'
                                        }`}
                                      />
                                      {p === 'high' ? 'High' : p === 'medium' ? 'Medium' : 'Low'}
                                    </button>
                                  );
                                })}
                                <div className="ml-auto flex items-center gap-1.5">
                                  <button
                                    type="submit"
                                    className="px-3 py-1 bg-[#0078d4] text-white text-xs font-semibold rounded-md hover:bg-[#106ebe] transition"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md hover:bg-slate-200 transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </form>
                          ) : (
                            <>
                              <p
                                className={`text-xs sm:text-sm leading-relaxed break-words ${
                                  task.completed
                                    ? 'line-through text-slate-400 font-normal'
                                    : 'text-slate-800 font-medium'
                                }`}
                              >
                                {task.title}
                              </p>

                              {/* Badges Row */}
                              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                {task.dueDate && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-[#0078d4] border border-blue-200/50">
                                    <Clock className="w-2.5 h-2.5" />
                                    {task.dueDate}
                                  </span>
                                )}

                                {task.priority && (
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                      task.priority === 'high'
                                        ? 'bg-red-50 text-red-700 border border-red-200'
                                        : task.priority === 'medium'
                                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                                    }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        task.priority === 'high'
                                          ? 'bg-red-500'
                                          : task.priority === 'medium'
                                          ? 'bg-amber-500'
                                          : 'bg-slate-400'
                                      }`}
                                    />
                                    {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}
                                  </span>
                                )}

                                {task.sourceEmailSubject && (
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 max-w-[280px] truncate"
                                    title={`Linked to email: ${task.sourceEmailSubject}`}
                                  >
                                    <Mail className="w-2.5 h-2.5 shrink-0 text-[#0078d4]" />
                                    <span className="truncate">{task.sourceEmailSubject}</span>
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Actions: Star, Edit & Delete */}
                        {editingTaskId !== task.id && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleTaskImportant(task.id)}
                              className={`p-1.5 rounded-lg transition ${
                                task.important
                                  ? 'text-amber-500 bg-amber-50'
                                  : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'
                              }`}
                              title={task.important ? 'Important' : 'Mark as important'}
                            >
                              <Star className={`w-4 h-4 ${task.important ? 'fill-amber-400' : ''}`} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(task)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#0078d4] hover:bg-blue-50 transition"
                              title="Edit task"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                  {/* Completed Accordion Section (When viewing active tasks) */}
                  {taskFilter !== 'completed' && filteredTasks.some((t) => t.completed) && (
                    <div className="mt-5 pt-3 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setIsCompletedCollapsed(!isCompletedCollapsed)}
                        className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-800 py-1.5 px-1 rounded-lg transition"
                      >
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Completed ({filteredTasks.filter((t) => t.completed).length})</span>
                        </span>
                        {isCompletedCollapsed ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </button>

                      {!isCompletedCollapsed && (
                        <div className="mt-2 space-y-2">
                          {filteredTasks
                            .filter((t) => t.completed)
                            .map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-white/70 opacity-60 hover:opacity-100 transition"
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleTaskComplete(task.id)}
                                    className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-emerald-500 text-white flex items-center justify-center shrink-0"
                                  >
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </button>
                                  <span className="text-xs text-slate-500 line-through truncate font-normal">
                                    {task.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                    title="Delete completed task"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Clean Modern Footer */}
            <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">
                {tasks.filter((t) => t.completed).length} of {tasks.length} tasks completed
              </span>
              <button
                type="button"
                onClick={() => {
                  handleCancelEdit();
                  setIsTaskPanelOpen(false);
                }}
                className="px-5 py-2 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded-lg transition active:scale-95 shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Universal Clean Toast (Zero window.alert) */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#202124] text-white text-xs font-medium rounded-xl shadow-2xl animate-in slide-in-from-bottom duration-200 border border-white/10">
          {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-[#34a853] shrink-0" />}
          {toast.type === 'error' && <AlertOctagon className="w-4 h-4 text-[#ea4335] shrink-0" />}
          {toast.type === 'info' && <ShieldCheck className="w-4 h-4 text-[#4285f4] shrink-0" />}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-white/60 hover:text-white transition p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Success Sent Toast */}
      {composeSentToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#202124] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom duration-200 border border-white/10">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Message sent successfully!</span>
        </div>
      )}
    </div>
  );
}
