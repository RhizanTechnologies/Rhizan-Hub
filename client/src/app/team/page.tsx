'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { Modal } from '@/components/Modal';
import { PriorityBadge } from '@/components/Badge';
import { apiFetch } from '@/lib/api';
import {
  Clock,
  CheckSquare,
  Mail,
  UserPlus,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  ArrowUpRight,
  Search,
  Users,
  Briefcase,
  Flame,
  ArrowRight,
  Layers,
  Send,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ActiveProjectItem {
  id?: string;
  _id?: string;
  name: string;
  status?: string;
  clientName?: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  title: string;
  status: string;
  mustChangePassword?: boolean;
  weeklyCapacityHours: number;
  activeTaskCount: number;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: any;
    projectName: string;
  }>;
  activeProjects: Array<string | ActiveProjectItem>;
  thisWeekHours: number;
}

export default function TeamPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  const currentUserId = currentUser?.id || currentUser?._id;

  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Expanded Tasks State (per member id)
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  // Invite modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [inviteTitle, setInviteTitle] = useState('Development');
  const [inviteCapacity, setInviteCapacity] = useState('48');
  const [tempoPassword, setTempoPassword] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Success modal state
  const [createdInvite, setCreatedInvite] = useState<{
    userId?: string;
    name: string;
    email: string;
    tempoPass: string;
    emailSent?: boolean;
    emailMessage?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showBackupCreds, setShowBackupCreds] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initial fallback team data (48h weekly capacity: 6 days x 8h)
  const initialTeam: TeamMember[] = [
    {
      id: '6abe3781770efbb9b5a4c96c',
      name: 'Abdulaziz',
      email: 'abdulaziz@rhizan.com',
      role: 'ADMIN',
      title: 'Development & Engineering',
      status: 'ACTIVE',
      weeklyCapacityHours: 48,
      activeTaskCount: 4,
      thisWeekHours: 27.1,
      activeProjects: [
        { id: '6abe3781770efbb9b5a4c972', name: 'Bakery ERP' },
        { id: '6abe3781770efbb9b5a4c974', name: 'RHIZAN Website' },
      ],
      tasks: [
        { id: '1', title: 'Fix ERP login authentication', status: 'TODO', priority: 'HIGH', projectName: 'Bakery ERP' },
        { id: '2', title: 'Deploy backend to production VPS', status: 'IN_PROGRESS', priority: 'URGENT', projectName: 'Bakery ERP' },
        { id: '3', title: 'API integration for kitchen orders', status: 'IN_PROGRESS', priority: 'MEDIUM', projectName: 'Bakery ERP' },
        { id: '4', title: 'Test payment gateway sandbox', status: 'REVIEW', priority: 'HIGH', projectName: 'Bakery ERP' },
      ],
    },
    {
      id: '6abe3781770efbb9b5a4c96e',
      name: 'Nebiyu',
      email: 'nebiyu@rhizan.com',
      role: 'MEMBER',
      title: 'Business & Client Outreach',
      status: 'ACTIVE',
      weeklyCapacityHours: 48,
      activeTaskCount: 6,
      thisWeekHours: 24,
      activeProjects: [
        { id: '6abe3781770efbb9b5a4c976', name: 'Client Acquisition Q4' },
        { id: '6abe3781770efbb9b5a4c972', name: 'Bakery ERP' },
      ],
      tasks: [
        { id: '5', title: 'Follow up with ABC Bakery on invoice', status: 'TODO', priority: 'HIGH', projectName: 'Bakery ERP' },
        { id: '6', title: 'Client pitch presentation for XYZ Bistro', status: 'IN_PROGRESS', priority: 'MEDIUM', projectName: 'Client Acquisition' },
        { id: '7', title: 'Prepare Client X proposal document', status: 'TODO', priority: 'MEDIUM', projectName: 'Client Acquisition' },
      ],
    },
    {
      id: '6abe3781770efbb9b5a4c970',
      name: 'Sadam',
      email: 'sadam@rhizan.com',
      role: 'MEMBER',
      title: 'Operations & Product QA',
      status: 'ACTIVE',
      weeklyCapacityHours: 48,
      activeTaskCount: 3,
      thisWeekHours: 21,
      activeProjects: [
        { id: '6abe3781770efbb9b5a4c974', name: 'RHIZAN Website' },
        { id: '6abe3781770efbb9b5a4c972', name: 'Bakery ERP' },
      ],
      tasks: [
        { id: '8', title: 'Update portfolio case studies', status: 'REVIEW', priority: 'MEDIUM', projectName: 'RHIZAN Website' },
        { id: '9', title: 'QA test inventory calculation edge cases', status: 'IN_PROGRESS', priority: 'HIGH', projectName: 'Bakery ERP' },
      ],
    },
  ];

  const loadTeam = async () => {
    try {
      const data = await apiFetch<TeamMember[]>('/team');
      if (data && data.length > 0) {
        setTeam(data);
      } else {
        setTeam(initialTeam);
      }
    } catch {
      setTeam(initialTeam);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `Rhizan@${code}`;
  };

  const handleOpenInvite = () => {
    setTempoPassword(generateRandomPassword());
    setInviteName('');
    setInviteEmail('');
    setInviteTitle('Development');
    setInviteRole('MEMBER');
    setInviteCapacity('48');
    setInviteError(null);
    setIsInviteOpen(true);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail || !tempoPassword) {
      setInviteError('Please complete all required fields.');
      return;
    }

    try {
      setIsInviting(true);
      setInviteError(null);

      const res = await apiFetch<{
        message: string;
        user: any;
        temporaryPassword: string;
        emailSent: boolean;
        emailMessage?: string;
      }>('/team/invite', {
        method: 'POST',
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail,
          role: inviteRole,
          title: inviteTitle,
          weeklyCapacityHours: parseInt(inviteCapacity, 10) || 48,
          customTemporaryPassword: tempoPassword,
        }),
      });

      setCreatedInvite({
        userId: res.user?.id || res.user?._id,
        name: inviteName,
        email: inviteEmail,
        tempoPass: res.temporaryPassword || tempoPassword,
        emailSent: res.emailSent,
        emailMessage: res.emailMessage,
      });
      setShowBackupCreds(false);

      setIsInviteOpen(false);
      await loadTeam();
    } catch (err: any) {
      setInviteError(err.message || 'Failed to send invite.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleResendInvite = async (memberId: string, memberEmail: string) => {
    try {
      setResendingId(memberId);
      const res = await apiFetch<{
        message: string;
        emailSent: boolean;
        emailMessage?: string;
        temporaryPassword?: string;
      }>(`/team/${memberId}/resend-invite`, {
        method: 'POST',
      });

      if (res.emailSent) {
        setToastMessage({
          type: 'success',
          text: `Invitation email delivered directly to ${memberEmail}!`,
        });
      } else {
        setToastMessage({
          type: 'error',
          text: res.emailMessage || 'Failed to send email. Check SMTP setup in Vercel.',
        });
      }
      setTimeout(() => setToastMessage(null), 6000);
      await loadTeam();
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err.message || 'Failed to resend invite.',
      });
      setTimeout(() => setToastMessage(null), 6000);
    } finally {
      setResendingId(null);
    }
  };

  const handleDeleteMember = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await apiFetch(`/team/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      setToastMessage({
        type: 'success',
        text: `Team member ${deleteTarget.name} has been removed.`,
      });
      setTimeout(() => setToastMessage(null), 5000);
      setDeleteTarget(null);
      await loadTeam();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete team member.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdInvite) return;
    const loginUrl = `${window.location.origin}/login`;
    const text = `RHIZAN Hub Invitation\n\nHello ${createdInvite.name},\nYou have been invited to RHIZAN Hub.\n\nLogin URL: ${loginUrl}\nEmail: ${createdInvite.email}\nTemporary Password: ${createdInvite.tempoPass}\n\nNote: You will be asked to change your password immediately upon your first sign in.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleExpanded = (memberId: string) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  // Helper to normalize project info
  const getProjectInfo = (p: string | ActiveProjectItem) => {
    if (typeof p === 'string') {
      return { id: '', name: p };
    }
    return {
      id: p.id || p._id || '',
      name: p.name || 'Project',
      clientName: p.clientName,
    };
  };

  // Department tabs
  const departments = useMemo(() => {
    const set = new Set<string>();
    team.forEach((m) => {
      if (m.title) set.add(m.title);
    });
    return ['ALL', ...Array.from(set)];
  }, [team]);

  // Filtered members
  const filteredTeam = useMemo(() => {
    return team.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.title && member.title.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDept =
        departmentFilter === 'ALL' || member.title?.toLowerCase() === departmentFilter.toLowerCase();

      return matchesSearch && matchesDept;
    });
  }, [team, searchQuery, departmentFilter]);

  // Top Aggregates
  const totalCapacityHours = team.reduce((acc, m) => acc + (m.weeklyCapacityHours || 48), 0);
  const totalHoursLoggedThisWeek = team.reduce((acc, m) => acc + (m.thisWeekHours || 0), 0);
  const totalActiveTasks = team.reduce((acc, m) => acc + (m.tasks?.length || m.activeTaskCount || 0), 0);
  const teamUtilizationPercent =
    totalCapacityHours > 0 ? Math.round((totalHoursLoggedThisWeek / totalCapacityHours) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Team Directory"
        subtitle="Manage member responsibilities, active projects, 48h weekly capacity, and performance"
        actionButton={{
          label: 'Invite Member',
          onClick: handleOpenInvite,
        }}
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Team Members"
            value={team.length}
            subtitle="Active collaborators"
            icon={Users}
            variant="default"
          />
          <StatCard
            label="Total Weekly Capacity"
            value={`${totalCapacityHours}h`}
            subtitle="48h baseline (6d × 8h)"
            icon={Clock}
            variant="teal"
          />
          <StatCard
            label="Logged This Week"
            value={`${Math.round(totalHoursLoggedThisWeek * 10) / 10}h`}
            subtitle="Recorded time entries"
            icon={Flame}
            variant="success"
          />
          <StatCard
            label="Team Utilization"
            value={`${teamUtilizationPercent}%`}
            subtitle={`${totalActiveTasks} active tasks total`}
            icon={Briefcase}
            variant={teamUtilizationPercent > 90 ? 'warning' : 'default'}
          />
        </div>

        {/* Search & Department Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-[#121212] border border-[#222222] rounded-2xl">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team members by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181818] border border-[#262626] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-teal-500 transition"
            />
          </div>

          {/* Department Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {departments.map((dept) => {
              const active = departmentFilter === dept;
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setDepartmentFilter(dept)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                    active
                      ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                      : 'bg-[#181818] text-neutral-400 border border-[#262626] hover:text-white hover:bg-[#202020]'
                  }`}
                >
                  {dept === 'ALL' ? 'All Roles' : dept}
                </button>
              );
            })}
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredTeam.map((member) => {
            const capacityLimit = member.weeklyCapacityHours || 48;
            const capacityPercent = Math.min(
              100,
              Math.round(((member.thisWeekHours || 0) / capacityLimit) * 100)
            );
            const isExpanded = !!expandedTasks[member.id];
            const tasksList = member.tasks || [];
            const visibleTasks = isExpanded ? tasksList : tasksList.slice(0, 2);
            const hasMoreTasks = tasksList.length > 2;

            // Load indicator badge
            const getLoadStatus = () => {
              if (capacityPercent >= 90) return { label: 'High Load', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
              if (capacityPercent >= 50) return { label: 'Optimal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
              return { label: 'Available', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' };
            };
            const loadStatus = getLoadStatus();

            return (
              <div
                key={member.id}
                className="p-5 rounded-2xl bg-[#121212] border border-[#222222] hover:border-teal-500/30 transition-all flex flex-col justify-between shadow-sm group"
              >
                <div>
                  {/* Member Profile Header */}
                  <div className="flex items-start justify-between mb-4">
                    <Link
                      href={`/team/${member.id}`}
                      className="flex items-center gap-3 group/profile focus:outline-none"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white font-bold text-base flex items-center justify-center shadow-lg shadow-teal-900/20 font-heading group-hover/profile:scale-105 transition-transform">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-heading text-base font-bold text-white group-hover/profile:text-teal-300 transition-colors">
                            {member.name}
                          </h3>
                          {member.role === 'ADMIN' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 font-medium">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 font-medium">{member.title}</p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${loadStatus.color}`}
                      >
                        {loadStatus.label}
                      </span>
                      {isAdmin && member.id !== currentUserId && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteTarget(member);
                          }}
                          title={`Delete ${member.name}`}
                          className="w-7 h-7 rounded-lg bg-neutral-900/80 hover:bg-rose-500/20 border border-neutral-800 hover:border-rose-500/40 text-neutral-500 hover:text-rose-400 flex items-center justify-center transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary Metric Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-[#181818] border border-[#262626]">
                    <div>
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <CheckSquare className="w-3 h-3 text-teal-400" /> Active Tasks
                      </span>
                      <div className="font-heading text-base font-bold text-white mt-0.5">
                        {tasksList.length}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" /> This Week
                      </span>
                      <div className="font-heading text-base font-bold text-teal-400 mt-0.5">
                        {member.thisWeekHours ?? 0}h
                      </div>
                    </div>
                  </div>

                  {/* Hours Capacity Bar (48h baseline) */}
                  <div className="space-y-1.5 mb-5">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span>Weekly Capacity ({capacityLimit}h)</span>
                      <span className="font-semibold text-neutral-200">{capacityPercent}%</span>
                    </div>
                    <div className="w-full bg-[#262626] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Active Projects (Clickable links to each project) */}
                  <div className="mb-4">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                      Active Projects
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(member.activeProjects || []).length > 0 ? (
                        member.activeProjects.map((p, idx) => {
                          const proj = getProjectInfo(p);
                          if (proj.id) {
                            return (
                              <Link
                                key={idx}
                                href={`/projects/${proj.id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#181818] hover:bg-[#202020] border border-[#262626] hover:border-teal-500/50 text-xs text-neutral-300 hover:text-teal-300 font-medium transition group/p"
                              >
                                <span>{proj.name}</span>
                                <ArrowUpRight className="w-3 h-3 opacity-50 group-hover/p:opacity-100 group-hover/p:translate-x-0.5 group-hover/p:-translate-y-0.5 transition" />
                              </Link>
                            );
                          }
                          return (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-[#181818] border border-[#262626] text-xs text-neutral-300 font-medium"
                            >
                              {proj.name}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-neutral-500 italic">No assigned projects</span>
                      )}
                    </div>
                  </div>

                  {/* Assigned Work (Shows 2 tasks initially, then expandable) */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                        Assigned Work ({tasksList.length})
                      </span>
                    </div>

                    <div className="space-y-2">
                      {tasksList.length > 0 ? (
                        <>
                          {visibleTasks.map((task) => (
                            <div
                              key={task.id}
                              className="p-2.5 rounded-lg bg-[#181818] border border-[#262626] text-xs hover:border-[#333333] transition"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-neutral-200 truncate pr-2">
                                  {task.title}
                                </span>
                                <PriorityBadge priority={task.priority} />
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-neutral-500">
                                <span>{task.projectName}</span>
                                <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-[#202020] text-neutral-400">
                                  {task.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          ))}

                          {hasMoreTasks && (
                            <button
                              type="button"
                              onClick={() => toggleExpanded(member.id)}
                              className="w-full py-1.5 px-3 rounded-lg bg-[#181818] hover:bg-[#202020] border border-[#262626] hover:border-teal-500/40 text-[11px] font-medium text-teal-400 hover:text-teal-300 flex items-center justify-center gap-1.5 transition"
                            >
                              <span>
                                {isExpanded
                                  ? 'Show less'
                                  : `+ Show ${tasksList.length - 2} more tasks`}
                              </span>
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="text-xs text-neutral-500 italic p-2.5 bg-[#181818] rounded-lg border border-[#262626]">
                          No pending tasks
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer with detail page link and email */}
                <div className="pt-3.5 border-t border-[#222222] space-y-2.5">
                  {member.mustChangePassword && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-teal-500/5 border border-teal-500/20 text-xs">
                      <span className="text-[11px] text-teal-300 font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>Invitation Pending</span>
                      </span>
                      <button
                        type="button"
                        disabled={resendingId === member.id}
                        onClick={() => handleResendInvite(member.id, member.email)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-teal-600/90 hover:bg-teal-500 text-white font-medium flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
                      >
                        {resendingId === member.id ? (
                          <>
                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>Resend Email</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/team/${member.id}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#181818] hover:bg-teal-500/10 border border-[#262626] hover:border-teal-500/40 text-xs font-medium text-neutral-300 hover:text-teal-300 flex items-center justify-center gap-1.5 transition group/btn"
                    >
                      <span>View Profile & Workload</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                    {isAdmin && member.id !== currentUserId && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteTarget(member);
                        }}
                        title={`Delete ${member.name}`}
                        className="py-2 px-2.5 rounded-xl bg-[#181818] hover:bg-rose-500/20 border border-[#262626] hover:border-rose-500/40 text-neutral-400 hover:text-rose-400 flex items-center justify-center transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="text-center">
                    <span className="text-[11px] text-neutral-500 flex items-center justify-center gap-1.5 hover:text-neutral-400 transition">
                      <Mail className="w-3 h-3 text-neutral-500" /> {member.email}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTeam.length === 0 && (
          <div className="text-center py-16 bg-[#121212] border border-[#222222] rounded-2xl">
            <Users className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No team members match your filter</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search query or clear the department filter to view all members.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setDepartmentFilter('ALL');
              }}
              className="mt-4 px-4 py-1.5 rounded-xl bg-[#181818] border border-[#262626] text-xs text-teal-400 hover:text-teal-300 transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite New Team Member"
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          {inviteError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{inviteError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="e.g. Ahmed Yasin"
              required
              className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Work Email
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="e.g. ahmed@rhizan.com"
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
                value={inviteTitle}
                onChange={(e) => setInviteTitle(e.target.value)}
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
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-neutral-300">
                Weekly Capacity (Hours)
              </label>
              <span className="text-[10px] text-teal-400">RHIZAN Standard: 48h (6d × 8h)</span>
            </div>
            <input
              type="number"
              value={inviteCapacity}
              onChange={(e) => setInviteCapacity(e.target.value)}
              min="10"
              max="80"
              className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
            />
          </div>

          {/* Temporary Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-neutral-300">
                Temporary Password
              </label>
              <button
                type="button"
                onClick={() => setTempoPassword(generateRandomPassword())}
                className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1 transition"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Regenerate</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={tempoPassword}
                onChange={(e) => setTempoPassword(e.target.value)}
                required
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-teal-300 font-mono tracking-wide outline-none transition"
              />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              The member will be strictly prompted to set their permanent password on their first login.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsInviteOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-[#1a1a1a] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isInviting}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs shadow-md shadow-teal-900/30 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isInviting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Inviting...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Invitation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Invitation Status Modal */}
      <Modal
        isOpen={Boolean(createdInvite)}
        onClose={() => setCreatedInvite(null)}
        title={createdInvite?.emailSent ? 'Invitation Dispatched' : 'Invitation Notice'}
      >
        {createdInvite && (
          <div className="space-y-4">
            {createdInvite.emailSent ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-950/40">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Invitation Email Dispatched!</h4>
                  <p className="text-xs text-emerald-300/90 mt-1 max-w-sm mx-auto leading-relaxed">
                    An email has been automatically sent to{' '}
                    <span className="font-semibold text-white underline underline-offset-2">{createdInvite.email}</span>.
                    The team member can open their inbox to retrieve their temporary credentials and sign in.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-left space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Automatic Email Delivery Failed</span>
                </div>
                <p className="text-[11px] text-rose-200/80 leading-relaxed">
                  {createdInvite.emailMessage || 'Failed to dispatch email via SMTP.'}
                </p>
                <p className="text-[11px] text-neutral-400 pt-1">
                  💡 Make sure the SMTP environment variables are added to your Vercel Project Settings and you have triggered a <strong>Redeploy</strong>.
                </p>
              </div>
            )}

            {/* If email failed OR if user toggled backup details */}
            {(!createdInvite.emailSent || showBackupCreds) && (
              <div className="p-3.5 rounded-xl bg-[#161616] border border-[#262626] space-y-2.5 font-mono text-xs">
                <div>
                  <span className="text-[10px] uppercase font-sans text-neutral-500 block">Login URL</span>
                  <span className="text-neutral-200 text-xs">
                    {typeof window !== 'undefined' ? `${window.location.origin}/login` : '/login'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-sans text-neutral-500 block">Work Email</span>
                  <span className="text-teal-400 text-xs font-semibold">{createdInvite.email}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-sans text-neutral-500 block">Temporary Password</span>
                  <span className="text-emerald-400 text-xs font-bold tracking-wider">{createdInvite.tempoPass}</span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              {createdInvite.emailSent ? (
                <>
                  <button
                    type="button"
                    onClick={() => setCreatedInvite(null)}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs shadow-md shadow-teal-900/30 flex items-center justify-center gap-2 transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Done</span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setShowBackupCreds(!showBackupCreds)}
                      className="text-[11px] text-neutral-500 hover:text-neutral-400 transition"
                    >
                      {showBackupCreds ? 'Hide backup credentials' : 'View temporary credentials (backup only)'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  {createdInvite.userId && (
                    <button
                      type="button"
                      disabled={resendingId === createdInvite.userId}
                      onClick={() => handleResendInvite(createdInvite.userId!, createdInvite.email)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      {resendingId === createdInvite.userId ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Retrying...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Retry Sending Email</span>
                        </>
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="py-2.5 px-3 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] hover:bg-[#222222] text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreatedInvite(null)}
                    className="py-2.5 px-3 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] hover:bg-[#222222] text-neutral-300 text-xs font-medium transition"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Member Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
        title="Delete Team Member"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">Permanently Remove Member</h4>
                <p className="text-xs text-rose-200/90 leading-relaxed">
                  Are you sure you want to remove <strong className="text-white">{deleteTarget.name}</strong> ({deleteTarget.email}) from Rhizan Hub?
                </p>
                <p className="text-[11px] text-neutral-400 pt-1">
                  This will revoke their access, unassign any open tasks, and remove them from project teams. This action cannot be undone.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-[#1a1a1a] transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteMember}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-md shadow-rose-950/40 flex items-center gap-2 transition disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Member</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 backdrop-blur-xl animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-[#10241e]/95 border-emerald-500/40 text-emerald-200'
              : 'bg-[#291417]/95 border-rose-500/40 text-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-medium">{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
