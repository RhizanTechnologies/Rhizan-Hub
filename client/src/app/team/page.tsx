'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Modal } from '@/components/Modal';
import { apiFetch } from '@/lib/api';
import {
  Clock,
  CheckSquare,
  Mail,
  UserPlus,
  Copy,
  Check,
  KeyRound,
  RefreshCw,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { PriorityBadge } from '@/components/Badge';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  title: string;
  status: string;
  weeklyCapacityHours: number;
  activeTaskCount: number;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: any;
    projectName: string;
  }>;
  activeProjects: string[];
  thisWeekHours: number;
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [inviteTitle, setInviteTitle] = useState('Development');
  const [inviteCapacity, setInviteCapacity] = useState('40');
  const [tempoPassword, setTempoPassword] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Success modal state
  const [createdInvite, setCreatedInvite] = useState<{
    name: string;
    email: string;
    tempoPass: string;
    emailSent?: boolean;
    emailMessage?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Initial fallback team data
  const initialTeam: TeamMember[] = [
    {
      id: '1',
      name: 'Abdulaziz',
      email: 'abdulaziz@rhizan.com',
      role: 'ADMIN',
      title: 'Development & Engineering',
      status: 'ACTIVE',
      weeklyCapacityHours: 40,
      activeTaskCount: 4,
      thisWeekHours: 27,
      activeProjects: ['Bakery ERP', 'RHIZAN Website'],
      tasks: [
        { id: '1', title: 'Fix ERP login authentication', status: 'TODO', priority: 'HIGH', projectName: 'Bakery ERP' },
        { id: '2', title: 'Deploy backend to production VPS', status: 'IN_PROGRESS', priority: 'URGENT', projectName: 'Bakery ERP' },
        { id: '3', title: 'API integration for kitchen orders', status: 'IN_PROGRESS', priority: 'MEDIUM', projectName: 'Bakery ERP' },
        { id: '4', title: 'Test payment gateway sandbox', status: 'REVIEW', priority: 'HIGH', projectName: 'Bakery ERP' },
      ],
    },
    {
      id: '2',
      name: 'Nebiyu',
      email: 'nebiyu@rhizan.com',
      role: 'MEMBER',
      title: 'Business & Client Outreach',
      status: 'ACTIVE',
      weeklyCapacityHours: 40,
      activeTaskCount: 6,
      thisWeekHours: 24,
      activeProjects: ['Client Acquisition Q4', 'Bakery ERP'],
      tasks: [
        { id: '5', title: 'Follow up with ABC Bakery on invoice', status: 'TODO', priority: 'HIGH', projectName: 'Bakery ERP' },
        { id: '6', title: 'Client pitch presentation for XYZ Bistro', status: 'IN_PROGRESS', priority: 'MEDIUM', projectName: 'Client Acquisition' },
        { id: '7', title: 'Prepare Client X proposal document', status: 'TODO', priority: 'MEDIUM', projectName: 'Client Acquisition' },
      ],
    },
    {
      id: '3',
      name: 'Sadam',
      email: 'sadam@rhizan.com',
      role: 'MEMBER',
      title: 'Operations & Product QA',
      status: 'ACTIVE',
      weeklyCapacityHours: 40,
      activeTaskCount: 3,
      thisWeekHours: 21,
      activeProjects: ['RHIZAN Website', 'Bakery ERP'],
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
    setInviteCapacity('40');
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
          weeklyCapacityHours: parseInt(inviteCapacity, 10) || 40,
          customTemporaryPassword: tempoPassword,
        }),
      });

      // Save for success popup
      setCreatedInvite({
        name: inviteName,
        email: inviteEmail,
        tempoPass: res.temporaryPassword || tempoPassword,
        emailSent: res.emailSent,
        emailMessage: res.emailMessage,
      });

      setIsInviteOpen(false);
      // Reload team list
      await loadTeam();
    } catch (err: any) {
      setInviteError(err.message || 'Failed to send invite.');
    } finally {
      setIsInviting(false);
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

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Team Directory"
        subtitle="Current responsibilities, active projects, and workload across RHIZAN"
        actionButton={{
          label: 'Invite Member',
          onClick: handleOpenInvite,
        }}
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-5 sm:space-y-6">
        {/* Team Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {team.map((member) => {
            const capacityPercent = Math.min(
              100,
              Math.round((member.thisWeekHours / (member.weeklyCapacityHours || 40)) * 100)
            );

            return (
              <div
                key={member.id}
                className="p-5 rounded-2xl bg-[#121212] border border-[#222222] hover:border-[#333333] transition flex flex-col justify-between shadow-sm"
              >
                <div>
                  {/* Member Profile Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white font-bold text-base flex items-center justify-center shadow-lg shadow-teal-900/20 font-heading">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-heading text-base font-bold text-white">{member.name}</h3>
                          {member.role === 'ADMIN' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 font-medium">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-teal-400 font-medium">{member.title}</p>
                      </div>
                    </div>

                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse mt-1" />
                  </div>

                  {/* Summary Metric Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-[#181818] border border-[#262626]">
                    <div>
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <CheckSquare className="w-3 h-3 text-teal-400" /> Active Tasks
                      </span>
                      <div className="font-heading text-base font-bold text-white mt-0.5">
                        {member.activeTaskCount ?? member.tasks?.length ?? 0}
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

                  {/* Hours Capacity Bar */}
                  <div className="space-y-1.5 mb-5">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span>Weekly Capacity ({member.weeklyCapacityHours || 40}h)</span>
                      <span className="font-semibold text-neutral-200">{capacityPercent}%</span>
                    </div>
                    <div className="w-full bg-[#262626] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Active Projects */}
                  <div className="mb-4">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                      Active Projects
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(member.activeProjects || []).length > 0 ? (
                        member.activeProjects.map((p, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded-lg bg-[#181818] border border-[#262626] text-xs text-neutral-300 font-medium"
                          >
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-neutral-500 italic">No assigned projects</span>
                      )}
                    </div>
                  </div>

                  {/* Current Tasks List */}
                  <div>
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                      Assigned Work ({(member.tasks || []).length})
                    </span>
                    <div className="space-y-2">
                      {(member.tasks || []).length > 0 ? (
                        member.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-2.5 rounded-lg bg-[#181818] border border-[#262626] text-xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-neutral-200 truncate pr-2">
                                {task.title}
                              </span>
                              <PriorityBadge priority={task.priority} />
                            </div>
                            <div className="text-[10px] text-neutral-500">{task.projectName}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-neutral-500 italic p-2 bg-[#181818] rounded-lg border border-[#262626]">
                          No pending tasks
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#222222] text-center">
                  <span className="text-xs text-neutral-400 flex items-center justify-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-neutral-500" /> {member.email}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
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
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Weekly Capacity (Hours)
            </label>
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

      {/* Invitation Credentials Ready Modal */}
      <Modal
        isOpen={Boolean(createdInvite)}
        onClose={() => setCreatedInvite(null)}
        title="Member Invitation Created"
      >
        {createdInvite && (
          <div className="space-y-4">
            {createdInvite.emailSent ? (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Invitation Email Delivered!</h4>
                  <p className="text-[11px] text-emerald-300 mt-0.5">
                    An email with the temporary login password and link was automatically sent to <span className="font-semibold text-white">{createdInvite.email}</span>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Invitation Created</h4>
                  <p className="text-[11px] text-neutral-300 mt-0.5">
                    {createdInvite.emailMessage || 'Invitation created. To send emails automatically, configure Gmail or Resend in server/.env.'}
                  </p>
                </div>
              </div>
            )}

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

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs shadow-md shadow-teal-900/30 flex items-center justify-center gap-2 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Invitation Details</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setCreatedInvite(null)}
                className="py-2.5 px-4 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] hover:bg-[#222222] text-neutral-300 text-xs font-medium transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
