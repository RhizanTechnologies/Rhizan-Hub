'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Modal } from '@/components/Modal';
import { Project, Client, User, ResourceLink, Task } from '@/types';
import { apiFetch } from '@/lib/api';
import {
  Calendar,
  Users,
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
  ChevronRight,
  Sparkles,
  Building2,
  Clock,
  TrendingUp,
  Search,
  ArrowUpRight,
  Minus,
} from 'lucide-react';
import { PriorityBadge } from '@/components/Badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProgressStage {
  id: string;
  label: string;
  rangeLabel: string;
  minProgress: number;
  maxProgress: number;
  borderAccent: string;
  badgeAccent: string;
  barColor: string;
}

const PROGRESS_PIPELINE_STAGES: ProgressStage[] = [
  {
    id: 'KICKOFF',
    label: 'Planning & Setup',
    rangeLabel: '0 - 24%',
    minProgress: 0,
    maxProgress: 24,
    borderAccent: 'border-neutral-700/60',
    badgeAccent: 'bg-neutral-800 text-neutral-300 border-neutral-700',
    barColor: 'from-neutral-500 to-neutral-400',
  },
  {
    id: 'DEV_EARLY',
    label: 'In Development',
    rangeLabel: '25 - 49%',
    minProgress: 25,
    maxProgress: 49,
    borderAccent: 'border-blue-500/30',
    badgeAccent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    barColor: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'DEV_ADVANCED',
    label: 'Advanced Build',
    rangeLabel: '50 - 74%',
    minProgress: 50,
    maxProgress: 74,
    borderAccent: 'border-teal-500/30',
    badgeAccent: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    barColor: 'from-teal-500 to-emerald-400',
  },
  {
    id: 'REVIEW',
    label: 'QA & Review',
    rangeLabel: '75 - 99%',
    minProgress: 75,
    maxProgress: 99,
    borderAccent: 'border-amber-500/30',
    badgeAccent: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    barColor: 'from-amber-500 to-yellow-400',
  },
  {
    id: 'COMPLETED',
    label: 'Delivered & Live',
    rangeLabel: '100%',
    minProgress: 100,
    maxProgress: 100,
    borderAccent: 'border-emerald-500/30',
    badgeAccent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    barColor: 'from-emerald-500 to-teal-400',
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // View state & search filters
  const [viewMode, setViewMode] = useState<'PIPELINE' | 'GRID'>('PIPELINE');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Detail Modal
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Link Form inside Project Detail
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkCategory, setNewLinkCategory] = useState<'GITHUB' | 'FIGMA' | 'LIVE' | 'STAGING' | 'DRIVE' | 'DOCS' | 'OTHER'>('LIVE');

  // Form State
  const [formName, setFormName] = useState('');
  const [formClientId, setFormClientId] = useState('');
  const [formClientName, setFormClientName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLeadId, setFormLeadId] = useState('');
  const [formTechStack, setFormTechStack] = useState('');
  const [formPriority, setFormPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [formBudget, setFormBudget] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formStatus, setFormStatus] = useState<'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED'>('IN_PROGRESS');
  const [formNotes, setFormNotes] = useState('');
  const [formMemberIds, setFormMemberIds] = useState<string[]>([]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [projData, clientData, teamData] = await Promise.all([
        apiFetch<Project[]>('/projects'),
        apiFetch<Client[]>('/clients'),
        apiFetch<any[]>('/team'),
      ]);

      if (projData) setProjects(projData);
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
    } catch (err) {
      console.error('Error loading projects data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const openProjectDetail = async (project: Project) => {
    setSelectedProject(project);
    setLoadingTasks(true);
    setIsAddingLink(false);

    try {
      const data = await apiFetch<{ project: Project; tasks: Task[] }>(`/projects/${project._id}`);
      if (data) {
        setSelectedProject(data.project);
        setProjectTasks(data.tasks || []);
      }
    } catch (err) {
      console.warn('Could not load specific project tasks:', err);
      setProjectTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const openCreateModal = () => {
    setFormName('');
    setFormClientId('');
    setFormClientName('');
    setFormDescription('');
    setFormLeadId('');
    setFormTechStack('');
    setFormPriority('MEDIUM');
    setFormBudget('');
    setFormDeadline('');
    setFormStatus('IN_PROGRESS');
    setFormNotes('');
    setFormMemberIds([]);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setFormName(project.name);
    setFormClientId(typeof project.clientId === 'object' ? (project.clientId as any)?._id : project.clientId || '');
    setFormClientName(project.clientName || '');
    setFormDescription(project.description || '');
    setFormLeadId(typeof project.lead === 'object' ? (project.lead as any)?._id : project.lead || '');
    setFormTechStack((project.techStack || []).join(', '));
    setFormPriority(project.priority || 'MEDIUM');
    setFormBudget(project.budget?.toString() || '');
    setFormDeadline(project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '');
    setFormStatus(project.status);
    setFormNotes(project.notes || '');
    setFormMemberIds((project.members || []).map((m: any) => m._id || m.id));
    setIsEditModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    let selectedClientName = formClientName.trim() || 'Internal';
    if (formClientId) {
      const match = clients.find((c) => c._id === formClientId);
      if (match) selectedClientName = match.name;
    }

    const payload = {
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
    };

    try {
      if (isEditModalOpen && selectedProject) {
        const updated = await apiFetch<Project>(`/projects/${selectedProject._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setProjects((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
        setSelectedProject(updated);
        setIsEditModalOpen(false);
      } else {
        const created = await apiFetch<Project>('/projects', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setProjects((prev) => [created, ...prev]);
        setIsCreateModalOpen(false);
        openProjectDetail(created);
      }
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Error saving project');
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await apiFetch(`/projects/${projectToDelete._id}`, { method: 'DELETE' });
      setProjects((prev) => prev.filter((p) => p._id !== projectToDelete._id));
      if (selectedProject?._id === projectToDelete._id) {
        setSelectedProject(null);
      }
      setProjectToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
    }
  };

  // Add Resource Link to Project
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newLinkTitle.trim() || !newLinkUrl.trim()) return;

    let formattedUrl = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const link: ResourceLink = {
      title: newLinkTitle.trim(),
      url: formattedUrl,
      category: newLinkCategory,
    };

    const updatedLinks = [...(selectedProject.links || []), link];

    try {
      const updated = await apiFetch<Project>(`/projects/${selectedProject._id}`, {
        method: 'PUT',
        body: JSON.stringify({ links: updatedLinks }),
      });
      setSelectedProject(updated);
      setProjects((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      setIsAddingLink(false);
      setNewLinkTitle('');
      setNewLinkUrl('');
    } catch (err: any) {
      alert(err.message || 'Failed to add link');
    }
  };

  const handleDeleteLink = async (index: number) => {
    if (!selectedProject) return;
    const updatedLinks = (selectedProject.links || []).filter((_, idx) => idx !== index);

    try {
      const updated = await apiFetch<Project>(`/projects/${selectedProject._id}`, {
        method: 'PUT',
        body: JSON.stringify({ links: updatedLinks }),
      });
      setSelectedProject(updated);
      setProjects((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    } catch (err: any) {
      alert(err.message || 'Failed to remove link');
    }
  };

  const getLinkIcon = (category?: string) => {
    switch (category) {
      case 'GITHUB':
        return <FileCode className="w-3.5 h-3.5 text-neutral-300" />;
      case 'FIGMA':
        return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      case 'LIVE':
        return <Globe className="w-3.5 h-3.5 text-emerald-400" />;
      case 'STAGING':
        return <Globe className="w-3.5 h-3.5 text-amber-400" />;
      case 'DOCS':
      case 'DRIVE':
        return <FileText className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <LinkIcon className="w-3.5 h-3.5 text-teal-400" />;
    }
  };

  const handleQuickProgressUpdate = async (e: React.MouseEvent, projectId: string, delta: number) => {
    e.stopPropagation();
    const proj = projects.find((p) => p._id === projectId);
    if (!proj) return;
    const currentProg = proj.progress || 0;
    const newProgress = Math.max(0, Math.min(100, currentProg + delta));
    if (newProgress === currentProg) return;

    const newStatus =
      newProgress === 100
        ? 'COMPLETED'
        : newProgress >= 75
        ? 'REVIEW'
        : newProgress > 0
        ? 'IN_PROGRESS'
        : 'PLANNING';

    // Optimistic update
    setProjects((prev) =>
      prev.map((p) => (p._id === projectId ? { ...p, progress: newProgress, status: newStatus as any } : p))
    );

    try {
      await apiFetch(`/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify({ progress: newProgress, status: newStatus }),
      });
    } catch (err: any) {
      console.error('Failed to update progress:', err);
      loadAllData();
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.clientName && project.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (project.techStack && project.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesPriority = priorityFilter === 'ALL' || project.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const avgProgress =
    projects.length > 0
      ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)
      : 0;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Projects"
        subtitle="Manage software delivery, client deliverables, external links, and milestones"
        actionButton={{
          label: 'Create Project',
          onClick: openCreateModal,
        }}
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-5 sm:space-y-6">
        {/* KPI Quick Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-[#121212] border border-[#222222] shadow-sm">
            <span className="text-xs text-neutral-400 font-medium">Total Active Projects</span>
            <div className="font-heading text-2xl font-bold text-white mt-1">{projects.length}</div>
            <p className="text-[11px] text-neutral-500 mt-1">Across all clients</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#121212] border border-[#222222] shadow-sm">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
              <span>Avg Delivery Progress</span>
              <span className="font-bold text-teal-400 font-mono">{avgProgress}%</span>
            </div>
            <div className="font-heading text-2xl font-bold text-teal-400 mt-1">{avgProgress}%</div>
            <div className="w-full bg-[#202020] h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all"
                style={{ width: `${avgProgress}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#121212] border border-[#222222] shadow-sm">
            <span className="text-xs text-neutral-400 font-medium">Total Delivery Budget</span>
            <div className="font-heading text-2xl font-bold text-emerald-400 mt-1 font-mono">
              ${totalBudget.toLocaleString()}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Contracted project scope</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#121212] border border-[#222222] shadow-sm">
            <span className="text-xs text-neutral-400 font-medium">Testing & Live</span>
            <div className="font-heading text-2xl font-bold text-amber-400 mt-1">
              {projects.filter((p) => (p.progress || 0) >= 75).length}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Projects at 75%+ progress</p>
          </div>
        </div>

        {/* View Switcher & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setViewMode('PIPELINE')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                viewMode === 'PIPELINE'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                  : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Progress Pipeline ({filteredProjects.length})</span>
            </button>

            <button
              onClick={() => setViewMode('GRID')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                viewMode === 'GRID'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                  : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Project Directory ({filteredProjects.length})</span>
            </button>
          </div>

          {/* Search & Priority Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects or clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#141414] border border-[#262626] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-teal-500 transition"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#141414] border border-[#262626] rounded-xl px-2.5 py-1.5 text-xs text-neutral-300 outline-none focus:border-teal-500 transition"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* VIEW 1: PROGRESS PIPELINE (Kanban View Based on Delivery Progress %) */}
        {viewMode === 'PIPELINE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
            {PROGRESS_PIPELINE_STAGES.map((stage) => {
              const stageProjects = filteredProjects.filter((p) => {
                const prog = p.progress || 0;
                if (stage.minProgress === 100) return prog >= 100;
                return prog >= stage.minProgress && prog <= stage.maxProgress;
              });

              const stageBudget = stageProjects.reduce((sum, p) => sum + (p.budget || 0), 0);

              return (
                <div
                  key={stage.id}
                  className={`bg-[#0f0f0f] border ${stage.borderAccent} rounded-2xl p-3 flex flex-col min-h-[550px] shadow-sm`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#1f1f1f] mb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{stage.label}</span>
                        <span className="w-5 h-5 rounded-full bg-[#1c1c1c] text-[10px] text-neutral-400 font-bold flex items-center justify-center">
                          {stageProjects.length}
                        </span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${stage.badgeAccent}`}>
                        {stage.rangeLabel}
                      </span>
                    </div>

                    <span className="text-[10px] text-emerald-400 font-semibold font-mono">
                      ${stageBudget.toLocaleString()}
                    </span>
                  </div>

                  {/* Projects in this Progress Stage */}
                  <div className="space-y-3 flex-1">
                    {stageProjects.map((project) => {
                      const prog = project.progress || 0;
                      return (
                        <div
                          key={project._id}
                          onClick={() => router.push(`/projects/${project._id}`)}
                          className="p-3.5 rounded-xl bg-[#141414] hover:bg-[#181818] border border-[#242424] hover:border-teal-500/50 cursor-pointer transition shadow-sm space-y-2.5 group"
                        >
                          {/* Title & Priority */}
                          <div>
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <h4 className="font-heading text-xs font-bold text-white group-hover:text-teal-300 transition flex items-center gap-1 leading-snug">
                                <span className="line-clamp-2">{project.name}</span>
                                <ArrowUpRight className="w-3 h-3 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                              </h4>
                              {project.priority && (
                                <PriorityBadge priority={project.priority} />
                              )}
                            </div>

                            <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                              <Building2 className="w-3 h-3 text-teal-400 shrink-0" />
                              <span className="truncate">{project.clientName || 'Internal'}</span>
                            </div>
                          </div>

                          {/* Interactive Delivery Progress */}
                          <div className="space-y-1 p-2 rounded-lg bg-[#181818] border border-[#242424]">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-neutral-400">Progress</span>
                              <div className="flex items-center gap-1.5">
                                {/* Quick Bump Buttons */}
                                <button
                                  type="button"
                                  title="Reduce progress by 10%"
                                  onClick={(e) => handleQuickProgressUpdate(e, project._id, -10)}
                                  className="w-4 h-4 rounded bg-[#242424] hover:bg-neutral-700 text-neutral-300 text-[10px] flex items-center justify-center transition"
                                >
                                  -
                                </button>
                                <span className="font-bold text-white font-mono text-xs">{prog}%</span>
                                <button
                                  type="button"
                                  title="Advance progress by 10%"
                                  onClick={(e) => handleQuickProgressUpdate(e, project._id, 10)}
                                  className="w-4 h-4 rounded bg-[#242424] hover:bg-teal-600 hover:text-white text-neutral-300 text-[10px] flex items-center justify-center transition"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="w-full bg-[#202020] h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`bg-gradient-to-r ${stage.barColor} h-full rounded-full transition-all duration-300`}
                                style={{ width: `${prog}%` }}
                              />
                            </div>
                          </div>

                          {/* Lead & Assigned Team */}
                          <div className="flex items-center justify-between pt-1 text-[10px]">
                            {project.lead ? (
                              <div className="flex items-center gap-1 truncate max-w-[120px]">
                                <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[8px] font-bold flex items-center justify-center shrink-0">
                                  {project.lead.name?.charAt(0) || 'L'}
                                </div>
                                <span className="text-neutral-300 truncate">{project.lead.name}</span>
                              </div>
                            ) : (
                              <span className="text-neutral-500 italic">No Lead</span>
                            )}

                            <div className="flex items-center -space-x-1">
                              {(project.members || []).slice(0, 3).map((m: any, idx: number) => (
                                <div
                                  key={idx}
                                  title={m.name}
                                  className="w-4 h-4 rounded-full bg-teal-800 text-[8px] text-white font-bold flex items-center justify-center border border-[#141414]"
                                >
                                  {m.name?.charAt(0) || 'U'}
                                </div>
                              ))}
                              {(project.members || []).length > 3 && (
                                <span className="text-[9px] text-neutral-500 pl-1 font-mono">
                                  +{project.members.length - 3}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Footer with Budget & Deadline */}
                          <div className="flex items-center justify-between pt-1 border-t border-[#1e1e1e] text-[10px] text-neutral-400">
                            <span className="text-emerald-400 font-mono font-bold">
                              ${(project.budget || 0).toLocaleString()}
                            </span>
                            {project.deadline && (
                              <span className="flex items-center gap-1 text-neutral-500">
                                <Calendar className="w-3 h-3" />
                                {new Date(project.deadline).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {stageProjects.length === 0 && (
                      <div className="h-32 border border-dashed border-[#202020] rounded-xl flex items-center justify-center p-3 text-center">
                        <span className="text-[11px] text-neutral-600">No projects in this stage</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: PROJECT DIRECTORY (Card Grid) */}
        {viewMode === 'GRID' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredProjects.map((project) => {
              const links = project.links || [];
              return (
                <div
                  key={project._id}
                  onClick={() => router.push(`/projects/${project._id}`)}
                  className="bg-[#121212] border border-[#222222] hover:border-teal-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl hover:shadow-teal-950/20 group flex flex-col justify-between"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-heading font-bold text-base text-white group-hover:text-teal-300 transition flex items-center gap-1.5">
                          {project.name}
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-teal-400" />
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-teal-400 font-medium flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {project.clientName || 'Internal Project'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold tracking-wider uppercase border ${
                            project.status === 'COMPLETED'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              : project.status === 'REVIEW'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                          }`}
                        >
                          {project.status.replace('_', ' ')}
                        </span>
                        {project.priority && (
                          <PriorityBadge priority={project.priority} />
                        )}
                      </div>
                    </div>

                    {/* Project Lead */}
                    {project.lead && (
                      <div className="flex items-center gap-2 mb-3 px-2.5 py-1 rounded-xl bg-[#161616] border border-[#262626] w-fit">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-teal-500 text-black font-extrabold text-[9px] flex items-center justify-center">
                          {project.lead.name?.charAt(0) || 'L'}
                        </div>
                        <div className="text-[11px] leading-tight">
                          <span className="text-[9px] uppercase font-bold text-amber-400 mr-1">Project Lead:</span>
                          <strong className="text-white font-medium">{project.lead.name}</strong>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-neutral-400 line-clamp-2 mb-3 leading-relaxed">
                      {project.description || 'No description provided.'}
                    </p>

                    {/* Tech Stack Pills */}
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.techStack.map((tech, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-[#181818] text-neutral-300 border border-[#262626]">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Multiple Links Pills (Quick access directly on card) */}
                    {links.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {links.slice(0, 3).map((l, idx) => (
                          <a
                            key={idx}
                            href={l.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#181818] hover:bg-[#222222] border border-[#282828] text-[10px] text-neutral-300 hover:text-teal-300 transition"
                          >
                            {getLinkIcon(l.category)}
                            <span className="truncate max-w-[90px]">{l.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        ))}
                        {links.length > 3 && (
                          <span className="px-1.5 py-1 rounded-lg bg-[#181818] border border-[#282828] text-[10px] text-neutral-500">
                            +{links.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400">Delivery Progress</span>
                        <span className="font-semibold text-white font-mono">{project.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-[#202020] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Metadata Stats */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-[#171717] border border-[#242424] text-neutral-400 mb-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-neutral-500" />
                        {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono text-neutral-300">
                        <DollarSign className="w-3 h-3 text-emerald-400" />
                        {project.budget ? `$${project.budget.toLocaleString()}` : 'Flexible'}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: Members & Manage */}
                  <div className="pt-3 border-t border-[#1f1f1f] flex items-center justify-between">
                    <div className="flex items-center -space-x-1.5 overflow-hidden">
                      {(project.members || []).map((m: any, idx: number) => (
                        <div
                          key={idx}
                          title={m.name}
                          className="w-6 h-6 rounded-full bg-teal-700 border border-[#121212] flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm"
                        >
                          {m.name?.charAt(0) || 'U'}
                        </div>
                      ))}
                      {(project.members || []).length === 0 && (
                        <span className="text-[10px] text-neutral-500 italic">No assigned team</span>
                      )}
                    </div>

                    <span className="text-xs text-teal-400 font-medium group-hover:underline flex items-center gap-1">
                      Details & Links →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PROJECT DETAIL MODAL */}
      <Modal
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        title={selectedProject?.name || 'Project Overview'}
      >
        {selectedProject && (
          <div className="space-y-5">
            {/* Header Banner */}
            <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg font-bold text-white">{selectedProject.name}</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    {selectedProject.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                  <span>Client: <strong className="text-teal-400">{selectedProject.clientName}</strong></span>
                  {selectedProject.deadline && (
                    <span>• Deadline: {new Date(selectedProject.deadline).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openEditModal(selectedProject)}
                  className="px-3 py-1.5 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] hover:bg-[#222222] text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProjectToDelete(selectedProject)}
                  className="px-3 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Description */}
            {selectedProject.description && (
              <div className="p-3.5 rounded-xl bg-[#161616] border border-[#242424] text-xs text-neutral-300 leading-relaxed">
                {selectedProject.description}
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#161616] border border-[#262626]">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Progress</span>
                <span className="text-base font-bold text-teal-400 font-mono mt-0.5 block">
                  {selectedProject.progress || 0}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#161616] border border-[#262626]">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Budget</span>
                <span className="text-base font-bold text-white font-mono mt-0.5 block">
                  {selectedProject.budget ? `$${selectedProject.budget.toLocaleString()}` : 'Flexible'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#161616] border border-[#262626]">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Linked Tasks</span>
                <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block">
                  {projectTasks.length} tasks
                </span>
              </div>
            </div>

            {/* SECTION: RESOURCE LINKS (Add many links, view, delete) */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#141414] border border-[#242424]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-teal-400" />
                    Resource & Project Links ({ (selectedProject.links || []).length })
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Add GitHub, Figma, Live demo, Staging, Documentation, or Drive links.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingLink(!isAddingLink)}
                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium flex items-center gap-1 transition"
                >
                  <Plus className="w-3 h-3" /> Add Link
                </button>
              </div>

              {/* Add Link Form */}
              {isAddingLink && (
                <form onSubmit={handleAddLink} className="p-3 rounded-xl bg-[#181818] border border-teal-500/30 space-y-2.5 animate-fade-in">
                  <div className="text-xs font-semibold text-teal-300">Add New Resource Link</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Title (e.g. Production URL or Figma UI)"
                      value={newLinkTitle}
                      onChange={(e) => setNewLinkTitle(e.target.value)}
                      required
                      className="col-span-2 w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                    />
                    <input
                      type="text"
                      placeholder="URL (e.g. https://github.com/... or https://rhizan.com)"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      required
                      className="col-span-2 w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                    />
                    <select
                      value={newLinkCategory}
                      onChange={(e) => setNewLinkCategory(e.target.value as any)}
                      className="col-span-2 w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                    >
                      <option value="LIVE">Live Production Site</option>
                      <option value="STAGING">Staging / Demo URL</option>
                      <option value="GITHUB">GitHub Repository</option>
                      <option value="FIGMA">Figma Design System</option>
                      <option value="DRIVE">Google Drive / Assets</option>
                      <option value="DOCS">Documentation / Wiki</option>
                      <option value="OTHER">Other Link</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingLink(false)}
                      className="px-3 py-1 rounded-lg text-xs text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-teal-600 text-white text-xs font-medium"
                    >
                      Save Link
                    </button>
                  </div>
                </form>
              )}

              {/* Links List */}
              <div className="space-y-2">
                {(selectedProject.links || []).length > 0 ? (
                  selectedProject.links!.map((link, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#181818] border border-[#262626] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-[#202020]">
                          {getLinkIcon(link.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-white">{link.title}</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                              {link.category || 'LINK'}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-500 truncate block max-w-xs">
                            {link.url}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-[#222222] hover:bg-[#2c2c2c] text-teal-400 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteLink(idx)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-neutral-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-500 italic p-2 text-center">
                    No resource links added yet. Click &apos;Add Link&apos; above to attach GitHub, Figma, or Live demo URLs.
                  </p>
                )}
              </div>
            </div>

            {/* Assigned Tasks */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-teal-400" />
                Tasks in this Project ({projectTasks.length})
              </h4>

              {projectTasks.length > 0 ? (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {projectTasks.map((t) => (
                    <div
                      key={t._id}
                      className="p-2 rounded-xl bg-[#161616] border border-[#242424] flex items-center justify-between text-xs"
                    >
                      <span className="text-neutral-200 truncate pr-2">{t.title}</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        t.status === 'DONE'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-teal-500/10 text-teal-400'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-500 italic p-3 bg-[#161616] rounded-xl text-center">
                  No tasks assigned to this project yet.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* CREATE / EDIT PROJECT MODAL */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? 'Edit Project' : 'Create New Project'}
      >
        <form onSubmit={handleSaveProject} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Bakery ERP or RHIZAN Mobile App"
              required
              className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Select Client Account
              </label>
              <select
                value={formClientId}
                onChange={(e) => {
                  setFormClientId(e.target.value);
                  const found = clients.find((c) => c._id === e.target.value);
                  if (found) setFormClientName(found.name);
                }}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
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
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Or Custom Client Name
              </label>
              <input
                type="text"
                value={formClientName}
                onChange={(e) => setFormClientName(e.target.value)}
                placeholder="e.g. ABC Bakery / Internal"
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              />
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
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
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
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Project Priority
              </label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as any)}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
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
              className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Project Description
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Describe deliverables, core features, or technical goals..."
              rows={2}
              className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Budget ($)
              </label>
              <input
                type="number"
                value={formBudget}
                onChange={(e) => setFormBudget(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                value={formDeadline}
                onChange={(e) => setFormDeadline(e.target.value)}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              >
                <option value="PLANNING">Planning</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review / QA</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Team Members Assignment */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Assign Team Members
            </label>
            <div className="flex flex-wrap gap-2 p-2.5 rounded-xl bg-[#181818] border border-[#262626]">
              {teamMembers.map((member) => {
                const isSelected = formMemberIds.includes(member._id || member.id || '');
                return (
                  <button
                    key={member._id || member.id}
                    type="button"
                    onClick={() => {
                      const id = member._id || member.id || '';
                      if (isSelected) {
                        setFormMemberIds(formMemberIds.filter((mId) => mId !== id));
                      } else {
                        setFormMemberIds([...formMemberIds, id]);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                        : 'bg-[#141414] text-neutral-400 border-[#262626] hover:text-white'
                    }`}
                  >
                    {member.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs shadow-md shadow-teal-900/30"
            >
              {isEditModalOpen ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        title="Confirm Project Deletion"
      >
        {projectToDelete && (
          <div className="space-y-4">
            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-white">{projectToDelete.name}</span>? 
              This will remove all associated project links and unbind it from its client.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-950/30"
              >
                Delete Project
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
