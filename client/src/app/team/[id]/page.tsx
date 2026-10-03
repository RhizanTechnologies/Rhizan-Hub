'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { Modal } from '@/components/Modal';
import { PriorityBadge } from '@/components/Badge';
import { apiFetch } from '@/lib/api';
import {
  ArrowLeft,
  Clock,
  CheckSquare,
  Mail,
  Edit3,
  Calendar,
  Layers,
  ArrowUpRight,
  Flame,
  CheckCircle2,
  FolderKanban,
  Target,
  ExternalLink,
  ChevronRight,
  Shield,
  ShieldAlert,
  Save,
  Briefcase,
  TrendingUp,
} from 'lucide-react';

interface MemberDetailsResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    title: string;
    status: string;
    weeklyCapacityHours: number;
    createdAt?: string;
  };
  stats: {
    thisWeekHours: number;
    allTimeHours: number;
    capacity: number;
    capacityPercent: number;
    totalTasks: number;
    pendingTasks: number;
    completedTasks: number;
    activeProjectsCount: number;
    assignedApproachesCount: number;
  };
  projects: Array<{
    _id: string;
    name: string;
    description?: string;
    status: string;
    priority: string;
    deadline?: string;
    clientName?: string;
    budget?: number;
    projectLead?: { name: string; email: string };
    techStack?: string[];
  }>;
  tasks: Array<{
    _id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate?: string;
    project?: { _id: string; name: string; clientName?: string };
    subtasks?: Array<{ id: string; title: string; completed: boolean }>;
  }>;
  timeEntries: Array<{
    _id: string;
    date: string;
    hours: number;
    minutes: number;
    description: string;
    billable: boolean;
    project?: { _id: string; name: string };
    task?: { title: string };
  }>;
  approaches: Array<{
    _id: string;
    businessName: string;
    contactPerson: string;
    email: string;
    phone?: string;
    status: string;
    niche?: string;
    location?: string;
    lastContactDate?: string;
    nextFollowUpDate?: string;
  }>;
}

