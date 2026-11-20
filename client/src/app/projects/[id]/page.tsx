'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Modal } from '@/components/Modal';
import { Project, Client, User, ResourceLink, Task, TaskStatus, ProjectMilestone, ProjectDeliverable } from '@/types';
import { apiFetch } from '@/lib/api';
import {
  ArrowLeft,
  Calendar,
  CheckSquare,
  DollarSign,
  Plus,
  ExternalLink,
  Trash2,
  Edit2,
  FolderKanban,
  FileCode,
  Globe,
  Layers,
  FileText,
  Link as LinkIcon,
  Users,
  Building2,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Milestone,
  ListChecks,
  Check,
  Flag,
  Circle,
  RefreshCw,
  MessageSquare,
  Pencil,
} from 'lucide-react';
import { PriorityBadge } from '@/components/Badge';
import Link from 'next/link';
import { useAlert } from '@/context/AlertContext';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showAlert, showConfirm } = useAlert();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Sub-forms
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Add Link Form
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkCategory, setLinkCategory] = useState<'SRS' | 'REQUIREMENTS' | 'GITHUB' | 'FIGMA' | 'LIVE' | 'STAGING' | 'DRIVE' | 'DOCS' | 'OTHER'>('SRS');

  // Add Task to this Project Form (Modal)
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [taskAssignedToId, setTaskAssignedToId] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskEstHours, setTaskEstHours] = useState('2');
  const [taskSubtasks, setTaskSubtasks] = useState<string[]>([]);
  const [taskSubtaskInput, setTaskSubtaskInput] = useState('');
  const [savingTask, setSavingTask] = useState(false);
  const taskDescriptionRef = useRef<HTMLTextAreaElement>(null);

  // Selected Task Detail & Comments Modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailSubtaskText, setDetailSubtaskText] = useState('');
  const [commentText, setCommentText] = useState('');

  // Edit Task State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [editTaskAssignedToId, setEditTaskAssignedToId] = useState('');
  const [editTaskDueDate, setEditTaskDueDate] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [editTaskEstHours, setEditTaskEstHours] = useState('2');
  const [savingEditTask, setSavingEditTask] = useState(false);
  const editTaskDescRef = useRef<HTMLTextAreaElement>(null);

  // Edit Milestone State
  const [editingMilestoneIndex, setEditingMilestoneIndex] = useState<number | null>(null);
  const [editMilestoneTitle, setEditMilestoneTitle] = useState('');
  const [editMilestoneDueDate, setEditMilestoneDueDate] = useState('');
  const [editMilestoneDescription, setEditMilestoneDescription] = useState('');
  const [savingEditMilestone, setSavingEditMilestone] = useState(false);
  const editMilestoneDescRef = useRef<HTMLTextAreaElement>(null);

  // Edit Link State
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);
  const [editLinkTitle, setEditLinkTitle] = useState('');
  const [editLinkUrl, setEditLinkUrl] = useState('');
  const [editLinkCategory, setEditLinkCategory] = useState<'SRS' | 'REQUIREMENTS' | 'GITHUB' | 'FIGMA' | 'LIVE' | 'STAGING' | 'DRIVE' | 'DOCS' | 'OTHER'>('SRS');
  const [savingEditLink, setSavingEditLink] = useState(false);

  // Auto-resize effects
  useEffect(() => {
    if (taskDescriptionRef.current) {
      taskDescriptionRef.current.style.height = 'auto';
      taskDescriptionRef.current.style.height = `${Math.max(68, taskDescriptionRef.current.scrollHeight)}px`;
    }
  }, [taskDescription, isAddingTask]);

  useEffect(() => {
    if (editTaskDescRef.current) {
      editTaskDescRef.current.style.height = 'auto';
      editTaskDescRef.current.style.height = `${Math.max(68, editTaskDescRef.current.scrollHeight)}px`;
    }
  }, [editTaskDescription, editingTask]);

  useEffect(() => {
    if (editMilestoneDescRef.current) {
      editMilestoneDescRef.current.style.height = 'auto';
      editMilestoneDescRef.current.style.height = `${Math.max(68, editMilestoneDescRef.current.scrollHeight)}px`;
    }
  }, [editMilestoneDescription, editingMilestoneIndex]);

  // View Tabs: Roadmap/Milestones vs Kanban Tasks
  const [activeTab, setActiveTab] = useState<'MILESTONES' | 'TASKS'>('MILESTONES');

  // Milestone Form State
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDueDate, setMilestoneDueDate] = useState('');
  const [milestoneDescription, setMilestoneDescription] = useState('');
  const [milestoneDeliverablesInput, setMilestoneDeliverablesInput] = useState('');
  const [savingMilestone, setSavingMilestone] = useState(false);
  const [deliverableInputMap, setDeliverableInputMap] = useState<{ [key: number]: string }>({});

  // Edit Project Form
  const [formName, setFormName] = useState('');
  const [formClientId, setFormClientId] = useState('');
  const [formClientName, setFormClientName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLeadId, setFormLeadId] = useState('');
  const [formTechStack, setFormTechStack] = useState('');
  const [formPriority, setFormPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [formBudget, setFormBudget] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formStatus, setFormStatus] = useState<any>('IN_PROGRESS');
  const [formNotes, setFormNotes] = useState('');
  const [formMemberIds, setFormMemberIds] = useState<string[]>([]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projData, clientData, teamData] = await Promise.all([
        apiFetch<{ project: Project; tasks: Task[] }>(`/projects/${projectId}`),
        apiFetch<Client[]>('/clients'),
        apiFetch<any[]>('/team'),
      ]);

      if (projData) {
        setProject(projData.project);
        setTasks(projData.tasks || []);

        setFormName(projData.project.name);
        setFormClientId(
          typeof projData.project.clientId === 'object'
            ? (projData.project.clientId as any)?._id
            : projData.project.clientId || ''
        );
        setFormClientName(projData.project.clientName || '');
        setFormDescription(projData.project.description || '');
        setFormLeadId(
          typeof projData.project.lead === 'object'
            ? (projData.project.lead as any)?._id
            : projData.project.lead || ''
        );
        setFormTechStack((projData.project.techStack || []).join(', '));
        setFormPriority(projData.project.priority || 'MEDIUM');
        setFormBudget(projData.project.budget?.toString() || '');
        setFormDeadline(
          projData.project.deadline
            ? new Date(projData.project.deadline).toISOString().split('T')[0]
            : ''
        );
        setFormStatus(projData.project.status);
        setFormNotes(projData.project.notes || '');
        setFormMemberIds((projData.project.members || []).map((m: any) => m._id || m.id));
      }

      if (clientData) setClients(clientData);
      if (teamData) {
        setTeamMembers(
          teamData.map((m) => ({
            id: m.id,
            _id: m.id,
            name: m.name,
            email: m.email,
            role: m.role,
            title: m.title,
            weeklyCapacityHours: m.weeklyCapacityHours || 40,
            status: m.status || 'ACTIVE',
          }))
        );
      }
    } catch (err: any) {
      console.error('Error loading project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !formName.trim()) return;

    let selectedClientName = formClientName.trim() || 'Internal';
    if (formClientId) {
      const match = clients.find((c) => c._id === formClientId);
      if (match) selectedClientName = match.name;
    }

    try {
      const updated = await apiFetch<Project>(`/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: formName.trim(),
          clientId: formClientId || undefined,
          clientName: selectedClientName,
          description: formDescription.trim(),
          lead: formLeadId || undefined,
          techStack: formTechStack.split(',').map((s) => s.trim()).filter(Boolean),
          priority: formPriority,
          budget: parseFloat(formBudget) || 0,
          deadline: formDeadline ? new Date(formDeadline).toISOString() : undefined,
          status: formStatus,
          notes: formNotes.trim(),
          members: formMemberIds,
        }),
      });

      setProject(updated);
      setIsEditModalOpen(false);
      await loadProjectData();
    } catch (err: any) {
      showAlert(err.message || 'Failed to update project', { type: 'error' });
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    try {
      await apiFetch(`/projects/${project._id}`, { method: 'DELETE' });
      router.push('/projects');
    } catch (err: any) {
      showAlert(err.message || 'Failed to delete project', { type: 'error' });
    }
  };

  // Add Link (Requirements, SRS, Figma, GitHub)
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !linkTitle.trim() || !linkUrl.trim()) return;

    let formattedUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newLink: ResourceLink = {
      title: linkTitle.trim(),
      url: formattedUrl,
      category: linkCategory,
    };

    const updatedLinks = [...(project.links || []), newLink];

    try {
      const updated = await apiFetch<Project>(`/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({ links: updatedLinks }),
      });
      setProject(updated);
      setIsAddingLink(false);
      setLinkTitle('');
      setLinkUrl('');
    } catch (err: any) {
      showAlert(err.message || 'Failed to add link', { type: 'error' });
    }
  };

  const handleDeleteLink = async (index: number) => {
    if (!project) return;
    const updatedLinks = (project.links || []).filter((_, idx) => idx !== index);

    try {
      const updated = await apiFetch<Project>(`/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({ links: updatedLinks }),
      });
      setProject(updated);
    } catch (err: any) {
      showAlert(err.message || 'Failed to remove link', { type: 'error' });
    }
  };

  // Create Task for this Project
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !taskTitle.trim()) return;

    try {
      setSavingTask(true);
      const newTask = await apiFetch<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          project: project._id,
          priority: taskPriority,
          assignedTo: taskAssignedToId || undefined,
          dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : undefined,
          estimatedHours: parseFloat(taskEstHours) || 2,
          subtasks: taskSubtasks.map((s) => ({ title: s, completed: false })),
          status: 'TODO',
        }),
      });

      setTasks([newTask, ...tasks]);
      setIsAddingTask(false);
      setTaskTitle('');
      setTaskDescription('');
      setTaskAssignedToId('');
      setTaskDueDate('');
      setTaskEstHours('2');
      setTaskSubtasks([]);
      setTaskSubtaskInput('');
      showAlert('Project task created successfully', { type: 'success' });
    } catch (err: any) {
      showAlert(err.message || 'Failed to create task for project', { type: 'error' });
    } finally {
      setSavingTask(false);
    }
  };

  const handleAddDraftTaskSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskSubtaskInput.trim()) return;
    setTaskSubtasks([...taskSubtasks, taskSubtaskInput.trim()]);
    setTaskSubtaskInput('');
  };

  const handleRemoveDraftTaskSubtask = (idx: number) => {
    setTaskSubtasks(taskSubtasks.filter((_, i) => i !== idx));
  };

  // Edit Task Handlers
  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setEditTaskTitle(task.title || '');
    setEditTaskDescription(task.description || '');
    setEditTaskAssignedToId(task.assignedTo?._id || (task.assignedTo as any) || '');
    setEditTaskDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setEditTaskPriority(task.priority || 'MEDIUM');
    setEditTaskEstHours(task.estimatedHours !== undefined ? String(task.estimatedHours) : '2');
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTaskTitle.trim()) return;

    try {
      setSavingEditTask(true);
      const payload: any = {
        title: editTaskTitle.trim(),
        description: editTaskDescription.trim(),
        assignedTo: editTaskAssignedToId || null,
        dueDate: editTaskDueDate ? new Date(editTaskDueDate).toISOString() : null,
        priority: editTaskPriority,
        estimatedHours: parseFloat(editTaskEstHours) || 0,
      };

      const updated = await apiFetch<Task>(`/tasks/${editingTask._id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      if (selectedTask?._id === updated._id) {
        setSelectedTask(updated);
      }
      setEditingTask(null);
      showAlert('Task updated successfully', { type: 'success' });
    } catch (err: any) {
      showAlert(err.message || 'Failed to update task', { type: 'error' });
    } finally {
      setSavingEditTask(false);
    }
  };

  // Subtask management inside Selected Task Detail Modal
  const handleToggleSubtask = async (task: Task, subtaskIdx: number) => {
    const currentSubtasks = [...(task.subtasks || [])];
    if (!currentSubtasks[subtaskIdx]) return;

    currentSubtasks[subtaskIdx].completed = !currentSubtasks[subtaskIdx].completed;

    let newStatus = task.status;
    const allDone = currentSubtasks.length > 0 && currentSubtasks.every((st) => st.completed);
    if (allDone && task.status !== 'DONE') {
      newStatus = 'DONE';
    } else if (!allDone && task.status === 'DONE') {
      newStatus = 'IN_PROGRESS';
    }

    const updatedTask = {
      ...task,
      subtasks: currentSubtasks,
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
          subtasks: currentSubtasks,
          status: newStatus,
        }),
      });
    } catch (err) {
      console.error('Failed to toggle subtask', err);
    }
  };

  const handleAddSubtaskToSelectedTask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedTask || !detailSubtaskText.trim()) return;

    const newSubtaskItem = {
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
      showAlert(err.message || 'Failed to add subtask', { type: 'error' });
    }
  };

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
      showAlert(err.message || 'Failed to remove subtask', { type: 'error' });
    }
  };

  const handleAddComment = async () => {
    if (!selectedTask || !commentText.trim()) return;

    const newComment = {
      text: commentText.trim(),
      author: {
        name: 'Abdulaziz',
        avatar: '',
      } as any,
      createdAt: 'Just now',
    };

    const updatedTask = {
      ...selectedTask,
      comments: [...(selectedTask.comments || []), newComment],
    };

    setSelectedTask(updatedTask);
    setTasks((prev) => prev.map((t) => (t._id === selectedTask._id ? updatedTask : t)));
    setCommentText('');

    try {
      await apiFetch(`/tasks/${selectedTask._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          comments: updatedTask.comments,
        }),
      });
    } catch (err: any) {
      showAlert(err.message || 'Failed to post comment', { type: 'error' });
    }
  };

  const handleDeleteComment = (commentIdx: number) => {
    if (!selectedTask) return;
    showConfirm(
      'Are you sure you want to delete this note?',
      async () => {
        const updatedComments = (selectedTask.comments || []).filter((_, idx) => idx !== commentIdx);
        const updatedTask = { ...selectedTask, comments: updatedComments };
        setSelectedTask(updatedTask);
        setTasks((prev) => prev.map((t) => (t._id === selectedTask._id ? updatedTask : t)));

        try {
          await apiFetch(`/tasks/${selectedTask._id}`, {
            method: 'PUT',
            body: JSON.stringify({ comments: updatedComments }),
          });
          showAlert('Note deleted', { type: 'success' });
        } catch (err: any) {
          showAlert(err.message || 'Failed to delete note', { type: 'error' });
        }
      },
      {
        title: 'Delete Note',
        confirmText: 'Delete',
        isDestructive: true,
      }
    );
  };

  const [editingCommentIdx, setEditingCommentIdx] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  const handleStartEditComment = (idx: number, currentText: string) => {
    setEditingCommentIdx(idx);
    setEditCommentText(currentText);
  };

  const handleSaveEditComment = async (commentIdx: number) => {
    if (!selectedTask || !editCommentText.trim()) return;
    const updatedComments = [...(selectedTask.comments || [])];
    updatedComments[commentIdx] = {
      ...updatedComments[commentIdx],
      text: editCommentText.trim(),
    };
    const updatedTask = { ...selectedTask, comments: updatedComments };
    setSelectedTask(updatedTask);
    setTasks((prev) => prev.map((t) => (t._id === selectedTask._id ? updatedTask : t)));
    setEditingCommentIdx(null);

    try {
      await apiFetch(`/tasks/${selectedTask._id}`, {
        method: 'PUT',
        body: JSON.stringify({ comments: updatedComments }),
      });
      showAlert('Note updated', { type: 'success' });
    } catch (err: any) {
      showAlert(err.message || 'Failed to update note', { type: 'error' });
    }
  };

  // INLINE EDIT DELIVERABLE
  const [editingDeliverable, setEditingDeliverable] = useState<{ mIdx: number; dIdx: number; text: string } | null>(null);

  const handleSaveDeliverableTitle = async (mIdx: number, dIdx: number) => {
    if (!project || !project.milestones || !editingDeliverable || !editingDeliverable.text.trim()) {
      setEditingDeliverable(null);
      return;
    }
    const currentMilestones = [...project.milestones];
    const targetM = { ...currentMilestones[mIdx] };
    const currentDeliverables = [...(targetM.deliverables || [])];
    currentDeliverables[dIdx] = {
      ...currentDeliverables[dIdx],
      title: editingDeliverable.text.trim(),
    };
    targetM.deliverables = currentDeliverables;
    currentMilestones[mIdx] = targetM;
    setEditingDeliverable(null);

    try {
      const updated = await apiFetch<Project>(`/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({ milestones: currentMilestones }),
      });
      setProject(updated);
      showAlert('Deliverable updated', { type: 'success' });
    } catch (err: any) {
      showAlert(err.message || 'Failed to update deliverable', { type: 'error' });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    showConfirm(
      'Are you sure you want to delete this task? This action cannot be undone.',
      async () => {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        if (selectedTask?._id === taskId) {
          setSelectedTask(null);
        }
        try {
          await apiFetch(`/tasks/${taskId}`, { method: 'DELETE' });
          showAlert('Task deleted successfully', { type: 'success' });
        } catch (err: any) {
          showAlert(err.message || 'Failed to delete task', { type: 'error' });
        }
      },
      {
        title: 'Delete Task',
        confirmText: 'Delete',
        isDestructive: true,
      }
    );
  };

  // Milestone Edit Handlers
  const openEditMilestone = (mIdx: number) => {
    if (!project || !project.milestones || !project.milestones[mIdx]) return;
    const m = project.milestones[mIdx];
    setEditingMilestoneIndex(mIdx);
    setEditMilestoneTitle(m.title || '');
    setEditMilestoneDueDate(m.dueDate ? new Date(m.dueDate).toISOString().split('T')[0] : '');
    setEditMilestoneDescription(m.description || '');
  };

  const handleUpdateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !project.milestones || editingMilestoneIndex === null || !editMilestoneTitle.trim()) return;

    try {
      setSavingEditMilestone(true);
      const updatedMilestones = [...project.milestones];
      updatedMilestones[editingMilestoneIndex] = {
        ...updatedMilestones[editingMilestoneIndex],
        title: editMilestoneTitle.trim(),
        dueDate: editMilestoneDueDate ? new Date(editMilestoneDueDate).toISOString() : undefined,
        description: editMilestoneDescription.trim() || undefined,
      };

      const updated = await apiFetch<Project>(`/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({ milestones: updatedMilestones }),
      });

      setProject(updated);
      setEditingMilestoneIndex(null);
      showAlert('Milestone updated successfully', { type: 'success' });
    } catch (err: any) {
      showAlert(err.message || 'Failed to update milestone', { type: 'error' });
    } finally {
      setSavingEditMilestone(false);
    }
  };

  // Link Edit Handlers
  const openEditLink = (index: number) => {
    if (!project || !project.links || !project.links[index]) return;
    const l = project.links[index];
    setEditingLinkIndex(index);
    setEditLinkTitle(l.title || '');
    setEditLinkUrl(l.url || '');
    setEditLinkCategory((l.category as any) || 'OTHER');
  };

  const handleUpdateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !project.links || editingLinkIndex === null || !editLinkTitle.trim() || !editLinkUrl.trim()) return;

    try {
      setSavingEditLink(true);
      let formattedUrl = editLinkUrl.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
      }

      const updatedLinks = [...project.links];
      updatedLinks[editingLinkIndex] = {
        title: editLinkTitle.trim(),
        url: formattedUrl,
        category: editLinkCategory,
      };

      const updated = await apiFetch<Project>(`/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({ links: updatedLinks }),
      });

      setProject(updated);
      setEditingLinkIndex(null);
      showAlert('Resource link updated successfully', { type: 'success' });
    } catch (err: any) {
      showAlert(err.message || 'Failed to update link', { type: 'error' });
    } finally {
      setSavingEditLink(false);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const updatedTasks = tasks.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t));
    setTasks(updatedTasks);

    // Auto-calculate combined progress
    const mDeliverables = project?.milestones || [];
    const totalUnits = updatedTasks.length + mDeliverables.reduce((s, m) => s + (m.deliverables?.length || 0), 0);
    const doneUnits =
      updatedTasks.filter((t) => t.status === 'DONE').length +
      mDeliverables.reduce((s, m) => s + (m.deliverables?.filter((d) => d.completed).length || 0), 0);
    const newProg = totalUnits > 0 ? Math.round((doneUnits / totalUnits) * 100) : project?.progress || 0;

    if (project && project.progress !== newProg) {
      setProject({ ...project, progress: newProg });
      apiFetch(`/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({ progress: newProg }),
      }).catch((e) => console.error('Failed to sync project progress', e));
    }

    try {
      await apiFetch(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

  // Milestone Actions
  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !milestoneTitle.trim()) return;

    try {
      setSavingMilestone(true);
      const parsedDeliverables: ProjectDeliverable[] = milestoneDeliverablesInput
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((title) => ({ title, completed: false }));

      const newMilestone: ProjectMilestone = {
        title: milestoneTitle.trim(),
        description: milestoneDescription.trim() || undefined,
        dueDate: milestoneDueDate ? new Date(milestoneDueDate).toISOString() : undefined,
        status: 'IN_PROGRESS',
        deliverables: parsedDeliverables,
      };

      const updatedMilestones = [...(project.milestones || []), newMilestone];

      const updated = await apiFetch<Project>(`/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({ milestones: updatedMilestones }),
      });

      setProject(updated);
      setIsAddingMilestone(false);
      setMilestoneTitle('');
      setMilestoneDueDate('');
      setMilestoneDescription('');
      setMilestoneDeliverablesInput('');
    } catch (err: any) {
      showAlert(err.message || 'Failed to add milestone', { type: 'error' });
    } finally {
      setSavingMilestone(false);
    }
  };

  const handleToggleDeliverable = async (mIdx: number, dIdx: number) => {
    if (!project || !project.milestones) return;
    const currentMilestones = [...project.milestones];
    const targetM = { ...currentMilestones[mIdx] };
    const currentDeliverables = [...(targetM.deliverables || [])];
    const targetD = { ...currentDeliverables[dIdx] };

    targetD.completed = !targetD.completed;
    currentDeliverables[dIdx] = targetD;
    targetM.deliverables = currentDeliverables;

    // Check if all deliverables completed to optionally advance status
    const allDone = currentDeliverables.length > 0 && currentDeliverables.every((d) => d.completed);
    if (allDone && targetM.status !== 'COMPLETED') {
      targetM.status = 'COMPLETED';
      targetM.completedAt = new Date().toISOString();
    } else if (!allDone && targetM.status === 'COMPLETED') {
      targetM.status = 'IN_PROGRESS';
      targetM.completedAt = undefined;
    }

    currentMilestones[mIdx] = targetM;

    // Auto-calculate combined progress with updated deliverables
    const totalUnits = tasks.length + currentMilestones.reduce((s, m) => s + (m.deliverables?.length || 0), 0);
    const doneUnits =
      tasks.filter((t) => t.status === 'DONE').length +
      currentMilestones.reduce((s, m) => s + (m.deliverables?.filter((d) => d.completed).length || 0), 0);
    const newProg = totalUnits > 0 ? Math.round((doneUnits / totalUnits) * 100) : project.progress || 0;

    try {
      const updated = await apiFetch<Project>(`/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({ milestones: currentMilestones, progress: newProg }),
      });
      setProject(updated);
    } catch (err: any) {
      showAlert(err.message || 'Failed to update deliverable', { type: 'error' });
    }
  };

  const syncCalculatedProgress = async () => {
    if (!project) return;
    const totalUnits = tasks.length + totalDeliverables;
    const doneUnits = completedCount + completedDeliverables;
    const calculated = totalUnits > 0 ? Math.round((doneUnits / totalUnits) * 100) : 0;

    setProject({ ...project, progress: calculated });
    try {
      await apiFetch(`/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({ progress: calculated }),
      });
      showAlert(`Project progress auto-synchronized to ${calculated}%!`, { type: 'success' });
    } catch (err: any) {
      showAlert(err.message || 'Failed to sync progress', { type: 'error' });
    }
  };

  const handleAddDeliverableItem = async (mIdx: number) => {
    const text = deliverableInputMap[mIdx]?.trim();
    if (!project || !project.milestones || !text) return;

    const currentMilestones = [...project.milestones];
    const targetM = { ...currentMilestones[mIdx] };
    const currentDeliverables = [...(targetM.deliverables || [])];

    currentDeliverables.push({ title: text, completed: false });
    targetM.deliverables = currentDeliverables;
    currentMilestones[mIdx] = targetM;

    try {
      const updated = await apiFetch<Project>(`/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({ milestones: currentMilestones }),
      });
      setProject(updated);
      setDeliverableInputMap((prev) => ({ ...prev, [mIdx]: '' }));
    } catch (err: any) {
      showAlert(err.message || 'Failed to add deliverable item', { type: 'error' });
    }
  };

  const handleDeleteDeliverableItem = async (mIdx: number, dIdx: number) => {
    if (!project || !project.milestones) return;
    const currentMilestones = [...project.milestones];
    const targetM = { ...currentMilestones[mIdx] };
    targetM.deliverables = (targetM.deliverables || []).filter((_, idx) => idx !== dIdx);
    currentMilestones[mIdx] = targetM;

    try {
      const updated = await apiFetch<Project>(`/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({ milestones: currentMilestones }),
      });
      setProject(updated);
    } catch (err: any) {
      showAlert(err.message || 'Failed to delete deliverable item', { type: 'error' });
    }
  };

  const handleUpdateMilestoneStatus = async (mIdx: number, newStatus: any) => {
    if (!project || !project.milestones) return;
    const currentMilestones = [...project.milestones];
    const targetM = { ...currentMilestones[mIdx], status: newStatus };
    if (newStatus === 'COMPLETED') {
      targetM.completedAt = new Date().toISOString();
    } else {
      targetM.completedAt = undefined;
    }
    currentMilestones[mIdx] = targetM;

    try {
      const updated = await apiFetch<Project>(`/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({ milestones: currentMilestones }),
      });
      setProject(updated);
    } catch (err: any) {
      showAlert(err.message || 'Failed to update milestone status', { type: 'error' });
    }
  };

  const handleDeleteMilestone = (mIdx: number) => {
    if (!project) return;
    showConfirm(
      'Are you sure you want to remove this milestone and its deliverables?',
      async () => {
        const currentMilestones = (project.milestones || []).filter((_, idx) => idx !== mIdx);

        try {
          const updated = await apiFetch<Project>(`/projects/${project._id}`, {
            method: 'PUT',
            body: JSON.stringify({ milestones: currentMilestones }),
          });
          setProject(updated);
        } catch (err: any) {
          showAlert(err.message || 'Failed to delete milestone', { type: 'error' });
        }
      },
      {
        title: 'Delete Milestone',
        confirmText: 'Remove',
        isDestructive: true,
      }
    );
  };

  const handleLoadStandardPhases = async () => {
    if (!project) return;
    const template: ProjectMilestone[] = [
      {
        title: 'Phase 1: Architecture, SRS & Figma UI/UX',
        description: 'Discovery, system design, high-fidelity prototypes, and technical specification sign-off.',
        status: 'IN_PROGRESS',
        deliverables: [
          { title: 'SRS (Software Requirements Specification) doc approved', completed: false },
          { title: 'Figma UI/UX prototype & design system completed', completed: false },
          { title: 'Database schema & API contracts defined', completed: false },
        ],
      },
      {
        title: 'Phase 2: Core MVP Development & APIs',
        description: 'Frontend components, backend business logic, and core features implementation.',
        status: 'PENDING',
        deliverables: [
          { title: 'Authentication & Role-Based Access Control', completed: false },
          { title: 'Primary business modules & API endpoints', completed: false },
          { title: 'Responsive web application interface', completed: false },
        ],
      },
      {
        title: 'Phase 3: QA Testing, UAT & Production Launch',
        description: 'End-to-end testing, bug fixing, client acceptance testing, and deployment to live servers.',
        status: 'PENDING',
        deliverables: [
          { title: 'Staging environment deployed & tested', completed: false },
          { title: 'Client UAT walkthrough & feedback resolved', completed: false },
          { title: 'Domain configuration & Production release', completed: false },
        ],
      },
    ];

    try {
      const updated = await apiFetch<Project>(`/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({ milestones: [...(project.milestones || []), ...template] }),
      });
      setProject(updated);
    } catch (err: any) {
      showAlert(err.message || 'Failed to load phase templates', { type: 'error' });
    }
  };

  const getLinkIcon = (category?: string) => {
    switch (category) {
      case 'SRS':
      case 'REQUIREMENTS':
      case 'DOCS':
        return <FileText className="w-4 h-4 text-teal-400" />;
      case 'GITHUB':
        return <FileCode className="w-4 h-4 text-neutral-300" />;
      case 'FIGMA':
        return <Layers className="w-4 h-4 text-purple-400" />;
      case 'LIVE':
        return <Globe className="w-4 h-4 text-emerald-400" />;
      case 'STAGING':
        return <Globe className="w-4 h-4 text-amber-400" />;
      default:
        return <LinkIcon className="w-4 h-4 text-teal-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-neutral-400 text-xs">
        <span className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mr-2" />
        Loading project workspace...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 p-8 text-center space-y-4">
        <FolderKanban className="w-12 h-12 text-neutral-600 mx-auto" />
        <h2 className="text-lg font-bold text-white">Project Not Found</h2>
        <p className="text-xs text-neutral-400">The requested project does not exist or was deleted.</p>
        <Link href="/projects" className="inline-block px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold">
          Return to Projects
        </Link>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.status === 'DONE').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : project.progress || 0;
  const assignedDevs = project.members || [];
  const links = project.links || [];

  const milestones = project.milestones || [];
  const completedMilestones = milestones.filter((m) => m.status === 'COMPLETED').length;
  const totalDeliverables = milestones.reduce((sum, m) => sum + (m.deliverables?.length || 0), 0);
  const completedDeliverables = milestones.reduce(
    (sum, m) => sum + (m.deliverables?.filter((d) => d.completed).length || 0),
    0
  );
  const milestoneProgress = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

  // Quick link finders for developer toolbar
  const githubLink = links.find((l) => l.category === 'GITHUB');
  const figmaLink = links.find((l) => l.category === 'FIGMA');
  const liveLink = links.find((l) => l.category === 'LIVE');
  const stagingLink = links.find((l) => l.category === 'STAGING');
  const srsLink = links.find((l) => l.category === 'SRS' || l.category === 'REQUIREMENTS' || l.category === 'DOCS');

  const openQuickAddLink = (category: any, defaultTitle: string) => {
    setLinkCategory(category);
    setLinkTitle(defaultTitle);
    setLinkUrl('');
    setIsAddingLink(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title={project.name}
        subtitle="Dedicated Project Workspace & Delivery Management"
        actionButton={{
          label: 'Edit Project',
          onClick: () => setIsEditModalOpen(true),
        }}
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-5 sm:space-y-6">
        {/* Back Link Breadcrumb */}
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 text-teal-400" />
            <span>Back to All Projects</span>
          </Link>
        </div>

        {/* Project Header Banner */}
        <div className="p-4 sm:p-6 rounded-3xl bg-[#111111] border border-[#222222] shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                  {project.name}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/30">
                  {project.status.replace('_', ' ')}
                </span>
                {project.priority && (
                  <PriorityBadge priority={project.priority} />
                )}
              </div>

              {/* Project Lead Card */}
              {project.lead && (
                <div className="flex items-center gap-2.5 mt-2 px-3 py-1.5 rounded-2xl bg-[#161616] border border-amber-500/25 w-fit">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-teal-500 text-black font-extrabold text-[10px] flex items-center justify-center shadow-sm">
                    {project.lead.name?.charAt(0) || 'L'}
                  </div>
                  <div className="text-xs">
                    <span className="text-[9px] uppercase font-bold text-amber-400 mr-1.5">Project Lead:</span>
                    <strong className="text-white">{project.lead.name}</strong>
                    <span className="text-neutral-400 text-[11px] ml-1">({project.lead.title || 'Developer'})</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 mt-2">
                <div className="flex items-center gap-1 text-neutral-300">
                  <Building2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Client:</span>
                  {typeof project.clientId === 'object' && (project.clientId as any)?._id ? (
                    <Link
                      href={`/clients/${(project.clientId as any)._id}`}
                      className="text-teal-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      {(project.clientId as any).name}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  ) : (
                    <strong className="text-white">{project.clientName || 'Internal'}</strong>
                  )}
                </div>

                {project.deadline && (
                  <span>• Target Deadline: <strong className="text-white">{new Date(project.deadline).toLocaleDateString()}</strong></span>
                )}
                {project.budget && (
                  <span>• Budget: <strong className="text-emerald-400">${project.budget.toLocaleString()}</strong></span>
                )}
              </div>

              {/* Tech Stack Pills */}
              {project.techStack && project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.techStack.map((tech, idx) => (
                    <span key={idx} className="text-[11px] px-2.5 py-0.5 rounded-lg bg-[#181818] text-teal-300 border border-[#2a2a2a] font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="px-3.5 py-2 rounded-xl border border-[#262626] bg-[#181818] hover:bg-[#222222] text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Project</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-3.5 py-2 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <p className="text-xs text-neutral-300 leading-relaxed border-t border-[#1e1e1e] pt-4">
              {project.description}
            </p>
          )}

          {/* Overall Delivery Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 font-medium">
                  Delivery Progress ({completedCount}/{tasks.length} tasks, {completedDeliverables}/{totalDeliverables} deliverables)
                </span>
                <button
                  type="button"
                  onClick={syncCalculatedProgress}
                  title="Auto-calculate and sync progress to database"
                  className="px-2 py-0.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-[10px] font-semibold flex items-center gap-1 transition"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Auto-Sync</span>
                </button>
              </div>
              <span className="font-mono text-teal-400 font-bold">{project.progress ?? progressPercent}%</span>
            </div>
            <div className="w-full bg-[#1c1c1c] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${project.progress ?? progressPercent}%` }}
              />
            </div>
          </div>

          {/* Developer Quick-Launch Command Bar */}
          <div className="pt-4 border-t border-[#1e1e1e] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                Dev Quick Launch:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* GitHub */}
              {githubLink ? (
                <a
                  href={githubLink.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#2d2d2d] hover:border-teal-500/50 text-white text-xs font-medium flex items-center gap-2 transition group shadow-sm"
                >
                  <FileCode className="w-3.5 h-3.5 text-neutral-300 group-hover:text-teal-400 transition" />
                  <span>GitHub Repo</span>
                  <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-teal-400" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => openQuickAddLink('GITHUB', 'GitHub Repository')}
                  className="px-3 py-1.5 rounded-xl bg-[#141414] hover:bg-[#1a1a1a] border border-dashed border-[#282828] hover:border-neutral-500 text-neutral-400 hover:text-white text-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>Connect GitHub</span>
                </button>
              )}

              {/* Figma */}
              {figmaLink ? (
                <a
                  href={figmaLink.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#2d2d2d] hover:border-purple-500/50 text-white text-xs font-medium flex items-center gap-2 transition group shadow-sm"
                >
                  <Layers className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition" />
                  <span>Figma Design</span>
                  <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-purple-400" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => openQuickAddLink('FIGMA', 'Figma Design System')}
                  className="px-3 py-1.5 rounded-xl bg-[#141414] hover:bg-[#1a1a1a] border border-dashed border-[#282828] hover:border-purple-500/40 text-neutral-400 hover:text-white text-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>Connect Figma</span>
                </button>
              )}

              {/* Staging */}
              {stagingLink ? (
                <a
                  href={stagingLink.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#2d2d2d] hover:border-amber-500/50 text-white text-xs font-medium flex items-center gap-2 transition group shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Staging App</span>
                  <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-amber-400" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => openQuickAddLink('STAGING', 'Staging / Test Environment')}
                  className="px-3 py-1.5 rounded-xl bg-[#141414] hover:bg-[#1a1a1a] border border-dashed border-[#282828] hover:border-amber-500/40 text-neutral-400 hover:text-white text-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>Set Staging</span>
                </button>
              )}

              {/* Live Production */}
              {liveLink ? (
                <a
                  href={liveLink.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#2d2d2d] hover:border-emerald-500/50 text-white text-xs font-medium flex items-center gap-2 transition group shadow-sm"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition" />
                  <span>Live App</span>
                  <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-emerald-400" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => openQuickAddLink('LIVE', 'Live Production Application')}
                  className="px-3 py-1.5 rounded-xl bg-[#141414] hover:bg-[#1a1a1a] border border-dashed border-[#282828] hover:border-emerald-500/40 text-neutral-400 hover:text-white text-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>Set Live URL</span>
                </button>
              )}

              {/* SRS / Scope Doc */}
              {srsLink ? (
                <a
                  href={srsLink.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#2d2d2d] hover:border-teal-500/50 text-white text-xs font-medium flex items-center gap-2 transition group shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-400 group-hover:scale-110 transition" />
                  <span>SRS / Scope</span>
                  <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-teal-400" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => openQuickAddLink('SRS', 'Software Requirements Specification (SRS)')}
                  className="px-3 py-1.5 rounded-xl bg-[#141414] hover:bg-[#1a1a1a] border border-dashed border-[#282828] hover:border-teal-500/40 text-neutral-400 hover:text-white text-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>Attach SRS</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[#222222] pb-3 overflow-x-auto max-w-full no-scrollbar whitespace-nowrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('MILESTONES')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === 'MILESTONES'
                  ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-[#181818] border border-transparent'
              }`}
            >
              <Milestone className="w-4 h-4 text-teal-400" />
              <span>Milestones & Deliverables Roadmap</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'MILESTONES' ? 'bg-teal-500/20 text-teal-200' : 'bg-[#222222] text-neutral-400'
              }`}>
                {milestones.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('TASKS')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === 'TASKS'
                  ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-[#181818] border border-transparent'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-teal-400" />
              <span>Developer Tasks</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'TASKS' ? 'bg-teal-500/20 text-teal-200' : 'bg-[#222222] text-neutral-400'
              }`}>
                {tasks.length}
              </span>
            </button>
          </div>
        </div>

        {/* Two-Column Layout: Left (Links & Team) - Right (Roadmap/Tasks) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Resource Links & Assigned Developers */}
          <div className="space-y-6">
            {/* Resource & Requirement Links (SRS, Figma, GitHub, Live) */}
            <div className="p-5 rounded-2xl bg-[#121212] border border-[#222222] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-sm font-bold text-white flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4 text-teal-400" />
                    Resource & Requirement Links
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    SRS document, Figma mockups, GitHub, and staging links.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingLink(!isAddingLink)}
                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium flex items-center gap-1 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Link</span>
                </button>
              </div>

              {/* Add Link Form */}
              {isAddingLink && (
                <form onSubmit={handleAddLink} className="p-3.5 rounded-xl bg-[#161616] border border-teal-500/30 space-y-2.5">
                  <span className="text-xs font-bold text-teal-300">Attach New Resource</span>
                  <input
                    type="text"
                    placeholder="Link Title (e.g. Software Requirements Specification - SRS)"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    required
                    className="w-full bg-[#101010] border border-[#282828] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                  />
                  <input
                    type="text"
                    placeholder="URL (e.g. https://docs.google.com/... or GitHub / Figma)"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    required
                    className="w-full bg-[#101010] border border-[#282828] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                  />
                  <select
                    value={linkCategory}
                    onChange={(e) => setLinkCategory(e.target.value as any)}
                    className="w-full bg-[#101010] border border-[#282828] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                  >
                    <option value="SRS">Software Requirements Specification (SRS)</option>
                    <option value="REQUIREMENTS">Requirements & Scope</option>
                    <option value="FIGMA">Figma Design System</option>
                    <option value="GITHUB">GitHub Source Code</option>
                    <option value="LIVE">Live Production URL</option>
                    <option value="STAGING">Staging / Test Server</option>
                    <option value="DRIVE">Google Drive Folder</option>
                    <option value="OTHER">Other Link</option>
                  </select>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingLink(false)}
                      className="px-3 py-1 rounded-lg text-xs text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1 rounded-lg bg-teal-600 text-white text-xs font-medium"
                    >
                      Save Link
                    </button>
                  </div>
                </form>
              )}

              {/* Links List */}
              <div className="space-y-2">
                {links.length > 0 ? (
                  links.map((l, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#161616] border border-[#262626] flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="p-2 rounded-lg bg-[#202020] shrink-0">
                          {getLinkIcon(l.category)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-white truncate">{l.title}</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 font-semibold shrink-0">
                              {l.category || 'LINK'}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-500 truncate block mt-0.5">
                            {l.url}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-[#202020] hover:bg-[#282828] text-teal-400 transition"
                          title="Open link in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openEditLink(idx)}
                          className="p-1.5 rounded-lg hover:bg-teal-500/10 text-neutral-500 hover:text-teal-300 transition cursor-pointer"
                          title="Edit link"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLink(idx)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-neutral-500 hover:text-rose-400 transition cursor-pointer"
                          title="Delete link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-500 italic p-4 text-center bg-[#161616] rounded-xl border border-dashed border-[#262626]">
                    No links added yet. Add SRS documents, GitHub, or Figma links above.
                  </p>
                )}
              </div>
            </div>

            {/* Assigned Developers / Team Members */}
            <div className="p-5 rounded-2xl bg-[#121212] border border-[#222222] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-sm font-bold text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-teal-400" />
                    Assigned Developers ({assignedDevs.length})
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Team members responsible for this project.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs text-teal-400 hover:underline"
                >
                  Manage
                </button>
              </div>

              <div className="space-y-2">
                {assignedDevs.map((dev: any, idx) => {
                  const isLead = (project.lead?._id || project.lead?.id) === (dev._id || dev.id);
                  return (
                    <div
                      key={dev._id || idx}
                      className={`p-3.5 rounded-2xl border flex items-start gap-3 transition ${
                        isLead
                          ? 'bg-[#181818] border-amber-500/30 shadow-sm'
                          : 'bg-[#161616] border-[#262626]'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isLead
                          ? 'bg-gradient-to-tr from-amber-500 to-amber-300 text-black font-extrabold shadow-sm'
                          : 'bg-gradient-to-tr from-teal-500 to-emerald-600 text-white'
                      }`}>
                        {dev.name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white truncate">{dev.name}</span>
                          {isLead && (
                            <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap shrink-0">
                              Project Lead
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-teal-400 font-medium truncate">
                          {dev.title || 'Developer'}
                        </div>
                        {dev.email && (
                          <div className="text-[11px] text-neutral-400 font-mono truncate pt-0.5" title={dev.email}>
                            {dev.email}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {assignedDevs.length === 0 && (
                  <p className="text-xs text-neutral-500 italic p-3 text-center">No developers assigned yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Milestones & Deliverables Roadmap OR Tasks */}
          <div className="lg:col-span-2 space-y-4">
            {activeTab === 'MILESTONES' ? (
              <div className="p-5 sm:p-6 rounded-3xl bg-[#0f172a] border border-[#1e293b] space-y-6 shadow-xl">
                {/* Header & Stats */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                      <Milestone className="w-4 h-4 text-teal-400" />
                      Milestones & Deliverables Roadmap ({milestones.length})
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Track delivery phases, client deliverables, and launch sign-offs.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {milestones.length === 0 && (
                      <button
                        type="button"
                        onClick={handleLoadStandardPhases}
                        className="px-3 py-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Use 3-Phase Template</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsAddingMilestone(!isAddingMilestone)}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Milestone</span>
                    </button>
                  </div>
                </div>

                {/* Milestone Summary Metric Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-[#131d2e] border border-[#1e293b] shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Phases</span>
                    <span className="text-xl font-extrabold text-white mt-0.5 block">{milestones.length}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#131d2e] border border-[#1e293b] shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">Completed Phases</span>
                    <span className="text-xl font-extrabold text-emerald-400 mt-0.5 block">{completedMilestones}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#131d2e] border border-[#1e293b] shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider block">Deliverables Checked</span>
                    <span className="text-xl font-extrabold text-teal-400 mt-0.5 block">{completedDeliverables} / {totalDeliverables}</span>
                  </div>
                </div>

                {/* Overall Phase Progress Bar */}
                {milestones.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Roadmap Progress</span>
                      <span className="font-mono text-teal-400 font-bold">{milestoneProgress}%</span>
                    </div>
                    <div className="w-full bg-[#0b1320] h-2.5 rounded-full overflow-hidden border border-[#1e293b]">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${milestoneProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Add Milestone Form */}
                {isAddingMilestone && (
                  <form onSubmit={handleAddMilestone} className="p-5 sm:p-6 rounded-2xl bg-[#131d2e] border border-teal-500/40 shadow-xl space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                        <Flag className="w-4 h-4 text-teal-400" />
                        Create New Milestone / Phase
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsAddingMilestone(false)}
                        className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] text-slate-300 font-medium mb-1">Phase Title *</label>
                        <input
                          type="text"
                          placeholder="e.g. Phase 1: Architecture, UI/UX Design & SRS"
                          value={milestoneTitle}
                          onChange={(e) => setMilestoneTitle(e.target.value)}
                          required
                          className="w-full bg-[#0b1320] border border-[#223147] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-300 font-medium mb-1">Target Deadline</label>
                        <input
                          type="date"
                          value={milestoneDueDate}
                          onChange={(e) => setMilestoneDueDate(e.target.value)}
                          className="w-full bg-[#0b1320] border border-[#223147] rounded-xl px-3 py-2 text-xs sm:text-sm text-white outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-300 font-medium mb-1">Phase Description (Optional)</label>
                      <textarea
                        rows={2}
                        placeholder="Brief summary of goals and scope for this phase"
                        value={milestoneDescription}
                        onChange={(e) => {
                          setMilestoneDescription(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = `${Math.max(68, e.target.scrollHeight)}px`;
                        }}
                        className="w-full bg-[#0b1320] border border-[#223147] rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition resize-none leading-relaxed overflow-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-300 font-medium mb-1 flex items-center justify-between">
                        <span>Deliverables Checklist (One deliverable per line)</span>
                        {milestoneDeliverablesInput.trim() && (
                          <span className="text-[10px] text-teal-400 font-mono">
                            {milestoneDeliverablesInput.split('\n').filter((l) => l.trim()).length} deliverables
                          </span>
                        )}
                      </label>
                      <textarea
                        rows={Math.max(4, milestoneDeliverablesInput.split('\n').length)}
                        placeholder={'SRS Requirements Specification document signed off\nFigma interactive wireframes and prototype\nDatabase schema ERD and API contracts'}
                        value={milestoneDeliverablesInput}
                        onChange={(e) => {
                          setMilestoneDeliverablesInput(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = `${Math.max(100, e.target.scrollHeight)}px`;
                        }}
                        className="w-full bg-[#0b1320] border border-[#223147] rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition resize-none font-mono leading-relaxed overflow-hidden"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingMilestone(false)}
                        className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingMilestone}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-teal-900/30"
                      >
                        {savingMilestone ? 'Saving...' : 'Create Milestone'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Milestones List */}
                <div className="space-y-4">
                  {milestones.length > 0 ? (
                    milestones.map((m, mIdx) => {
                      const deliverables = m.deliverables || [];
                      const doneCount = deliverables.filter((d) => d.completed).length;
                      const phaseProgress = deliverables.length > 0 ? Math.round((doneCount / deliverables.length) * 100) : m.status === 'COMPLETED' ? 100 : 0;

                      return (
                        <div
                          key={m._id || mIdx}
                          className={`p-5 rounded-2xl border transition-all shadow-md ${
                            m.status === 'COMPLETED'
                              ? 'bg-[#0f1d24] border-emerald-500/40 shadow-emerald-950/20'
                              : m.status === 'IN_PROGRESS'
                              ? 'bg-[#0f1b2c] border-teal-500/40 shadow-teal-950/20 ring-1 ring-teal-500/20'
                              : 'bg-[#0f172a] border-[#1e293b] hover:border-slate-700'
                          }`}
                        >
                          {/* Milestone Header: Title on Left, Date/Status/Delete on Right (Above) */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e293b]">
                            <div className="flex items-center gap-3">
                              <span className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 ${
                                m.status === 'COMPLETED'
                                  ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30'
                                  : 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/30'
                              }`}>
                                {mIdx + 1}
                              </span>
                              <h4 className="text-sm sm:text-base font-bold text-white tracking-wide">
                                {m.title}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                              {m.dueDate && (
                                <span className="text-xs text-slate-300 bg-[#0b1320] border border-[#223147] px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xs">
                                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                                  {new Date(m.dueDate).toLocaleDateString()}
                                </span>
                              )}

                              {/* Status Dropdown */}
                              <select
                                value={m.status}
                                onChange={(e) => handleUpdateMilestoneStatus(mIdx, e.target.value)}
                                className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg border outline-none cursor-pointer transition ${
                                  m.status === 'COMPLETED'
                                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                                    : m.status === 'IN_PROGRESS'
                                    ? 'bg-teal-950/60 text-teal-300 border-teal-500/40 ring-1 ring-teal-500/30'
                                    : 'bg-[#0b1320] text-slate-300 border-[#223147]'
                                }`}
                              >
                                <option value="PENDING" className="bg-[#0f172a] text-slate-300">Pending</option>
                                <option value="IN_PROGRESS" className="bg-[#0f172a] text-teal-300">In Progress</option>
                                <option value="COMPLETED" className="bg-[#0f172a] text-emerald-300">Completed</option>
                                <option value="CANCELLED" className="bg-[#0f172a] text-rose-300">Cancelled</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => openEditMilestone(mIdx)}
                                className="p-1.5 rounded-lg hover:bg-teal-500/10 text-slate-400 hover:text-teal-300 transition cursor-pointer"
                                title="Edit milestone"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteMilestone(mIdx)}
                                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                                title="Delete milestone"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Phase Description: Full Width with increased, readable font size */}
                          {m.description && (
                            <div className="pt-3 pb-1 w-full">
                              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                                {m.description}
                              </p>
                            </div>
                          )}

                          {/* Phase Progress Bar */}
                          {deliverables.length > 0 && (
                            <div className="py-2.5">
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="text-slate-400">
                                  Deliverables: <strong className="text-white">{doneCount}</strong> of <strong className="text-white">{deliverables.length}</strong> complete
                                </span>
                                <span className="font-mono text-teal-400 font-bold">{phaseProgress}%</span>
                              </div>
                              <div className="w-full bg-[#0b1320] h-2 rounded-full overflow-hidden border border-[#1e293b]/60">
                                <div
                                  className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${phaseProgress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Deliverables Checklist */}
                          <div className="space-y-2 pt-2">
                            <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                              Phase Deliverables Checklist:
                            </span>

                            <div className="space-y-1">
                              {deliverables.map((d, dIdx) => (
                                <div
                                  key={d._id || dIdx}
                                  className="group flex items-center justify-between py-1.5 px-2.5 rounded-xl hover:bg-[#162238]/60 transition"
                                >
                                  {editingDeliverable?.mIdx === mIdx && editingDeliverable?.dIdx === dIdx ? (
                                    <div className="flex items-center gap-2 flex-1 mr-2">
                                      <input
                                        type="text"
                                        value={editingDeliverable.text}
                                        onChange={(e) =>
                                          setEditingDeliverable({ ...editingDeliverable, text: e.target.value })
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleSaveDeliverableTitle(mIdx, dIdx);
                                          if (e.key === 'Escape') setEditingDeliverable(null);
                                        }}
                                        autoFocus
                                        className="flex-1 px-2.5 py-1 bg-[#0b1320] border border-teal-500/50 rounded-lg text-xs text-white outline-none"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleSaveDeliverableTitle(mIdx, dIdx)}
                                        className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                                      >
                                        Save
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingDeliverable(null)}
                                        className="px-2 py-1 text-slate-400 hover:text-white text-xs cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleDeliverable(mIdx, dIdx)}
                                      className="flex items-center gap-2.5 text-left min-w-0 cursor-pointer flex-1"
                                    >
                                      <div
                                        className={`w-4 h-4 rounded flex items-center justify-center transition shrink-0 ${
                                          d.completed
                                            ? 'bg-emerald-500 text-black shadow-sm ring-1 ring-emerald-400'
                                            : 'border border-slate-600 group-hover:border-teal-400'
                                        }`}
                                      >
                                        {d.completed && <Check className="w-3 h-3 stroke-[3]" />}
                                      </div>
                                      <span
                                        className={`text-xs sm:text-sm transition ${
                                          d.completed
                                            ? 'line-through text-slate-500'
                                            : 'text-slate-200 group-hover:text-white'
                                        }`}
                                      >
                                        {d.title}
                                      </span>
                                    </button>
                                  )}

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => setEditingDeliverable({ mIdx, dIdx, text: d.title })}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-teal-400 transition cursor-pointer"
                                      title="Edit deliverable"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteDeliverableItem(mIdx, dIdx)}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                                      title="Remove deliverable"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Inline Add Deliverable Input */}
                            <div className="mt-3 flex items-center rounded-xl bg-[#0b1320] border border-[#223147] focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500/30 p-1 pl-3 transition-all">
                              <Plus className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
                              <input
                                type="text"
                                placeholder="Add deliverable to this phase (press Enter)..."
                                value={deliverableInputMap[mIdx] || ''}
                                onChange={(e) =>
                                  setDeliverableInputMap((prev) => ({ ...prev, [mIdx]: e.target.value }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddDeliverableItem(mIdx);
                                  }
                                }}
                                className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 outline-none min-w-0"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddDeliverableItem(mIdx)}
                                disabled={!(deliverableInputMap[mIdx] || '').trim()}
                                className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1 transition shrink-0 shadow-sm active:scale-95 cursor-pointer"
                              >
                                <span>Add</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center bg-[#131d2e] rounded-2xl border border-dashed border-[#1e293b] space-y-3">
                      <Milestone className="w-9 h-9 text-slate-500 mx-auto" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">No delivery milestones added yet</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Break your project into clear delivery phases (e.g. SRS & UI/UX, Backend MVP, Testing, and Launch) to keep clients and developers aligned.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleLoadStandardPhases}
                          className="px-3.5 py-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Load 3-Phase Software Template</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingMilestone(true)}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create Custom Milestone</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-5 sm:p-6 rounded-3xl bg-[#0f172a] border border-[#1e293b] space-y-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-teal-400" />
                      Project Tasks ({tasks.length})
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Break down features into tasks and assign developers.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Task for this Project</span>
                  </button>
                </div>

                {/* Tasks List */}
                <div className="space-y-2">
                  {tasks.length > 0 ? (
                    tasks.map((t) => (
                      <div
                        key={t._id}
                        onClick={() => setSelectedTask(t)}
                        className="p-4 rounded-2xl bg-[#131d2e] border border-[#1e293b] hover:border-teal-500/50 hover:bg-[#162238] transition flex items-center justify-between cursor-pointer group shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-3">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            t.status === 'DONE' ? 'bg-emerald-400 ring-2 ring-emerald-500/20' : 'bg-teal-400 ring-2 ring-teal-500/20'
                          }`} />
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-teal-300 transition truncate">
                              {t.title}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                              {t.assignedTo && (
                                <span className="text-slate-300 flex items-center gap-1">
                                  <Users className="w-3 h-3 text-teal-400" />
                                  <span>Assigned: <strong className="text-white">{t.assignedTo.name}</strong></span>
                                </span>
                              )}
                              {t.dueDate && (
                                <span className="flex items-center gap-1 font-mono text-slate-400">
                                  <Calendar className="w-3 h-3 text-slate-500" />
                                  <span>Due: {new Date(t.dueDate).toLocaleDateString()}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {t.subtasks && t.subtasks.length > 0 && (
                            <span className="text-[10px] text-teal-400 font-mono font-medium px-2 py-0.5 rounded-lg bg-teal-500/10 border border-teal-500/20 hidden sm:inline-block">
                              ✓ {t.subtasks.filter((s) => s.completed).length}/{t.subtasks.length} subtasks
                            </span>
                          )}
                          <PriorityBadge priority={t.priority} />
                          <select
                            value={t.status}
                            onChange={(e) => handleTaskStatusChange(t._id, e.target.value as TaskStatus)}
                            className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border outline-none cursor-pointer transition ${
                              t.status === 'DONE'
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                                : t.status === 'IN_PROGRESS'
                                ? 'bg-teal-950/60 text-teal-300 border-teal-500/40 ring-1 ring-teal-500/30'
                                : t.status === 'REVIEW'
                                ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                                : 'bg-[#0b1320] text-slate-300 border-[#223147]'
                            }`}
                          >
                            <option value="TODO" className="bg-[#0f172a] text-slate-300">To Do</option>
                            <option value="IN_PROGRESS" className="bg-[#0f172a] text-teal-300">In Progress</option>
                            <option value="REVIEW" className="bg-[#0f172a] text-amber-300">Review</option>
                            <option value="DONE" className="bg-[#0f172a] text-emerald-300">Done</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(t._id)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-[#131d2e] rounded-2xl border border-dashed border-[#1e293b]">
                      <CheckSquare className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">No tasks created for this project yet.</p>
                      <button
                        type="button"
                        onClick={() => setIsAddingTask(true)}
                        className="mt-2 text-xs text-teal-400 hover:underline font-semibold cursor-pointer"
                      >
                        Create First Task →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT PROJECT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project Details"
      >
        <form onSubmit={handleUpdateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Project Name *</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Connected Client</label>
              <select
                value={formClientId}
                onChange={(e) => {
                  setFormClientId(e.target.value);
                  const found = clients.find((c) => c._id === e.target.value);
                  if (found) setFormClientName(found.name);
                }}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="">-- Choose Existing Client --</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.status})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="PLANNING">Planning</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review / QA</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Project Lead (Lead Developer / Tech Lead)
              </label>
              <select
                value={formLeadId}
                onChange={(e) => setFormLeadId(e.target.value)}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="">-- Choose Project Lead (Optional) --</option>
                {teamMembers.map((m) => (
                  <option key={m.id || m._id} value={m.id || m._id}>
                    {m.name} ({m.title || 'Developer'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Priority</label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as any)}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Tech Stack (Comma-separated)
            </label>
            <input
              type="text"
              value={formTechStack}
              onChange={(e) => setFormTechStack(e.target.value)}
              placeholder="e.g. Next.js, Node.js, PostgreSQL, Tailwind CSS"
              className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Budget ($)</label>
              <input
                type="number"
                value={formBudget}
                onChange={(e) => setFormBudget(e.target.value)}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Deadline</label>
              <input
                type="date"
                value={formDeadline}
                onChange={(e) => setFormDeadline(e.target.value)}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Assign Developers</label>
            <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-[#181818] border border-[#262626]">
              {teamMembers.map((m) => {
                const isSelected = formMemberIds.includes(m._id || m.id || '');
                return (
                  <button
                    key={m._id || m.id}
                    type="button"
                    onClick={() => {
                      const id = m._id || m.id || '';
                      if (isSelected) {
                        setFormMemberIds(formMemberIds.filter((devId) => devId !== id));
                      } else {
                        setFormMemberIds([...formMemberIds, id]);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-500'
                        : 'bg-[#121212] text-neutral-400 border-[#262626] hover:text-white'
                    }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Description & Scope</label>
            <textarea
              value={formDescription}
              onChange={(e) => {
                setFormDescription(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.max(68, e.target.scrollHeight)}px`;
              }}
              rows={2}
              className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none resize-none leading-relaxed overflow-hidden transition-[height]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs shadow-md shadow-teal-900/30"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Project"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-300 leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-white">{project.name}</strong>?
            This will remove all associated links and unbind it from its client.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteProject}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-950/30"
            >
              Yes, Delete Project
            </button>
          </div>
        </div>
      </Modal>

      {/* CREATE NEW TASK MODAL */}
      <Modal isOpen={isAddingTask} onClose={() => setIsAddingTask(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Implement JWT authentication & ERP backend APIs"
              className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Description</label>
            <textarea
              ref={taskDescriptionRef}
              rows={2}
              value={taskDescription}
              onChange={(e) => {
                setTaskDescription(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.max(68, e.target.scrollHeight)}px`;
              }}
              placeholder="Provide details, deliverables, or acceptance criteria..."
              className="w-full px-3 py-2.5 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500 resize-none leading-relaxed overflow-hidden transition-[height] duration-75"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Project</label>
              <div className="px-3 py-2 bg-[#141414] border border-[#282828] rounded-xl text-xs text-teal-400 font-semibold truncate">
                📁 {project.name}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Assignee</label>
              <select
                value={taskAssignedToId}
                onChange={(e) => setTaskAssignedToId(e.target.value)}
                className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="">-- Unassigned (Team Backlog) --</option>
                {teamMembers.map((m) => (
                  <option key={m._id || m.id} value={m._id || m.id}>
                    {m.name} ({m.title || 'Developer'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Due Date</label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 min-w-0"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
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
                value={taskEstHours}
                onChange={(e) => setTaskEstHours(e.target.value)}
                className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Subtasks Checklist Builder */}
          <div className="p-3.5 rounded-2xl bg-[#141414] border border-[#262626] space-y-2.5">
            <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-teal-400" />
              Subtasks Checklist ({taskSubtasks.length})
            </span>

            {/* Subtask Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={taskSubtaskInput}
                onChange={(e) => setTaskSubtaskInput(e.target.value)}
                placeholder="Add subtask and press enter (e.g. Design schema)..."
                className="flex-1 px-3 py-1.5 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDraftTaskSubtask(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddDraftTaskSubtask}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white rounded-xl flex items-center gap-1 transition shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* List of draft subtasks */}
            {taskSubtasks.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                {taskSubtasks.map((st, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#181818] border border-[#262626] text-xs text-neutral-300"
                  >
                    <span className="truncate pr-2">{st}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDraftTaskSubtask(idx)}
                      className="text-neutral-500 hover:text-rose-400 p-0.5 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#222222]">
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingTask}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 disabled:opacity-50 text-xs font-semibold text-white rounded-xl shadow-md shadow-teal-900/30 transition cursor-pointer"
            >
              {savingTask ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* TASK DETAILS POPUP MODAL */}
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
                  onChange={(e) => handleTaskStatusChange(selectedTask._id, e.target.value as TaskStatus)}
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
                  {selectedTask.project?.name || project.name}
                </strong>
              </div>

              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-400" />
                <span>Assignee:</span>
                <strong className="text-white">{selectedTask.assignedTo?.name || 'Unassigned'}</strong>
              </div>
            </div>

            {/* Description */}
            {selectedTask.description && (
              <p className="text-xs text-neutral-300 leading-relaxed bg-[#161616] p-3.5 rounded-2xl border border-[#242424] whitespace-pre-wrap break-words">
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
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {(selectedTask.subtasks || []).map((st, idx) => (
                  <div
                    key={idx}
                    className="group flex items-center justify-between p-2.5 rounded-xl bg-[#181818] border border-[#262626] hover:border-[#383838] transition"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(selectedTask, idx)}
                      className="flex items-center gap-2.5 text-left min-w-0 cursor-pointer flex-1"
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center transition shrink-0 ${
                          st.completed
                            ? 'bg-emerald-500 text-black shadow-sm'
                            : 'border border-neutral-600 group-hover:border-teal-400'
                        }`}
                      >
                        {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span
                        className={`text-xs transition truncate ${
                          st.completed ? 'line-through text-neutral-500' : 'text-neutral-200'
                        }`}
                      >
                        {st.title}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSubtaskFromSelected(idx)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-rose-400 transition cursor-pointer"
                      title="Delete subtask"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {(selectedTask.subtasks || []).length === 0 && (
                  <p className="text-xs text-neutral-600 italic">No subtasks added yet.</p>
                )}
              </div>

              {/* Inline Add Subtask Input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={detailSubtaskText}
                  onChange={(e) => setDetailSubtaskText(e.target.value)}
                  placeholder="Add a new subtask..."
                  className="flex-1 px-3 py-1.5 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSubtaskToSelectedTask(e);
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSubtaskToSelectedTask}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white rounded-xl transition cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* ACTIVITY & COMMENTS SECTION */}
            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626] space-y-3">
              <h4 className="font-heading text-xs font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-teal-400" />
                Notes & Activity ({selectedTask.comments?.length || 0})
              </h4>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedTask.comments && selectedTask.comments.length > 0 ? (
                  selectedTask.comments.map((c, i) => (
                    <div key={i} className="group/c p-2.5 rounded-xl bg-[#161616] border border-[#262626] text-xs">
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                        <span className="font-semibold text-neutral-200">{c.author.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span>{c.createdAt}</span>
                          <button
                            type="button"
                            onClick={() => handleStartEditComment(i, c.text)}
                            className="opacity-0 group-hover/c:opacity-100 text-neutral-500 hover:text-teal-400 p-0.5 rounded transition cursor-pointer"
                            title="Edit note"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(i)}
                            className="opacity-0 group-hover/c:opacity-100 text-neutral-500 hover:text-rose-400 p-0.5 rounded transition cursor-pointer"
                            title="Delete note"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {editingCommentIdx === i ? (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <input
                            type="text"
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            className="flex-1 px-2.5 py-1 bg-[#121212] border border-teal-500/50 rounded-lg text-xs text-white outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEditComment(i);
                              if (e.key === 'Escape') setEditingCommentIdx(null);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditComment(i)}
                            className="px-2 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCommentIdx(null)}
                            className="px-2 py-1 text-neutral-400 hover:text-white text-[11px] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <p className="text-neutral-300 whitespace-pre-wrap">{c.text}</p>
                      )}
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
                  className="px-3.5 py-1.5 bg-[#202020] hover:bg-teal-600 text-xs font-semibold text-white rounded-xl transition cursor-pointer"
                >
                  Reply
                </button>
              </div>
            </div>

            {/* Action Bar (Delete Task, Edit Task, Close) */}
            <div className="flex justify-between items-center pt-3 border-t border-[#222222]">
              <button
                type="button"
                onClick={() => handleDeleteTask(selectedTask._id)}
                className="px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditTask(selectedTask)}
                  className="px-3.5 py-1.5 bg-teal-600/15 hover:bg-teal-600/25 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Task</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-1.5 bg-[#181818] hover:bg-[#222222] text-xs text-white rounded-xl font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT TASK MODAL */}
      {editingTask && (
        <Modal isOpen={!!editingTask} onClose={() => setEditingTask(null)} title="Edit Task">
          <form onSubmit={handleUpdateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Task Title *</label>
              <input
                type="text"
                required
                value={editTaskTitle}
                onChange={(e) => setEditTaskTitle(e.target.value)}
                placeholder="e.g. Implement JWT authentication & ERP backend APIs"
                className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Description</label>
              <textarea
                ref={editTaskDescRef}
                rows={2}
                value={editTaskDescription}
                onChange={(e) => {
                  setEditTaskDescription(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.max(68, e.target.scrollHeight)}px`;
                }}
                placeholder="Provide details or acceptance criteria..."
                className="w-full px-3 py-2.5 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500 resize-none leading-relaxed overflow-hidden transition-[height] duration-75"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Project</label>
                <div className="px-3 py-2 bg-[#141414] border border-[#282828] rounded-xl text-xs text-teal-400 font-semibold truncate">
                  📁 {project.name}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Assignee</label>
                <select
                  value={editTaskAssignedToId}
                  onChange={(e) => setEditTaskAssignedToId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="">-- Unassigned (Team Backlog) --</option>
                  {teamMembers.map((m) => (
                    <option key={m._id || m.id} value={m._id || m.id}>
                      {m.name} ({m.title || 'Developer'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={editTaskDueDate}
                  onChange={(e) => setEditTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 min-w-0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Priority</label>
                <select
                  value={editTaskPriority}
                  onChange={(e) => setEditTaskPriority(e.target.value as any)}
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
                  value={editTaskEstHours}
                  onChange={(e) => setEditTaskEstHours(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#222222]">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEditTask}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 disabled:opacity-50 text-xs font-semibold text-white rounded-xl shadow-md shadow-teal-900/30 transition cursor-pointer"
              >
                {savingEditTask ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT MILESTONE MODAL */}
      {editingMilestoneIndex !== null && (
        <Modal
          isOpen={editingMilestoneIndex !== null}
          onClose={() => setEditingMilestoneIndex(null)}
          title="Edit Milestone / Delivery Phase"
        >
          <form onSubmit={handleUpdateMilestone} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Phase Title *</label>
              <input
                type="text"
                required
                value={editMilestoneTitle}
                onChange={(e) => setEditMilestoneTitle(e.target.value)}
                placeholder="e.g. Phase 2: Core MVP Development & APIs"
                className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Target Deadline</label>
              <input
                type="date"
                value={editMilestoneDueDate}
                onChange={(e) => setEditMilestoneDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Phase Description</label>
              <textarea
                ref={editMilestoneDescRef}
                rows={2}
                value={editMilestoneDescription}
                onChange={(e) => {
                  setEditMilestoneDescription(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.max(68, e.target.scrollHeight)}px`;
                }}
                placeholder="Scope and key objectives for this delivery milestone..."
                className="w-full px-3 py-2.5 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500 resize-none leading-relaxed overflow-hidden transition-[height] duration-75"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#222222]">
              <button
                type="button"
                onClick={() => setEditingMilestoneIndex(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEditMilestone}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 disabled:opacity-50 text-xs font-semibold text-white rounded-xl shadow-md shadow-teal-900/30 transition cursor-pointer"
              >
                {savingEditMilestone ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT LINK MODAL */}
      {editingLinkIndex !== null && (
        <Modal
          isOpen={editingLinkIndex !== null}
          onClose={() => setEditingLinkIndex(null)}
          title="Edit Resource Link"
        >
          <form onSubmit={handleUpdateLink} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Link Title *</label>
              <input
                type="text"
                required
                value={editLinkTitle}
                onChange={(e) => setEditLinkTitle(e.target.value)}
                placeholder="e.g. Figma Design System"
                className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">URL *</label>
              <input
                type="text"
                required
                value={editLinkUrl}
                onChange={(e) => setEditLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Category</label>
              <select
                value={editLinkCategory}
                onChange={(e) => setEditLinkCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="SRS">SRS & Requirements</option>
                <option value="GITHUB">GitHub Repository</option>
                <option value="FIGMA">Figma Design System</option>
                <option value="LIVE">Live Production App</option>
                <option value="STAGING">Staging Environment</option>
                <option value="DRIVE">Google Drive / Docs</option>
                <option value="OTHER">Other Link</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#222222]">
              <button
                type="button"
                onClick={() => setEditingLinkIndex(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEditLink}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 disabled:opacity-50 text-xs font-semibold text-white rounded-xl shadow-md shadow-teal-900/30 transition cursor-pointer"
              >
                {savingEditLink ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
