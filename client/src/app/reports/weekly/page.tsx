'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { PriorityBadge } from '@/components/Badge';
import {
  FileText,
  Printer,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  FolderKanban,
  Users,
  Compass,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Download,
  Building2,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  Target,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';
import { WeeklyReportData } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function WeeklyReportPage() {
  const { user } = useAuth();
  const [report, setReport] = useState<WeeklyReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, +1 = next week

  // Calculate week start (Monday) and end (Sunday) based on weekOffset
  const dateRange = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1) + weekOffset * 7;
    const start = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    const label = `${start.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })} – ${end.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;

    return { startStr, endStr, label };
  }, [weekOffset]);

  const loadWeeklyReport = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<WeeklyReportData>(
        `/reports/weekly?startDate=${dateRange.startStr}&endDate=${dateRange.endStr}`
      );
      if (data) setReport(data);
    } catch (err) {
      console.error('Failed to load weekly report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeeklyReport();
  }, [dateRange]);

  const handlePrint = () => {
    window.print();
  };

  const summary = report?.summary;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#0a0a0a] text-white print:bg-white print:text-black">
      {/* Screen-Only App Header */}
      <div className="print:hidden">
        <Header
          title="Weekly Operations Report"
          subtitle="One-page executive performance, capacity utilization, and deliverables digest"
          actionButton={{
            label: 'Print / Save PDF',
            onClick: handlePrint,
          }}
        />
      </div>

      <main className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6 print:p-0 print:m-0 print:max-w-none">
        {/* Navigation & Controls Ribbon (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#111111] border border-[#222222] rounded-3xl shadow-md print:hidden">
          {/* Week Navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="p-2 rounded-xl bg-[#181818] hover:bg-[#222222] text-neutral-300 hover:text-white border border-[#282828] transition"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                weekOffset === 0
                  ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                  : 'bg-[#181818] text-neutral-400 border-[#282828] hover:text-white'
              }`}
            >
              Current Week
            </button>

            <button
              type="button"
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="p-2 rounded-xl bg-[#181818] hover:bg-[#222222] text-neutral-300 hover:text-white border border-[#282828] transition"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="font-heading text-xs font-bold text-white ml-2 flex items-center gap-1.5 bg-[#161616] border border-[#262626] px-3 py-1.5 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>{report?.weekRange.label || dateRange.label}</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadWeeklyReport}
              disabled={loading}
              className="p-2 rounded-xl bg-[#181818] hover:bg-[#222222] text-neutral-300 hover:text-teal-400 border border-[#282828] transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-teal-950 transition active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRINTABLE ONE-PAGE REPORT CONTAINER                                       */}
        {/* ========================================================================= */}
        <div className="bg-[#111111] border border-[#222222] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl print:border-none print:shadow-none print:p-4 print:bg-white print:text-black">
          {/* Executive Report Document Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#242424] print:border-neutral-300">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white p-2 flex items-center justify-center shadow-md print:border print:border-neutral-300">
                <Image
                  src="/logo_minimal.png"
                  alt="Rhizan Logo"
                  width={34}
                  height={34}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-white print:text-black">
                    RHIZAN HUB
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 print:bg-neutral-100 print:text-black print:border-neutral-300">
                    Executive Weekly Report
                  </span>
                </div>
                <p className="text-xs text-neutral-400 print:text-neutral-600">
                  Deliverables, Capacity Utilization & Pipeline Performance
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-white print:text-black flex items-center justify-end gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-400 print:text-neutral-700" />
                <span>Week: {report?.weekRange.label || dateRange.label}</span>
              </div>
              <p className="text-[10px] text-neutral-500 print:text-neutral-500 mt-0.5">
                Generated {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Top Executive KPI Highlights (6 Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 print:grid-cols-6 print:gap-2">
            <div className="p-3.5 rounded-2xl bg-[#161616] border border-[#262626] print:bg-neutral-50 print:border-neutral-200">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">
                Team Workload
              </span>
              <div className="font-heading text-base font-bold text-teal-400 print:text-black">
                {summary?.totalTeamHours ?? 0}h
              </div>
              <span className="text-[10px] text-neutral-500">
                of {summary?.expectedCapacityTotal ?? 144}h ({summary?.capacityUtilization ?? 0}%)
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#161616] border border-[#262626] print:bg-neutral-50 print:border-neutral-200">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">
                Billable Ratio
              </span>
              <div className="font-heading text-base font-bold text-emerald-400 print:text-black">
                {summary?.billablePercentage ?? 0}%
              </div>
              <span className="text-[10px] text-neutral-500">
                {summary?.billableHours ?? 0}h client work
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#161616] border border-[#262626] print:bg-neutral-50 print:border-neutral-200">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">
                Tasks Completed
              </span>
              <div className="font-heading text-base font-bold text-white print:text-black">
                {summary?.tasksCompletedCount ?? 0}
              </div>
              <span className="text-[10px] text-neutral-500">deliverables closed</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#161616] border border-[#262626] print:bg-neutral-50 print:border-neutral-200">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">
                Active Projects
              </span>
              <div className="font-heading text-base font-bold text-white print:text-black">
                {summary?.activeProjectsCount ?? 0}
              </div>
              <span className="text-[10px] text-neutral-500">ongoing contracts</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#161616] border border-[#262626] print:bg-neutral-50 print:border-neutral-200">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">
                Outreach & Deals
              </span>
              <div className="font-heading text-base font-bold text-white print:text-black">
                {summary?.newApproachesCount ?? 0}
              </div>
              <span className="text-[10px] text-neutral-500">
                {summary?.dealsWonCount ?? 0} deals won
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#161616] border border-[#262626] print:bg-neutral-50 print:border-neutral-200">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">
                At-Risk / Overdue
              </span>
              <div
                className={`font-heading text-base font-bold ${
                  (summary?.overdueCount ?? 0) > 0 ? 'text-rose-400' : 'text-neutral-400'
                } print:text-black`}
              >
                {summary?.overdueCount ?? 0}
              </div>
              <span className="text-[10px] text-neutral-500">
                {(summary?.overdueCount ?? 0) > 0 ? 'Requires triage' : 'Clean queue'}
              </span>
            </div>
          </div>

          {/* Section 1: Team Performance & 48h Weekly Capacity Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#222222] print:border-neutral-300">
              <h2 className="font-heading text-xs uppercase font-bold text-neutral-200 print:text-black flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-teal-400 print:text-neutral-700" />
                <span>1. Team Weekly Capacity & Performance (48h Standard)</span>
              </h2>
              <span className="text-[11px] text-neutral-400 print:text-neutral-600">
                Weekly Target: 48h / member (6 days × 8h)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#242424] text-[10px] uppercase font-bold text-neutral-400 print:border-neutral-300 print:text-neutral-600">
                    <th className="py-2.5 px-3">Team Member</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Logged / Target</th>
                    <th className="py-2.5 px-3">Capacity %</th>
                    <th className="py-2.5 px-3">Billable</th>
                    <th className="py-2.5 px-3">Daily Logged (Mon – Sun)</th>
                    <th className="py-2.5 px-3">Top Projects</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1e1e] print:divide-neutral-200">
                  {(report?.teamPerformance || []).map((m) => (
                    <tr key={m.id} className="hover:bg-[#161616]/50 transition print:hover:bg-transparent">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                            {m.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-white print:text-black">{m.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-neutral-400 print:text-neutral-600 text-[11px]">
                        {m.role}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-white print:text-black">
                        {m.hoursLogged}h <span className="text-neutral-500 font-normal">/ {m.targetHours}h</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="w-28 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-teal-400 print:text-black">
                              {m.utilizationPercent}%
                            </span>
                          </div>
                          <div className="w-full bg-[#1a1a1a] h-1.5 rounded-full overflow-hidden border border-[#2a2a2a] print:border-neutral-300 print:bg-neutral-200">
                            <div
                              className="bg-teal-500 h-full rounded-full transition-all"
                              style={{ width: `${m.utilizationPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-emerald-400 print:text-black text-[11px]">
                        {m.billableHours}h
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 text-[10px] font-mono">
                          {m.dailyHours.map((d) => (
                            <span
                              key={d.day}
                              title={`${d.day} (${d.date}): ${d.hours}h`}
                              className={`px-1.5 py-0.5 rounded text-center min-w-[24px] ${
                                d.hours >= 8
                                  ? 'bg-teal-500/20 text-teal-300 font-bold print:bg-neutral-100 print:text-black'
                                  : d.hours > 0
                                  ? 'bg-[#1e1e1e] text-neutral-300 print:bg-neutral-50 print:text-neutral-700'
                                  : 'text-neutral-600 print:text-neutral-400'
                              }`}
                            >
                              {d.hours > 0 ? `${d.hours}` : '-'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-neutral-300 print:text-neutral-700 truncate max-w-[160px]">
                        {m.topProjects.map((p) => `${p.name} (${p.hours}h)`).join(', ') || 'General'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Active Projects Deliverables & Progress */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#222222] print:border-neutral-300">
              <h2 className="font-heading text-xs uppercase font-bold text-neutral-200 print:text-black flex items-center gap-2">
                <FolderKanban className="w-3.5 h-3.5 text-teal-400 print:text-neutral-700" />
                <span>2. Project Deliverables & Weekly Progress</span>
              </h2>
              <span className="text-[11px] text-neutral-400 print:text-neutral-600">
                {(report?.projectDeliverables || []).length} Active Projects
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 print:grid-cols-3 print:gap-2">
              {(report?.projectDeliverables || []).map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-3 print:bg-white print:border-neutral-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-xs font-bold text-white print:text-black truncate max-w-[160px]">
                        {proj.name}
                      </h3>
                      <p className="text-[10px] text-neutral-400 print:text-neutral-600">
                        {proj.clientName}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-teal-400 print:text-black">
                      {proj.progress}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#111111] h-1.5 rounded-full overflow-hidden border border-[#242424] print:border-neutral-300 print:bg-neutral-100">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400 print:text-neutral-600 pt-0.5">
                    <span>Logged this week: <strong className="text-white print:text-black font-mono">{proj.weeklyHours}h</strong></span>
                    <span>Deadline: <strong className="text-neutral-300 print:text-black">{proj.deadline || 'Upcoming'}</strong></span>
                  </div>

                  {/* Completed deliverables this week */}
                  <div className="pt-2 border-t border-[#222222] print:border-neutral-200 space-y-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Deliverables Finished ({proj.completedThisWeek.length}):
                    </span>
                    {proj.completedThisWeek.length > 0 ? (
                      <ul className="space-y-1 max-h-[75px] overflow-y-auto custom-scrollbar">
                        {proj.completedThisWeek.map((t) => (
                          <li
                            key={t._id}
                            className="text-[11px] text-neutral-200 print:text-black flex items-start gap-1.5"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="truncate">{t.title}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-[10px] text-neutral-500 italic">No deliverables finalized this week.</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: 2-Column Split: Key Accomplishments vs Next Week Roadmap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 print:grid-cols-2 print:gap-3">
            {/* Column A: Key Tasks Accomplished */}
            <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-3 print:bg-white print:border-neutral-300">
              <div className="flex items-center justify-between pb-2 border-b border-[#222222] print:border-neutral-200">
                <h3 className="font-heading text-xs font-bold text-white print:text-black flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>3. Key Accomplishments This Week</span>
                </h3>
                <span className="text-[10px] font-mono text-neutral-400">
                  {(report?.completedTasksThisWeek || []).length} items
                </span>
              </div>

              <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1 custom-scrollbar">
                {(report?.completedTasksThisWeek || []).length > 0 ? (
                  report?.completedTasksThisWeek.slice(0, 8).map((t) => (
                    <div
                      key={t._id}
                      className="p-2 rounded-xl bg-[#111111] border border-[#222222] text-xs flex items-start justify-between gap-2 print:bg-neutral-50 print:border-neutral-200"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-white print:text-black block truncate">
                          {t.title}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                          {t.project && <span>{t.project.name}</span>}
                          {t.assignedTo && <span>• {t.assignedTo.name}</span>}
                        </div>
                      </div>
                      <PriorityBadge priority={t.priority} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-neutral-500">
                    No completed tasks logged this week.
                  </div>
                )}
              </div>
            </div>

            {/* Column B: Planned Roadmap for Next Week */}
            <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-3 print:bg-white print:border-neutral-300">
              <div className="flex items-center justify-between pb-2 border-b border-[#222222] print:border-neutral-200">
                <h3 className="font-heading text-xs font-bold text-white print:text-black flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-teal-400" />
                  <span>4. Planned Priorities for Next Week</span>
                </h3>
                <span className="text-[10px] font-mono text-neutral-400">High & Urgent Focus</span>
              </div>

              <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1 custom-scrollbar">
                {(report?.plannedNextWeek || []).length > 0 ? (
                  report?.plannedNextWeek.slice(0, 8).map((t) => (
                    <div
                      key={t._id}
                      className="p-2 rounded-xl bg-[#111111] border border-[#222222] text-xs flex items-start justify-between gap-2 print:bg-neutral-50 print:border-neutral-200"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-white print:text-black block truncate">
                          {t.title}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                          {t.project && <span>{t.project.name}</span>}
                          {t.dueDate && (
                            <span className="text-amber-400">
                              • Due {new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <PriorityBadge priority={t.priority} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-neutral-500">
                    No critical forward tasks scheduled.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Business Development & Operations Summary Footer */}
          <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] print:bg-white print:border-neutral-300 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-heading text-xs font-bold text-white print:text-black flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-teal-400" />
                <span>5. CRM Outreach & Pipeline Update:</span>
              </span>
              <p className="text-[11px] text-neutral-400 print:text-neutral-600">
                <strong className="text-white print:text-black">{report?.businessDevelopment.newApproachesCount || 0}</strong> new approaches initiated this week •{' '}
                <strong className="text-emerald-400 print:text-black">{report?.businessDevelopment.dealsWonCount || 0}</strong> deals won •{' '}
                <strong className="text-white print:text-black">{report?.businessDevelopment.totalActiveApproaches || 0}</strong> active client prospects in negotiation.
              </p>
            </div>

            <div className="text-right text-[10px] text-neutral-500 print:text-neutral-500">
              <span>RHIZAN TECH • Confidential Executive Operations Report</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
