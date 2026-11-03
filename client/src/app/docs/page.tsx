'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { usePwa } from '@/context/PwaContext';
import {
  BookOpen,
  CheckSquare,
  FolderKanban,
  Building2,
  Compass,
  Users,
  Clock,
  FileText,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Download,
  Laptop,
  ArrowRight,
  Search,
  HelpCircle,
  Lightbulb,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
  AlertCircle,
  Phone,
  Calendar,
  TrendingUp,
  Award,
  Layers,
  CheckCircle2,
  Wifi,
  Bell,
  KeyRound,
  Filter,
  Kanban,
  Briefcase,
} from 'lucide-react';

interface TopicCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const CATEGORIES: TopicCategory[] = [
  { id: 'all', name: 'All Modules', icon: Layers, description: 'Complete documentation index' },
  { id: 'quickstart', name: 'Quick Start & PWA', icon: Sparkles, description: 'Installation & core rhythm' },
  { id: 'tasks', name: 'Tasks & Daily Board', icon: CheckSquare, description: 'Kanban, WIP limits & filters' },
  { id: 'projects', name: 'Projects & Delivery', icon: FolderKanban, description: 'Milestones & repo links' },
  { id: 'clients', name: 'Clients & Accounts', icon: Building2, description: 'Contracts, meetings & invoices' },
  { id: 'outreach', name: 'Client Outreach', icon: Compass, description: 'Pipeline, WhatsApp & niches' },
  { id: 'team', name: 'Team & User Roles', icon: Users, description: 'Permissions & credential reset' },
  { id: 'time', name: 'Time Tracking', icon: Clock, description: '48h sprint capacity & timesheets' },
  { id: 'reports', name: 'Standups & Reports', icon: FileText, description: 'Daily EOD & weekly summaries' },
  { id: 'faq', name: 'FAQs & Pro-Tips', icon: HelpCircle, description: 'Common solutions & shortcuts' },
];

