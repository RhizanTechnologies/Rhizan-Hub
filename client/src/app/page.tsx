'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { PriorityBadge, StatusBadge } from '@/components/Badge';
import {
  CheckSquare,
  AlertCircle,
  Clock,
  FolderKanban,
  Users,
  Building2,
  TrendingUp,
  ArrowRight,
  Plus,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { DashboardSummary } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback initial data matching the user's specification
  const fallbackData: DashboardSummary = {
    stats: {
      totalTasks: 12,
      tasksDueToday: 3,
      overdueTasks: 2,
      activeProjectsCount: 3,
      activeClientsCount: 5,
      teamMembersCount: 3,
      hoursThisWeek: 72,
    },
    activeProjects: [
      {
        id: '1',
        name: 'Bakery ERP',
        clientName: 'ABC Bakery',
        progress: 80,
        totalTasks: 18,
        status: 'IN_PROGRESS',
        deadline: 'Oct 14',
      },
      {
        id: '2',
        name: 'RHIZAN Website',
        clientName: 'Internal',
        progress: 50,
        totalTasks: 12,
        status: 'IN_PROGRESS',
        deadline: 'Oct 21',
      },
      {
        id: '3',
        name: 'Client Acquisition Q4',
        clientName: 'Internal',
        progress: 25,
        totalTasks: 8,
        status: 'IN_PROGRESS',
        deadline: 'Oct 30',
      },
    ],
    myTasks: [
      {
        _id: 't1',
        title: 'Fix ERP login authentication',
        description: 'Resolve session timeout issue',
        priority: 'HIGH',
        status: 'TODO',
        project: { _id: '1', name: 'Bakery ERP', clientName: 'ABC Bakery', status: 'IN_PROGRESS' },
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 't2',
        title: 'Deploy backend to production VPS',
        description: 'Configure PM2 and Nginx reverse proxy',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        project: { _id: '1', name: 'Bakery ERP', clientName: 'ABC Bakery', status: 'IN_PROGRESS' },
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 't3',
        title: 'Follow up with ABC Bakery on invoice',
        description: 'Verify milestone payment',
        priority: 'HIGH',
        status: 'TODO',
        project: { _id: '1', name: 'Bakery ERP', clientName: 'ABC Bakery', status: 'IN_PROGRESS' },
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 't4',
        title: 'Update portfolio case studies',
        description: 'Add bakery ERP screenshots',
        priority: 'MEDIUM',
        status: 'REVIEW',
        project: { _id: '2', name: 'RHIZAN Website', clientName: 'Internal', status: 'IN_PROGRESS' },
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    recentActivities: [
      {
        _id: 'a1',
        user: 'u1',
        userName: 'Abdulaziz',
        action: 'moved task to Review',
        entityType: 'TASK',
        entityTitle: 'Test bakery payment integration',
        createdAt: '2 hours ago',
      },
      {
        _id: 'a2',
        user: 'u2',
        userName: 'Nebiyu',
        action: 'added new lead / client',
        entityType: 'CLIENT',
        entityTitle: 'Apex Printing Press',
        createdAt: '3 hours ago',
      },
      {
        _id: 'a3',
        user: 'u3',
        userName: 'Sadam',
        action: 'completed task',
        entityType: 'TASK',
        entityTitle: 'Landing page responsive design check',
        createdAt: 'Yesterday',
      },
      {
        _id: 'a4',
        user: 'u1',
        userName: 'Abdulaziz',
        action: 'logged 4h 30m on',
        entityType: 'TIME',
        entityTitle: 'Bakery ERP',
        createdAt: 'Yesterday',
      },
    ],
    upcomingDeadlines: [],
  };

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await apiFetch<DashboardSummary>('/dashboard/summary');
        setData(res);
      } catch (err) {
        setData(fallbackData);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const currentData = data || fallbackData;

  const toggleTaskDone = (taskId: string) => {
    if (!data) return;
    setData({
      ...data,
      myTasks: data.myTasks.map((t) =>
        t._id === taskId
          ? { ...t, status: t.status === 'DONE' ? 'TODO' : 'DONE' }
          : t
      ),
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Rhizan Operations"
        subtitle={`Welcome back, ${user?.name || 'Abdulaziz'} 👋`}
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top KPIs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <StatCard
            label="Total Tasks"
            value={currentData.stats.totalTasks}
            subtitle="Across team"
            icon={CheckSquare}
          />
          <StatCard
            label="Due Today"
            value={currentData.stats.tasksDueToday}
            subtitle="Requires attention"
            icon={Calendar}
            variant="warning"
          />
          <StatCard
            label="Overdue"
            value={currentData.stats.overdueTasks}
            subtitle="Past deadline"
            icon={AlertCircle}
            variant="danger"
          />
          <StatCard
            label="Active Projects"
            value={currentData.stats.activeProjectsCount}
            subtitle="In progress"
            icon={FolderKanban}
            variant="teal"
          />
          <StatCard
            label="Active Clients"
            value={currentData.stats.activeClientsCount}
            subtitle="In pipeline"
            icon={Building2}
            variant="success"
          />
          <StatCard
            label="Hours This Week"
            value={`${currentData.stats.hoursThisWeek}h`}
            subtitle="Team total"
            icon={Clock}
          />
        </div>

        {/* 2-Column Core Section: Active Projects + My Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Projects (7 columns) */}
          <div className="lg:col-span-7 bg-[#121212] border border-[#222222] rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-teal-400" />
                  Active Projects
                </h2>
                <p className="text-xs text-neutral-400">Current ongoing client & internal deliverables</p>
              </div>
              <Link
                href="/projects"
                className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium transition"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {currentData.activeProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 rounded-xl bg-[#181818] border border-[#262626] hover:border-[#333333] transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-heading text-sm font-bold text-white">{project.name}</span>
                      <span className="text-xs text-neutral-400 ml-2">({project.clientName})</span>
                    </div>
                    <span className="text-xs font-bold text-teal-400">
                      {project.progress}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#262626] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2.5 text-[11px] text-neutral-400">
                    <span>{project.totalTasks} tasks tracked</span>
                    <span>Deadline: {project.deadline || 'Upcoming'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Tasks (5 columns) */}
          <div className="lg:col-span-5 bg-[#121212] border border-[#222222] rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    My Tasks
                  </h2>
                  <p className="text-xs text-neutral-400">Assigned directly to you</p>
                </div>
                <Link
                  href="/tasks"
                  className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium transition"
                >
                  Board <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2">
                {currentData.myTasks.map((task) => {
                  const isDone = task.status === 'DONE';
                  return (
                    <div
                      key={task._id}
                      onClick={() => toggleTaskDone(task._id)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 select-none ${
                        isDone
                          ? 'bg-[#141414] border-[#1e1e1e] opacity-60'
                          : 'bg-[#181818] border-[#262626] hover:border-[#383838]'
                      }`}
                    >
                      <button
                        type="button"
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-neutral-600 hover:border-teal-400'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-3 h-3" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-xs font-medium leading-snug ${
                            isDone ? 'line-through text-neutral-500' : 'text-neutral-200'
                          }`}
                        >
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <PriorityBadge priority={task.priority} />
                          {task.project && (
                            <span className="text-[10px] text-neutral-400 truncate">
                              {task.project.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Link
              href="/tasks"
              className="mt-4 w-full py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#262626] text-xs font-medium text-neutral-300 text-center transition block border border-[#2e2e2e]"
            >
              Open Kanban Board
            </Link>
          </div>
        </div>

        {/* Bottom Section: Team Activity Feed & Quick Team Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Team Activity Feed (7 cols) */}
          <div className="lg:col-span-7 bg-[#121212] border border-[#222222] rounded-2xl p-5 backdrop-blur-sm">
            <h2 className="font-heading text-sm font-bold text-white mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              Recent Activity Feed
            </h2>
            <p className="text-xs text-neutral-400 mb-4">
              Real-time updates across projects, tasks, and client pipeline
            </p>

            <div className="space-y-2.5">
              {currentData.recentActivities.map((act) => (
                <div
                  key={act._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#181818] border border-[#262626] text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                      {act.userName.charAt(0)}
                    </div>
                    <div>
                      <span className="font-semibold text-white">{act.userName}</span>{' '}
                      <span className="text-neutral-400">{act.action}</span>{' '}
                      <span className="font-medium text-neutral-200">"{act.entityTitle}"</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-neutral-500 shrink-0 ml-2">
                    {act.createdAt}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Team Breakdown (5 cols) */}
          <div className="lg:col-span-5 bg-[#121212] border border-[#222222] rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-400" />
                  Team Weekly Status
                </h2>
                <p className="text-xs text-neutral-400">Hours logged this week</p>
              </div>
              <Link
                href="/team"
                className="text-xs text-teal-400 hover:text-teal-300 font-medium transition"
              >
                Team Page
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Abdulaziz', role: 'Development', active: 'Bakery ERP', hours: 27 },
                { name: 'Nebiyu', role: 'Business / Client', active: 'Client Acquisition', hours: 24 },
                { name: 'Sadam', role: 'Operations / Product', active: 'RHIZAN Website', hours: 21 },
              ].map((member) => (
                <div
                  key={member.name}
                  className="p-3.5 rounded-xl bg-[#181818] border border-[#262626] flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-white">{member.name}</div>
                    <div className="text-[11px] text-neutral-400">
                      {member.role} • <span className="text-teal-400">{member.active}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-heading text-sm font-bold text-white">{member.hours}h</div>
                    <div className="text-[10px] text-neutral-500">logged</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
