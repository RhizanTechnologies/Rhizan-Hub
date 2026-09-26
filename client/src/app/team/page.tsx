'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { apiFetch } from '@/lib/api';
import {
  Clock,
  CheckSquare,
  Mail,
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

  // Exact data from user's specification Section 2
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

  useEffect(() => {
    async function loadTeam() {
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
    }
    loadTeam();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Team Directory"
        subtitle="Current responsibilities, active projects, and workload across RHIZAN"
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member) => {
            const capacityPercent = Math.min(
              100,
              Math.round((member.thisWeekHours / member.weeklyCapacityHours) * 100)
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
                        {member.activeTaskCount}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" /> This Week
                      </span>
                      <div className="font-heading text-base font-bold text-teal-400 mt-0.5">
                        {member.thisWeekHours}h
                      </div>
                    </div>
                  </div>

                  {/* Hours Capacity Bar */}
                  <div className="space-y-1.5 mb-5">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span>Weekly Capacity ({member.weeklyCapacityHours}h)</span>
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
                      {member.activeProjects.map((p, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded-lg bg-[#181818] border border-[#262626] text-xs text-neutral-300 font-medium"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Current Tasks List */}
                  <div>
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                      Assigned Work ({member.tasks.length})
                    </span>
                    <div className="space-y-2">
                      {member.tasks.map((task) => (
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
                      ))}
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
    </div>
  );
}
