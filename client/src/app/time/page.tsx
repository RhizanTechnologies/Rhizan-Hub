'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Modal } from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';
import { TimeEntry, Project, Task, WeeklyTeamMemberSummary } from '@/types';
import { apiFetch } from '@/lib/api';
import {
  Play,
  Square,
  Clock,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  FolderKanban,
  Check,
  RotateCcw,
  BarChart3,
  Users,
  Search,
  Filter,
  Layers,
  ChevronDown,
  Sparkles,
  Eye,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Tag,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

const TIMER_STORAGE_KEY = 'rhizan_active_timer_state';

export default function TimeTrackingPage() {
  const { user } = useAuth();

  // Data states
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklyTeamMemberSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: Personal Tracker vs Team Timesheet
  const [viewTab, setViewTab] = useState<'TRACKER' | 'TEAM_TIMESHEET'>('TRACKER');

  // Input Mode in Tracker: Timer vs Manual
  const [entryMode, setEntryMode] = useState<'TIMER' | 'MANUAL'>('TIMER');

  // Live Timer states
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Top Bar Form fields
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [isBillable, setIsBillable] = useState(true);

  // Manual Entry Form fields
  const [manualDate, setManualDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [manualStartTime, setManualStartTime] = useState('09:00');
  const [manualEndTime, setManualEndTime] = useState('11:30');
  const [manualHours, setManualHours] = useState('2');
  const [manualMinutes, setManualMinutes] = useState('30');
  const [manualUseTimeRange, setManualUseTimeRange] = useState(false);

  // Filter states
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'THIS_MONTH'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Notification / success message
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Week navigation and detailed timesheet states
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedMemberForDetails, setSelectedMemberForDetails] = useState<WeeklyTeamMemberSummary | null>(null);
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL');

  // Week range calculation based on weekOffset (0 = current week, -1 = prev week, +1 = next week)
  const weekRange = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1) + weekOffset * 7;
    const start = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const startStr = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const label = `${startStr} – ${endStr}`;

    return { start, end, label };
  }, [weekOffset]);

  // Helper to format 12-hour clock (e.g. 09:30 AM)
  const formatClockTime = (dateObj: Date): string => {
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Helper to format seconds into HH:MM:SS
  const formatStopwatch = (totalSecs: number): string => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to format duration into "2h 45m" or "45m"
  const formatDurationText = (hours: number, minutes: number): string => {
    if (hours === 0 && minutes === 0) return '0m';
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  // Load weekly team timesheets for the active weekRange
  const loadWeeklySummaries = async (start: Date, end: Date) => {
    try {
      const data = await apiFetch<WeeklyTeamMemberSummary[]>(
        `/time/weekly-summary?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      );
      if (data) {
        setWeeklySummaries(data);
        setSelectedMemberForDetails((prev) => {
          if (!prev) return null;
          return data.find((d) => d.user.id === prev.user.id) || null;
        });
      }
    } catch (err) {
      console.error('Failed to load weekly summaries:', err);
    }
  };

  useEffect(() => {
    loadWeeklySummaries(weekRange.start, weekRange.end);
  }, [weekRange]);

  // Breakdown of selected team member's tracked days (Monday through Sunday)
  const memberDailyBreakdown = useMemo(() => {
    if (!selectedMemberForDetails) return [];
    const entries = selectedMemberForDetails.entries || [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const days = [];

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(weekRange.start);
      dayDate.setDate(weekRange.start.getDate() + i);
      const dateStr = dayDate.toISOString().split('T')[0];

      const dayEntries = entries.filter((e) => {
        const eDate = new Date(e.date).toISOString().split('T')[0];
        return eDate === dateStr;
      });

      const dayMinutes = dayEntries.reduce((sum, e) => sum + (e.hours * 60 + e.minutes), 0);
      const dayHours = Math.floor(dayMinutes / 60);
      const dayRemMinutes = dayMinutes % 60;

      days.push({
        dayName: dayNames[i],
        date: dayDate,
        dateKey: dateStr,
        dateFormatted: dayDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        isToday: new Date().toISOString().split('T')[0] === dateStr,
        entries: dayEntries,
        totalMinutes: dayMinutes,
        formattedDuration:
          dayMinutes === 0
            ? '0h'
            : dayRemMinutes === 0
            ? `${dayHours}h`
            : `${dayHours}h ${dayRemMinutes}m`,
      });
    }

    return days;
  }, [selectedMemberForDetails, weekRange.start]);

  const selectedMemberStats = useMemo(() => {
    if (!selectedMemberForDetails) return { billableHours: 0, nonBillableHours: 0, totalEntries: 0 };
    const entries = selectedMemberForDetails.entries || [];
    let billableMinutes = 0;
    let nonBillableMinutes = 0;

    entries.forEach((e) => {
      const mins = e.hours * 60 + e.minutes;
      if (e.billable) billableMinutes += mins;
      else nonBillableMinutes += mins;
    });

    return {
      billableHours: Math.round((billableMinutes / 60) * 10) / 10,
      nonBillableHours: Math.round((nonBillableMinutes / 60) * 10) / 10,
      totalEntries: entries.length,
    };
  }, [selectedMemberForDetails]);

  // Load backend data
  const loadData = async () => {
    try {
      setLoading(true);
      const [entriesData, projectsData, tasksData] = await Promise.all([
        apiFetch<TimeEntry[]>('/time'),
        apiFetch<Project[]>('/projects'),
        apiFetch<Task[]>('/tasks'),
      ]);

      if (entriesData) setEntries(entriesData);
      if (projectsData) {
        setProjects(projectsData);
        if (projectsData.length > 0 && !selectedProjectId) {
          setSelectedProjectId(projectsData[0]._id);
        }
      }
      if (tasksData) setTasks(tasksData);
    } catch (err) {
      console.error('Failed to load time tracking data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Check and restore active running timer from localStorage on mount
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
          if (parsed.description) setDescription(parsed.description);
          if (parsed.projectId) setSelectedProjectId(parsed.projectId);
          if (parsed.taskId) setSelectedTaskId(parsed.taskId);
          if (parsed.billable !== undefined) setIsBillable(parsed.billable);

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

  // START TIMER
  const startTimer = () => {
    const now = Date.now();
    setIsRunning(true);
    setElapsedSeconds(0);

    const timerData = {
      isRunning: true,
      startTimestamp: now,
      description,
      projectId: selectedProjectId,
      taskId: selectedTaskId,
      billable: isBillable,
    };
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timerData));

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const currentElapsed = Math.max(0, Math.floor((Date.now() - now) / 1000));
      setElapsedSeconds(currentElapsed);
    }, 1000);
  };

  // STOP TIMER AND LOG ENTRY
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
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem(TIMER_STORAGE_KEY);
    setIsRunning(false);

    const now = new Date();
    const startDateObj = new Date(startTimestamp);
    const startTimeStr = formatClockTime(startDateObj);
    const endTimeStr = formatClockTime(now);

    const totalMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Default project if none selected
    const fallbackProjectId = selectedProjectId || (projects.length > 0 ? projects[0]._id : undefined);

    if (!fallbackProjectId) {
      alert('Please create or select a project before logging time.');
      setElapsedSeconds(0);
      return;
    }

    try {
      const newEntry = await apiFetch<TimeEntry>('/time', {
        method: 'POST',
        body: JSON.stringify({
          project: fallbackProjectId,
          task: selectedTaskId || undefined,
          description: description.trim() || 'General task execution',
          date: now.toISOString(),
          startTime: startTimeStr,
          endTime: endTimeStr,
          hours,
          minutes,
          billable: isBillable,
          tag: 'Development',
        }),
      });

      setEntries([newEntry, ...entries]);
      setDescription('');
      setSelectedTaskId('');
      setElapsedSeconds(0);
      setSuccessToast(`Logged ${formatDurationText(hours, minutes)} successfully!`);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save time entry');
    }
  };

  // RESTART PAST TIMER (Clockify Signature Feature ▶)
  const restartPastTimer = (entry: TimeEntry) => {
    const projId = typeof entry.project === 'object' ? entry.project._id : entry.project;
    const taskId = typeof entry.task === 'object' ? entry.task._id : entry.task;

    setDescription(entry.description || '');
    if (projId) setSelectedProjectId(projId);
    if (taskId) setSelectedTaskId(taskId);
    if (entry.billable !== undefined) setIsBillable(entry.billable);

    // If a timer was already running, stop it first or restart
    if (isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      localStorage.removeItem(TIMER_STORAGE_KEY);
    }

    const now = Date.now();
    setIsRunning(true);
    setElapsedSeconds(0);

    const timerData = {
      isRunning: true,
      startTimestamp: now,
      description: entry.description || '',
      projectId: projId,
      taskId: taskId || '',
      billable: entry.billable !== undefined ? entry.billable : true,
    };
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timerData));

    timerRef.current = setInterval(() => {
      const currentElapsed = Math.max(0, Math.floor((Date.now() - now) / 1000));
      setElapsedSeconds(currentElapsed);
    }, 1000);

    setSuccessToast(`Timer restarted for "${entry.description || 'Task'}"`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // LOG TIME IN MANUAL MODE
  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const fallbackProjectId = selectedProjectId || (projects.length > 0 ? projects[0]._id : undefined);

    if (!fallbackProjectId) {
      alert('Please select a project before logging time.');
      return;
    }

    let hoursToSave = Number(manualHours) || 0;
    let minutesToSave = Number(manualMinutes) || 0;
    let startTimeStr = '';
    let endTimeStr = '';

    if (manualUseTimeRange && manualStartTime && manualEndTime) {
      const [startH, startM] = manualStartTime.split(':').map(Number);
      const [endH, endM] = manualEndTime.split(':').map(Number);
      const startTotal = startH * 60 + startM;
      const endTotal = endH * 60 + endM;
      const diffMins = Math.max(1, endTotal >= startTotal ? endTotal - startTotal : 24 * 60 - startTotal + endTotal);
      hoursToSave = Math.floor(diffMins / 60);
      minutesToSave = diffMins % 60;

      const dummyStart = new Date();
      dummyStart.setHours(startH, startM, 0, 0);
      const dummyEnd = new Date();
      dummyEnd.setHours(endH, endM, 0, 0);
      startTimeStr = formatClockTime(dummyStart);
      endTimeStr = formatClockTime(dummyEnd);
    }

    try {
      const targetDate = manualDate ? new Date(manualDate).toISOString() : new Date().toISOString();
      const newEntry = await apiFetch<TimeEntry>('/time', {
        method: 'POST',
        body: JSON.stringify({
          project: fallbackProjectId,
          task: selectedTaskId || undefined,
          description: description.trim() || 'Manual time record',
          date: targetDate,
          startTime: startTimeStr || undefined,
          endTime: endTimeStr || undefined,
          hours: hoursToSave,
          minutes: minutesToSave,
          billable: isBillable,
          tag: 'Development',
        }),
      });

      setEntries([newEntry, ...entries]);
      setDescription('');
      setSelectedTaskId('');
      setSuccessToast(`Logged ${formatDurationText(hoursToSave, minutesToSave)} manually!`);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save manual time entry');
    }
  };

  // DELETE TIME ENTRY
  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this time entry?')) return;

    setEntries((prev) => prev.filter((e) => e._id !== entryId));

    try {
      await apiFetch(`/time/${entryId}`, { method: 'DELETE' });
    } catch (err: any) {
      alert(err.message || 'Failed to delete time entry');
    }
  };

  // Filter Tasks by Selected Project
  const projectTasks = tasks.filter((t) => {
    if (!selectedProjectId) return false;
    const projId = typeof t.project === 'object' ? t.project?._id : t.project;
    return projId === selectedProjectId;
  });

  // Filter Entries for Current User and Filter Controls
  const filteredEntries = entries.filter((entry) => {
    // Project filter
    if (projectFilter !== 'ALL') {
      const pId = typeof entry.project === 'object' ? entry.project?._id : entry.project;
      if (pId !== projectFilter && entry.project?.name !== projectFilter) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = entry.description?.toLowerCase().includes(q);
      const matchProj = entry.project?.name?.toLowerCase().includes(q);
      const matchTask = entry.task?.title?.toLowerCase().includes(q);
      if (!matchDesc && !matchProj && !matchTask) return false;
    }

    // Date Range Filter
    if (dateRangeFilter === 'ALL') return true;

    const entryDate = new Date(entry.date);
    if (isNaN(entryDate.getTime())) return true;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (dateRangeFilter === 'TODAY') return diffDays === 0;
    if (dateRangeFilter === 'YESTERDAY') return diffDays === -1;
    if (dateRangeFilter === 'THIS_WEEK') return diffDays <= 0 && diffDays >= -7;
    if (dateRangeFilter === 'THIS_MONTH') {
      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
    }

    return true;
  });

  // Group Entries by Day (Clockify-style date groups)
  interface DayGroup {
    dateKey: string;
    dateLabel: string;
    totalMinutes: number;
    entries: TimeEntry[];
  }

  const groupedDays: DayGroup[] = React.useMemo(() => {
    const groups: { [key: string]: DayGroup } = {};

    filteredEntries.forEach((entry) => {
      const d = new Date(entry.date);
      const isValid = !isNaN(d.getTime());
      const dateKey = isValid ? d.toISOString().split('T')[0] : 'Other';

      let dateLabel = dateKey;
      if (isValid) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) dateLabel = 'Today, ' + d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        else if (diffDays === -1) dateLabel = 'Yesterday, ' + d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        else dateLabel = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      }

      const mins = (Number(entry.hours) || 0) * 60 + (Number(entry.minutes) || 0);

      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateKey,
          dateLabel,
          totalMinutes: 0,
          entries: [],
        };
      }

      groups[dateKey].totalMinutes += mins;
      groups[dateKey].entries.push(entry);
    });

    return Object.values(groups).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [filteredEntries]);

  // Overall Metrics
  const todayEntries = entries.filter((e) => {
    const d = new Date(e.date);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const totalMinutesToday = todayEntries.reduce((sum, e) => sum + (e.hours * 60 + e.minutes), 0);
  const hoursToday = Math.floor(totalMinutesToday / 60);
  const minutesToday = totalMinutesToday % 60;
  const targetDailyHours = 8;
  const targetDailyMinutes = targetDailyHours * 60; // 480 mins
  const dailyPercent = Math.min(100, Math.round((totalMinutesToday / targetDailyMinutes) * 100));

  // Weekly hours logged by current user (default 48h = 6 days x 8h)
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);

  const thisWeekEntries = entries.filter((e) => {
    const d = new Date(e.date);
    return !isNaN(d.getTime()) && d >= startOfWeek;
  });
  const totalMinutesThisWeek = thisWeekEntries.reduce((sum, e) => sum + (e.hours * 60 + e.minutes), 0);
  const hoursThisWeek = Math.round((totalMinutesThisWeek / 60) * 10) / 10;
  const targetWeeklyHours = (user as any)?.weeklyCapacityHours === 40 ? 48 : ((user as any)?.weeklyCapacityHours || 48);
  const capacityPercent = Math.min(100, Math.round((hoursThisWeek / targetWeeklyHours) * 100));

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Time Tracker"
        subtitle="Clockify-grade live timer, daily timesheets, and weekly team capacity burn"
      />

      {/* Success Floating Toast */}
      {successToast && (
        <div className="fixed top-20 right-8 z-50 p-3 rounded-2xl bg-emerald-600/95 border border-emerald-400 text-white text-xs font-semibold flex items-center gap-2 shadow-2xl animate-fade-in backdrop-blur-md">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{successToast}</span>
        </div>
      )}

      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-5 sm:space-y-6">
        {/* Navigation Switcher: Personal Tracker vs Team Timesheet */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setViewTab('TRACKER')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                viewTab === 'TRACKER'
                  ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-[#181818] border border-transparent'
              }`}
            >
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Personal Tracker</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#222222] text-neutral-300">
                {entries.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setViewTab('TEAM_TIMESHEET')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                viewTab === 'TEAM_TIMESHEET'
                  ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-[#181818] border border-transparent'
              }`}
            >
              <Users className="w-4 h-4 text-teal-400" />
              <span>Team Timesheet</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#222222] text-neutral-300">
                {weeklySummaries.length}
              </span>
            </button>
          </div>

          {/* Quick Metrics Pills */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs font-mono">
            {/* Daily tracked metric with percentage and visual progress bar */}
            <div className="flex items-center gap-2 bg-[#141414] px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#242424] shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400">Today:</span>
                <span className="font-bold text-amber-300">{hoursToday}h {minutesToday}m</span>
                <span className="text-neutral-500 text-[11px]">/ 8h</span>
                <span className="text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded text-[10px]">
                  {dailyPercent}%
                </span>
              </div>
              <div className="w-12 sm:w-16 bg-[#202020] h-1.5 rounded-full overflow-hidden hidden xs:block">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
                  style={{ width: `${dailyPercent}%` }}
                />
              </div>
            </div>

            {/* Weekly tracked metric with capacity percentage and progress bar */}
            <div className="flex items-center gap-2 bg-[#141414] px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#242424] shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400">Week:</span>
                <span className="font-bold text-teal-400">{hoursThisWeek}h</span>
                <span className="text-neutral-500 text-[11px]">/ {targetWeeklyHours}h</span>
                <span className="text-teal-300 font-bold bg-teal-500/10 border border-teal-500/20 px-1.5 py-0.2 rounded text-[10px]">
                  {capacityPercent}%
                </span>
              </div>
              <div className="w-12 sm:w-16 bg-[#202020] h-1.5 rounded-full overflow-hidden hidden xs:block">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${capacityPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {viewTab === 'TRACKER' ? (
          <>
            {/* CLOCKIFY TOP TIME TRACKER BAR */}
            <div className="p-4 rounded-3xl bg-[#121212] border border-[#242424] shadow-xl backdrop-blur-md space-y-3">
              {/* Tracker Mode Toggle & Billable Icon */}
              <div className="flex items-center justify-between text-xs pb-1">
                <div className="flex items-center gap-2">
                  <div className="p-0.5 rounded-xl bg-[#181818] border border-[#282828] flex items-center">
                    <button
                      type="button"
                      onClick={() => setEntryMode('TIMER')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                        entryMode === 'TIMER'
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Timer Mode</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntryMode('MANUAL')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                        entryMode === 'MANUAL'
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Manual Add</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Billable toggle */}
                  <button
                    type="button"
                    onClick={() => setIsBillable(!isBillable)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition border ${
                      isBillable
                        ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                        : 'bg-[#181818] text-neutral-500 border-[#282828]'
                    }`}
                    title={isBillable ? 'Billable Time ($)' : 'Non-billable Time'}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>{isBillable ? 'Billable' : 'Non-billable'}</span>
                  </button>
                </div>
              </div>

              {/* The Main Clockify Bar Form */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                {/* Description Input (What are you working on?) */}
                <div className="lg:col-span-5">
                  <input
                    type="text"
                    placeholder="What are you working on right now?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-2xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-teal-500 transition shadow-inner font-medium"
                  />
                </div>

                {/* Project Selector */}
                <div className="lg:col-span-3 relative">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => {
                      setSelectedProjectId(e.target.value);
                      setSelectedTaskId('');
                    }}
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-2xl px-3.5 py-2.5 pr-8 text-xs text-white outline-none focus:border-teal-500 appearance-none cursor-pointer font-medium"
                  >
                    <option value="">-- Choose Project --</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.clientName || 'Internal'})
                      </option>
                    ))}
                  </select>
                  <FolderKanban className="w-3.5 h-3.5 text-teal-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Optional Task Selector */}
                <div className="lg:col-span-2 relative">
                  <select
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-2xl px-3 py-2.5 pr-7 text-xs text-white outline-none focus:border-teal-500 appearance-none cursor-pointer truncate"
                  >
                    <option value="">-- Task (Optional) --</option>
                    {projectTasks.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Action Column: Digital Timer & Start/Stop OR Manual Input */}
                <div className="lg:col-span-2 flex items-center justify-between sm:justify-end gap-3 pt-1 lg:pt-0">
                  {entryMode === 'TIMER' ? (
                    <>
                      {/* Big Digital Stopwatch */}
                      <span className={`font-mono font-extrabold text-base tracking-wider ${
                        isRunning ? 'text-amber-300 animate-pulse' : 'text-neutral-300'
                      }`}>
                        {formatStopwatch(elapsedSeconds)}
                      </span>

                      {/* Start / Stop Button */}
                      {isRunning ? (
                        <button
                          type="button"
                          onClick={stopTimer}
                          className="px-4 sm:px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-lg shadow-rose-950/40"
                        >
                          <Square className="w-3.5 h-3.5 fill-white" />
                          <span>STOP</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={startTimer}
                          className="px-4 sm:px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-lg shadow-teal-950/40"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>START</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleManualAdd}
                      className="w-full py-2.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ADD TIME</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Extra Row for Manual Mode: Date & Time range / hours */}
              {entryMode === 'MANUAL' && (
                <div className="pt-2.5 border-t border-[#1e1e1e] flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-neutral-400">Date:</span>
                      <input
                        type="date"
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        className="bg-[#181818] border border-[#2a2a2a] rounded-xl px-2.5 py-1 text-white text-xs outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 border-l border-[#262626] pl-3">
                      <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300">
                        <input
                          type="checkbox"
                          checked={manualUseTimeRange}
                          onChange={(e) => setManualUseTimeRange(e.target.checked)}
                          className="rounded bg-[#181818] border-[#333333] text-teal-500"
                        />
                        <span>Enter Start/End Time</span>
                      </label>
                    </div>

                    {manualUseTimeRange ? (
                      <div className="flex items-center gap-1.5 pl-2">
                        <input
                          type="time"
                          value={manualStartTime}
                          onChange={(e) => setManualStartTime(e.target.value)}
                          className="bg-[#181818] border border-[#2a2a2a] rounded-xl px-2 py-1 text-white text-xs outline-none"
                        />
                        <span className="text-neutral-500">-</span>
                        <input
                          type="time"
                          value={manualEndTime}
                          onChange={(e) => setManualEndTime(e.target.value)}
                          className="bg-[#181818] border border-[#2a2a2a] rounded-xl px-2 py-1 text-white text-xs outline-none"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pl-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="24"
                            value={manualHours}
                            onChange={(e) => setManualHours(e.target.value)}
                            className="w-14 bg-[#181818] border border-[#2a2a2a] rounded-xl px-2 py-1 text-white text-xs outline-none text-center"
                          />
                          <span className="text-neutral-400">h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="59"
                            step="5"
                            value={manualMinutes}
                            onChange={(e) => setManualMinutes(e.target.value)}
                            className="w-14 bg-[#181818] border border-[#2a2a2a] rounded-xl px-2 py-1 text-white text-xs outline-none text-center"
                          />
                          <span className="text-neutral-400">m</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] text-neutral-500">
                    Logged under: <strong className="text-neutral-300">{user?.name || 'Me'}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Filter and Search Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#121212] border border-[#222222] rounded-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 pl-1">
                  <Filter className="w-3.5 h-3.5 text-teal-400" />
                  Filter:
                </span>

                {/* Project Filter */}
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="bg-[#181818] border border-[#2a2a2a] text-white text-xs rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
                >
                  <option value="ALL">All Projects</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                {/* Date Range Filter */}
                <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 no-scrollbar">
                  {(['ALL', 'TODAY', 'YESTERDAY', 'THIS_WEEK', 'THIS_MONTH'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setDateRangeFilter(mode)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        dateRangeFilter === mode
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                          : 'bg-[#181818] text-neutral-400 hover:text-white border border-[#262626]'
                      }`}
                    >
                      {mode === 'ALL'
                        ? 'All Time'
                        : mode === 'TODAY'
                        ? 'Today'
                        : mode === 'YESTERDAY'
                        ? 'Yesterday'
                        : mode === 'THIS_WEEK'
                        ? 'This Week'
                        : 'This Month'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keyword Search */}
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search time logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#181818] border border-[#2a2a2a] rounded-xl text-xs text-white placeholder-neutral-500 outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* CLOCKIFY GROUPED ENTRIES BY DAY */}
            <div className="space-y-5">
              {groupedDays.length > 0 ? (
                groupedDays.map((dayGroup) => {
                  const dayHours = Math.floor(dayGroup.totalMinutes / 60);
                  const dayMins = dayGroup.totalMinutes % 60;

                  return (
                    <div
                      key={dayGroup.dateKey}
                      className="rounded-3xl bg-[#111111] border border-[#222222] overflow-hidden shadow-sm"
                    >
                      {/* Day Group Header (Clockify Style) */}
                      <div className="px-5 py-3 bg-[#151515] border-b border-[#222222] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-teal-400" />
                          <h3 className="font-heading text-xs font-bold text-white tracking-wide">
                            {dayGroup.dateLabel}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-neutral-400">Total:</span>
                          <span className="font-mono text-sm font-bold text-teal-400">
                            {formatDurationText(dayHours, dayMins)}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline">/ 8h</span>
                          <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                            {Math.min(100, Math.round((dayGroup.totalMinutes / 480) * 100))}%
                          </span>
                        </div>
                      </div>

                      {/* Entries List for this Day */}
                      <div className="divide-y divide-[#1e1e1e]">
                        {dayGroup.entries.map((entry) => (
                          <div
                            key={entry._id}
                            className="p-3.5 hover:bg-[#161616] transition flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                          >
                            {/* Left: Description & Tags */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2.5">
                                <span className="text-xs font-semibold text-white truncate">
                                  {entry.description || 'Task execution'}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                                {/* Project Tag */}
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#1a1a1a] border border-[#2a2a2a] text-teal-300 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                                  <span>{entry.project?.name || 'Project'}</span>
                                  {entry.project?.clientName && (
                                    <span className="text-neutral-500 font-normal">
                                      • {entry.project.clientName}
                                    </span>
                                  )}
                                </div>

                                {/* Task Tag if linked */}
                                {entry.task?.title && (
                                  <span className="text-neutral-400 bg-[#181818] px-2 py-0.5 rounded border border-[#262626]">
                                    Task: {entry.task.title}
                                  </span>
                                )}

                                {/* Billable indicator */}
                                {entry.billable !== false && (
                                  <span className="text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px]" title="Billable time">
                                    $
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Right: Time Range, Duration, Restart & Delete */}
                            <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                              {/* Time Interval e.g. 09:30 AM - 11:45 AM */}
                              {entry.startTime && entry.endTime && (
                                <span className="text-[11px] text-neutral-400 font-mono hidden sm:inline-block">
                                  {entry.startTime} - {entry.endTime}
                                </span>
                              )}

                              {/* Duration */}
                              <span className="font-mono text-xs font-bold text-white min-w-[55px] text-right">
                                {formatDurationText(entry.hours, entry.minutes)}
                              </span>

                              {/* Actions: Restart (▶) & Delete */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => restartPastTimer(entry)}
                                  className="p-1.5 rounded-lg bg-[#1e1e1e] hover:bg-teal-600 hover:text-white text-teal-400 transition shadow-sm"
                                  title="Continue / restart this timer"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEntry(entry._id)}
                                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-neutral-500 hover:text-rose-400 transition"
                                  title="Delete time entry"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center bg-[#111111] rounded-3xl border border-dashed border-[#242424] space-y-3">
                  <Clock className="w-10 h-10 text-neutral-600 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">No time entries recorded</h4>
                    <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
                      Start the live timer above or use manual mode to log hours spent on client projects.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startTimer}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start Timer Now</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* TEAM WEEKLY TIMESHEET & REPORTS TAB */
          <div className="space-y-6">
            <div className="p-5 rounded-3xl bg-[#121212] border border-[#222222] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-teal-400" />
                    Weekly Team Timesheets & Capacity Burn
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Live timesheet rollup for selected week. Click any member card to view day-by-day tracked details.
                  </p>
                </div>

                {/* Week Navigation Controls */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center bg-[#161616] border border-[#262626] rounded-xl p-1 text-xs shadow-sm">
                    <button
                      type="button"
                      onClick={() => setWeekOffset((prev) => prev - 1)}
                      className="p-1.5 hover:bg-[#222222] text-neutral-400 hover:text-white rounded-lg transition"
                      title="Previous week"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 font-semibold text-white text-xs whitespace-nowrap">
                      {weekRange.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setWeekOffset((prev) => prev + 1)}
                      className="p-1.5 hover:bg-[#222222] text-neutral-400 hover:text-white rounded-lg transition"
                      title="Next week"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {weekOffset !== 0 && (
                    <button
                      type="button"
                      onClick={() => setWeekOffset(0)}
                      className="text-xs font-semibold text-teal-400 hover:text-teal-300 hover:underline px-2 py-1 transition"
                    >
                      Current Week
                    </button>
                  )}

                  <div className="text-xs text-neutral-400 font-mono hidden md:block border-l border-[#262626] pl-3">
                    Target: <strong className="text-teal-400">48h / member</strong> <span className="text-neutral-500 text-[11px]">(6 days × 8h)</span>
                  </div>
                </div>
              </div>

              {/* Team Members Timesheet Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {weeklySummaries.map((summary) => {
                  const target = summary.user.capacity === 40 ? 48 : (summary.user.capacity || 48);
                  const pct = Math.min(100, Math.round((summary.totalHours / target) * 100));

                  return (
                    <div
                      key={summary.user.id}
                      onClick={() => setSelectedMemberForDetails(summary)}
                      className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-3 shadow-sm hover:border-teal-500/50 hover:bg-[#191919] transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {summary.user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-teal-300 transition">
                              {summary.user.name}
                            </div>
                            <div className="text-[11px] text-teal-400">{summary.user.title || 'Team Member'}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-heading text-sm font-bold text-white font-mono">
                            {summary.totalHours}h
                          </span>
                          <span className="text-[11px] text-neutral-500 block">/ {target}h</span>
                        </div>
                      </div>

                      {/* Capacity Burn Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-neutral-400">
                          <span>Capacity Burn</span>
                          <span className="font-mono text-teal-300 font-bold">{pct}%</span>
                        </div>
                        <div className="w-full bg-[#101010] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Project Breakdown Pills */}
                      {summary.projectBreakdown && summary.projectBreakdown.length > 0 && (
                        <div className="pt-2 border-t border-[#222222] space-y-1">
                          <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                            Project Distribution:
                          </span>
                          <div className="space-y-1">
                            {summary.projectBreakdown.map((pb, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-[11px] text-neutral-300"
                              >
                                <span className="truncate max-w-[150px]">{pb.projectName}</span>
                                <span className="font-mono text-neutral-400">{pb.hours}h</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interactive Trigger Banner */}
                      <div className="pt-2.5 border-t border-[#222222] flex items-center justify-between text-xs text-teal-400 group-hover:text-teal-300 font-medium">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5" />
                          View Day-by-Day Logs
                        </span>
                        <span className="text-[10px] text-neutral-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition font-mono">
                          {(summary.entries || []).length} log{(summary.entries || []).length === 1 ? '' : 's'} →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED DAILY TIMESHEET MODAL */}
      <Modal
        isOpen={!!selectedMemberForDetails}
        onClose={() => {
          setSelectedMemberForDetails(null);
          setSelectedDayFilter('ALL');
        }}
        title={selectedMemberForDetails ? `${selectedMemberForDetails.user.name}'s Weekly Timesheet` : 'Member Timesheet'}
        maxWidth="max-w-3xl"
      >
        {selectedMemberForDetails && (
          <div className="space-y-5">
            {/* Member Profile & Metrics Header */}
            <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-md shadow-teal-950/30">
                    {selectedMemberForDetails.user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-heading text-sm sm:text-base font-bold text-white leading-tight">
                      {selectedMemberForDetails.user.name}
                    </h4>
                    <p className="text-xs text-teal-400 font-medium">
                      {selectedMemberForDetails.user.title || 'Team Member'}
                      {selectedMemberForDetails.user.email && (
                        <span className="text-neutral-500 ml-1.5 font-normal">
                          • {selectedMemberForDetails.user.email}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#111111] px-3.5 py-2 rounded-xl border border-[#222222] self-start sm:self-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Logged</span>
                    <span className="font-heading text-lg font-bold text-white font-mono">
                      {selectedMemberForDetails.totalHours}h
                    </span>
                  </div>
                  <div className="border-l border-[#262626] pl-3">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Capacity</span>
                    <span className="text-xs font-mono text-teal-300">
                      {(() => {
                        const target = selectedMemberForDetails.user.capacity === 40 ? 48 : (selectedMemberForDetails.user.capacity || 48);
                        const pct = Math.min(100, Math.round((selectedMemberForDetails.totalHours / target) * 100));
                        return `${pct}% of ${target}h`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-metrics: Billable vs Non-Billable & Week Range */}
              <div className="pt-2 border-t border-[#222222] flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Billable: <strong className="text-emerald-400 font-mono">{selectedMemberStats.billableHours}h</strong>
                  </span>
                  <span className="text-neutral-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-neutral-500" />
                    Non-billable: <strong className="text-neutral-300 font-mono">{selectedMemberStats.nonBillableHours}h</strong>
                  </span>
                  <span className="text-neutral-500">
                    • {selectedMemberStats.totalEntries} time log{selectedMemberStats.totalEntries === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="text-[11px] text-neutral-400 font-mono">
                  Week of <span className="text-neutral-200">{weekRange.label}</span>
                </div>
              </div>

              {/* Project breakdown pills */}
              {selectedMemberForDetails.projectBreakdown && selectedMemberForDetails.projectBreakdown.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold mr-1">Projects:</span>
                  {selectedMemberForDetails.projectBreakdown.map((pb, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#1f1f1f] text-neutral-300 text-[11px] border border-[#2a2a2a]"
                    >
                      <FolderKanban className="w-2.5 h-2.5 text-teal-400" />
                      <span>{pb.projectName}</span>
                      <strong className="text-teal-300 font-mono text-[10px]">{pb.hours}h</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Day Filter Pills */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                <span>Daily Breakdown (Monday – Sunday):</span>
                {selectedDayFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setSelectedDayFilter('ALL')}
                    className="text-[11px] text-teal-400 hover:underline font-medium"
                  >
                    Show all days
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedDayFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedDayFilter === 'ALL'
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                      : 'bg-[#181818] text-neutral-400 hover:text-white border border-[#242424]'
                  }`}
                >
                  All Days ({selectedMemberForDetails.totalHours}h)
                </button>
                {memberDailyBreakdown.map((day) => (
                  <button
                    key={day.dayName}
                    type="button"
                    onClick={() => setSelectedDayFilter(day.dayName)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                      selectedDayFilter === day.dayName
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                        : day.totalMinutes > 0
                        ? 'bg-[#181818] text-neutral-300 hover:text-white border border-[#262626]'
                        : 'bg-[#141414] text-neutral-500 hover:text-neutral-400 border border-[#1f1f1f]'
                    }`}
                  >
                    <span>{day.dayName.slice(0, 3)}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        selectedDayFilter === day.dayName
                          ? 'bg-black/30 text-white'
                          : day.totalMinutes > 0
                          ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                          : 'bg-[#202020] text-neutral-600'
                      }`}
                    >
                      {day.formattedDuration}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Day-by-Day List */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
              {memberDailyBreakdown
                .filter((day) => selectedDayFilter === 'ALL' || selectedDayFilter === day.dayName)
                .map((day) => {
                  return (
                    <div
                      key={day.dayName}
                      className="rounded-2xl bg-[#141414] border border-[#222222] overflow-hidden"
                    >
                      {/* Day Header */}
                      <div className="py-2.5 px-4 bg-[#181818]/70 border-b border-[#222222] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-heading text-xs font-bold text-white">
                            {day.dayName}
                          </span>
                          <span className="text-xs text-neutral-400 font-mono">
                            {day.dateFormatted}
                          </span>
                          {day.isToday && (
                            <span className="px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[9px] uppercase font-bold tracking-wider">
                              Today
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${
                              day.totalMinutes > 0
                                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                                : 'text-neutral-500'
                            }`}
                          >
                            {day.totalMinutes > 0 ? `${day.formattedDuration} logged` : '0h / No logs'}
                          </span>
                        </div>
                      </div>

                      {/* Day Entries List */}
                      <div className="p-3 space-y-2">
                        {day.entries.length === 0 ? (
                          <div className="py-3 text-center text-xs text-neutral-500 italic">
                            No time entries logged on {day.dayName}.
                          </div>
                        ) : (
                          day.entries.map((entry) => (
                            <div
                              key={entry._id}
                              className="p-3 rounded-xl bg-[#181818] border border-[#242424] hover:border-[#333333] transition space-y-2"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-start gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <Clock className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <span className="font-medium text-white text-xs block leading-snug">
                                      {entry.description || (entry.task as any)?.title || 'Work log'}
                                    </span>
                                    {(entry.task as any)?.title && entry.description && (
                                      <span className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                                        <CheckCircle2 className="w-3 h-3 text-teal-500 shrink-0" />
                                        Task: {(entry.task as any).title}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                                  {entry.startTime && entry.endTime && (
                                    <span className="text-[11px] font-mono text-neutral-400 bg-[#202020] px-2 py-0.5 rounded border border-[#2a2a2a]">
                                      {entry.startTime} – {entry.endTime}
                                    </span>
                                  )}
                                  <span className="text-xs font-mono font-bold text-teal-300 bg-teal-500/10 px-2.5 py-0.5 rounded-lg border border-teal-500/20">
                                    {formatDurationText(entry.hours, entry.minutes)}
                                  </span>
                                </div>
                              </div>

                              {/* Badges: Project, Client, Tag, Billable */}
                              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#202020] text-[11px]">
                                <span className="inline-flex items-center gap-1 text-neutral-300 bg-[#202020] px-2 py-0.5 rounded border border-[#2a2a2a]">
                                  <FolderKanban className="w-3 h-3 text-teal-400" />
                                  {(entry.project as any)?.name || 'Project'}
                                </span>

                                {(entry.project as any)?.clientName && (
                                  <span className="text-neutral-500 text-[11px]">
                                    Client: {(entry.project as any).clientName}
                                  </span>
                                )}

                                {entry.tag && (
                                  <span className="inline-flex items-center gap-1 text-neutral-400 bg-[#1c1c1c] px-2 py-0.5 rounded">
                                    <Tag className="w-2.5 h-2.5 text-neutral-500" />
                                    {entry.tag}
                                  </span>
                                )}

                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium text-[10px] ${
                                    entry.billable
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700/50'
                                  }`}
                                >
                                  <DollarSign className="w-2.5 h-2.5" />
                                  {entry.billable ? 'Billable' : 'Non-billable'}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
