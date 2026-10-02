'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Modal } from '@/components/Modal';
import { Client, Project, ClientMeeting, ClientPayment, ResourceLink } from '@/types';
import { apiFetch } from '@/lib/api';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Plus,
  ExternalLink,
  Trash2,
  Edit2,
  FolderKanban,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Users,
  Clock,
  Sparkles,
  Share2,
} from 'lucide-react';
import Link from 'next/link';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PROJECTS' | 'MEETINGS' | 'PAYMENTS' | 'LINKS'>('PROJECTS');

  // Modals & Forms
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Sub-resource forms
  const [isAddingMeeting, setIsAddingMeeting] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('14:00');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');

  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentTitle, setPaymentTitle] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentInvoice, setPaymentInvoice] = useState('');
  const [paymentDueDate, setPaymentDueDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PENDING' | 'OVERDUE'>('PENDING');

  const [isAddingLink, setIsAddingLink] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkCategory, setLinkCategory] = useState('CONTRACT');

  // Edit form state
  const [formName, setFormName] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStatus, setFormStatus] = useState<any>('ACTIVE');
  const [formService, setFormService] = useState('');
  const [formDealValue, setFormDealValue] = useState('');
  const [formPaidAmount, setFormPaidAmount] = useState('');
  const [formCurrency, setFormCurrency] = useState('USD');
  const [formNotes, setFormNotes] = useState('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  // Create Project state
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectBudget, setNewProjectBudget] = useState('');
  const [newProjectDeadline, setNewProjectDeadline] = useState('');
  const [newProjectStatus, setNewProjectStatus] = useState<'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED'>('IN_PROGRESS');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);

  const loadClient = async () => {
    try {
      setLoading(true);
      const [clientData, projectsData] = await Promise.all([
        apiFetch<Client>(`/clients/${clientId}`),
        apiFetch<Project[]>('/projects'),
      ]);

      if (clientData) {
        setClient(clientData);
        setFormName(clientData.name);
        setFormContactPerson(clientData.contactPerson || '');
        setFormPhone(clientData.phone || '');
        setFormEmail(clientData.email || '');
        setFormStatus(clientData.status);
        setFormService(clientData.serviceInterested || '');
        setFormDealValue(clientData.dealValue?.toString() || '');
        setFormPaidAmount(clientData.paidAmount?.toString() || '');
        setFormCurrency(clientData.currency || 'USD');
        setFormNotes(clientData.notes || '');
        setSelectedProjectIds((clientData.projects || []).map((p) => p._id));
      }
      if (projectsData) {
        setAvailableProjects(projectsData);
      }
    } catch (err: any) {
      console.error('Failed to load client details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      loadClient();
    }
  }, [clientId]);

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !client) return;

    try {
      const updated = await apiFetch<Client>(`/clients/${client._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: formName.trim(),
          contactPerson: formContactPerson.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim(),
          status: formStatus,
          serviceInterested: formService.trim(),
          dealValue: parseFloat(formDealValue) || 0,
          paidAmount: parseFloat(formPaidAmount) || 0,
          currency: formCurrency,
          notes: formNotes.trim(),
          projects: selectedProjectIds,
        }),
      });

      setClient(updated);
      setIsEditModalOpen(false);
      await loadClient();
    } catch (err: any) {
      alert(err.message || 'Failed to update client');
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !client) return;

    try {
      setCreatingProject(true);
      await apiFetch<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: newProjectName.trim(),
          clientId: client._id,
          clientName: client.name,
          budget: parseFloat(newProjectBudget) || 0,
          status: newProjectStatus,
          deadline: newProjectDeadline || undefined,
          description: newProjectDescription.trim(),
        }),
      });

      setIsCreateProjectModalOpen(false);
      setNewProjectName('');
      setNewProjectBudget('');
      setNewProjectDeadline('');
      setNewProjectDescription('');
      await loadClient();
    } catch (err: any) {
      alert(err.message || 'Failed to create project');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!client) return;
    try {
      await apiFetch(`/clients/${client._id}`, { method: 'DELETE' });
      router.push('/clients');
    } catch (err: any) {
      alert(err.message || 'Failed to delete client');
    }
  };

  // Add Meeting
  const handleAddMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !meetingTitle.trim() || !meetingDate) return;

    const newM: ClientMeeting = {
      title: meetingTitle.trim(),
      date: meetingDate,
      time: meetingTime,
      linkOrLocation: meetingLocation.trim(),
      status: 'SCHEDULED',
      notes: meetingNotes.trim(),
    };

    const updatedMeetings = [...(client.meetings || []), newM];

    try {
      const updated = await apiFetch<Client>(`/clients/${client._id}`, {
        method: 'PUT',
        body: JSON.stringify({ meetings: updatedMeetings }),
      });
      setClient(updated);
      setIsAddingMeeting(false);
      setMeetingTitle('');
      setMeetingDate('');
      setMeetingLocation('');
      setMeetingNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to schedule meeting');
    }
  };

  // Add Payment
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !paymentTitle.trim() || !paymentAmount) return;

    const amountNum = parseFloat(paymentAmount) || 0;
    const newP: ClientPayment = {
      title: paymentTitle.trim(),
      amount: amountNum,
      invoiceNumber: paymentInvoice.trim(),
      dueDate: paymentDueDate || undefined,
      paidDate: paymentStatus === 'PAID' ? new Date().toISOString() : undefined,
      status: paymentStatus,
    };

    const updatedPayments = [...(client.payments || []), newP];
    const totalPaid = updatedPayments
      .filter((p) => p.status === 'PAID')
      .reduce((s, p) => s + (p.amount || 0), 0);

    try {
      const updated = await apiFetch<Client>(`/clients/${client._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          payments: updatedPayments,
          paidAmount: totalPaid,
        }),
      });
      setClient(updated);
      setIsAddingPayment(false);
      setPaymentTitle('');
      setPaymentAmount('');
      setPaymentInvoice('');
      setPaymentDueDate('');
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    }
  };

  // Add Link (Google Docs agreement, SOW, Figma, etc.)
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !linkTitle.trim() || !linkUrl.trim()) return;

    let formattedUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newL: ResourceLink = {
      title: linkTitle.trim(),
      url: formattedUrl,
      category: linkCategory,
    };

    const updatedLinks = [...(client.links || []), newL];

    try {
      const updated = await apiFetch<Client>(`/clients/${client._id}`, {
        method: 'PUT',
        body: JSON.stringify({ links: updatedLinks }),
      });
      setClient(updated);
      setIsAddingLink(false);
      setLinkTitle('');
      setLinkUrl('');
    } catch (err: any) {
      alert(err.message || 'Failed to attach link');
    }
  };

  const handleDeleteLink = async (index: number) => {
    if (!client) return;
    const updatedLinks = (client.links || []).filter((_, idx) => idx !== index);

    try {
      const updated = await apiFetch<Client>(`/clients/${client._id}`, {
        method: 'PUT',
        body: JSON.stringify({ links: updatedLinks }),
      });
      setClient(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to remove link');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-neutral-400 text-xs">
        <span className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mr-2" />
        Loading client profile...
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex-1 p-8 text-center space-y-4">
        <Building2 className="w-12 h-12 text-neutral-600 mx-auto" />
        <h2 className="text-lg font-bold text-white">Client Not Found</h2>
        <p className="text-xs text-neutral-400">The requested client record does not exist or was deleted.</p>
        <Link href="/clients" className="inline-block px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold">
          Return to Clients
        </Link>
      </div>
    );
  }

  const connectedProjects = client.projects || [];
  const totalProjectsBudget = connectedProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const dealVal = (typeof client.dealValue === 'number' && client.dealValue > 0)
    ? client.dealValue
    : totalProjectsBudget;
  const isBudgetFromProjects = (!client.dealValue || client.dealValue === 0) && totalProjectsBudget > 0;
  const paidVal = client.paidAmount || 0;
  const balance = Math.max(0, dealVal - paidVal);
  const paidPercent = dealVal > 0 ? Math.min(100, Math.round((paidVal / dealVal) * 100)) : 0;
  const currencySymbol = client.currency === 'ETB' ? 'ETB ' : (client.currency === 'EUR' ? '€' : (client.currency === 'GBP' ? '£' : '$'));

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title={client.name}
        subtitle="Dedicated Client Account Dashboard"
        actionButton={{
          label: 'Edit Client',
          onClick: () => setIsEditModalOpen(true),
        }}
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Back Link Breadcrumb */}
        <div>
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 text-teal-400" />
            <span>Back to All Clients</span>
          </Link>
        </div>

        {/* Client Hero Card */}
        <div className="p-6 rounded-3xl bg-[#111111] border border-[#222222] shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white font-heading font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-teal-900/30">
                {client.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-heading font-extrabold text-xl text-white tracking-tight">
                    {client.name}
                  </h1>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/30">
                    {client.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Primary Contact: <strong className="text-neutral-200">{client.contactPerson || 'Direct Company'}</strong> • Scope: <span className="text-teal-300 font-medium">{client.serviceInterested}</span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="px-3.5 py-2 rounded-xl border border-[#262626] bg-[#181818] hover:bg-[#222222] text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Client</span>
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

          {/* Contact Strip */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#1e1e1e] text-xs text-neutral-300">
            {client.email && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#171717] border border-[#262626]">
                <Mail className="w-3.5 h-3.5 text-teal-400" /> {client.email}
              </span>
            )}
            {client.phone && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#171717] border border-[#262626]">
                <Phone className="w-3.5 h-3.5 text-teal-400" /> {client.phone}
              </span>
            )}
            {client.notes && (
              <span className="text-xs text-neutral-400 italic">
                Note: {client.notes}
              </span>
            )}
          </div>
        </div>

        {/* Financial Metrics Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#121212] border border-[#222222]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-neutral-400 uppercase font-semibold block">Total Contract / Deal Value</span>
              {isBudgetFromProjects && (
                <span className="text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 font-medium">
                  {connectedProjects.length} Projects Total
                </span>
              )}
            </div>
            <span className="text-xl font-bold font-mono text-white mt-1 block">
              {currencySymbol}{dealVal.toLocaleString()}
            </span>
            {connectedProjects.length > 0 && (
              <div className="text-[11px] text-neutral-400 mt-2 pt-2 border-t border-[#1e1e1e] flex flex-wrap gap-x-2 gap-y-0.5">
                {connectedProjects.map((p, idx) => (
                  <span key={p._id} className="text-neutral-400">
                    <span className="text-neutral-300 font-medium">{p.name}</span>: <span className="text-teal-400 font-mono">{currencySymbol}{(p.budget || 0).toLocaleString()}</span>
                    {idx < connectedProjects.length - 1 ? ' • ' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 rounded-2xl bg-[#121212] border border-[#222222]">
            <span className="text-[11px] text-emerald-400 uppercase font-semibold block">Paid So Far</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
              {currencySymbol}{paidVal.toLocaleString()} ({paidPercent}%)
            </span>
            <div className="w-full bg-[#202020] h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${paidPercent}%` }} />
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#121212] border border-[#222222]">
            <span className="text-[11px] text-amber-400 uppercase font-semibold block">Outstanding Balance</span>
            <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
              {currencySymbol}{balance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Detailed Sections Tabs */}
        <div className="flex items-center gap-2 border-b border-[#222222] pb-3">
          {[
            { id: 'PROJECTS', label: `Connected Projects (${connectedProjects.length})`, icon: FolderKanban },
            { id: 'MEETINGS', label: `Meeting Schedules (${(client.meetings || []).length})`, icon: Calendar },
            { id: 'PAYMENTS', label: `Payment Milestones (${(client.payments || []).length})`, icon: Receipt },
            { id: 'LINKS', label: `Agreements & Links (${(client.links || []).length})`, icon: LinkIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                  activeTab === tab.id
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                    : 'bg-[#121212] text-neutral-400 hover:text-white border border-[#222222]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: CONNECTED PROJECTS (1 Client can have 2 or more projects) */}
        {activeTab === 'PROJECTS' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-heading text-sm font-bold text-white">
                  Active Projects for {client.name}
                </h3>
                <p className="text-xs text-neutral-400">
                  Clients can run multiple simultaneous projects with RHIZAN, each with its own budget/pricing.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-[#262626] bg-[#181818] hover:bg-[#222222] text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-teal-400" />
                  <span>Link Existing</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateProjectModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium flex items-center gap-1.5 transition shadow-sm shadow-teal-900/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Create Project</span>
                </button>
              </div>
            </div>

            {connectedProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connectedProjects.map((proj) => (
                  <div
                    key={proj._id}
                    className="p-5 rounded-2xl bg-[#121212] border border-[#222222] hover:border-teal-500/40 transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-heading font-bold text-sm text-white">
                          {proj.name}
                        </h4>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                          {proj.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {proj.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-[#1e1e1e]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400">Delivery Progress</span>
                        <span className="font-mono text-teal-400 font-bold">{proj.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-[#202020] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-400 h-full rounded-full" style={{ width: `${proj.progress || 0}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 text-neutral-400">
                      <span>Project Price: <strong className="text-teal-300 font-mono">{currencySymbol}{proj.budget ? proj.budget.toLocaleString() : '0'}</strong></span>
                      <Link
                        href={`/projects/${proj._id}`}
                        className="text-teal-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>Open Project Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#121212] border border-dashed border-[#262626] text-center space-y-2">
                <FolderKanban className="w-10 h-10 text-neutral-600 mx-auto" />
                <h4 className="text-xs font-bold text-white">No Projects Connected</h4>
                <p className="text-xs text-neutral-400">Create a new project with its own price or link an existing one.</p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateProjectModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium"
                  >
                    + Create Project
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-xs text-teal-400 hover:underline font-semibold"
                  >
                    Link Existing →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MEETINGS & SCHEDULES */}
        {activeTab === 'MEETINGS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-sm font-bold text-white">
                  Meeting Schedules
                </h3>
                <p className="text-xs text-neutral-400">
                  Track client check-ins, demo reviews, and sprint planning sessions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingMeeting(!isAddingMeeting)}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule Meeting</span>
              </button>
            </div>

            {isAddingMeeting && (
              <form onSubmit={handleAddMeeting} className="p-4 rounded-2xl bg-[#151515] border border-teal-500/30 space-y-3">
                <h4 className="text-xs font-bold text-teal-300">Schedule New Client Meeting</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Meeting Title / Topic (e.g. Sprint 2 Feature Demo)"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    required
                    className="md:col-span-2 w-full bg-[#101010] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                  />
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    required
                    className="w-full bg-[#101010] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                  />
                  <input
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full bg-[#101010] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                  />
                  <input
                    type="text"
                    placeholder="Location or Video Link (Google Meet / Zoom / Office)"
                    value={meetingLocation}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                    className="md:col-span-2 w-full bg-[#101010] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingMeeting(false)}
                    className="px-3.5 py-1.5 rounded-xl text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium"
                  >
                    Save Meeting
                  </button>
                </div>
              </form>
            )}

            {(client.meetings || []).length > 0 ? (
              <div className="space-y-2.5">
                {client.meetings!.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#121212] border border-[#222222] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-xs font-bold text-white">{m.title}</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                          {m.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 mt-1">
                        <span className="flex items-center gap-1 text-teal-400">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          {new Date(m.date).toLocaleDateString()} {m.time ? `@ ${m.time}` : ''}
                        </span>
                        {m.linkOrLocation && <span>• {m.linkOrLocation}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 italic p-8 text-center bg-[#121212] rounded-2xl border border-[#222222]">
                No meetings scheduled with this client yet.
              </p>
            )}
          </div>
        )}

        {/* TAB 3: PAYMENTS & MILESTONES */}
        {activeTab === 'PAYMENTS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-sm font-bold text-white">
                  Payment Milestones & Invoicing
                </h3>
                <p className="text-xs text-neutral-400">
                  Track advance deposits, milestone disbursements, and invoices.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingPayment(!isAddingPayment)}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Payment Milestone</span>
              </button>
            </div>

            {isAddingPayment && (
              <form onSubmit={handleAddPayment} className="p-4 rounded-2xl bg-[#151515] border border-teal-500/30 space-y-3">
                <h4 className="text-xs font-bold text-teal-300">Add Payment Milestone</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Milestone Description (e.g. 50% Contract Advance)"
                    value={paymentTitle}
                    onChange={(e) => setPaymentTitle(e.target.value)}
                    required
                    className="md:col-span-2 w-full bg-[#101010] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                  />
                  <input
                    type="number"
                    placeholder="Amount ($)"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                    className="w-full bg-[#101010] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                  />
                  <input
                    type="text"
                    placeholder="Invoice Number (e.g. INV-2026-001)"
                    value={paymentInvoice}
                    onChange={(e) => setPaymentInvoice(e.target.value)}
                    className="w-full bg-[#101010] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                  />
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full bg-[#101010] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid / Received</option>
                    <option value="OVERDUE">Overdue</option>
                  </select>
                  <input
                    type="date"
                    value={paymentDueDate}
                    onChange={(e) => setPaymentDueDate(e.target.value)}
                    className="w-full bg-[#101010] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingPayment(false)}
                    className="px-3.5 py-1.5 rounded-xl text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium"
                  >
                    Save Milestone
                  </button>
                </div>
              </form>
            )}

            {(client.payments || []).length > 0 ? (
              <div className="space-y-2.5">
                {client.payments!.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#121212] border border-[#222222] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-xs font-bold text-white">{p.title}</span>
                        {p.invoiceNumber && (
                          <span className="text-[10px] text-neutral-500 font-mono">#{p.invoiceNumber}</span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">
                        {p.dueDate ? `Due by ${new Date(p.dueDate).toLocaleDateString()}` : 'Scheduled milestone'}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-white">
                        ${(p.amount || 0).toLocaleString()}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        p.status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : p.status === 'OVERDUE'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 italic p-8 text-center bg-[#121212] rounded-2xl border border-[#222222]">
                No payment milestones recorded yet.
              </p>
            )}
          </div>
        )}

        {/* TAB 4: AGREEMENTS & DOCUMENT LINKS (Google Docs, Contracts, Figma) */}
        {activeTab === 'LINKS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-sm font-bold text-white">
                  Client Agreements & Resource Links
                </h3>
                <p className="text-xs text-neutral-400">
                  Attach Google Docs agreements, signed contracts, design links, and shared drives.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingLink(!isAddingLink)}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Attach Link / Agreement</span>
              </button>
            </div>

            {isAddingLink && (
              <form onSubmit={handleAddLink} className="p-4 rounded-2xl bg-[#151515] border border-teal-500/30 space-y-3">
                <h4 className="text-xs font-bold text-teal-300">Add Agreement / Resource Link</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Link Title (e.g. Master Services Agreement / Google Doc)"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    required
                    className="md:col-span-2 w-full bg-[#101010] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                  />
                  <input
                    type="text"
                    placeholder="URL (e.g. https://docs.google.com/document/d/... or Figma)"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    required
                    className="w-full bg-[#101010] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                  />
                  <select
                    value={linkCategory}
                    onChange={(e) => setLinkCategory(e.target.value)}
                    className="w-full bg-[#101010] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                  >
                    <option value="CONTRACT">Legal Agreement / Contract</option>
                    <option value="DOCS">Google Doc / SOW</option>
                    <option value="DESIGN">Design Mockup / Figma</option>
                    <option value="DRIVE">Google Drive Assets</option>
                    <option value="OTHER">Other Resource</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingLink(false)}
                    className="px-3.5 py-1.5 rounded-xl text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium"
                  >
                    Save Link
                  </button>
                </div>
              </form>
            )}

            {(client.links || []).length > 0 ? (
              <div className="space-y-2.5">
                {client.links!.map((l, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#121212] border border-[#222222] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#1c1c1c] text-teal-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading text-xs font-bold text-white">{l.title}</span>
                          <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-semibold">
                            {l.category || 'DOCUMENT'}
                          </span>
                        </div>
                        <span className="text-xs text-neutral-500 truncate block max-w-md mt-0.5">
                          {l.url}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-[#1c1c1c] hover:bg-[#262626] text-teal-400 transition"
                        title="Open external link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteLink(idx)}
                        className="p-2 rounded-xl hover:bg-rose-500/10 text-neutral-500 hover:text-rose-400 transition"
                        title="Delete link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 italic p-8 text-center bg-[#121212] rounded-2xl border border-[#222222]">
                No agreements or external document links added. Click &apos;Attach Link / Agreement&apos; above.
              </p>
            )}
          </div>
        )}
      </div>

      {/* CREATE NEW PROJECT MODAL */}
      <Modal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        title={`Create New Project for ${client.name}`}
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Project Name *</label>
            <input
              type="text"
              placeholder="e.g. Mobile App V2, Loyalty Portal"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              required
              className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Project Price / Budget ({currencySymbol.trim()}) *
              </label>
              <input
                type="number"
                placeholder="e.g. 3500"
                value={newProjectBudget}
                onChange={(e) => setNewProjectBudget(e.target.value)}
                required
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Status</label>
              <select
                value={newProjectStatus}
                onChange={(e) => setNewProjectStatus(e.target.value as any)}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="PLANNING">Planning</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Under Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Target Deadline</label>
            <input
              type="date"
              value={newProjectDeadline}
              onChange={(e) => setNewProjectDeadline(e.target.value)}
              className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Description / Deliverables Scope</label>
            <textarea
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              rows={3}
              placeholder="Key project goals, specifications, or deliverables..."
              className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateProjectModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingProject}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-medium text-xs shadow-md shadow-teal-900/30 flex items-center gap-1.5"
            >
              {creatingProject ? 'Creating...' : '+ Create & Link Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT CLIENT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Client Details"
      >
        <form onSubmit={handleUpdateClient} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Company / Client Name *</label>
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
              <label className="block text-xs font-medium text-neutral-300 mb-1">Contact Person</label>
              <input
                type="text"
                value={formContactPerson}
                onChange={(e) => setFormContactPerson(e.target.value)}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="ACTIVE">Active Deal Client</option>
                <option value="PROPOSAL">Proposal Stage</option>
                <option value="MEETING">Meeting Stage</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Email</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Phone</label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Currency</label>
              <select
                value={formCurrency}
                onChange={(e) => setFormCurrency(e.target.value)}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="ETB">ETB (ETB)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-neutral-300">Deal Value</label>
                {totalProjectsBudget > 0 && (
                  <button
                    type="button"
                    onClick={() => setFormDealValue(totalProjectsBudget.toString())}
                    className="text-[10px] text-teal-400 hover:underline"
                    title="Copy sum of all project budgets"
                  >
                    Sum ({totalProjectsBudget.toLocaleString()})
                  </button>
                )}
              </div>
              <input
                type="number"
                value={formDealValue}
                onChange={(e) => setFormDealValue(e.target.value)}
                placeholder={totalProjectsBudget > 0 ? `Projects: ${totalProjectsBudget}` : '0'}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Paid Amount</label>
              <input
                type="number"
                value={formPaidAmount}
                onChange={(e) => setFormPaidAmount(e.target.value)}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Link Projects */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Connected Projects (Can select multiple projects)
            </label>
            <div className="max-h-36 overflow-y-auto p-2 rounded-xl bg-[#181818] border border-[#262626] space-y-1">
              {availableProjects.map((p) => {
                const isSelected = selectedProjectIds.includes(p._id);
                return (
                  <label key={p._id} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#202020] cursor-pointer text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) {
                            setSelectedProjectIds(selectedProjectIds.filter((id) => id !== p._id));
                          } else {
                            setSelectedProjectIds([...selectedProjectIds, p._id]);
                          }
                        }}
                        className="accent-teal-500"
                      />
                      <span className="text-white font-medium">{p.name}</span>
                      <span className="text-[10px] text-neutral-500">({p.status})</span>
                    </div>
                    {p.budget ? (
                      <span className="font-mono text-teal-400 text-[11px] font-semibold">
                        {currencySymbol}{p.budget.toLocaleString()}
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Notes</label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
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
        title="Delete Client Record"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-300 leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-white">{client.name}</strong>?
            This will remove all meetings, payment records, and unbind all connected projects.
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
              onClick={handleDeleteClient}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-950/30"
            >
              Yes, Delete Client
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
