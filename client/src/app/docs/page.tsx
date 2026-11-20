'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/Header';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Building2,
  Compass,
  Users,
  Clock,
  FileText,
  SlidersHorizontal,
  ArrowRight,
  Search,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Phone,
  Calendar,
  Layers,
  Award,
  Filter,
  KeyRound,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface PageGuide {
  id: string;
  name: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badge: string;
  summary: string;
  whatYouCanDo: {
    title: string;
    description: string;
  }[];
  howToUse: string[];
  goldenRule: string;
}

const PAGES_GUIDE: PageGuide[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    route: '/',
    icon: LayoutDashboard,
    accentColor: 'text-teal-400',
    badge: 'Operations Hub',
    summary:
      'The executive control center providing real-time visibility into company-wide project delivery, team capacity, and recent operations activity.',
    whatYouCanDo: [
      {
        title: 'Executive Metrics Overview',
        description:
          'Monitor active projects, in-progress deliverables, total client count, deals won, and team capacity at a glance.',
      },
      {
        title: 'Live Activity Feed',
        description:
          'View real-time updates as teammates move tasks, log billable hours, convert deals, or submit daily standup reports.',
      },
      {
        title: 'Delivery Progress Pulse',
        description:
          'Track overall software delivery velocity across all client projects with visual progress indicators.',
      },
      {
        title: 'Quick Operations Shortcuts',
        description:
          'Fast access to log hours, create urgent tasks, or review active deliverables without leaving the main view.',
      },
    ],
    howToUse: [
      'Start your workday here to assess overall sprint health and team velocity.',
      'Check the Live Activity Feed to see deliverables completed by teammates overnight or earlier in the day.',
      'Click on any active project card to jump directly into its milestone and deliverables dashboard.',
    ],
    goldenRule:
      'The Dashboard is your morning launchpad. If metrics show blocked projects or low capacity, review the Weekly Report standups immediately.',
  },
  {
    id: 'tasks',
    name: 'Tasks (Daily Board)',
    route: '/tasks',
    icon: CheckSquare,
    accentColor: 'text-sky-400',
    badge: 'Daily Execution',
    summary:
      'The daily execution engine and Kanban board for individual tasks, deliverable checklists, due dates, and WIP bottleneck limits.',
    whatYouCanDo: [
      {
        title: '4-Stage Kanban Workflow',
        description:
          'Drag or update tasks across To Do, In Progress, Review, and Done to reflect real-time deliverable status.',
      },
      {
        title: 'Scope to "My Tasks (Personal)"',
        description:
          'Select the Assignee filter to "My Tasks (Personal)" to focus exclusively on your own assigned tasks and due dates.',
      },
      {
        title: 'WIP Bottleneck Protection',
        description:
          'The board automatically flags when more than 3 tasks are In Progress per person to protect team focus.',
      },
      {
        title: 'Deliverables & Subtask Checklists',
        description:
          'Break large engineering or design tickets into micro-checklists that can be checked off in real time.',
      },
      {
        title: 'Due Date Filter Badges',
        description:
          'Click Today, Tomorrow, This Week, or Overdue badges to filter the board with counts scoped to your active filter.',
      },
      {
        title: 'Board vs List View',
        description:
          'Toggle seamlessly between the visual 4-column Kanban board and a compact table list view for rapid triage.',
      },
    ],
    howToUse: [
      'Set the Assignee dropdown to "My Tasks (Personal)" to view your personal work queue.',
      'Pick 1 or 2 highest priority items from "To Do" and move them to "In Progress".',
      'As you write code or produce designs, check off individual subtask deliverables inside the task modal.',
      'When your pull request is opened or deliverable is ready for QA, move the task to "Review".',
      'Once verified and merged, mark the task as "Done".',
    ],
    goldenRule:
      'Never keep more than 3 tasks in "In Progress" at the same time. Finish or move existing items to Review before starting new ones.',
  },
  {
    id: 'projects',
    name: 'Projects',
    route: '/projects',
    icon: FolderKanban,
    accentColor: 'text-indigo-400',
    badge: 'Delivery Management',
    summary:
      'Central hub for managing client software engagements, delivery budgets, technical milestones, and engineering repository links.',
    whatYouCanDo: [
      {
        title: 'Directory vs Progress Pipeline',
        description:
          'Toggle between the visual card directory and the chronological delivery pipeline showing milestone progression.',
      },
      {
        title: 'Automated Delivery Progress %',
        description:
          'Progress bars update automatically based on the ratio of completed tasks versus total tasks under the project.',
      },
      {
        title: 'Engineering & Design Links',
        description:
          'Direct 1-click links to GitHub Repositories, Figma Design Systems, and Staging Environments stored right on the card.',
      },
      {
        title: 'Commercial Budget Tracking',
        description:
          'Monitor contracted delivery budget ($), start dates, target completion dates, and assigned Project Leads.',
      },
      {
        title: 'Create & Edit Projects',
        description:
          'Add new client projects, designate the project lead, specify deliverables, and link to registered client accounts.',
      },
    ],
    howToUse: [
      'Use the Progress Pipeline view to review milestone completion during weekly client syncs.',
      'Access technical resources (Figma, GitHub, Staging) directly from the project card shortcuts.',
      'Click into any project to inspect its linked client, milestones, and filtered list of tasks.',
    ],
    goldenRule:
      'Every project must have an assigned Project Lead responsible for weekly progress updates and staging deployments.',
  },
  {
    id: 'clients',
    name: 'Clients (CRM)',
    route: '/clients',
    icon: Building2,
    accentColor: 'text-emerald-400',
    badge: 'Account Management',
    summary:
      'The client relationship directory tracking contracted accounts, stakeholder contacts, invoices, payments, and scheduled meetings.',
    whatYouCanDo: [
      {
        title: 'Commercial Health & Invoicing',
        description:
          'Track total Deal Value ($), cleared Paid milestone deposits, and remaining Pending balances for each account.',
      },
      {
        title: 'Stakeholder & Contact Directory',
        description:
          'Maintain primary contact persons, direct phone numbers, email addresses, and contracted services.',
      },
      {
        title: 'Meeting & Signoff Scheduling',
        description:
          'Schedule sprint review meetings, demos, and milestone signoffs with dates, times, and location/Google Meet links.',
      },
      {
        title: 'Client Specification Links',
        description:
          'Attach client requirements docs, contracts, and briefs directly to the client profile.',
      },
    ],
    howToUse: [
      'Open a client card to review payment milestones before releasing production code or new features.',
      'Schedule upcoming stakeholder demos and milestone signoffs under the meetings section.',
      'Click phone numbers or emails directly from the card to initiate instant client communications.',
    ],
    goldenRule:
      'Keep invoice payment statuses up to date so leadership has an accurate picture of cash flow and accounts receivable.',
  },
  {
    id: 'approaches',
    name: 'Client Outreach',
    route: '/approaches',
    icon: Compass,
    accentColor: 'text-amber-400',
    badge: 'Business Development',
    summary:
      'Prospecting and business development pipeline for approaching businesses, logging interactions, scheduling follow-ups, and winning new client deals.',
    whatYouCanDo: [
      {
        title: '6-Stage Outreach Pipeline',
        description:
          'Track prospect lifecycle: Identified → Contacted → In Discussion → Proposal Sent → Follow-up Required → Deal Won (Client).',
      },
      {
        title: '1-Click WhatsApp Web Shortcut',
        description:
          'Click the WhatsApp badge on any prospect to launch instant messaging with a pre-formatted intro note.',
      },
      {
        title: '1-Click Phone Dialer',
        description:
          'Click the phone icon to instantly initiate calls to prospective decision makers on mobile or desktop.',
      },
      {
        title: 'Interaction History & Follow-ups',
        description:
          'Log call notes, feedback, and set next follow-up dates. Automated alerts remind you on the morning follow-ups are due.',
      },
      {
        title: 'Industry Niches Management',
        description:
          'Organize prospects by industry sector (Retail & Supermarket, Technology, Healthcare, Hospitality, etc.).',
      },
      {
        title: '1-Click Deal Won Conversion',
        description:
          'When negotiations succeed, mark as "Deal Won (Client)" and click "Convert to Client" to automatically create their CRM record.',
      },
    ],
    howToUse: [
      'Filter by industry niche to focus outreach on a targeted market sector.',
      'Click the WhatsApp icon to send an introduction message to the business owner or manager.',
      'Log the call outcome in the interaction drawer and pick a follow-up date for next week.',
      'When the client accepts the proposal, mark as "Deal Won" and convert them directly into an active Client.',
    ],
    goldenRule:
      'Never leave a contacted prospect without a scheduled next follow-up date. Consistent follow-ups convert leads into contracts.',
  },
  {
    id: 'team',
    name: 'Team & Roles',
    route: '/team',
    icon: Users,
    accentColor: 'text-rose-400',
    badge: 'Talent & Permissions',
    summary:
      'The internal team directory, organizational hierarchy, role permissions governance, and streamlined member onboarding.',
    whatYouCanDo: [
      {
        title: '5-Tier Role Governance',
        description:
          'Clear role designations: 👑 CEO (Executive), ⚡ CTO (Tech Strategy), 📊 COO (Operations), 🛡️ Admin (System), and 👤 Member (Contributor).',
      },
      {
        title: 'Streamlined Member Onboarding',
        description:
          'Invite teammates with automatic temporary password generation and 1-click password copy for instant private dispatch.',
      },
      {
        title: 'Automated Welcome Emails',
        description:
          'System sends an onboarding email with an active auto-fill link that inputs the temporary password into the reset form.',
      },
      {
        title: 'Mandatory First-Login Password Change',
        description:
          'New members are required to set their own secure personal password on initial login before accessing company data.',
      },
      {
        title: 'Weekly Capacity Tracking',
        description:
          'View each member’s weekly hour target (default 48h) and monitor real-time logged hours.',
      },
    ],
    howToUse: [
      'Admins click "Invite Member", fill in name, email, title, role, and capacity.',
      'Click "Copy Temporary Password" on the confirmation modal to dispatch credentials to the new hire.',
      'Click on any team member card to inspect their active tasks, logged hours, and activity logs.',
    ],
    goldenRule:
      'Only assign CEO, CTO, COO, or Admin roles to verified leadership. All core engineers and designers should be assigned Member.',
  },
  {
    id: 'time',
    name: 'Time Tracking',
    route: '/time',
    icon: Clock,
    accentColor: 'text-teal-400',
    badge: 'Sprint Capacity',
    summary:
      'Sprint hour logging, 48-hour weekly capacity meters, billable project allocation, and paginated timesheet audits.',
    whatYouCanDo: [
      {
        title: 'Log Work Hours',
        description:
          'Record task hours with project association, date, duration, description, and work tags (Frontend, Backend, Design, QA, Strategy).',
      },
      {
        title: 'Billable vs Non-Billable Tagging',
        description:
          'Distinguish client-billable delivery hours from internal operational or administrative work.',
      },
      {
        title: '48h Sprint Capacity Meter',
        description:
          'Real-time visual capacity meter shows weekly progress toward the 48h standard with under-capacity and overtime alerts.',
      },
      {
        title: 'Paginated Timesheets Table',
        description:
          'Audit all team time entries with 10 entries per page, search keywords, and member/project filters.',
      },
      {
        title: 'Edit & Correct Entries',
        description:
          'Easily edit descriptions or delete accidental duplicate entries to keep client billing clean.',
      },
    ],
    howToUse: [
      'At the end of each focused work block or daily at 5:30 PM, click "Log Time".',
      'Select the project you worked on, enter the hours/minutes, pick a tag, and write a concise note.',
      'Check your weekly capacity meter to ensure you are on track to achieve your 48h sprint capacity.',
    ],
    goldenRule:
      'Log time on the day work is performed. Never postpone logging hours until the end of the month.',
  },
  {
    id: 'reports',
    name: 'Weekly Report & Standups',
    route: '/reports/weekly',
    icon: FileText,
    accentColor: 'text-amber-400',
    badge: 'Accountability',
    summary:
      'The daily asynchronous EOD standup check-in system and executive weekly delivery summary for unblocking teammates and monitoring velocity.',
    whatYouCanDo: [
      {
        title: '60-Second Daily EOD Standup',
        description:
          'Submit your daily check-in: Completed Today, Tomorrow’s Priorities, Blockers/Dependencies, and Hours Worked.',
      },
      {
        title: 'Live Team Standup Feed',
        description:
          'Read daily check-ins from engineers and outreach specialists to maintain full async alignment without long meetings.',
      },
      {
        title: 'Blocker Identification & Resolution',
        description:
          'Highlight dependencies, waiting PR reviews, or missing client credentials so leads can resolve them immediately.',
      },
      {
        title: 'Executive Weekly Rollup',
        description:
          'Automated summary of shipped features, department highlights, and company-wide velocity for weekly leadership reviews.',
      },
    ],
    howToUse: [
      'Every evening between 5:00 PM and 6:30 PM, open "Weekly Report" and click "Submit Daily Standup".',
      'Fill in 2-3 bullet points for Completed Today and Tomorrow’s Priorities.',
      'If you are blocked by code reviews or missing assets, clearly state the blocker.',
      'Project Leads review the standup feed each morning to unblock their team before deep work begins.',
    ],
    goldenRule:
      'Daily EOD standups are mandatory for all active staff. If you have a blocker, write it explicitly so leadership can clear it.',
  },
  {
    id: 'settings',
    name: 'Settings & Appearance',
    route: '/settings',
    icon: SlidersHorizontal,
    accentColor: 'text-purple-400',
    badge: 'Personalization',
    summary:
      'Customize themes, enterprise dark/light palettes, typography, profile details, and background push notifications.',
    whatYouCanDo: [
      {
        title: '7 Enterprise Color Themes',
        description:
          'Switch between Clean Light, Rhizan Dark, Midnight Navy, Cyber Violet, Forest Emerald, Luxury Gold, and Monokai Pro.',
      },
      {
        title: 'Custom Typography',
        description:
          'Personalize font styling across the Hub: Plus Jakarta Sans, Inter, JetBrains Mono, or Roboto.',
      },
      {
        title: 'Light / Dark Mode Toggle',
        description:
          'Instantly toggle high-contrast dark and light modes with persistent localStorage storage.',
      },
      {
        title: 'Edit Profile & Details',
        description:
          'Update your display name, official title, and phone number directly from your personal settings.',
      },
      {
        title: 'PWA & Cache Management',
        description:
          'Check Progressive Web App installation status, offline cache health, and background sync.',
      },
    ],
    howToUse: [
      'Pick a color theme and typography that suits your working environment and ambient lighting.',
      'Click "Edit Profile" to keep your title and contact phone up to date for teammates.',
      'Enable browser push notification permissions when prompted to receive task due alerts.',
    ],
    goldenRule:
      'Keep your profile name and title accurate so team assignment dropdowns and client lead designations stay clear.',
  },
];

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPage, setSelectedPage] = useState<string>('all');

  // Filter pages based on search and selected pill
  const filteredPages = PAGES_GUIDE.filter((page) => {
    if (selectedPage !== 'all' && page.id !== selectedPage) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchName = page.name.toLowerCase().includes(query);
    const matchSummary = page.summary.toLowerCase().includes(query);
    const matchActions = page.whatYouCanDo.some(
      (a) => a.title.toLowerCase().includes(query) || a.description.toLowerCase().includes(query)
    );
    const matchHowTo = page.howToUse.some((h) => h.toLowerCase().includes(query));
    return matchName || matchSummary || matchActions || matchHowTo;
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-20">
      <Header
        title={
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <span>Rhizan Hub Operational Manual</span>
          </div>
        }
        subtitle="A clear, page-by-page operational guide explaining what each page is for and what you can do on it"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Banner with Live Search */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121c24] via-[#101720] to-[#0c1017] border border-teal-500/20 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  <h1 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-wide">
                    PAGE-BY-PAGE HUB GUIDE
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-300">
                    Understand the exact purpose, capabilities, and operational rules for every page in Rhizan Hub
                  </p>
                </div>
              </div>

              <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                9 Core Modules
              </span>
            </div>

            {/* Live Search */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any page, feature, rule, or action (e.g., WIP limit, WhatsApp, Standup)..."
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

            {/* Quick Navigation Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedPage('all')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedPage === 'all'
                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
                    : 'bg-[#151e28] text-neutral-300 hover:bg-[#1b2634] hover:text-white border border-[#233142]'
                }`}
              >
                <span>All Pages (9)</span>
              </button>
              {PAGES_GUIDE.map((page) => {
                const Icon = page.icon;
                const isSelected = selectedPage === page.id;
                return (
                  <button
                    key={page.id}
                    onClick={() => setSelectedPage(page.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                      isSelected
                        ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
                        : 'bg-[#151e28] text-neutral-300 hover:bg-[#1b2634] hover:text-white border border-[#233142]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{page.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Page Guides Grid */}
        <div className="space-y-8">
          {filteredPages.map((page, index) => {
            const Icon = page.icon;
            return (
              <div
                key={page.id}
                id={page.id}
                className="rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] p-6 sm:p-8 space-y-6 shadow-sm hover:border-[var(--border-hover)] transition scroll-mt-24"
              >
                {/* Page Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]">
                      <Icon className={`w-6 h-6 ${page.accentColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-teal-400">
                          {String(index + 1).padStart(2, '0')}.
                        </span>
                        <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] font-heading">
                          {page.name}
                        </h2>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--muted)] border border-[var(--border)]">
                          {page.route}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                          {page.badge}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">{page.summary}</p>
                    </div>
                  </div>

                  <Link
                    href={page.route}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-900/20 transition self-start sm:self-auto cursor-pointer"
                  >
                    <span>Open {page.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Section 1: What You Can Do Here */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    What You Can Do On This Page
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {page.whatYouCanDo.map((action, aIdx) => (
                      <div
                        key={aIdx}
                        className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-1.5"
                      >
                        <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>{action.title}</span>
                        </h4>
                        <p className="text-xs text-[var(--muted)] leading-relaxed">{action.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 2: Step-by-Step How to Use */}
                <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-sky-400" />
                    How to Use It (Step-by-Step Workflow)
                  </h3>
                  <ol className="space-y-2 text-xs text-[var(--muted)] list-decimal list-inside leading-relaxed">
                    {page.howToUse.map((step, sIdx) => (
                      <li key={sIdx} className="text-[var(--foreground)]">
                        <span className="text-[var(--muted)]">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Section 3: Golden Rule / Pro Tip */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px]">
                      Golden Operational Rule
                    </span>
                    <p className="text-neutral-200 leading-relaxed">{page.goldenRule}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredPages.length === 0 && (
            <div className="p-12 text-center rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] space-y-3">
              <Search className="w-8 h-8 text-[var(--muted)] mx-auto" />
              <h3 className="text-sm font-semibold text-[var(--foreground)]">No matching pages or features found</h3>
              <p className="text-xs text-[var(--muted)]">Try searching for keywords like "Kanban", "Tasks", "Clients", "Hours", or "Outreach".</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPage('all');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-teal-500/10 text-teal-400 text-xs font-semibold border border-teal-500/20 hover:bg-teal-500/20 transition cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
