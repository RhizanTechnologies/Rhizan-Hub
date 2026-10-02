'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Modal } from '@/components/Modal';
import { Project, Client, User, ResourceLink, Task } from '@/types';
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
} from 'lucide-react';
import { PriorityBadge } from '@/components/Badge';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
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

  // Add Task to this Project Form
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [taskAssignedToId, setTaskAssignedToId] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskEstHours, setTaskEstHours] = useState('4');

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
      alert(err.message || 'Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    try {
      await apiFetch(`/projects/${project._id}`, { method: 'DELETE' });
      router.push('/projects');
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
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
      alert(err.message || 'Failed to add link');
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
      alert(err.message || 'Failed to remove link');
    }
  };

  // Create Task for this Project
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !taskTitle.trim()) return;

    try {
      const newTask = await apiFetch<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: taskTitle.trim(),
          project: project._id,
          priority: taskPriority,
          assignedTo: taskAssignedToId || undefined,
          dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : undefined,
          estimatedHours: parseFloat(taskEstHours) || 4,
          status: 'TODO',
        }),
      });

      setTasks([newTask, ...tasks]);
      setIsAddingTask(false);
      setTaskTitle('');
      setTaskAssignedToId('');
      setTaskDueDate('');
    } catch (err: any) {
      alert(err.message || 'Failed to create task for project');
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

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
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
        <div className="p-6 rounded-3xl bg-[#111111] border border-[#222222] shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-heading font-extrabold text-2xl text-white tracking-tight">
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
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-medium">Delivery Progress ({completedCount} of {tasks.length} tasks complete)</span>
              <span className="font-mono text-teal-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#1c1c1c] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Two-Column Layout: Left (Links & Team) - Right (Tasks) */}
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
                          onClick={() => handleDeleteLink(idx)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-neutral-500 hover:text-rose-400 transition"
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
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isLead
                          ? 'bg-[#181818] border-amber-500/30 shadow-sm'
                          : 'bg-[#161616] border-[#262626]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isLead
                            ? 'bg-gradient-to-tr from-amber-500 to-amber-300 text-black font-extrabold shadow-sm'
                            : 'bg-gradient-to-tr from-teal-500 to-emerald-600 text-white'
                        }`}>
                          {dev.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-white">{dev.name}</span>
                            {isLead && (
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Project Lead
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-teal-400">{dev.title || 'Developer'}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-neutral-500">{dev.email}</span>
                    </div>
                  );
                })}
                {assignedDevs.length === 0 && (
                  <p className="text-xs text-neutral-500 italic p-3 text-center">No developers assigned yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Project Tasks & Developer Assignments */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-2xl bg-[#121212] border border-[#222222] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-teal-400" />
                    Project Tasks ({tasks.length})
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Break down features into tasks and assign developers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingTask(!isAddingTask)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Task for this Project</span>
                </button>
              </div>

              {/* Create Task Form */}
              {isAddingTask && (
                <form onSubmit={handleCreateTask} className="p-4 rounded-2xl bg-[#161616] border border-teal-500/30 space-y-3 animate-fade-in">
                  <h4 className="text-xs font-bold text-teal-300">Create New Project Task</h4>
                  <input
                    type="text"
                    placeholder="Task Title (e.g. Implement JWT authentication & ERP backend APIs)"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    required
                    className="w-full bg-[#101010] border border-[#282828] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Assign Developer</label>
                      <select
                        value={taskAssignedToId}
                        onChange={(e) => setTaskAssignedToId(e.target.value)}
                        className="w-full bg-[#101010] border border-[#282828] rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                      >
                        <option value="">-- Unassigned --</option>
                        {teamMembers.map((m) => (
                          <option key={m._id || m.id} value={m._id || m.id}>
                            {m.name} ({m.title})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Priority</label>
                      <select
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value as any)}
                        className="w-full bg-[#101010] border border-[#282828] rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={taskDueDate}
                        onChange={(e) => setTaskDueDate(e.target.value)}
                        className="w-full bg-[#101010] border border-[#282828] rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingTask(false)}
                      className="px-3.5 py-1.5 rounded-xl text-xs text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold"
                    >
                      Add Task
                    </button>
                  </div>
                </form>
              )}

              {/* Tasks List */}
              <div className="space-y-2">
                {tasks.length > 0 ? (
                  tasks.map((t) => (
                    <div
                      key={t._id}
                      className="p-3.5 rounded-xl bg-[#161616] border border-[#242424] hover:border-[#333333] transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          t.status === 'DONE' ? 'bg-emerald-400' : 'bg-teal-400'
                        }`} />
                        <div>
                          <div className="text-xs font-semibold text-white">{t.title}</div>
                          <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-1">
                            {t.assignedTo && (
                              <span className="text-neutral-300">
                                Assigned: <strong>{t.assignedTo.name}</strong>
                              </span>
                            )}
                            {t.dueDate && (
                              <span>Due: {new Date(t.dueDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <PriorityBadge priority={t.priority} />
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          t.status === 'DONE'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-[#161616] rounded-2xl border border-dashed border-[#242424]">
                    <CheckSquare className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <p className="text-xs text-neutral-400">No tasks created for this project yet.</p>
                    <button
                      type="button"
                      onClick={() => setIsAddingTask(true)}
                      className="mt-2 text-xs text-teal-400 hover:underline font-semibold"
                    >
                      Create First Task →
                    </button>
                  </div>
                )}
              </div>
            </div>
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
              onChange={(e) => setFormDescription(e.target.value)}
              rows={2}
              className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
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
    </div>
  );
}
