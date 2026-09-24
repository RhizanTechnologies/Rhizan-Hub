'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { PriorityBadge, StatusBadge } from '@/components/Badge';
import { Modal } from '@/components/Modal';
import { Task, TaskPriority, TaskStatus } from '@/types';
import { apiFetch } from '@/lib/api';
import {
  Clock,
  MessageSquare,
  Plus,
  ChevronRight,
  Filter,
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
  const [loading, setLoading] = useState(true);
  const [filterMember, setFilterMember] = useState<string>('ALL');

  // Modals state
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assignedName, setAssignedName] = useState('Abdulaziz');
  const [projectName, setProjectName] = useState('Bakery ERP');
  const [commentText, setCommentText] = useState('');

  const initialTasks: Task[] = [
    {
      _id: '1',
      title: 'Fix ERP login authentication',
      description: 'Resolve session timeout issue and token refresh on mobile web',
      priority: 'HIGH',
      status: 'TODO',
      project: { _id: 'p1', name: 'Bakery ERP', clientName: 'ABC Bakery', status: 'IN_PROGRESS' },
      assignedTo: { name: 'Abdulaziz', email: 'abdulaziz@rhizan.com', role: 'ADMIN', title: 'Development', weeklyCapacityHours: 40, status: 'ACTIVE' },
      dueDate: 'Today',
      comments: [{ author: { name: 'Sadam', email: 'sadam@rhizan.com' }, text: 'Client mentioned it happens when opening camera.', createdAt: '10:00 AM' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '2',
      title: 'Client call with ABC Bakery',
      description: 'Review milestone progress and collect feedback on invoicing',
      priority: 'HIGH',
      status: 'TODO',
      project: { _id: 'p1', name: 'Bakery ERP', clientName: 'ABC Bakery', status: 'IN_PROGRESS' },
      assignedTo: { name: 'Nebiyu', email: 'nebiyu@rhizan.com', role: 'MEMBER', title: 'Business / Client', weeklyCapacityHours: 40, status: 'ACTIVE' },
      dueDate: 'Today',
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '3',
      title: 'API integration for orders',
      description: 'Connect order dispatch to kitchen ticket printer endpoints',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      project: { _id: 'p1', name: 'Bakery ERP', clientName: 'ABC Bakery', status: 'IN_PROGRESS' },
      assignedTo: { name: 'Abdulaziz', email: 'abdulaziz@rhizan.com', role: 'ADMIN', title: 'Development', weeklyCapacityHours: 40, status: 'ACTIVE' },
      dueDate: 'Tomorrow',
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '4',
      title: 'Dashboard KPI metrics layout',
      description: 'Build real-time revenue and sales velocity widgets',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      project: { _id: 'p1', name: 'Bakery ERP', clientName: 'ABC Bakery', status: 'IN_PROGRESS' },
      assignedTo: { name: 'Sadam', email: 'sadam@rhizan.com', role: 'MEMBER', title: 'Operations / Product', weeklyCapacityHours: 40, status: 'ACTIVE' },
      dueDate: 'Oct 3',
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '5',
      title: 'Test payment gateway sandbox',
      description: 'Perform mock checkout transactions and receipt generation',
      priority: 'URGENT',
      status: 'REVIEW',
      project: { _id: 'p1', name: 'Bakery ERP', clientName: 'ABC Bakery', status: 'IN_PROGRESS' },
      assignedTo: { name: 'Abdulaziz', email: 'abdulaziz@rhizan.com', role: 'ADMIN', title: 'Development', weeklyCapacityHours: 40, status: 'ACTIVE' },
      dueDate: 'Tomorrow',
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '6',
      title: 'Landing page copy review',
      description: 'Refine value proposition copy for bakery owners',
      priority: 'LOW',
      status: 'DONE',
      project: { _id: 'p2', name: 'RHIZAN Website', clientName: 'Internal', status: 'IN_PROGRESS' },
      assignedTo: { name: 'Sadam', email: 'sadam@rhizan.com', role: 'MEMBER', title: 'Operations / Product', weeklyCapacityHours: 40, status: 'ACTIVE' },
      dueDate: 'Yesterday',
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '7',
      title: 'Update portfolio case studies',
      description: 'Upload bakery ERP mockups and UI screens',
      priority: 'MEDIUM',
      status: 'DONE',
      project: { _id: 'p2', name: 'RHIZAN Website', clientName: 'Internal', status: 'IN_PROGRESS' },
      assignedTo: { name: 'Sadam', email: 'sadam@rhizan.com', role: 'MEMBER', title: 'Operations / Product', weeklyCapacityHours: 40, status: 'ACTIVE' },
      dueDate: 'Yesterday',
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await apiFetch<Task[]>('/tasks');
        if (data && data.length > 0) {
          setTasks(data);
        } else {
          setTasks(initialTasks);
        }
      } catch {
        setTasks(initialTasks);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  const moveTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await apiFetch(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // Local state already updated
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: Task = {
      _id: `t-${Date.now()}`,
      title,
      description,
      priority,
      status: 'TODO',
      project: { _id: 'p-custom', name: projectName, clientName: 'Rhizan', status: 'IN_PROGRESS' },
      assignedTo: {
        name: assignedName,
        email: `${assignedName.toLowerCase()}@rhizan.com`,
        role: assignedName === 'Abdulaziz' ? 'ADMIN' : 'MEMBER',
        title: assignedName === 'Abdulaziz' ? 'Development' : assignedName === 'Nebiyu' ? 'Business / Client' : 'Operations',
        weeklyCapacityHours: 40,
        status: 'ACTIVE',
      },
      dueDate: 'Upcoming',
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
    setTitle('');
    setDescription('');
    setIsNewTaskOpen(false);

    try {
      await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          priority,
          status: 'TODO',
        }),
      });
    } catch {
      // Handled gracefully
    }
  };

  const handleAddComment = () => {
    if (!selectedTask || !commentText.trim()) return;
    const newComment = {
      author: {
        name: user?.name || 'Abdulaziz',
        email: user?.email || 'abdulaziz@rhizan.com',
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
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterMember === 'ALL') return true;
    return task.assignedTo?.name === filterMember;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Tasks & Kanban Board"
        subtitle="Manage daily tasks, priorities, and workflow progress"
        actionButton={{
          label: 'New Task',
          onClick: () => setIsNewTaskOpen(true),
        }}
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-4">
        {/* Controls & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#121212] border border-[#222222] rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 flex items-center gap-1.5 pl-2 font-medium">
              <Filter className="w-3.5 h-3.5 text-teal-400" /> Filter Assignee:
            </span>
            <div className="flex gap-1">
              {['ALL', 'Abdulaziz', 'Nebiyu', 'Sadam'].map((member) => (
                <button
                  key={member}
                  onClick={() => setFilterMember(member)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    filterMember === member
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-[#181818] text-neutral-400 hover:text-white border border-[#262626]'
                  }`}
                >
                  {member}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-neutral-400 pr-2">
            Showing <span className="text-white font-semibold">{filteredTasks.length}</span> tasks
          </div>
        </div>

        {/* Kanban Board Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-[#121212] border border-[#222222] rounded-2xl p-3.5 flex flex-col min-h-[580px]"
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
                  </div>
                </div>

                {/* Task Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.map((task) => (
                    <div
                      key={task._id}
                      onClick={() => setSelectedTask(task)}
                      className="p-3.5 rounded-xl bg-[#181818] border border-[#262626] hover:border-[#383838] transition cursor-pointer shadow-sm group select-none"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <PriorityBadge priority={task.priority} />
                        {task.dueDate && (
                          <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {task.dueDate}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-semibold text-white leading-snug group-hover:text-teal-300 transition">
                        {task.title}
                      </h4>

                      {task.project && (
                        <div className="text-[11px] text-neutral-400 mt-1 truncate">
                          📁 {task.project.name}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#262626] text-neutral-400 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center text-[10px] font-bold">
                            {task.assignedTo?.name?.charAt(0) || 'U'}
                          </div>
                          <span>{task.assignedTo?.name || 'Unassigned'}</span>
                        </div>

                        {task.comments && task.comments.length > 0 && (
                          <div className="flex items-center gap-1 text-neutral-400">
                            <MessageSquare className="w-3 h-3" />
                            <span>{task.comments.length}</span>
                          </div>
                        )}
                      </div>

                      {/* Move to next stage quick button */}
                      <div className="mt-2.5 pt-2 border-t border-[#222222] flex justify-end">
                        {col.id === 'TODO' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveTaskStatus(task._id, 'IN_PROGRESS');
                            }}
                            className="text-[10px] text-teal-400 hover:text-teal-300 flex items-center gap-0.5 font-medium"
                          >
                            Start Task <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                        {col.id === 'IN_PROGRESS' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveTaskStatus(task._id, 'REVIEW');
                            }}
                            className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5 font-medium"
                          >
                            Submit Review <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                        {col.id === 'REVIEW' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveTaskStatus(task._id, 'DONE');
                            }}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 font-medium"
                          >
                            Mark Done <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="h-32 border border-dashed border-[#262626] rounded-xl flex items-center justify-center text-xs text-neutral-600">
                      No tasks in {col.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Task Modal */}
      <Modal isOpen={isNewTaskOpen} onClose={() => setIsNewTaskOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fix ERP login or Prepare Client Proposal"
              className="w-full px-3 py-2 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details or acceptance criteria..."
              className="w-full px-3 py-2 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Assignee</label>
              <select
                value={assignedName}
                onChange={(e) => setAssignedName(e.target.value)}
                className="w-full px-3 py-2 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="Abdulaziz">Abdulaziz (Development)</option>
                <option value="Nebiyu">Nebiyu (Business / Client)</option>
                <option value="Sadam">Sadam (Operations / Product)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Project</label>
              <select
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="Bakery ERP">Bakery ERP (ABC Bakery)</option>
                <option value="RHIZAN Website">RHIZAN Website</option>
                <option value="Client Acquisition Q4">Client Acquisition Q4</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3 py-2 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#222222]">
            <button
              type="button"
              onClick={() => setIsNewTaskOpen(false)}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-xs font-medium text-white rounded-xl shadow-md transition"
            >
              Create Task
            </button>
          </div>
        </form>
      </Modal>

      {/* Task Details & Comments Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={selectedTask.title}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <PriorityBadge priority={selectedTask.priority} />
              <StatusBadge status={selectedTask.status} />
              <span className="text-xs text-neutral-400 ml-auto">
                Project: {selectedTask.project?.name || 'General'}
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed bg-[#181818] p-3 rounded-xl border border-[#262626]">
              {selectedTask.description || 'No description provided.'}
            </p>

            <div className="text-xs text-neutral-400">
              Assigned to:{' '}
              <span className="text-white font-medium">
                {selectedTask.assignedTo?.name || 'Unassigned'}
              </span>
            </div>

            {/* Comments list */}
            <div className="pt-3 border-t border-[#222222]">
              <h4 className="font-heading text-xs font-bold text-neutral-300 mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-teal-400" /> Comments
              </h4>

              <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                {selectedTask.comments && selectedTask.comments.length > 0 ? (
                  selectedTask.comments.map((c, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#181818] border border-[#262626] text-xs">
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                        <span className="font-semibold text-neutral-200">{c.author.name}</span>
                        <span>{c.createdAt}</span>
                      </div>
                      <p className="text-neutral-300">{c.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-600">No comments yet. Start the conversation!</p>
                )}
              </div>

              {/* Add Comment input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-1.5 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddComment();
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-xs font-medium text-white rounded-xl transition"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