export default function TeamMemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params?.id as string;

  const [data, setData] = useState<MemberDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'tasks' | 'time' | 'outreach'>('overview');
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'>('ALL');

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editRole, setEditRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [editCapacity, setEditCapacity] = useState('48');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const getFallbackMember = (id: string): MemberDetailsResponse => {
    if (id === '2' || id === '6abe3781770efbb9b5a4c96e') {
      return {
        user: {
          id: '6abe3781770efbb9b5a4c96e',
          name: 'Nebiyu',
          email: 'nebiyu@rhizan.com',
          role: 'MEMBER',
          title: 'Business & Client Outreach',
          status: 'ACTIVE',
          weeklyCapacityHours: 48,
          createdAt: '2026-10-01T10:35:45.269Z',
        },
        stats: {
          thisWeekHours: 24,
          allTimeHours: 98,
          capacity: 48,
          capacityPercent: 50,
          totalTasks: 3,
          pendingTasks: 3,
          completedTasks: 0,
          activeProjectsCount: 2,
          assignedApproachesCount: 4,
        },
        projects: [
          {
            _id: '6abe3781770efbb9b5a4c976',
            name: 'Client Acquisition Q4',
            clientName: 'Internal Campaign',
            description: 'Outreach campaign targeting local retail and F&B businesses.',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            deadline: '2026-10-31T00:00:00.000Z',
            budget: 2000,
          },
          {
            _id: '6abe3781770efbb9b5a4c972',
            name: 'Bakery ERP',
            clientName: 'ABC Bakery',
            description: 'Comprehensive ERP system for bakery production, inventory, and sales.',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            deadline: '2026-10-15T00:00:00.000Z',
            budget: 5000,
          },
        ],
        tasks: [
          {
            _id: 't-neb-1',
            title: 'Follow up with ABC Bakery on invoice',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            project: { _id: '6abe3781770efbb9b5a4c972', name: 'Bakery ERP' },
          },
          {
            _id: 't-neb-2',
            title: 'Client pitch presentation for XYZ Bistro',
            status: 'IN_PROGRESS',
            priority: 'MEDIUM',
            project: { _id: '6abe3781770efbb9b5a4c976', name: 'Client Acquisition Q4' },
          },
          {
            _id: 't-neb-3',
            title: 'Prepare Client X proposal document',
            status: 'TODO',
            priority: 'MEDIUM',
            project: { _id: '6abe3781770efbb9b5a4c976', name: 'Client Acquisition Q4' },
          },
        ],
        timeEntries: [
          {
            _id: 'te-neb-1',
            date: new Date().toISOString(),
            hours: 8,
            minutes: 0,
            description: 'Direct sales pitch & discovery call',
            billable: true,
            project: { _id: '6abe3781770efbb9b5a4c976', name: 'Client Acquisition Q4' },
          },
        ],
        approaches: [
          {
            _id: 'app-neb-1',
            businessName: 'Golden Grain Bakery',
            contactPerson: 'Dawit Mengistu',
            email: 'dawit@goldengrain.com',
            status: 'PITCHED',
          },
        ],
      };
    }

    if (id === '3' || id === '6abe3781770efbb9b5a4c970') {
      return {
        user: {
          id: '6abe3781770efbb9b5a4c970',
          name: 'Sadam',
          email: 'sadam@rhizan.com',
          role: 'MEMBER',
          title: 'Operations & Product QA',
          status: 'ACTIVE',
          weeklyCapacityHours: 48,
          createdAt: '2026-10-01T10:35:45.269Z',
        },
        stats: {
          thisWeekHours: 21,
          allTimeHours: 85,
          capacity: 48,
          capacityPercent: 44,
          totalTasks: 2,
          pendingTasks: 2,
          completedTasks: 0,
          activeProjectsCount: 2,
          assignedApproachesCount: 0,
        },
        projects: [
          {
            _id: '6abe3781770efbb9b5a4c974',
            name: 'RHIZAN Website',
            clientName: 'Internal',
            description: 'Brand website and public showcase for RHIZAN services.',
            status: 'IN_PROGRESS',
            priority: 'MEDIUM',
            deadline: '2026-10-22T00:00:00.000Z',
            budget: 1500,
          },
          {
            _id: '6abe3781770efbb9b5a4c972',
            name: 'Bakery ERP',
            clientName: 'ABC Bakery',
            description: 'Comprehensive ERP system for bakery production, inventory, and sales.',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            deadline: '2026-10-15T00:00:00.000Z',
            budget: 5000,
          },
        ],
        tasks: [
          {
            _id: 't-sad-1',
            title: 'Update portfolio case studies',
            status: 'REVIEW',
            priority: 'MEDIUM',
            project: { _id: '6abe3781770efbb9b5a4c974', name: 'RHIZAN Website' },
          },
          {
            _id: 't-sad-2',
            title: 'QA test inventory calculation edge cases',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            project: { _id: '6abe3781770efbb9b5a4c972', name: 'Bakery ERP' },
          },
        ],
        timeEntries: [
          {
            _id: 'te-sad-1',
            date: new Date().toISOString(),
            hours: 7,
            minutes: 0,
            description: 'QA regression testing on release candidate',
            billable: true,
            project: { _id: '6abe3781770efbb9b5a4c972', name: 'Bakery ERP' },
          },
        ],
        approaches: [],
      };
    }

    // Default: Abdulaziz
    return {
      user: {
        id: id || '6abe3781770efbb9b5a4c96c',
        name: 'Abdulaziz',
        email: 'abdulaziz@rhizan.com',
        role: 'ADMIN',
        title: 'Development & Engineering',
        status: 'ACTIVE',
        weeklyCapacityHours: 48,
        createdAt: '2026-10-01T10:35:45.269Z',
      },
      stats: {
        thisWeekHours: 27.1,
        allTimeHours: 142.5,
        capacity: 48,
        capacityPercent: 56,
        totalTasks: 4,
        pendingTasks: 2,
        completedTasks: 2,
        activeProjectsCount: 2,
        assignedApproachesCount: 1,
      },
      projects: [
        {
          _id: '6abe3781770efbb9b5a4c972',
          name: 'Bakery ERP',
          clientName: 'ABC Bakery',
          description: 'Comprehensive ERP system for bakery production, inventory, and sales.',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          deadline: '2026-10-15T00:00:00.000Z',
          budget: 5000,
        },
        {
          _id: '6abe3781770efbb9b5a4c974',
          name: 'RHIZAN Website',
          clientName: 'Internal',
          description: 'Brand website and public showcase for RHIZAN services.',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          deadline: '2026-10-22T00:00:00.000Z',
          budget: 1500,
        },
      ],
      tasks: [
        {
          _id: 't-abd-1',
          title: 'Fix ERP login authentication',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          project: { _id: '6abe3781770efbb9b5a4c972', name: 'Bakery ERP' },
        },
        {
          _id: 't-abd-2',
          title: 'Deploy backend to production VPS',
          status: 'TODO',
          priority: 'URGENT',
          project: { _id: '6abe3781770efbb9b5a4c972', name: 'Bakery ERP' },
        },
      ],
      timeEntries: [
        {
          _id: 'te-abd-1',
          date: new Date().toISOString(),
          hours: 8,
          minutes: 30,
          description: 'Next.js frontend setup and UI styling',
          billable: true,
          project: { _id: '6abe3781770efbb9b5a4c974', name: 'RHIZAN Website' },
        },
      ],
      approaches: [
        {
          _id: 'app-abd-1',
          businessName: 'Sed eligendi aperiam',
          contactPerson: 'Rerum est eum conse',
          email: 'minagyn@mailinator.com',
          status: 'PROSPECT',
        },
      ],
    };
  };

  const fetchMember = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<MemberDetailsResponse>(`/team/${memberId}`);
      if (res && res.user) {
        setData(res);
        setEditName(res.user.name || '');
        setEditTitle(res.user.title || '');
        setEditRole((res.user.role as any) || 'MEMBER');
        setEditCapacity(String(res.user.weeklyCapacityHours || 48));
        setEditStatus(res.user.status || 'ACTIVE');
      } else {
        const fallback = getFallbackMember(memberId);
        setData(fallback);
        setEditName(fallback.user.name);
        setEditTitle(fallback.user.title);
        setEditRole(fallback.user.role as any);
        setEditCapacity(String(fallback.user.weeklyCapacityHours));
        setEditStatus(fallback.user.status);
      }
    } catch (err: any) {
      console.warn('Using fallback member details:', err.message);
      const fallback = getFallbackMember(memberId);
      setData(fallback);
      setEditName(fallback.user.name);
      setEditTitle(fallback.user.title);
      setEditRole(fallback.user.role as any);
      setEditCapacity(String(fallback.user.weeklyCapacityHours));
      setEditStatus(fallback.user.status);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memberId) {
      fetchMember();
    }
  }, [memberId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      setEditError(null);
      await apiFetch(`/team/${memberId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editName,
          title: editTitle,
          role: editRole,
          weeklyCapacityHours: parseInt(editCapacity, 10) || 48,
          status: editStatus,
        }),
      });
      setIsEditOpen(false);
      await fetchMember();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update member profile');
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (!data?.tasks) return [];
    if (taskFilter === 'ALL') return data.tasks;
    return data.tasks.filter((t) => t.status === taskFilter);
  }, [data?.tasks, taskFilter]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <Header title="Team Member" subtitle="Loading member profile..." />
        <div className="p-6 max-w-7xl mx-auto w-full flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-3 text-neutral-400">
            <span className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
            <span className="text-xs">Loading profile and workload details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <Header title="Member Not Found" subtitle="Could not locate team member details." />
        <div className="p-6 max-w-7xl mx-auto w-full text-center py-20">
          <p className="text-sm text-neutral-400 mb-4">The requested team member does not exist or has been removed.</p>
          <Link
            href="/team"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Team Directory
          </Link>
        </div>
      </div>
    );
  }

  const { user, stats, projects, tasks, timeEntries, approaches } = data;
  const capacityLimit = user.weeklyCapacityHours || 48;
  const capacityPercent = Math.min(100, Math.round(((stats.thisWeekHours || 0) / capacityLimit) * 100));

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Top Header */}
      <Header
        title={user.name}
        subtitle={`${user.title || 'Team Member'} • ${user.role === 'ADMIN' ? 'Administrator' : 'Standard Member'}`}
        actionButton={{
          label: 'Edit Member',
          onClick: () => setIsEditOpen(true),
        }}
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/team"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Team Directory</span>
          </Link>

          <span className="text-xs text-neutral-500">
            RHIZAN Standard: <strong className="text-teal-400">48h / week</strong> (6 days × 8h)
          </span>
        </div>

        {/* Member Profile Card & Hero Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#121212] border border-[#222222] shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white font-bold text-2xl flex items-center justify-center shadow-xl shadow-teal-900/30 font-heading shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-heading text-white">{user.name}</h2>
                  {user.role === 'ADMIN' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-medium">
                      Admin
                    </span>
                  )}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      user.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20'
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
                <p className="text-xs text-teal-400 font-medium">{user.title || 'General Team Member'}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-neutral-500" />
                    <a href={`mailto:${user.email}`} className="hover:text-white transition">
                      {user.email}
                    </a>
                  </span>
                  <span className="text-neutral-600">•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    Target Capacity: <strong className="text-neutral-200">{capacityLimit}h/week</strong>
                  </span>
                  {user.createdAt && (
                    <>
                      <span className="text-neutral-600">•</span>
                      <span className="flex items-center gap-1.5 text-neutral-500">
                        <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full sm:w-64 p-3.5 bg-[#181818] border border-[#262626] rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Weekly Burn</span>
                <span className="font-bold text-white">
                  {stats.thisWeekHours}h / {capacityLimit}h ({capacityPercent}%)
                </span>
              </div>
              <div className="w-full bg-[#262626] h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    capacityPercent > 100
                      ? 'bg-rose-500'
                      : capacityPercent >= 80
                      ? 'bg-amber-400'
                      : 'bg-gradient-to-r from-teal-500 to-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, capacityPercent)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-neutral-500">
                <span>Remaining: {Math.max(0, Math.round((capacityLimit - stats.thisWeekHours) * 10) / 10)}h</span>
                <span>{capacityPercent > 100 ? 'Over capacity' : capacityPercent >= 80 ? 'Heavy' : 'On Track'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Key Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="This Week Logged"
            value={`${stats.thisWeekHours}h`}
            subtitle={`${capacityPercent}% of ${capacityLimit}h capacity`}
            icon={Flame}
            variant="teal"
          />
          <StatCard
            label="All-Time Logged"
            value={`${stats.allTimeHours}h`}
            subtitle="Total tracked work hours"
            icon={TrendingUp}
            variant="default"
          />
          <StatCard
            label="Active Projects"
            value={stats.activeProjectsCount}
            subtitle={`${projects.length} total projects involved`}
            icon={FolderKanban}
            variant="default"
          />
          <StatCard
            label="Tasks Progress"
            value={`${stats.pendingTasks} Pending`}
            subtitle={`${stats.completedTasks} completed tasks`}
            icon={CheckSquare}
            variant={stats.pendingTasks > 5 ? 'warning' : 'success'}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#222222] pb-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-[#181818]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Overview & Activity</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'projects'
                ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-[#181818]'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Projects ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-[#181818]'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('time')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'time'
                ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-[#181818]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Time Entries ({timeEntries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('outreach')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'outreach'
                ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-[#181818]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Outreach Leads ({approaches.length})</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Active Work & Projects */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Projects Showcase */}
              <div className="p-5 rounded-2xl bg-[#121212] border border-[#222222]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-teal-400" /> Active Projects
                  </h3>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="text-xs text-teal-400 hover:text-teal-300 font-medium"
                  >
                    View all ({projects.length})
                  </button>
                </div>

                {projects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {projects.slice(0, 4).map((p) => (
                      <Link
                        key={p._id}
                        href={`/projects/${p._id}`}
                        className="p-4 rounded-xl bg-[#181818] border border-[#262626] hover:border-teal-500/50 transition flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-heading text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                              {p.name}
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-teal-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                          </div>
                          <p className="text-xs text-neutral-400 line-clamp-2 mb-3">
                            {p.description || 'No description provided.'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-[#262626]">
                          <span>{p.clientName || 'Internal'}</span>
                          <span className="uppercase font-medium text-teal-400 text-[10px]">
                            {p.status.replace('_', ' ')}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-neutral-500 bg-[#181818] rounded-xl border border-[#262626]">
                    No active projects assigned.
                  </div>
                )}
              </div>

              {/* Pending Priority Tasks */}
              <div className="p-5 rounded-2xl bg-[#121212] border border-[#222222]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-400" /> Pending Workload
                  </h3>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="text-xs text-teal-400 hover:text-teal-300 font-medium"
                  >
                    All tasks ({tasks.length})
                  </button>
                </div>

                {tasks.filter((t) => t.status !== 'DONE').length > 0 ? (
                  <div className="space-y-2.5">
                    {tasks
                      .filter((t) => t.status !== 'DONE')
                      .slice(0, 5)
                      .map((task) => (
                        <div
                          key={task._id}
                          className="p-3 rounded-xl bg-[#181818] border border-[#262626] flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white truncate">{task.title}</div>
                            <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                              <span>{task.project?.name || 'General Task'}</span>
                              {task.dueDate && (
                                <>
                                  <span>•</span>
                                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-[#202020] text-neutral-300 font-medium">
                              {task.status.replace('_', ' ')}
                            </span>
                            <PriorityBadge priority={task.priority as any} />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-neutral-500 bg-[#181818] rounded-xl border border-[#262626]">
                    No pending tasks! Workload clear.
                  </div>
                )}
              </div>
            </div>

            {/* Right 1 Col: Recent Time Logs & Outreach Highlights */}
            <div className="space-y-6">
              {/* Recent Time Logs */}
              <div className="p-5 rounded-2xl bg-[#121212] border border-[#222222]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" /> Recent Time Logs
                  </h3>
                  <button
                    onClick={() => setActiveTab('time')}
                    className="text-xs text-teal-400 hover:text-teal-300 font-medium"
                  >
                    View log
                  </button>
                </div>

                {timeEntries.length > 0 ? (
                  <div className="space-y-2.5">
                    {timeEntries.slice(0, 5).map((entry) => (
                      <div
                        key={entry._id}
                        className="p-3 rounded-xl bg-[#181818] border border-[#262626] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-white truncate">{entry.description || 'Logged work'}</span>
                          <span className="text-teal-400 font-bold shrink-0">
                            {entry.hours}h {entry.minutes > 0 ? `${entry.minutes}m` : ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-neutral-500">
                          <span>{entry.project?.name || 'General'}</span>
                          <span>{new Date(entry.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-neutral-500 bg-[#181818] rounded-xl border border-[#262626]">
                    No logged hours recently.
                  </div>
                )}
              </div>

              {/* Outreach Assigned Leads */}
              <div className="p-5 rounded-2xl bg-[#121212] border border-[#222222]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-teal-400" /> Assigned Outreach
                  </h3>
                  <button
                    onClick={() => setActiveTab('outreach')}
                    className="text-xs text-teal-400 hover:text-teal-300 font-medium"
                  >
                    All ({approaches.length})
                  </button>
                </div>

                {approaches.length > 0 ? (
                  <div className="space-y-2.5">
                    {approaches.slice(0, 4).map((appr) => (
                      <Link
                        key={appr._id}
                        href={`/approaches/${appr._id}`}
                        className="p-3 rounded-xl bg-[#181818] border border-[#262626] hover:border-teal-500/40 transition flex items-center justify-between text-xs group"
                      >
                        <div>
                          <div className="font-medium text-white group-hover:text-teal-300 transition-colors">
                            {appr.businessName}
                          </div>
                          <div className="text-[11px] text-neutral-500">{appr.contactPerson}</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#202020] text-teal-400 font-medium">
                          {appr.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-neutral-500 bg-[#181818] rounded-xl border border-[#262626]">
                    No outreach targets assigned.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-heading text-white">
                All Projects Assigned ({projects.length})
              </h3>
            </div>

            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((p) => (
                  <div
                    key={p._id}
                    className="p-5 rounded-2xl bg-[#121212] border border-[#222222] hover:border-teal-500/40 transition flex flex-col justify-between shadow-sm group"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <Link
                          href={`/projects/${p._id}`}
                          className="font-heading text-base font-bold text-white group-hover:text-teal-300 transition-colors flex items-center gap-1.5"
                        >
                          <span>{p.name}</span>
                          <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-teal-300 transition-colors" />
                        </Link>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 font-medium">
                          {p.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-400 line-clamp-3 mb-4">
                        {p.description || 'No description provided.'}
                      </p>

                      <div className="space-y-1.5 text-xs text-neutral-400 mb-4 bg-[#181818] p-3 rounded-xl border border-[#262626]">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Client</span>
                          <span className="text-white font-medium">{p.clientName || 'Internal RHIZAN'}</span>
                        </div>
                        {p.deadline && (
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Deadline</span>
                            <span className="text-neutral-300">
                              {new Date(p.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {p.projectLead && (
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Project Lead</span>
                            <span className="text-teal-400">{p.projectLead.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/projects/${p._id}`}
                      className="w-full py-2 px-3 rounded-xl bg-[#181818] hover:bg-teal-500/10 border border-[#262626] hover:border-teal-500/40 text-xs font-medium text-teal-400 flex items-center justify-center gap-1.5 transition"
                    >
                      <span>Open Project Workspace</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-neutral-500 bg-[#121212] rounded-2xl border border-[#222222]">
                This team member is not currently assigned to any projects.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TASKS */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold font-heading text-white">
                Assigned Tasks ({filteredTasks.length})
              </h3>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {(['ALL', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setTaskFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      taskFilter === st
                        ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                        : 'bg-[#181818] text-neutral-400 border border-[#262626] hover:text-white hover:bg-[#202020]'
                    }`}
                  >
                    {st === 'ALL' ? 'All Status' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {filteredTasks.length > 0 ? (
              <div className="bg-[#121212] border border-[#222222] rounded-2xl overflow-hidden shadow-sm divide-y divide-[#222222]">
                {filteredTasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-4 hover:bg-[#161616] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{task.title}</span>
                        <PriorityBadge priority={task.priority as any} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-500">
                        {task.project && (
                          <Link
                            href={`/projects/${task.project._id}`}
                            className="text-teal-400 hover:underline"
                          >
                            {task.project.name}
                          </Link>
                        )}
                        {task.dueDate && (
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <span>
                            {task.subtasks.filter((s) => s.completed).length} / {task.subtasks.length} subtasks
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs uppercase px-2.5 py-1 rounded-lg bg-[#181818] border border-[#262626] text-neutral-300 font-medium">
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-neutral-500 bg-[#121212] rounded-2xl border border-[#222222]">
                No tasks found matching the selected status.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TIME ENTRIES */}
        {activeTab === 'time' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-heading text-white">Recent Time Entries</h3>
                <p className="text-xs text-neutral-500">
                  {stats.thisWeekHours} hours tracked this week towards {capacityLimit}h capacity baseline
                </p>
              </div>
              <Link
                href="/time"
                className="px-3 py-1.5 rounded-xl bg-[#181818] border border-[#262626] text-xs text-teal-400 hover:text-teal-300 transition"
              >
                Go to Time Tracker
              </Link>
            </div>

            {timeEntries.length > 0 ? (
              <div className="bg-[#121212] border border-[#222222] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#181818] border-b border-[#262626] text-neutral-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Date</th>
                        <th className="px-4 py-3 font-semibold">Project</th>
                        <th className="px-4 py-3 font-semibold">Description</th>
                        <th className="px-4 py-3 font-semibold">Type</th>
                        <th className="px-4 py-3 font-semibold text-right">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222222]">
                      {timeEntries.map((entry) => (
                        <tr key={entry._id} className="hover:bg-[#161616] transition">
                          <td className="px-4 py-3 text-neutral-300 whitespace-nowrap">
                            {new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                            {entry.project?.name || 'General Work'}
                          </td>
                          <td className="px-4 py-3 text-neutral-400 max-w-xs truncate">
                            {entry.description || entry.task?.title || 'Logged time'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                entry.billable
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20'
                              }`}
                            >
                              {entry.billable ? 'Billable' : 'Internal'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-teal-400 whitespace-nowrap">
                            {entry.hours}h {entry.minutes > 0 ? `${entry.minutes}m` : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-neutral-500 bg-[#121212] rounded-2xl border border-[#222222]">
                No time entries have been recorded yet for this member.
              </div>
            )}
          </div>
        )}

        {/* TAB 5: OUTREACH */}
        {activeTab === 'outreach' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-heading text-white">
                  Assigned Outreach Targets ({approaches.length})
                </h3>
                <p className="text-xs text-neutral-500">
                  Business acquisition targets and client leads assigned for follow-up
                </p>
              </div>
              <Link
                href="/approaches"
                className="px-3 py-1.5 rounded-xl bg-[#181818] border border-[#262626] text-xs text-teal-400 hover:text-teal-300 transition"
              >
                Go to Outreach Board
              </Link>
            </div>

            {approaches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {approaches.map((appr) => (
                  <div
                    key={appr._id}
                    className="p-5 rounded-2xl bg-[#121212] border border-[#222222] hover:border-teal-500/40 transition flex flex-col justify-between shadow-sm group"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <Link
                          href={`/approaches/${appr._id}`}
                          className="font-heading text-base font-bold text-white group-hover:text-teal-300 transition-colors flex items-center gap-1.5"
                        >
                          <span>{appr.businessName}</span>
                          <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-teal-300 transition-colors" />
                        </Link>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 font-medium">
                          {appr.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-neutral-400 mb-4 bg-[#181818] p-3 rounded-xl border border-[#262626]">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Contact</span>
                          <span className="text-white font-medium">{appr.contactPerson}</span>
                        </div>
                        {appr.email && (
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Email</span>
                            <span className="text-neutral-300">{appr.email}</span>
                          </div>
                        )}
                        {appr.phone && (
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Phone</span>
                            <span className="text-neutral-300">{appr.phone}</span>
                          </div>
                        )}
                        {appr.nextFollowUpDate && (
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Next Follow-up</span>
                            <span className="text-amber-400 font-medium">
                              {new Date(appr.nextFollowUpDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/approaches/${appr._id}`}
                      className="w-full py-2 px-3 rounded-xl bg-[#181818] hover:bg-teal-500/10 border border-[#262626] hover:border-teal-500/40 text-xs font-medium text-teal-400 flex items-center justify-center gap-1.5 transition"
                    >
                      <span>Open Outreach Detail</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-neutral-500 bg-[#121212] rounded-2xl border border-[#222222]">
                No outreach targets currently assigned to this team member.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Member Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Team Member Profile"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          {editError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{editError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Department / Role Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="e.g. Development"
                required
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                System Role
              </label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as any)}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Weekly Capacity (Hours)
              </label>
              <input
                type="number"
                value={editCapacity}
                onChange={(e) => setEditCapacity(e.target.value)}
                min="10"
                max="80"
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              />
              <span className="text-[10px] text-teal-400 mt-1 block">Baseline: 48h (6d × 8h)</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-[#1a1a1a] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs shadow-md shadow-teal-900/30 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