export default function DocumentationPage() {
  const { user } = useAuth();
  const { isInstallable, isInstalled, installPwa } = usePwa();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeRole, setActiveRole] = useState<'engineer' | 'growth' | 'exec'>('engineer');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // Filter topics based on search and category
  const matchesFilter = (catId: string, searchTerms: string[]) => {
    if (selectedCategory !== 'all' && selectedCategory !== catId) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return searchTerms.some((term) => term.toLowerCase().includes(query));
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-20">
      <Header
        title={
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <span>Rhizan Hub Documentation</span>
          </div>
        }
        subtitle="The definitive operational playbook, module guides, and workflows for Rhizan Technologies staff"
        actionButton={
          isInstallable && !isInstalled
            ? {
                label: 'Install Desktop App',
                mobileLabel: 'Install',
                icon: <Download className="w-4 h-4" />,
                onClick: installPwa,
              }
            : undefined
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Hero Banner with Search */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121c24] via-[#101720] to-[#0c1017] border border-teal-500/20 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg shadow-teal-900/30">
                  <Image
                    src="/logo_minimal.png"
                    alt="Rhizan Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-wide">
                      RHIZAN HUB OPERATIONS
                    </h1>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      v1.0 Production
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300">
                    High-velocity, async-first operating system for internal projects, clients, and outreach
                  </p>
                </div>
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {isInstalled ? 'Installed Native PWA' : 'PWA Ready'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                  <Clock className="w-3.5 h-3.5" />
                  48h Sprint Standard
                </span>
              </div>
            </div>

            {/* Live Search Input */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workflows, module guides, roles, WIP rules, shortcuts..."
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[#0a0f16]/90 border border-teal-500/30 text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-neutral-800"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Navigation Category Badges */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                      isSelected
                        ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
                        : 'bg-[#151e28] text-neutral-300 hover:bg-[#1b2634] hover:text-white border border-[#233142]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Interactive Playbook by Role */}
        <div className="rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-400" />
                <h2 className="text-lg font-bold text-[var(--foreground)]">Role-Based Daily Playbooks</h2>
              </div>
              <p className="text-xs text-[var(--muted)] mt-1">
                Select your role to see the exact recommended daily rhythm and best practices
              </p>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center p-1 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] self-start sm:self-auto">
              <button
                onClick={() => setActiveRole('engineer')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeRole === 'engineer'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Engineer & Designer</span>
              </button>
              <button
                onClick={() => setActiveRole('growth')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeRole === 'growth'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Sales & Growth</span>
              </button>
              <button
                onClick={() => setActiveRole('exec')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeRole === 'exec'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Lead & Executive</span>
              </button>
            </div>
          </div>

          {/* Role Content Cards */}
          {activeRole === 'engineer' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider font-mono">
                  Step 1 • 09:00 AM
                </span>
                <h4 className="text-sm font-semibold text-[var(--foreground)]">Personal Sprint Board</h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Open <strong className="text-[var(--foreground)]">Tasks</strong> and ensure Assignee filter is set to{' '}
                  <span className="text-teal-400">"My Tasks (Personal)"</span>. Pick top priority tasks from To Do and move them to In Progress.
                </p>
                <Link
                  href="/tasks"
                  className="inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-medium pt-2"
                >
                  Go to Tasks <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                  Step 2 • Focused Work
                </span>
                <h4 className="text-sm font-semibold text-[var(--foreground)]">WIP Discipline & Links</h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Respect the <strong className="text-amber-400">Max 3 Tasks / Person limit</strong>. Check deliverables subtasks and use project links (Figma, GitHub, Staging) directly from task cards.
                </p>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium pt-2"
                >
                  View Projects <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider font-mono">
                  Step 3 • Log Sprint Hours
                </span>
                <h4 className="text-sm font-semibold text-[var(--foreground)]">Log Billable Hours</h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Log your active dev/design hours in <strong className="text-[var(--foreground)]">Time Tracking</strong>. Target your 48h weekly sprint capacity meter.
                </p>
                <Link
                  href="/time"
                  className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium pt-2"
                >
                  Log Time <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                  Step 4 • 06:00 PM EOD
                </span>
                <h4 className="text-sm font-semibold text-[var(--foreground)]">Daily Check-In</h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Open <strong className="text-[var(--foreground)]">Weekly Report</strong> and submit your 60-second EOD standup: accomplishments, tomorrow's plan, and any blockers.
                </p>
                <Link
                  href="/reports/weekly"
                  className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium pt-2"
                >
                  Submit Standup <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {activeRole === 'growth' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider font-mono">
                  Stage 1 • Prospecting
                </span>
                <h4 className="text-sm font-semibold text-[var(--foreground)]">Target Research & Niches</h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  In <strong className="text-[var(--foreground)]">Client Outreach</strong>, filter by niche or add newly targeted businesses with key decision maker contacts.
                </p>
                <Link
                  href="/approaches"
                  className="inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-medium pt-2"
                >
                  Open Outreach <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                  Stage 2 • Direct Outreach
                </span>
                <h4 className="text-sm font-semibold text-[var(--foreground)]">1-Click WhatsApp & Phone</h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Click the green WhatsApp button or Phone icon on the approach row to launch instant chat with pre-filled intro pitch.
                </p>
                <span className="text-[11px] text-neutral-400">Status: Contacted &bull; In Discussion</span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                  Stage 3 • Interaction Logs
                </span>
                <h4 className="text-sm font-semibold text-[var(--foreground)]">Log Notes & Follow-ups</h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Record call outcome, feedback, and set the next follow-up date. Automated notifications alert you on the due morning!
                </p>
                <span className="text-[11px] text-amber-400">Never miss a scheduled callback</span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider font-mono">
                  Stage 4 • Deal Won
                </span>
                <h4 className="text-sm font-semibold text-[var(--foreground)]">Convert to Client</h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Mark status as <strong className="text-emerald-400">Deal Won (Client)</strong>. Click "Convert to Client" to automatically create their active CRM account!
                </p>
                <Link
                  href="/clients"
                  className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium pt-2"
                >
                  View Clients <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {activeRole === 'exec' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                  Leadership • Pulse Check
                </span>
                <h4 className="text-sm font-semibold text-[var(--foreground)]">Executive Dashboard</h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Audit company delivery progress, active projects, live deals won, and team capacity burndown across all departments.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium pt-2"
                >
                  View Dashboard <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider font-mono">
                  Delivery • Budgets & Scope
                </span>
                <h4 className="text-sm font-semibold text-[var(--foreground)]">Project Governance</h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Inspect delivery progress pipelines, contract scope, assigned project leads, and client repository deliverables.
                </p>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-medium pt-2"
                >
                  Inspect Projects <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider font-mono">
                  People • Talent & Roles
                </span>
                <h4 className="text-sm font-semibold text-[var(--foreground)]">Team Management</h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Invite teammates with automatic credentials generation, 1-click password copy, and instant email dispatch.
                </p>
                <Link
                  href="/team"
                  className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium pt-2"
                >
                  Manage Team <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider font-mono">
                  Accountability • Standups
                </span>
                <h4 className="text-sm font-semibold text-[var(--foreground)]">Blocker Resolution</h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Read daily EOD check-ins in the Weekly Report, identify blocked engineers, and resolve dependencies immediately.
                </p>
                <Link
                  href="/reports/weekly"
                  className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-medium pt-2"
                >
                  Weekly Brief <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Module Documentation */}
        <div className="space-y-8">
          {/* 1. Quick Start & PWA Guide */}
          {matchesFilter('quickstart', ['pwa', 'install', 'mobile', 'offline', 'shortcuts', 'desktop']) && (
            <div className="rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                    1. Quick Start & PWA Native Installation
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Run Rhizan Hub as a standalone desktop or mobile application with offline support
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Desktop Install */}
                <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-3">
                  <div className="flex items-center gap-2 text-teal-400">
                    <Laptop className="w-4 h-4" />
                    <h4 className="text-sm font-semibold text-[var(--foreground)]">Windows & macOS</h4>
                  </div>
                  <ol className="text-xs text-[var(--muted)] space-y-2 list-decimal list-inside leading-relaxed">
                    <li>Open Rhizan Hub in Chrome, Edge, or Brave.</li>
                    <li>
                      Look at the right side of the address bar for the{' '}
                      <strong className="text-[var(--foreground)]">Install</strong> icon (computer with arrow).
                    </li>
                    <li>
                      Or click the <strong className="text-teal-400">"Install Desktop App"</strong> button in the
                      sidebar bottom left.
                    </li>
                    <li>Launch directly from your Taskbar or macOS Launchpad.</li>
                  </ol>
                </div>

                {/* iOS Install */}
                <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-3">
                  <div className="flex items-center gap-2 text-sky-400">
                    <Smartphone className="w-4 h-4" />
                    <h4 className="text-sm font-semibold text-[var(--foreground)]">Apple iOS (iPhone / iPad)</h4>
                  </div>
                  <ol className="text-xs text-[var(--muted)] space-y-2 list-decimal list-inside leading-relaxed">
                    <li>Open Rhizan Hub in Apple Safari.</li>
                    <li>
                      Tap the <strong className="text-[var(--foreground)]">Share</strong> icon (square with arrow up).
                    </li>
                    <li>
                      Scroll down and tap <strong className="text-sky-400">"Add to Home Screen"</strong>.
                    </li>
                    <li>The Hub opens full screen without browser toolbars.</li>
                  </ol>
                </div>

                {/* Android Install */}
                <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Download className="w-4 h-4" />
                    <h4 className="text-sm font-semibold text-[var(--foreground)]">Android</h4>
                  </div>
                  <ol className="text-xs text-[var(--muted)] space-y-2 list-decimal list-inside leading-relaxed">
                    <li>Open Rhizan Hub in Google Chrome.</li>
                    <li>Tap the 3 dots menu in the top right corner.</li>
                    <li>
                      Tap <strong className="text-emerald-400">"Install app"</strong> or "Add to Home screen".
                    </li>
                    <li>Enjoy standalone native performance and offline caching.</li>
                  </ol>
                </div>
              </div>

              {/* Callout: Notifications & Offline */}
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-start gap-3">
                <Bell className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-teal-300">Push Notifications & Offline Availability</p>
                  <p className="text-neutral-300 leading-relaxed">
                    When prompted by your browser, click <strong className="text-white">"Allow Notifications"</strong>.
                    Rhizan Hub alerts you when tasks are approaching due dates, client follow-ups are due, or new
                    deliverables are assigned to you. Cached assets allow you to inspect projects even when offline.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. Tasks & Kanban Board */}
          {matchesFilter('tasks', ['tasks', 'kanban', 'wip', 'todo', 'subtasks', 'assignee', 'due dates']) && (
            <div className="rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                      2. Personal Tasks & Daily Kanban Board
                    </h3>
                    <p className="text-xs text-[var(--muted)]">
                      Queue management, deliverable checklists, and WIP bottleneck limits
                    </p>
                  </div>
                </div>
                <Link
                  href="/tasks"
                  className="px-3.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-semibold border border-teal-500/20 transition flex items-center gap-1.5"
                >
                  <span>Open Tasks Board</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Columns Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-500/10 text-neutral-400 border border-neutral-500/20">
                    COLUMN 1
                  </span>
                  <h4 className="text-sm font-semibold text-[var(--foreground)]">TO DO</h4>
                  <p className="text-xs text-[var(--muted)]">
                    Sprint backlog items prioritized for execution. Subtasks can be prepared in advance.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-teal-500/30 space-y-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    COLUMN 2 &bull; WIP LIMIT
                  </span>
                  <h4 className="text-sm font-semibold text-[var(--foreground)]">IN PROGRESS</h4>
                  <p className="text-xs text-[var(--muted)]">
                    Tasks currently being actively coded or designed. Recommended maximum of 3 concurrent tasks per
                    member to prevent context switching.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-amber-500/30 space-y-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    COLUMN 3
                  </span>
                  <h4 className="text-sm font-semibold text-[var(--foreground)]">REVIEW</h4>
                  <p className="text-xs text-[var(--muted)]">
                    Pull Requests undergoing code review, QA staging verification, or awaiting stakeholder signoff.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-emerald-500/30 space-y-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    COLUMN 4
                  </span>
                  <h4 className="text-sm font-semibold text-[var(--foreground)]">DONE</h4>
                  <p className="text-xs text-[var(--muted)]">
                    Completed, tested, and verified deliverables ready for milestone invoicing.
                  </p>
                </div>
              </div>

              {/* Filters Guide */}
              <div className="p-5 rounded-2xl bg-[#0f1722] border border-[#1e2d3f] space-y-3">
                <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5" />
                  Powerful Scoped Filtering Engine
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-300">
                  <div className="space-y-1.5">
                    <p className="font-semibold text-white">1. Assignee Scoping:</p>
                    <p className="text-neutral-400">
                      Selecting <strong className="text-teal-300">"My Tasks (Personal)"</strong> hides everyone else's
                      tasks and personalizes all date badges (Today, Tomorrow, Overdue) strictly to your own workload.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-semibold text-white">2. Date Filter Badges:</p>
                    <p className="text-neutral-400">
                      Click <strong className="text-amber-300">"Today"</strong>,{' '}
                      <strong className="text-rose-300">"Overdue"</strong>, or{' '}
                      <strong className="text-sky-300">"This Week"</strong> pills to instantly focus your daily priority
                      stream.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Projects & Software Delivery */}
          {matchesFilter('projects', ['projects', 'milestones', 'github', 'figma', 'staging', 'budget']) && (
            <div className="rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                      3. Projects & Client Deliverables
                    </h3>
                    <p className="text-xs text-[var(--muted)]">
                      Milestone tracking, budgets, team ownership, and repository integrations
                    </p>
                  </div>
                </div>
                <Link
                  href="/projects"
                  className="px-3.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-semibold border border-teal-500/20 transition flex items-center gap-1.5"
                >
                  <span>Go to Projects</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                  <h4 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                    <Award className="w-4 h-4 text-teal-400" />
                    Project Directory vs Pipeline
                  </h4>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Toggle between card grid and step-by-step pipeline view to see active delivery progress (0% - 100%)
                    computed automatically from linked tasks.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                  <h4 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-sky-400" />
                    External Engineering Links
                  </h4>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Every project card stores direct links to its <strong className="text-[var(--foreground)]">GitHub Repository</strong>,{' '}
                    <strong className="text-[var(--foreground)]">Figma Designs</strong>, and{' '}
                    <strong className="text-[var(--foreground)]">Staging Environment</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                  <h4 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    Lead Ownership
                  </h4>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Each project designates a Project Lead who oversees weekly milestones, signs off on deliverable PRs,
                    and communicates timeline updates with the client.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. Clients & CRM */}
          {matchesFilter('clients', ['clients', 'crm', 'contracts', 'invoices', 'meetings', 'payments']) && (
            <div className="rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                      4. Clients & Accounts Management
                    </h3>
                    <p className="text-xs text-[var(--muted)]">
                      Contract values, invoice milestones, payments status, and scheduled reviews
                    </p>
                  </div>
                </div>
                <Link
                  href="/clients"
                  className="px-3.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-semibold border border-teal-500/20 transition flex items-center gap-1.5"
                >
                  <span>Open Clients</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-[var(--muted)]">
                <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-3">
                  <h4 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Contract Financial Tracking
                  </h4>
                  <p className="leading-relaxed">
                    Track the exact commercial health for every account:
                  </p>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li><strong className="text-[var(--foreground)]">Deal Value ($)</strong>: Total contracted value for the software engagement.</li>
                    <li><strong className="text-emerald-400">Paid Amount ($)</strong>: Cleared milestone deposits.</li>
                    <li><strong className="text-amber-400">Pending Amount ($)</strong>: Milestone balances due on signoff.</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-3">
                  <h4 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-400" />
                    Meetings & Milestones
                  </h4>
                  <p className="leading-relaxed">
                    Schedule client demo calls and review meetings directly within the client file. Key stakeholders
                    receive reminders, ensuring transparent client relationships.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5. Client Outreach Pipeline */}
          {matchesFilter('outreach', ['outreach', 'approaches', 'whatsapp', 'niches', 'pipeline', 'deals']) && (
            <div className="rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                      5. Client Outreach & Approaches Pipeline
                    </h3>
                    <p className="text-xs text-[var(--muted)]">
                      Multi-stage prospect sales funnel, direct WhatsApp triggers, and conversion workflow
                    </p>
                  </div>
                </div>
                <Link
                  href="/approaches"
                  className="px-3.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-semibold border border-teal-500/20 transition flex items-center gap-1.5"
                >
                  <span>Go to Outreach</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Status progression flow */}
              <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-3">
                <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                  Outreach Stage Progression
                </h4>
                <div className="flex items-center gap-2 flex-wrap text-xs font-medium">
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-300">1. IDENTIFIED</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-300">2. CONTACTED</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300">3. IN DISCUSSION</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300">4. PROPOSAL SENT</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300">5. FOLLOW-UP</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    6. DEAL WON (CLIENT)
                  </span>
                </div>
              </div>

              {/* WhatsApp and Follow-up Pro Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <MessageSquare className="w-4 h-4" />
                    <span>Instant WhatsApp Outreach</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Clicking the WhatsApp badge on any approach row opens WhatsApp Web or mobile app with a personalized
                    intro note pre-addressed to the contact person.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-teal-400 text-xs font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>1-Click Conversion to Client</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    When you close a deal, select "Deal Won (Client)". A prompt will appear allowing you to convert the
                    prospect straight into a registered Client account without retyping details.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 6. Team & Role Management */}
          {matchesFilter('team', ['team', 'roles', 'ceo', 'cto', 'coo', 'admin', 'member', 'password', 'invite']) && (
            <div className="rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                      6. Team Hierarchy & Role Permissions
                    </h3>
                    <p className="text-xs text-[var(--muted)]">
                      Role badges, automated invitations, 1-click credential copying, and security
                    </p>
                  </div>
                </div>
                <Link
                  href="/team"
                  className="px-3.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-semibold border border-teal-500/20 transition flex items-center gap-1.5"
                >
                  <span>Open Team Directory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Roles Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-2xl bg-[var(--surface-elevated)] border border-amber-500/30 space-y-1">
                  <span className="text-[10px] font-bold text-amber-400">👑 CEO</span>
                  <p className="text-xs font-semibold text-[var(--foreground)]">Chief Executive</p>
                  <p className="text-[11px] text-[var(--muted)]">Full executive governance, company KPIs, user management.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--surface-elevated)] border border-sky-500/30 space-y-1">
                  <span className="text-[10px] font-bold text-sky-400">⚡ CTO</span>
                  <p className="text-xs font-semibold text-[var(--foreground)]">Chief Technology</p>
                  <p className="text-[11px] text-[var(--muted)]">Engineering architecture, technical roadmaps, staging signoff.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--surface-elevated)] border border-emerald-500/30 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400">📊 COO</span>
                  <p className="text-xs font-semibold text-[var(--foreground)]">Chief Operations</p>
                  <p className="text-[11px] text-[var(--muted)]">Project delivery cadence, client success, weekly burndown.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--surface-elevated)] border border-teal-500/30 space-y-1">
                  <span className="text-[10px] font-bold text-teal-400">🛡️ Admin</span>
                  <p className="text-xs font-semibold text-[var(--foreground)]">System Admin</p>
                  <p className="text-[11px] text-[var(--muted)]">Team invites, account onboarding, permission governance.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400">👤 Member</span>
                  <p className="text-xs font-semibold text-[var(--foreground)]">Core Contributor</p>
                  <p className="text-[11px] text-[var(--muted)]">Engineers, designers, outreach specialists, time logging.</p>
                </div>
              </div>

              {/* Onboarding & Password Flow */}
              <div className="p-5 rounded-2xl bg-[#0f1722] border border-[#1e2d3f] space-y-3">
                <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5" />
                  Streamlined Team Onboarding Flow
                </h4>
                <ol className="text-xs text-neutral-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    When an Admin creates a new team member, the Hub automatically generates a secure temporary password.
                  </li>
                  <li>
                    A modal immediately displays the password with a <strong className="text-teal-300">1-click Copy button</strong> so you can dispatch it via private channel.
                  </li>
                  <li>
                    A customized welcome email is sent to the teammate with an active auto-fill link that inputs their temporary password automatically into the password reset form.
                  </li>
                  <li>
                    On first login, the user is redirected to set their own permanent password before accessing the system.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* 7. Time Tracking & Sprints */}
          {matchesFilter('time', ['time', 'capacity', 'hours', 'timesheet', 'pagination', 'billable']) && (
            <div className="rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                      7. Time Tracking & 48h Sprint Standard
                    </h3>
                    <p className="text-xs text-[var(--muted)]">
                      Capacity management, billable project allocation, and paginated audit history
                    </p>
                  </div>
                </div>
                <Link
                  href="/time"
                  className="px-3.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-semibold border border-teal-500/20 transition flex items-center gap-1.5"
                >
                  <span>Open Time Tracker</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-[var(--muted)]">
                <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                  <h4 className="text-sm font-semibold text-[var(--foreground)]">48 Hours / Week Capacity</h4>
                  <p className="leading-relaxed">
                    Rhizan operates on 48h weekly sprints. The capacity meter turns green as you approach 48h and flags
                    under-utilization or overtime.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                  <h4 className="text-sm font-semibold text-[var(--foreground)]">Billable vs Non-Billable</h4>
                  <p className="leading-relaxed">
                    Tag hours with specific work types (Frontend, Backend, Design, QA, Strategy). Billable hours feed directly into client invoices.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                  <h4 className="text-sm font-semibold text-[var(--foreground)]">Paginated Timesheet Table</h4>
                  <p className="leading-relaxed">
                    Timesheets are paginated (10 entries/page) with full date range and teammate filters for swift monthly audits.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 8. Standups & Weekly Report */}
          {matchesFilter('reports', ['standup', 'eod', 'report', 'blockers', 'weekly']) && (
            <div className="rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                      8. Daily Standups & Weekly Executive Brief
                    </h3>
                    <p className="text-xs text-[var(--muted)]">
                      60-second daily check-ins, velocity meters, and automatic department summaries
                    </p>
                  </div>
                </div>
                <Link
                  href="/reports/weekly"
                  className="px-3.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-semibold border border-teal-500/20 transition flex items-center gap-1.5"
                >
                  <span>Open Weekly Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-[var(--muted)]">
                <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-3">
                  <h4 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    Daily EOD Standup Format
                  </h4>
                  <p className="leading-relaxed">
                    Submit your check-in every evening between 5:00 PM and 6:30 PM:
                  </p>
                  <ol className="space-y-1.5 list-decimal list-inside">
                    <li><strong className="text-[var(--foreground)]">Completed Today</strong>: Concrete deliverables shipped.</li>
                    <li><strong className="text-[var(--foreground)]">Tomorrow's Priorities</strong>: The 2-3 most impactful tasks.</li>
                    <li><strong className="text-rose-400">Blockers & Dependencies</strong>: Code reviews, APIs, or credentials needed.</li>
                    <li><strong className="text-teal-400">Hours Worked Today</strong>: Total logged hours.</li>
                  </ol>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-3">
                  <h4 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    Automated Executive Summary
                  </h4>
                  <p className="leading-relaxed">
                    The Weekly Report aggregates all team standups and time entries into department metrics, delivery velocity,
                    and billable utilization charts for leadership review every Friday.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 9. Interactive FAQ & Pro-Tips Accordion */}
          {matchesFilter('faq', ['faq', 'password', 'notifications', 'theme', 'shortcuts', 'questions']) && (
            <div className="rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                    9. Frequently Asked Questions & Pro-Tips
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Quick answers to common questions and practical power-user tips
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    q: 'How do background notifications work and why do I need to allow them?',
                    a: 'Rhizan Hub uses a Service Worker and native Push API to alert you about tasks due today, overdue follow-ups, and milestone events. When your browser displays a permission banner, click "Allow". If you ever missed it, check your browser lock icon in the address bar and switch Notifications to "Allow".',
                  },
                  {
                    q: 'How do I change my temporary password?',
                    a: 'When you log in with a temporary password from your welcome email, the system automatically redirects you to the Change Password screen. You can also click your avatar in the top right header at any time and select "Change Password".',
                  },
                  {
                    q: 'What is the WIP (Work-In-Progress) Bottleneck Limit on the Tasks board?',
                    a: 'The Kanban methodology discourages having more than 3 active tasks per person in "In Progress" at the same time. Excessive multitasking creates bottlenecks and delays delivery. Complete or move your active tasks to Review before starting new ones!',
                  },
                  {
                    q: 'Can I personalize the visual theme and typography?',
                    a: 'Yes! Navigate to Settings & Appearance (/settings) from the sidebar or header menu. You can choose from 7 enterprise themes (Clean Light, Rhizan Dark, Midnight Navy, Cyber Violet, etc.) and custom fonts like Plus Jakarta Sans, Inter, or JetBrains Mono.',
                  },
                  {
                    q: 'How do I convert an outreach prospect into an active Client?',
                    a: 'In Client Outreach (/approaches), when your negotiations succeed, change the status to "Deal Won (Client)". A 1-click conversion action allows you to import the business directly into Clients with their deal value and contact details.',
                  },
                  {
                    q: 'Can I use Rhizan Hub while travelling or with poor internet connectivity?',
                    a: 'Yes. Rhizan Hub is a Progressive Web App (PWA) with active service worker caching. It caches essential UI screens and data so you can view existing tasks and project specifications even during flight or network drops.',
                  },
                ].map((item, idx) => {
                  const isOpen = expandedFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] overflow-hidden transition"
                    >
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[var(--surface)] transition"
                      >
                        <span className="text-xs sm:text-sm font-semibold text-[var(--foreground)]">{item.q}</span>
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4 text-teal-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-[var(--muted)] shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs text-[var(--muted)] leading-relaxed border-t border-[var(--border)] animate-fade-in">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 10. Copyable Daily Rhythm Checklist */}
          <div className="rounded-3xl bg-gradient-to-br from-[#101924] to-[#0c1219] border border-teal-500/20 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-400" />
                  Rhizan Daily Operational Checklist
                </h3>
                <p className="text-xs text-neutral-300">
                  A high-impact 3-step checklist to paste in your daily notes or planner
                </p>
              </div>

              <button
                onClick={() =>
                  handleCopy(
                    `# Rhizan Daily Checklist\n- [ ] 09:00 AM: Open Rhizan Hub -> Tasks -> Filter "My Tasks" -> Set top 2 priorities\n- [ ] 10:00 AM - 05:00 PM: Deep execution, track subtasks, log time on project tasks\n- [ ] 06:00 PM: Submit EOD Standup in Weekly Report & verify logged capacity`,
                    'daily-checklist'
                  )
                }
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 text-xs font-semibold transition cursor-pointer self-start sm:self-auto"
              >
                {copiedCode === 'daily-checklist' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied Checklist!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Checklist</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#090d13] border border-[#1b2633] text-xs font-mono text-neutral-300 space-y-2 leading-relaxed">
              <p className="text-teal-400 font-bold"># Daily Operational Rhythm</p>
              <p>• [09:00 AM] Morning Kickoff: Check Dashboard & Tasks (filter: "My Tasks"). Pick 2 top priorities.</p>
              <p>• [Mid-day] Deep Execution: Respect WIP limit (max 3 in progress). Check off subtasks as delivered.</p>
              <p>• [05:30 PM] Time Tracking: Log hours worked with tags (Frontend, Backend, Design, QA).</p>
              <p>• [06:00 PM] EOD Standup: Submit 1-min check-in (completed, tomorrow priorities, blockers).</p>
            </div>
          </div>
        </div>

        {/* Footer Support Contact */}
        <div className="p-6 rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] text-center space-y-2">
          <p className="text-xs font-semibold text-[var(--foreground)]">Need additional help or have feedback?</p>
          <p className="text-xs text-[var(--muted)]">
            Reach out to internal operations leadership or visit the public portal at{' '}
            <a
              href="https://www.rhizantech.com"
              target="_blank"
              rel="noreferrer"
              className="text-teal-400 hover:underline font-medium inline-flex items-center gap-1"
            >
              rhizantech.com <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
