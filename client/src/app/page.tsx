'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { PriorityBadge } from '@/components/Badge';
import { Modal } from '@/components/Modal';
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
  Play,
  Square,
  DollarSign,
  Tag,
  Trash2,
  ExternalLink,
  Sparkles,
  Zap,
  Target,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { DashboardSummary, Project, Task, TimeEntry } from '@/types';

const TIMER_STORAGE_KEY = 'rhizan_active_timer_state';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Live Timer states (synchronized with /time page)
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [timerDescription, setTimerDescription] = useState('');
  const [timerProjectId, setTimerProjectId] = useState<string>('');
  const [timerTaskId, setTimerTaskId] = useState<string>('');
  const [timerBillable, setTimerBillable] = useState(true);

  // Quick Modals
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Log Time Form State
  const [manualDate, setManualDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [manualHours, setManualHours] = useState('1');
  const [manualMinutes, setManualMinutes] = useState('30');
  const [manualDescription, setManualDescription] = useState('');
  const [manualProjectId, setManualProjectId] = useState('');
  const [manualTaskId, setManualTaskId] = useState('');
  const [manualBillable, setManualBillable] = useState(true);

  // Quick New Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskProjectId, setTaskProjectId] = useState('');
  const [taskPriority, setTaskPriority] = useState<'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskEstimatedHours, setTaskEstimatedHours] = useState('2');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Format seconds into HH:MM:SS
  const formatStopwatch = (totalSecs: number): string => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format duration into e.g. "2h 30m"
  const formatDurationText = (hours: number, minutes: number): string => {
    if (hours === 0 && minutes === 0) return '0m';
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [summaryRes, projectsRes, tasksRes] = await Promise.all([
        apiFetch<DashboardSummary>('/dashboard/summary'),
        apiFetch<Project[]>('/projects').catch(() => []),
        apiFetch<Task[]>('/tasks').catch(() => []),
      ]);

      if (summaryRes) setData(summaryRes);
      if (projectsRes) {
        setProjects(projectsRes);
        if (projectsRes.length > 0 && !timerProjectId) {
          setTimerProjectId(projectsRes[0]._id);
          setManualProjectId(projectsRes[0]._id);
        }
      }
      if (tasksRes) setTasks(tasksRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Restore active timer from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(TIMER_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.isRunning && parsed.startTimestamp) {
          const now = Date.now();
          const elapsed = Math.max(0, Math.floor((now - parsed.startTimestamp) / 1000));
          setElapsedSeconds(elapsed);
          setIsRunning(true);
          if (parsed.description) setTimerDescription(parsed.description);
          if (parsed.projectId) setTimerProjectId(parsed.projectId);
          if (parsed.taskId) setTimerTaskId(parsed.taskId);
          if (parsed.billable !== undefined) setTimerBillable(parsed.billable);

          timerRef.current = setInterval(() => {
            const currentElapsed = Math.max(0, Math.floor((Date.now() - parsed.startTimestamp) / 1000));
            setElapsedSeconds(currentElapsed);
          }, 1000);
        }
      } catch (e) {
        console.error('Failed to restore active timer', e);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Start Live Timer
  const startTimer = () => {
    const now = Date.now();
    setIsRunning(true);
    setElapsedSeconds(0);

    const timerData = {
      isRunning: true,
      startTimestamp: now,
      description: timerDescription,
      projectId: timerProjectId,
      taskId: timerTaskId,
      billable: timerBillable,
    };
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timerData));

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const currentElapsed = Math.max(0, Math.floor((Date.now() - now) / 1000));
      setElapsedSeconds(currentElapsed);
    }, 1000);
    showToast('⏱️ Timer started! Tracking time on dashboard.');
  };

  // Stop Timer and Log to Backend
  const stopTimer = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const saved = localStorage.getItem(TIMER_STORAGE_KEY);
    let startTimestamp = Date.now() - elapsedSeconds * 1000;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.startTimestamp) startTimestamp = parsed.startTimestamp;
      } catch (e) {}
    }

    const startTimeFormatted = new Date(startTimestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const endTimeFormatted = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const totalMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const projectId = timerProjectId || (projects.length > 0 ? projects[0]._id : '');

    try {
      await apiFetch<TimeEntry>('/time', {
        method: 'POST',
        body: JSON.stringify({
          project: projectId,
          task: timerTaskId || undefined,
          description: timerDescription.trim() || 'Work session',
          date: new Date().toISOString(),
          startTime: startTimeFormatted,
          endTime: endTimeFormatted,
          hours,
          minutes,
          billable: timerBillable,
          tag: 'Development',
        }),
      });

      localStorage.removeItem(TIMER_STORAGE_KEY);
      setIsRunning(false);
      setElapsedSeconds(0);
      setTimerDescription('');
      showToast(`✅ Successfully logged ${formatDurationText(hours, minutes)} for today!`);
      loadDashboard();
    } catch (err: any) {
      console.error('Failed to log timer entry', err);
      alert(err.message || 'Failed to save time entry');
    }
  };

  // Quick Preset Log (e.g. +30m, +1h)
  const handleQuickPresetLog = async (presetMins: number) => {
    const projectId = timerProjectId || (projects.length > 0 ? projects[0]._id : '');
    if (!projectId) {
      alert('Please select a project first');
      return;
    }

    const hours = Math.floor(presetMins / 60);
    const minutes = presetMins % 60;

    try {
      await apiFetch<TimeEntry>('/time', {
        method: 'POST',
        body: JSON.stringify({
          project: projectId,
          task: timerTaskId || undefined,
          description: timerDescription.trim() || `Quick ${formatDurationText(hours, minutes)} session`,
          date: new Date().toISOString(),
          hours,
          minutes,
          billable: timerBillable,
          tag: 'Development',
        }),
      });

      showToast(`⚡ Logged ${formatDurationText(hours, minutes)} to today's timesheet!`);
      loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to log preset time');
    }
  };

  // Submit Manual Log Time Modal
  const handleManualLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualProjectId) {
      alert('Please select a project');
      return;
    }

    const hrs = parseInt(manualHours) || 0;
    const mins = parseInt(manualMinutes) || 0;
    if (hrs === 0 && mins === 0) {
      alert('Please enter hours or minutes');
      return;
    }

    try {
      await apiFetch<TimeEntry>('/time', {
        method: 'POST',
        body: JSON.stringify({
          project: manualProjectId,
          task: manualTaskId || undefined,
          description: manualDescription.trim() || 'Work session',
          date: manualDate ? new Date(manualDate).toISOString() : new Date().toISOString(),
          hours: hrs,
          minutes: mins,
          billable: manualBillable,
          tag: 'Development',
        }),
      });

      setIsLogTimeOpen(false);
      setManualDescription('');
      showToast(`✅ Successfully logged ${formatDurationText(hrs, mins)}!`);
      loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to log time');
    }
  };

  // Submit Quick New Task Modal
  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      await apiFetch<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: taskTitle.trim(),
          priority: taskPriority,
          status: 'TODO',
          project: taskProjectId || undefined,
          assignedTo: (user as any)?.id || undefined,
          dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : undefined,
          estimatedHours: parseFloat(taskEstimatedHours) || 2,
        }),
      });

      setIsNewTaskOpen(false);
      setTaskTitle('');
      showToast('✅ New task added to your board!');
      loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to create task');
    }
  };

  // Delete today's time entry
  const handleDeleteTimeEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this time entry?')) return;
    try {
      await apiFetch(`/time/${id}`, { method: 'DELETE' });
      showToast('🗑️ Time entry removed');
      loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to delete time entry');
    }
  };

  // Toggle Task Completion directly from Dashboard
  const toggleTaskDone = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!data) return;

    const task = data.myTasks.find((t) => t._id === taskId);
    if (!task) return;

    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';

    // Optimistic UI update
    setData({
      ...data,
      myTasks: data.myTasks.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)),
    });

    try {
      await apiFetch(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(newStatus === 'DONE' ? '🎉 Task marked as complete!' : 'Task moved back to To Do');
    } catch (err) {
      console.error('Failed to update task status:', err);
      loadDashboard();
    }
  };

  // 1-Click Track Time on a Specific Task
  const startTrackingForTask = (task: Task) => {
    const projId = typeof task.project === 'object' ? task.project?._id : (task.project as any);
    if (projId) setTimerProjectId(projId);
    setTimerTaskId(task._id);
    setTimerDescription(task.title);

    // Scroll smoothly to timer widget
    const timerElem = document.getElementById('dashboard-timer-section');
    if (timerElem) {
      timerElem.scrollIntoView({ behavior: 'smooth' });
    }

    if (!isRunning) {
      startTimer();
    } else {
      showToast(`🎯 Updated active timer to "${task.title}"`);
    }
  };

  // Calculations for Today's Time
  const todayTracking = data?.todayTimeTracking;
  const myHoursToday = todayTracking?.myHoursToday ?? 0;
  const teamHoursToday = todayTracking?.teamHoursToday ?? 0;
  const dailyTarget = todayTracking?.dailyTargetHours ?? 8;
  const todayProgressPercent = Math.min(100, Math.round((myHoursToday / dailyTarget) * 100));
  const todayEntries = todayTracking?.myEntriesToday || [];

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161616] border border-teal-500/40 text-white px-4 py-3 rounded-2xl shadow-2xl shadow-black/80 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header with Quick Actions */}
      <Header
        title="Rhizan Operations Hub"
        subtitle={`Welcome back, ${user?.name || 'Abdulaziz'} 👋 • ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}`}
        actionButton={{
          label: '+ Log Time',
          onClick: () => setIsLogTimeOpen(true),
        }}
      />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Quick Action Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#111111] border border-[#222222] rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs font-semibold text-neutral-300">Quick Actions:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsLogTimeOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-teal-600/10 hover:bg-teal-600/20 text-teal-400 border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Log Time Entry</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNewTaskOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#181818] hover:bg-[#222222] text-neutral-300 border border-[#282828] text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>

            <Link
              href="/time"
              className="px-3 py-1.5 rounded-xl bg-[#181818] hover:bg-[#222222] text-neutral-300 border border-[#282828] text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
              <span>Full Timesheet</span>
            </Link>

            <Link
              href="/tasks"
              className="px-3 py-1.5 rounded-xl bg-[#181818] hover:bg-[#222222] text-neutral-300 border border-[#282828] text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FolderKanban className="w-3.5 h-3.5 text-teal-400" />
              <span>Kanban Board</span>
            </Link>
          </div>
        </div>

        {/* Top 6 KPIs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
          <StatCard
            label="Today's Hours"
            value={`${myHoursToday}h / 8h`}
            subtitle={`${todayProgressPercent}% daily goal`}
            icon={Clock}
            variant="teal"
          />
          <StatCard
            label="Due Today"
            value={data?.stats.tasksDueToday ?? 0}
            subtitle="Requires attention"
            icon={Calendar}
            variant={(data?.stats.tasksDueToday ?? 0) > 0 ? 'warning' : 'default'}
          />
          <StatCard
            label="Overdue Tasks"
            value={data?.stats.overdueTasks ?? 0}
            subtitle="Past deadline"
            icon={AlertCircle}
            variant={(data?.stats.overdueTasks ?? 0) > 0 ? 'danger' : 'default'}
          />
          <StatCard
            label="Active Projects"
            value={data?.stats.activeProjectsCount ?? 0}
            subtitle="In progress"
            icon={FolderKanban}
            variant="teal"
          />
          <StatCard
            label="Active Clients"
            value={data?.stats.activeClientsCount ?? 0}
            subtitle="In pipeline"
            icon={Building2}
            variant="success"
          />
          <StatCard
            label="Hours This Week"
            value={`${data?.stats.hoursThisWeek ?? 0}h`}
            subtitle="Team total"
            icon={TrendingUp}
          />
        </div>

        {/* ========================================================================= */}
        {/* TODAY'S TIME TRACKING & LIVE TIMER HUB (High-Priority User Feature)       */}
        {/* ========================================================================= */}
        <div
          id="dashboard-timer-section"
          className="bg-[#111111] border border-[#222222] rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden"
        >
          {/* Subtle Ambient Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#222222]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-base font-bold text-white">Today's Time Tracking Hub</h2>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 font-bold border border-teal-500/20">
                    Live
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Track hours in real time, monitor your daily 8h capacity, and review today's logged work
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/time"
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition px-3 py-1.5 rounded-xl bg-[#181818] border border-[#262626] hover:border-[#383838]"
              >
                <span>View Full Timesheet</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Live Stopwatch & Quick Logging (6 Cols) */}
            <div className="lg:col-span-6 bg-[#161616] border border-[#262626] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isRunning ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'
                    }`}
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    {isRunning ? 'Timer Running' : 'Live Stopwatch'}
                  </span>
                </div>

                <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20">
                  {formatStopwatch(elapsedSeconds)}
                </span>
              </div>

              {/* Description Input */}
              <div>
                <input
                  type="text"
                  placeholder="What are you working on right now?"
                  value={timerDescription}
                  onChange={(e) => setTimerDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#111111] border border-[#2a2a2a] rounded-xl text-xs text-white placeholder-neutral-500 outline-none focus:border-teal-500 transition"
                />
              </div>

              {/* Project & Task Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="relative">
                  <select
                    value={timerProjectId}
                    onChange={(e) => setTimerProjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111111] border border-[#2a2a2a] rounded-xl text-xs text-white outline-none focus:border-teal-500 cursor-pointer appearance-none truncate pr-7"
                  >
                    <option value="" disabled>Select Project *</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        📁 {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <select
                    value={timerTaskId}
                    onChange={(e) => setTimerTaskId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111111] border border-[#2a2a2a] rounded-xl text-xs text-white outline-none focus:border-teal-500 cursor-pointer appearance-none truncate pr-7"
                  >
                    <option value="">(Optional) Link Task</option>
                    {tasks
                      .filter((t) => !timerProjectId || (typeof t.project === 'object' ? t.project?._id === timerProjectId : t.project === timerProjectId))
                      .map((t) => (
                        <option key={t._id} value={t._id}>
                          ✓ {t.title}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Timer Controls & Quick Presets */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#222222]">
                <div className="flex items-center gap-2">
                  {!isRunning ? (
                    <button
                      type="button"
                      onClick={startTimer}
                      className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-900/40 transition active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Timer</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopTimer}
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-900/40 transition active:scale-95 animate-pulse"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop & Log</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setTimerBillable(!timerBillable)}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
                      timerBillable
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-[#181818] border-[#2a2a2a] text-neutral-400'
                    }`}
                    title="Billable toggle"
                  >
                    <DollarSign className="w-3 h-3" />
                    <span>{timerBillable ? 'Billable' : 'Internal'}</span>
                  </button>
                </div>

                {/* Instant Quick Log Chips (+15m, +30m, +1h) */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-neutral-500 mr-1 font-medium">Quick Log:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetLog(15)}
                    className="px-2 py-1 rounded-lg bg-[#111111] hover:bg-[#202020] text-neutral-300 hover:text-teal-300 border border-[#2a2a2a] text-[10px] font-mono transition"
                  >
                    +15m
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetLog(30)}
                    className="px-2 py-1 rounded-lg bg-[#111111] hover:bg-[#202020] text-neutral-300 hover:text-teal-300 border border-[#2a2a2a] text-[10px] font-mono transition"
                  >
                    +30m
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetLog(60)}
                    className="px-2 py-1 rounded-lg bg-[#111111] hover:bg-[#202020] text-neutral-300 hover:text-teal-300 border border-[#2a2a2a] text-[10px] font-mono transition"
                  >
                    +1h
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Daily Capacity Dial & Today's Logged Entries (6 Cols) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Daily Capacity Meter Card */}
              <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-bold text-white">Daily Target Progress</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-white">{myHoursToday}h</span>
                    <span className="text-xs text-neutral-400"> / {dailyTarget}h target</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#111111] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#2a2a2a]">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      todayProgressPercent >= 100
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-teal-500 to-teal-300'
                    }`}
                    style={{ width: `${todayProgressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                  <span>
                    {todayProgressPercent >= 100
                      ? '🎉 Daily goal achieved!'
                      : `${Math.max(0, Math.round((dailyTarget - myHoursToday) * 10) / 10)}h remaining today`}
                  </span>
                  <span className="font-semibold text-teal-400">{todayProgressPercent}% of 8h</span>
                  <span className="text-neutral-500">Team today: {teamHoursToday}h</span>
                </div>
              </div>

              {/* Today's Logged Sessions List */}
              <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>Today's Logged Work ({todayEntries.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLogTimeOpen(true)}
                    className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Manual</span>
                  </button>
                </div>

                <div className="max-h-[175px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {todayEntries.length > 0 ? (
                    todayEntries.map((entry) => (
                      <div
                        key={entry._id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#111111] border border-[#262626] hover:border-[#333333] transition text-xs group"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-white truncate max-w-[140px]">
                              {entry.project?.name || 'Project'}
                            </span>
                            {entry.task && (
                              <span className="text-[10px] text-teal-400/90 truncate max-w-[130px]">
                                • {entry.task.title}
                              </span>
                            )}
                          </div>
                          {entry.description && (
                            <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                              {entry.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-xs font-bold text-white bg-[#1a1a1a] px-2 py-0.5 rounded-md border border-[#2e2e2e]">
                            {formatDurationText(entry.hours, entry.minutes)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteTimeEntry(entry._id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-rose-400 transition"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-neutral-500 text-xs">
                      No hours logged yet today. Click <strong className="text-teal-400">Start Timer</strong> or{' '}
                      <strong className="text-teal-400">+ Manual</strong> to get started!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CORE SECTION: ACTIVE PROJECTS & MY WORK QUEUE                            */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Projects (7 columns) */}
          <div className="lg:col-span-7 bg-[#111111] border border-[#222222] rounded-3xl p-5 sm:p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
              <div>
                <h2 className="font-heading text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-teal-400" />
                  Active Project Deliverables
                </h2>
                <p className="text-xs text-neutral-400">Ongoing client contracts & internal roadmap</p>
              </div>
              <Link
                href="/projects"
                className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold transition"
              >
                <span>All Projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {(data?.activeProjects || []).length > 0 ? (
                data?.activeProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block p-4 rounded-2xl bg-[#161616] border border-[#262626] hover:border-teal-500/40 transition group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-heading text-sm font-bold text-white group-hover:text-teal-300 transition truncate">
                          {project.name}
                        </span>
                        <span className="text-[11px] text-neutral-400 shrink-0">
                          ({project.clientName})
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-teal-400 shrink-0">
                        {project.progress}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#111111] h-2 rounded-full overflow-hidden border border-[#282828]">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2.5 text-[11px] text-neutral-400">
                      <span>{project.totalTasks} tasks connected</span>
                      <span className="text-neutral-500">
                        Deadline: <strong className="text-neutral-300">{project.deadline || 'Upcoming'}</strong>
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-neutral-500 text-xs">No active projects found.</div>
              )}
            </div>
          </div>

          {/* My Tasks with 1-Click Timer Integration (5 columns) */}
          <div className="lg:col-span-5 bg-[#111111] border border-[#222222] rounded-3xl p-5 sm:p-6 backdrop-blur-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#222222] mb-3">
                <div>
                  <h2 className="font-heading text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    My Active Tasks
                  </h2>
                  <p className="text-xs text-neutral-400">Assigned directly to you</p>
                </div>
                <Link
                  href="/tasks"
                  className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold transition"
                >
                  <span>Board</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-0.5 custom-scrollbar">
                {(data?.myTasks || []).length > 0 ? (
                  data?.myTasks.map((task) => {
                    const isDone = task.status === 'DONE';
                    return (
                      <div
                        key={task._id}
                        className={`p-3 rounded-2xl border transition flex items-start gap-3 select-none ${
                          isDone
                            ? 'bg-[#141414] border-[#1e1e1e] opacity-60'
                            : 'bg-[#161616] border-[#262626] hover:border-[#383838]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={(e) => toggleTaskDone(task._id, e)}
                          className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition shrink-0 ${
                            isDone
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-neutral-600 hover:border-teal-400 text-transparent'
                          }`}
                          title={isDone ? 'Mark Incomplete' : 'Mark Done'}
                        >
                          <CheckCircle2 className="w-3 h-3 fill-current" />
                        </button>

                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-xs font-semibold leading-snug ${
                              isDone ? 'line-through text-neutral-500' : 'text-neutral-200'
                            }`}
                          >
                            {task.title}
                          </div>

                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <PriorityBadge priority={task.priority} />
                            {task.project && (
                              <span className="text-[10px] text-neutral-400 truncate max-w-[120px]">
                                {task.project.name}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 1-Click Track Time Button */}
                        {!isDone && (
                          <button
                            type="button"
                            onClick={() => startTrackingForTask(task)}
                            className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-teal-600 text-neutral-400 hover:text-white border border-[#2a2a2a] transition shrink-0"
                            title="Start timer for this task"
                          >
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-neutral-500 text-xs">
                    No active tasks assigned. Great job!
                  </div>
                )}
              </div>
            </div>

            <Link
              href="/tasks"
              className="w-full py-2.5 rounded-xl bg-[#181818] hover:bg-[#222222] text-xs font-semibold text-neutral-200 text-center transition block border border-[#282828]"
            >
              Open Full Task Board
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM SECTION: TEAM 48H CAPACITY & RECENT ACTIVITY FEED                 */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Team Weekly Status (5 cols) - 48h Weekly Target */}
          <div className="lg:col-span-5 bg-[#111111] border border-[#222222] rounded-3xl p-5 sm:p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
              <div>
                <h2 className="font-heading text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-400" />
                  Team Weekly Capacity
                </h2>
                <p className="text-xs text-neutral-400">Target: 48h / member (6 days × 8h)</p>
              </div>
              <Link
                href="/team"
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold transition"
              >
                Team Page
              </Link>
            </div>

            <div className="space-y-3">
              {(data?.teamWeeklyBreakdown || [
                { id: '1', name: 'Abdulaziz', role: 'Development', hours: 32, capacity: 48, percentage: 67 },
                { id: '2', name: 'Nebiyu', role: 'Sales / Client Relations', hours: 28, capacity: 48, percentage: 58 },
                { id: '3', name: 'Sadam', role: 'Operations & Strategy', hours: 24, capacity: 48, percentage: 50 },
              ]).map((member) => (
                <Link
                  key={member.id}
                  href={`/team/${member.id}`}
                  className="block p-3.5 rounded-2xl bg-[#161616] border border-[#262626] hover:border-teal-500/40 transition group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-teal-600/20 text-teal-300 font-bold text-xs flex items-center justify-center border border-teal-500/30">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-teal-300 transition">
                          {member.name}
                        </div>
                        <div className="text-[10px] text-neutral-400">{member.role}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-white">{member.hours}h</span>
                      <span className="text-[10px] text-neutral-500"> / {member.capacity || 48}h</span>
                    </div>
                  </div>

                  {/* Capacity Progress Bar */}
                  <div className="w-full bg-[#111111] h-1.5 rounded-full overflow-hidden border border-[#242424]">
                    <div
                      className="bg-teal-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, member.percentage || 0)}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed (7 cols) */}
          <div className="lg:col-span-7 bg-[#111111] border border-[#222222] rounded-3xl p-5 sm:p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
              <div>
                <h2 className="font-heading text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-400" />
                  Recent Operations Feed
                </h2>
                <p className="text-xs text-neutral-400">Live updates across deliverables, clients, and time logs</p>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-0.5 custom-scrollbar">
              {(data?.recentActivities || []).length > 0 ? (
                data?.recentActivities.map((act) => (
                  <div
                    key={act._id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#161616] border border-[#262626] text-xs gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {act.userName.charAt(0)}
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-white">{act.userName}</span>{' '}
                        <span className="text-neutral-400">{act.action}</span>{' '}
                        <span className="font-medium text-teal-300">"{act.entityTitle}"</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-500 shrink-0">
                      {act.createdAt}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-neutral-500 text-xs">
                  No activity recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODAL: QUICK LOG TIME ENTRY DIRECTLY FROM DASHBOARD                      */}
      {/* ========================================================================= */}
      <Modal isOpen={isLogTimeOpen} onClose={() => setIsLogTimeOpen(false)} title="Log Time for Today">
        <form onSubmit={handleManualLogSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Project *</label>
            <select
              value={manualProjectId}
              onChange={(e) => setManualProjectId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:border-teal-500 outline-none"
            >
              <option value="" disabled>Select Project</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  📁 {p.name} ({p.clientName || 'Internal'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Task (Optional)</label>
            <select
              value={manualTaskId}
              onChange={(e) => setManualTaskId(e.target.value)}
              className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:border-teal-500 outline-none"
            >
              <option value="">No linked task</option>
              {tasks
                .filter((t) => !manualProjectId || (typeof t.project === 'object' ? t.project?._id === manualProjectId : t.project === manualProjectId))
                .map((t) => (
                  <option key={t._id} value={t._id}>
                    ✓ {t.title}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Hours *</label>
              <input
                type="number"
                min="0"
                max="24"
                value={manualHours}
                onChange={(e) => setManualHours(e.target.value)}
                className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Minutes *</label>
              <input
                type="number"
                min="0"
                max="59"
                value={manualMinutes}
                onChange={(e) => setManualMinutes(e.target.value)}
                className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:border-teal-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Work Description</label>
            <textarea
              rows={2}
              value={manualDescription}
              onChange={(e) => setManualDescription(e.target.value)}
              placeholder="What deliverables did you complete in this session?"
              className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white placeholder-neutral-500 focus:border-teal-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#222222]">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
              <input
                type="checkbox"
                checked={manualBillable}
                onChange={(e) => setManualBillable(e.target.checked)}
                className="rounded border-[#333333] text-teal-600 focus:ring-0"
              />
              <span>Billable to Client</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLogTimeOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-950 transition"
              >
                Log Time
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: QUICK ADD NEW TASK DIRECTLY FROM DASHBOARD                         */}
      {/* ========================================================================= */}
      <Modal isOpen={isNewTaskOpen} onClose={() => setIsNewTaskOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTaskSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Prepare API schema documentation"
              className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white placeholder-neutral-500 focus:border-teal-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Project</label>
              <select
                value={taskProjectId}
                onChange={(e) => setTaskProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:border-teal-500 outline-none"
              >
                <option value="">No Project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    📁 {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:border-teal-500 outline-none"
              >
                <option value="URGENT">🔴 Urgent</option>
                <option value="HIGH">🟠 High</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="LOW">🟢 Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Due Date</label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Estimated Hours</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={taskEstimatedHours}
                onChange={(e) => setTaskEstimatedHours(e.target.value)}
                className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:border-teal-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222222]">
            <button
              type="button"
              onClick={() => setIsNewTaskOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-950 transition"
            >
              Create Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
