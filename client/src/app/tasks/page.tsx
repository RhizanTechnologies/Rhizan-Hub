'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { PriorityBadge } from '@/components/Badge';
import { Modal } from '@/components/Modal';
import { Task, TaskPriority, TaskStatus, TaskSubtask, Project, User } from '@/types';
import { apiFetch } from '@/lib/api';
import {
  Clock,
  MessageSquare,
  Plus,
  Filter,
  Calendar,
  CalendarDays,
  Check,
  CheckSquare,
  ListChecks,
  Search,
  Trash2,
  FolderKanban,
  AlertTriangle,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  GripVertical,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const COLUMNS: { id: TaskStatus; label: string; accent: string }[] = [
  { id: 'TODO', label: 'To Do', accent: 'border-[#262626]' },
  { id: 'IN_PROGRESS', label: 'In Progress', accent: 'border-teal-500/40' },
  { id: 'REVIEW', label: 'Review', accent: 'border-amber-500/40' },
  { id: 'DONE', label: 'Done', accent: 'border-emerald-500/40' },
];

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<TaskStatus | null>(null);

  // Filters
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'TOMORROW' | 'THIS_WEEK' | 'OVERDUE' | 'CUSTOM'>('ALL');
  const [customDate, setCustomDate] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('MY_TASKS'); // Default: Personal My Tasks

  // Modals state
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('TODO');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [mobileColumn, setMobileColumn] = useState<'ALL' | TaskStatus>('ALL');

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedAssignedToId, setSelectedAssignedToId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [estimatedHours, setEstimatedHours] = useState('2');
  const [newSubtasks, setNewSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');

  // Selected Task Detail Subtask & Comment state
  const [detailSubtaskText, setDetailSubtaskText] = useState('');
  const [commentText, setCommentText] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, projectsData, teamData] = await Promise.all([
        apiFetch<Task[]>('/tasks'),
        apiFetch<Project[]>('/projects'),
        apiFetch<any[]>('/team'),
      ]);

      if (tasksData) setTasks(tasksData);
      if (projectsData) {
        setProjects(projectsData);
        if (projectsData.length > 0 && !selectedProjectId) {
          setSelectedProjectId(projectsData[0]._id);
        }
      }
      if (teamData) setTeamMembers(teamData);
    } catch (err) {
      console.error('Failed to load tasks workspace', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Set default assigned to current user when user loads
  useEffect(() => {
    if (user && !selectedAssignedToId) {
      const match = teamMembers.find((m) => m.email === user.email || (m as any).id === (user as any).id);
      if (match) {
        setSelectedAssignedToId((match as any).id || (match as any)._id);
      }
    }
  }, [user, teamMembers]);

  // Status Change with Dropdown
  const handleQuickStatusChange = async (taskId: string, newStatus: TaskStatus, e?: React.ChangeEvent<HTMLSelectElement> | React.MouseEvent) => {
    if (e) e.stopPropagation();

    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    if (selectedTask && selectedTask._id === taskId) {
      setSelectedTask({ ...selectedTask, status: newStatus });
    }

    try {
      await apiFetch(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Open New Task Modal pre-assigned to a specific column/status
  const openNewTaskForColumn = (status: TaskStatus) => {
    setNewTaskStatus(status);
    setIsNewTaskOpen(true);
  };

  // Handle Drag & Drop Task between Kanban columns
  const handleDropToColumn = async (targetStatus: TaskStatus) => {
    if (!draggedTaskId) return;
    const task = tasks.find((t) => t._id === draggedTaskId);
    if (!task || task.status === targetStatus) {
      setDraggedTaskId(null);
      setDragOverColumnId(null);
      return;
    }

    const currentId = draggedTaskId;

    // Optimistic UI state update
    setTasks((prev) =>
      prev.map((t) => (t._id === currentId ? { ...t, status: targetStatus } : t))
    );

    if (selectedTask?._id === currentId) {
      setSelectedTask({ ...selectedTask, status: targetStatus });
    }

    setDraggedTaskId(null);
    setDragOverColumnId(null);

    try {
      await apiFetch(`/tasks/${currentId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: targetStatus }),
      });
    } catch (err) {
      console.error('Failed to move task via drag-and-drop:', err);
      loadData();
    }
  };

  // Toggle Subtask Checkbox
  const handleToggleSubtask = async (task: Task, subtaskIdx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentSubtasks = [...(task.subtasks || [])];
    if (!currentSubtasks[subtaskIdx]) return;

    const updatedSubtasks: TaskSubtask[] = currentSubtasks.map((st, idx) =>
      idx === subtaskIdx ? { ...st, completed: !st.completed } : st
    );

    // If all subtasks are checked and task is not DONE, optionally advance to DONE
    const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
    let newStatus = task.status;
    if (allCompleted && task.status !== 'DONE') {
      newStatus = 'DONE';
    } else if (!allCompleted && task.status === 'DONE') {
      newStatus = 'IN_PROGRESS';
    }

    const updatedTask: Task = {
      ...task,
      subtasks: updatedSubtasks,
      status: newStatus,
    };

    setTasks((prev) => prev.map((t) => (t._id === task._id ? updatedTask : t)));
    if (selectedTask?._id === task._id) {
      setSelectedTask(updatedTask);
    }

    try {
      await apiFetch(`/tasks/${task._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          subtasks: updatedSubtasks,
          status: newStatus,
        }),
      });
    } catch (err) {
      console.error('Failed to toggle subtask', err);
    }
  };

  // Add subtask in Task Detail Modal
  const handleAddSubtaskToSelectedTask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedTask || !detailSubtaskText.trim()) return;

    const newSubtaskItem: TaskSubtask = {
      title: detailSubtaskText.trim(),
      completed: false,
    };

    const updatedSubtasks = [...(selectedTask.subtasks || []), newSubtaskItem];
    const updatedTask: Task = {
      ...selectedTask,
      subtasks: updatedSubtasks,
    };

    setSelectedTask(updatedTask);
    setTasks((prev) => prev.map((t) => (t._id === selectedTask._id ? updatedTask : t)));
    setDetailSubtaskText('');

    try {
      await apiFetch(`/tasks/${selectedTask._id}`, {
        method: 'PUT',
        body: JSON.stringify({ subtasks: updatedSubtasks }),
      });
    } catch (err: any) {
      alert(err.message || 'Failed to add subtask');
    }
  };

  // Delete subtask from Selected Task
  const handleDeleteSubtaskFromSelected = async (subtaskIdx: number) => {
    if (!selectedTask) return;
    const updatedSubtasks = (selectedTask.subtasks || []).filter((_, idx) => idx !== subtaskIdx);
    const updatedTask = { ...selectedTask, subtasks: updatedSubtasks };

    setSelectedTask(updatedTask);
    setTasks((prev) => prev.map((t) => (t._id === selectedTask._id ? updatedTask : t)));

    try {
      await apiFetch(`/tasks/${selectedTask._id}`, {
        method: 'PUT',
        body: JSON.stringify({ subtasks: updatedSubtasks }),
      });
    } catch (err: any) {
      alert(err.message || 'Failed to remove subtask');
    }
  };

  // Delete entire task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    if (selectedTask?._id === taskId) {
      setSelectedTask(null);
    }

    try {
      await apiFetch(`/tasks/${taskId}`, { method: 'DELETE' });
    } catch (err: any) {
      alert(err.message || 'Failed to delete task');
    }
  };

  // Draft subtasks builder in Create Modal
  const handleAddDraftSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtaskInput.trim()) return;
    setNewSubtasks([...newSubtasks, subtaskInput.trim()]);
    setSubtaskInput('');
  };

  const handleRemoveDraftSubtask = (idx: number) => {
    setNewSubtasks(newSubtasks.filter((_, i) => i !== idx));
  };

  // Create Task Form Submit
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const subtasksPayload = newSubtasks.map((s) => ({
      title: s,
      completed: false,
    }));

    try {
      const created = await apiFetch<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          priority,
          status: newTaskStatus || 'TODO',
          project: selectedProjectId || undefined,
          assignedTo: selectedAssignedToId || undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          estimatedHours: parseFloat(estimatedHours) || 0,
          subtasks: subtasksPayload,
        }),
      });

      setTasks([created, ...tasks]);
      setTitle('');
      setDescription('');
      setNewSubtasks([]);
      setSubtaskInput('');
      setIsNewTaskOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create task');
    }
  };

  // Add Comment to Selected Task
  const handleAddComment = async () => {
    if (!selectedTask || !commentText.trim()) return;
    const newComment = {
      author: {
        name: user?.name || 'Me',
        email: user?.email || '',
      },
      text: commentText.trim(),
      createdAt: 'Just now',
    };

    const updatedTask = {
      ...selectedTask,
      comments: [...(selectedTask.comments || []), newComment],
    };

    setSelectedTask(updatedTask);
    setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
    setCommentText('');

    try {
      await apiFetch(`/tasks/${selectedTask._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          comments: updatedTask.comments,
        }),
      });
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  // Date Calculation Helpers
  const getDaysDiff = (dateStr?: string) => {
    if (!dateStr) return null;
    const taskDate = new Date(dateStr);
    if (isNaN(taskDate.getTime())) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tDate = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
    return Math.round((tDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatTaskDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const diff = getDaysDiff(dateStr);
    if (diff === null) return { text: dateStr, isToday: false, isOverdue: false, isTomorrow: false };

    if (diff === 0) return { text: 'Today', isToday: true, isOverdue: false, isTomorrow: false };
    if (diff === 1) return { text: 'Tomorrow', isToday: false, isOverdue: false, isTomorrow: true };
    if (diff === -1) return { text: 'Yesterday', isToday: false, isOverdue: true, isTomorrow: false };
    if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, isToday: false, isOverdue: true, isTomorrow: false };
    if (diff <= 7) {
      const d = new Date(dateStr);
      return { text: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }), isToday: false, isOverdue: false, isTomorrow: false };
    }
    const d = new Date(dateStr);
    return { text: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), isToday: false, isOverdue: false, isTomorrow: false };
  };

  // Metric counts for date badges
  const todayCount = tasks.filter((t) => getDaysDiff(t.dueDate) === 0).length;
  const tomorrowCount = tasks.filter((t) => getDaysDiff(t.dueDate) === 1).length;
  const overdueCount = tasks.filter((t) => {
    const diff = getDaysDiff(t.dueDate);
    return diff !== null && diff < 0 && t.status !== 'DONE';
  }).length;

  // Filter Tasks Engine
  const filteredTasks = tasks.filter((task) => {
    // 1. Assignee / Person Filter (Dropdown)
    if (assigneeFilter === 'MY_TASKS') {
      if (user) {
        const isMyTask =
          task.assignedTo?._id === (user as any).id ||
          (task.assignedTo as any)?.id === (user as any).id ||
          task.assignedTo?.email?.toLowerCase() === user.email?.toLowerCase() ||
          task.assignedTo?.name?.toLowerCase() === user.name?.toLowerCase();
        if (!isMyTask) return false;
      }
    } else if (assigneeFilter !== 'ALL') {
      const assignedId = task.assignedTo?._id || (task.assignedTo as any)?.id;
      const assignedEmail = task.assignedTo?.email?.toLowerCase();
      const assignedName = task.assignedTo?.name?.toLowerCase();
      const targetMember = teamMembers.find(
        (m) => (m as any).id === assigneeFilter || (m as any)._id === assigneeFilter
      );
      const isTarget =
        assignedId === assigneeFilter ||
        (targetMember &&
          (assignedEmail === targetMember.email?.toLowerCase() ||
            assignedName === targetMember.name?.toLowerCase()));
      if (!isTarget) return false;
    }

    // 2. Project Filter
    if (projectFilter !== 'ALL') {
      const projId = typeof task.project === 'object' ? task.project?._id : task.project;
      if (projId !== projectFilter && task.project?.name !== projectFilter) {
        return false;
      }
    }

    // 3. Priority Filter
    if (priorityFilter !== 'ALL') {
      if (task.priority !== priorityFilter) return false;
    }

    // 4. Keyword Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchSub = task.subtasks?.some((st) => st.title.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchSub) return false;
    }

    // 5. Date Filter
    if (dateFilter === 'ALL') return true;

    const diff = getDaysDiff(task.dueDate);

    if (dateFilter === 'TODAY') {
      return diff === 0;
    }
    if (dateFilter === 'TOMORROW') {
      return diff === 1;
    }
    if (dateFilter === 'THIS_WEEK') {
      return diff !== null && diff >= 0 && diff <= 7;
    }
    if (dateFilter === 'OVERDUE') {
      return diff !== null && diff < 0 && task.status !== 'DONE';
    }
    if (dateFilter === 'CUSTOM' && customDate) {
      if (!task.dueDate) return false;
      const target = new Date(customDate);
      const current = new Date(task.dueDate);
      return (
        target.getFullYear() === current.getFullYear() &&
        target.getMonth() === current.getMonth() &&
        target.getDate() === current.getDate()
      );
    }

    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Personal Tasks & Daily Board"
        subtitle="Individual work queue with subtask tracking, due dates, and project filtering"
        actionButton={{
          label: 'New Task',
          onClick: () => setIsNewTaskOpen(true),
        }}
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-4">
        {/* Productivity Control & Filtering Ribbon */}
        <div className="p-4 bg-[#121212] border border-[#222222] rounded-3xl space-y-3 shadow-md">
          {/* Top Row: Personal Scope Switcher + Search + Projects */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Assignee / Person Filter Dropdown */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="bg-[#181818] border border-[#282828] text-white text-xs font-medium rounded-xl px-3 py-2 pr-8 outline-none focus:border-teal-500 cursor-pointer appearance-none min-w-[200px]"
                >
                  <option value="MY_TASKS">👤 My Tasks (Personal)</option>
                  <option value="ALL">👥 All Team Tasks</option>
                  <optgroup label="Select Specific Person">
                    {teamMembers.map((m) => {
                      const mId = (m as any).id || (m as any)._id;
                      return (
                        <option key={mId} value={mId}>
                          👤 {m.name} ({m.title || m.role})
                        </option>
                      );
                    })}
                  </optgroup>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Project Filter Dropdown */}
              <div className="relative">
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="bg-[#181818] border border-[#282828] text-white text-xs rounded-xl px-3 py-2 pr-8 outline-none focus:border-teal-500 cursor-pointer appearance-none min-w-[170px]"
                >
                  <option value="ALL">📁 All Projects</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.clientName || 'Internal'})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Priority Filter Dropdown */}
              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-[#181818] border border-[#282828] text-white text-xs rounded-xl px-3 py-2 pr-8 outline-none focus:border-teal-500 cursor-pointer appearance-none"
                >
                  <option value="ALL">⚡ All Priorities</option>
                  <option value="URGENT">🔴 Urgent</option>
                  <option value="HIGH">🟠 High</option>
                  <option value="MEDIUM">🟡 Medium</option>
                  <option value="LOW">🟢 Low</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Keyword Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks or subtasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white placeholder-neutral-500 outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Bottom Row: Date Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[#1e1e1e]">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                <CalendarDays className="w-3.5 h-3.5 text-teal-400" />
                Filter Date:
              </span>

              <button
                type="button"
                onClick={() => setDateFilter('ALL')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                  dateFilter === 'ALL'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'bg-[#181818] text-neutral-400 hover:text-white border border-[#282828]'
                }`}
              >
                All Dates
              </button>

              <button
                type="button"
                onClick={() => setDateFilter('TODAY')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  dateFilter === 'TODAY'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-[#181818] text-neutral-400 hover:text-white border border-[#282828]'
                }`}
              >
                <span>Today</span>
                {todayCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/30 text-amber-200 font-bold">
                    {todayCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setDateFilter('TOMORROW')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  dateFilter === 'TOMORROW'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'bg-[#181818] text-neutral-400 hover:text-white border border-[#282828]'
                }`}
              >
                <span>Tomorrow</span>
                {tomorrowCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-500/30 text-teal-200 font-bold">
                    {tomorrowCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setDateFilter('THIS_WEEK')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                  dateFilter === 'THIS_WEEK'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'bg-[#181818] text-neutral-400 hover:text-white border border-[#282828]'
                }`}
              >
                This Week
              </button>

              <button
                type="button"
                onClick={() => setDateFilter('OVERDUE')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  dateFilter === 'OVERDUE'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-[#181818] text-neutral-400 hover:text-rose-400 border border-[#282828]'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>Overdue</span>
                {overdueCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/30 text-rose-200 font-bold">
                    {overdueCount}
                  </span>
                )}
              </button>

              {/* Specific Date Picker */}
              <div className="flex items-center gap-1 pl-1">
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    if (e.target.value) setDateFilter('CUSTOM');
                  }}
                  className={`px-2 py-0.5 rounded-xl text-xs outline-none border transition ${
                    dateFilter === 'CUSTOM'
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
                      : 'bg-[#181818] border-[#282828] text-neutral-400'
                  }`}
                />
              </div>
            </div>

            <div className="text-xs text-neutral-400">
              Showing <strong className="text-white font-mono">{filteredTasks.length}</strong> tasks
              {assigneeFilter === 'MY_TASKS'
                ? ' for you'
                : assigneeFilter === 'ALL'
                ? ' across team'
                : ` for ${teamMembers.find((m) => (m as any).id === assigneeFilter || (m as any)._id === assigneeFilter)?.name || 'selected member'}`}
            </div>
          </div>
        </div>

        {/* Mobile Column Tab Switcher */}
        <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          <button
            type="button"
            onClick={() => setMobileColumn('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              mobileColumn === 'ALL'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-[#181818] text-neutral-400 border border-[#262626]'
            }`}
          >
            All Columns ({filteredTasks.length})
          </button>
          {COLUMNS.map((col) => {
            const count = filteredTasks.filter((t) => t.status === col.id).length;
            const isSelected = mobileColumn === col.id;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setMobileColumn(col.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-[#181818] text-neutral-400 border border-[#262626]'
                }`}
              >
                <span>{col.label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 font-bold">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Kanban Board Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const isHiddenOnMobile = mobileColumn !== 'ALL' && mobileColumn !== col.id;
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            const colEstimatedHours = colTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
            const isColumnTarget = dragOverColumnId === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverColumnId !== col.id) {
                    setDragOverColumnId(col.id);
                  }
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  if (dragOverColumnId === col.id) {
                    setDragOverColumnId(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropToColumn(col.id);
                }}
                className={`${
                  isHiddenOnMobile ? 'hidden md:flex' : 'flex'
                } bg-[#111111] border ${
                  isColumnTarget
                    ? 'border-teal-500 bg-teal-950/20 shadow-lg shadow-teal-950/40 ring-2 ring-teal-500/30'
                    : 'border-[#222222]'
                } rounded-3xl p-3.5 flex-col min-h-[460px] md:min-h-[580px] shadow-sm transition-all duration-200`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222222]">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-xs font-bold uppercase tracking-wider text-neutral-200">
                      {col.label}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1c1c1c] text-neutral-400 font-semibold border border-[#2a2a2a]">
                      {colTasks.length}
                    </span>
                    {colEstimatedHours > 0 && (
                      <span className="text-[10px] font-mono text-neutral-500">
                        • {colEstimatedHours}h est
                      </span>
                    )}
                  </div>

                  {/* Quick Add Button to Column */}
                  <button
                    type="button"
                    title={`Add task to ${col.label}`}
                    onClick={() => openNewTaskForColumn(col.id)}
                    className="w-6 h-6 rounded-lg bg-[#181818] hover:bg-teal-600 text-neutral-400 hover:text-white flex items-center justify-center transition text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Drop Indicator placeholder when dragging over column */}
                {isColumnTarget && draggedTaskId && (
                  <div className="p-3 mb-3 rounded-2xl border-2 border-dashed border-teal-500/70 bg-teal-500/10 text-center text-xs text-teal-300 font-medium animate-pulse">
                    Drop task here to move to {col.label}
                  </div>
                )}

                {/* Task Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.map((task) => {
                    const dateInfo = formatTaskDueDate(task.dueDate);
                    const subtasks = task.subtasks || [];
                    const completedSubtasks = subtasks.filter((s) => s.completed).length;
                    const isDraggingThis = draggedTaskId === task._id;

                    return (
                      <div
                        key={task._id}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', task._id);
                          e.dataTransfer.effectAllowed = 'move';
                          setDraggedTaskId(task._id);
                        }}
                        onDragEnd={() => {
                          setDraggedTaskId(null);
                          setDragOverColumnId(null);
                        }}
                        onClick={() => setSelectedTask(task)}
                        className={`p-3.5 rounded-2xl bg-[#161616] border ${
                          isDraggingThis
                            ? 'opacity-40 border-dashed border-teal-500 scale-[0.98]'
                            : dateInfo?.isOverdue
                            ? 'border-rose-500/30 hover:border-rose-500/60'
                            : 'border-[#242424] hover:border-teal-500/40'
                        } transition-all cursor-grab active:cursor-grabbing shadow-sm group select-none space-y-2.5`}
                      >
                        {/* Top Badges: Priority + Due Date + Drag Grip */}
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <GripVertical className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-400 opacity-60 group-hover:opacity-100 transition shrink-0" />
                            <PriorityBadge priority={task.priority} />
                          </div>

                          {dateInfo && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                                dateInfo.isOverdue
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                  : dateInfo.isToday
                                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                  : dateInfo.isTomorrow
                                  ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                                  : 'bg-[#202020] text-neutral-400 border-[#2d2d2d]'
                              }`}
                            >
                              <Calendar className="w-2.5 h-2.5" />
                              {dateInfo.text}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-semibold text-white leading-snug group-hover:text-teal-300 transition">
                          {task.title}
                        </h4>

                        {/* Connected Project */}
                        {task.project && (
                          <div className="text-[11px] text-teal-400/90 font-medium truncate flex items-center gap-1">
                            <FolderKanban className="w-3 h-3 text-teal-400 shrink-0" />
                            <span>{task.project.name}</span>
                          </div>
                        )}

                        {/* Subtasks Progress Chip & Quick Checkbox Checklist */}
                        {subtasks.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-[10px] text-neutral-400">
                              <span className="font-semibold flex items-center gap-1">
                                <ListChecks className="w-3 h-3 text-teal-400" />
                                Subtasks
                              </span>
                              <span className="font-mono text-teal-300 font-bold">
                                {completedSubtasks}/{subtasks.length}
                              </span>
                            </div>

                            {/* Mini Progress Bar */}
                            <div className="w-full bg-[#121212] h-1 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.round((completedSubtasks / subtasks.length) * 100)}%`,
                                }}
                              />
                            </div>

                            {/* Subtask Interactive Checkbox Items */}
                            <div className="space-y-1 pt-1">
                              {subtasks.slice(0, 3).map((st, sIdx) => (
                                <div
                                  key={sIdx}
                                  onClick={(e) => handleToggleSubtask(task, sIdx, e)}
                                  className="flex items-center gap-2 py-0.5 text-left group/st hover:text-white"
                                >
                                  <div
                                    className={`w-3.5 h-3.5 rounded flex items-center justify-center transition shrink-0 ${
                                      st.completed
                                        ? 'bg-emerald-500 text-black'
                                        : 'border border-neutral-600 group-hover/st:border-teal-400'
                                    }`}
                                  >
                                    {st.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                  </div>
                                  <span
                                    className={`text-[11px] truncate transition ${
                                      st.completed
                                        ? 'line-through text-neutral-500'
                                        : 'text-neutral-300'
                                    }`}
                                  >
                                    {st.title}
                                  </span>
                                </div>
                              ))}
                              {subtasks.length > 3 && (
                                <div className="text-[10px] text-neutral-500 italic pl-5">
                                  +{subtasks.length - 3} more subtasks...
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Interactive Status Dropdown, Assignee Avatar & Estimated Hours */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-[#222222] gap-2">
                          {/* Status Dropdown Selector */}
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={task.status}
                              onChange={(e) => handleQuickStatusChange(task._id, e.target.value as TaskStatus, e)}
                              className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                                task.status === 'DONE'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : task.status === 'IN_PROGRESS'
                                  ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                                  : task.status === 'REVIEW'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  : 'bg-[#121212] text-neutral-300 border-[#2a2a2a]'
                              }`}
                            >
                              <option value="TODO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="REVIEW">Review</option>
                              <option value="DONE">Done</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                            {/* Assignee Avatar */}
                            {task.assignedTo ? (
                              <div
                                title={`Assigned to ${task.assignedTo.name || 'Member'}`}
                                className="flex items-center gap-1 bg-[#1a1a1a] border border-[#2a2a2a] px-1.5 py-0.5 rounded-md"
                              >
                                <div className="w-3.5 h-3.5 rounded-full bg-teal-600 text-white font-bold text-[8px] flex items-center justify-center">
                                  {task.assignedTo.name?.charAt(0) || 'U'}
                                </div>
                                <span className="text-[10px] text-neutral-300 truncate max-w-[65px]">
                                  {task.assignedTo.name}
                                </span>
                              </div>
                            ) : null}

                            {task.estimatedHours ? (
                              <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5 text-teal-400" />
                                {task.estimatedHours}h
                              </span>
                            ) : null}

                            {task.comments && task.comments.length > 0 && (
                              <div className="flex items-center gap-0.5 text-neutral-400">
                                <MessageSquare className="w-3 h-3" />
                                <span className="text-[10px]">{task.comments.length}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="h-32 border border-dashed border-[#262626] rounded-2xl flex items-center justify-center text-xs text-neutral-600">
                      No tasks in {col.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Task Modal with Subtasks Builder */}
      <Modal isOpen={isNewTaskOpen} onClose={() => setIsNewTaskOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement JWT authentication & ERP backend APIs"
              className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details or acceptance criteria..."
              className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="">-- No Project (General) --</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.clientName || 'Internal'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Assignee</label>
              <select
                value={selectedAssignedToId}
                onChange={(e) => setSelectedAssignedToId(e.target.value)}
                className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="">-- Myself (Personal Task) --</option>
                {teamMembers.map((m) => (
                  <option key={(m as any).id || (m as any)._id} value={(m as any).id || (m as any)._id}>
                    {m.name} ({m.title || 'Developer'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Est. Hours</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Subtasks Builder */}
          <div className="p-3.5 rounded-2xl bg-[#141414] border border-[#262626] space-y-2.5">
            <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-teal-400" />
              Subtasks Checklist ({newSubtasks.length})
            </span>

            {/* Subtask Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add subtask and press enter (e.g. Design schema)..."
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDraftSubtask(e);
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500"
              />
              <button
                type="button"
                onClick={handleAddDraftSubtask}
                className="px-3 py-1.5 bg-[#222222] hover:bg-teal-600 text-white rounded-xl text-xs font-medium transition"
              >
                Add
              </button>
            </div>

            {/* Drafted subtasks list */}
            {newSubtasks.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {newSubtasks.map((st, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#181818] border border-[#242424] text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded border border-neutral-600 text-[10px] flex items-center justify-center text-neutral-400">
                        {idx + 1}
                      </span>
                      <span className="text-white">{st}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDraftSubtask(idx)}
                      className="text-neutral-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#222222]">
            <button
              type="button"
              onClick={() => setIsNewTaskOpen(false)}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white rounded-xl shadow-md transition"
            >
              Create Task
            </button>
          </div>
        </form>
      </Modal>

      {/* Task Details & Subtasks Checklist Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={selectedTask.title}
        >
          <div className="space-y-5">
            {/* Header info bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-[#161616] border border-[#262626]">
              <div className="flex items-center gap-2">
                <PriorityBadge priority={selectedTask.priority} />
                {selectedTask.dueDate && (
                  <span className="text-xs text-neutral-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-teal-400" />
                    {new Date(selectedTask.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-neutral-400 uppercase">Status:</span>
                <select
                  value={selectedTask.status}
                  onChange={(e) => handleQuickStatusChange(selectedTask._id, e.target.value as TaskStatus)}
                  className={`text-xs font-bold uppercase px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${
                    selectedTask.status === 'DONE'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : selectedTask.status === 'IN_PROGRESS'
                      ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                      : selectedTask.status === 'REVIEW'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-[#181818] text-neutral-300 border-[#333333]'
                  }`}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
            </div>

            {/* Project & Assignee */}
            <div className="flex flex-wrap items-center justify-between text-xs text-neutral-400 gap-2">
              <div className="flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-teal-400" />
                <span>Project:</span>
                <strong className="text-white">
                  {selectedTask.project?.name || 'General Task'}
                </strong>
              </div>

              <div className="flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-teal-400" />
                <span>Assignee:</span>
                <strong className="text-white">{selectedTask.assignedTo?.name || 'Myself'}</strong>
              </div>
            </div>

            {/* Description */}
            {selectedTask.description && (
              <p className="text-xs text-neutral-300 leading-relaxed bg-[#161616] p-3.5 rounded-2xl border border-[#242424]">
                {selectedTask.description}
              </p>
            )}

            {/* SUBTASKS CHECKLIST SECTION */}
            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-heading text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-teal-400" />
                  Subtasks Checklist ({(selectedTask.subtasks || []).filter((s) => s.completed).length}/
                  {(selectedTask.subtasks || []).length})
                </h4>
                {(selectedTask.subtasks || []).length > 0 && (
                  <span className="text-xs font-mono font-bold text-teal-400">
                    {Math.round(
                      (((selectedTask.subtasks || []).filter((s) => s.completed).length) /
                        (selectedTask.subtasks || []).length) *
                        100
                    )}
                    %
                  </span>
                )}
              </div>

              {/* Subtasks List */}
              <div className="space-y-1.5">
                {(selectedTask.subtasks || []).map((st, idx) => (
                  <div
                    key={st._id || idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#181818] border border-[#242424] hover:border-[#333333] transition group"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(selectedTask, idx)}
                      className="flex items-center gap-2.5 text-left min-w-0"
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center transition shrink-0 ${
                          st.completed
                            ? 'bg-emerald-500 text-black shadow-sm'
                            : 'border border-neutral-600 hover:border-teal-400'
                        }`}
                      >
                        {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span
                        className={`text-xs transition ${
                          st.completed
                            ? 'line-through text-neutral-500'
                            : 'text-neutral-200 group-hover:text-white'
                        }`}
                      >
                        {st.title}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSubtaskFromSelected(idx)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-rose-400 transition"
                      title="Remove subtask"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {(selectedTask.subtasks || []).length === 0 && (
                  <p className="text-xs text-neutral-500 italic p-3 text-center">
                    No subtasks yet. Break this task down below.
                  </p>
                )}
              </div>

              {/* Add Subtask Input Form */}
              <form onSubmit={handleAddSubtaskToSelectedTask} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="+ Add new subtask (press enter)..."
                  value={detailSubtaskText}
                  onChange={(e) => setDetailSubtaskText(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Comments Thread */}
            <div className="pt-2 border-t border-[#222222] space-y-3">
              <h4 className="font-heading text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                Comments & Work Notes
              </h4>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedTask.comments && selectedTask.comments.length > 0 ? (
                  selectedTask.comments.map((c, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#161616] border border-[#262626] text-xs">
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                        <span className="font-semibold text-neutral-200">{c.author.name}</span>
                        <span>{c.createdAt}</span>
                      </div>
                      <p className="text-neutral-300">{c.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-600 italic">No notes or comments yet.</p>
                )}
              </div>

              {/* Add Comment input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a note..."
                  className="flex-1 px-3 py-1.5 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddComment();
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  className="px-3.5 py-1.5 bg-[#202020] hover:bg-teal-600 text-xs font-semibold text-white rounded-xl transition"
                >
                  Reply
                </button>
              </div>
            </div>

            {/* Action Bar (Delete Task) */}
            <div className="flex justify-between items-center pt-3 border-t border-[#222222]">
              <button
                type="button"
                onClick={() => handleDeleteTask(selectedTask._id)}
                className="px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-1.5 bg-[#181818] hover:bg-[#222222] text-xs text-white rounded-xl font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
