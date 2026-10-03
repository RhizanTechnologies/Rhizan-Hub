'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Modal } from '@/components/Modal';
import { Client, ClientStatus, Project, ClientMeeting, ClientPayment, ResourceLink } from '@/types';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import {
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Plus,
  ExternalLink,
  Trash2,
  Edit2,
  FolderKanban,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Link as LinkIcon,
  ChevronRight,
  Receipt,
  Users,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Client Selection for Detail Modal
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [detailTab, setDetailTab] = useState<'PROJECTS' | 'MEETINGS' | 'PAYMENTS' | 'LINKS'>('PROJECTS');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Quick Sub-resource forms inside Detail view
  const [isAddingMeeting, setIsAddingMeeting] = useState(false);
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [newMeetingTime, setNewMeetingTime] = useState('14:00');
  const [newMeetingLocation, setNewMeetingLocation] = useState('');
  const [newMeetingNotes, setNewMeetingNotes] = useState('');

  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPaymentTitle, setNewPaymentTitle] = useState('');
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [newPaymentDueDate, setNewPaymentDueDate] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState<'PAID' | 'PENDING' | 'OVERDUE'>('PENDING');
  const [newPaymentInvoice, setNewPaymentInvoice] = useState('');

  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkCategory, setNewLinkCategory] = useState('CONTRACT');

  // Form State for Create / Edit
  const [formName, setFormName] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState<ClientStatus>('ACTIVE');
  const [formService, setFormService] = useState('Custom Software / ERP');
  const [formDealValue, setFormDealValue] = useState('');
  const [formPaidAmount, setFormPaidAmount] = useState('');
  const [formCurrency, setFormCurrency] = useState('USD');
  const [formNotes, setFormNotes] = useState('');
  const [formSelectedProjectIds, setFormSelectedProjectIds] = useState<string[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientsData, projectsData] = await Promise.all([
        apiFetch<Client[]>('/clients'),
        apiFetch<Project[]>('/projects'),
      ]);

      if (clientsData) setClients(clientsData);
      if (projectsData) setAvailableProjects(projectsData);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setFormName('');
    setFormContactPerson('');
    setFormEmail('');
    setFormPhone('');
    setFormStatus('ACTIVE');
    setFormService('Custom Software / ERP');
    setFormDealValue('');
    setFormPaidAmount('');
    setFormCurrency('USD');
    setFormNotes('');
    setFormSelectedProjectIds([]);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setFormName(client.name);
    setFormContactPerson(client.contactPerson || '');
    setFormEmail(client.email || '');
    setFormPhone(client.phone || '');
    setFormStatus(client.status);
    setFormService(client.serviceInterested || '');
    setFormDealValue(client.dealValue?.toString() || '');
    setFormPaidAmount(client.paidAmount?.toString() || '');
    setFormCurrency(client.currency || 'USD');
    setFormNotes(client.notes || '');
    setFormSelectedProjectIds((client.projects || []).map((p) => p._id));
    setIsEditModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const payload = {
      name: formName.trim(),
      contactPerson: formContactPerson.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      status: formStatus,
      serviceInterested: formService,
      dealValue: parseFloat(formDealValue) || 0,
      paidAmount: parseFloat(formPaidAmount) || 0,
      currency: formCurrency,
      notes: formNotes,
      projects: formSelectedProjectIds,
    };

    try {
      if (isEditModalOpen && selectedClient) {
        const updated = await apiFetch<Client>(`/clients/${selectedClient._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setClients((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
        setSelectedClient(updated);
        setIsEditModalOpen(false);
      } else {
        const created = await apiFetch<Client>('/clients', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setClients((prev) => [created, ...prev]);
        setIsCreateModalOpen(false);
        setSelectedClient(created);
      }
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error saving client');
    }
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    try {
      await apiFetch(`/clients/${clientToDelete._id}`, { method: 'DELETE' });
      setClients((prev) => prev.filter((c) => c._id !== clientToDelete._id));
      if (selectedClient?._id === clientToDelete._id) {
        setSelectedClient(null);
      }
      setClientToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Error deleting client');
    }
  };

  // Sub-resource Handlers
  const handleAddMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newMeetingTitle.trim() || !newMeetingDate) return;

    const meeting: ClientMeeting = {
      title: newMeetingTitle.trim(),
      date: newMeetingDate,
      time: newMeetingTime,
      linkOrLocation: newMeetingLocation.trim(),
      status: 'SCHEDULED',
      notes: newMeetingNotes.trim(),
    };

    const updatedMeetings = [...(selectedClient.meetings || []), meeting];

    try {
      const updated = await apiFetch<Client>(`/clients/${selectedClient._id}`, {
        method: 'PUT',
        body: JSON.stringify({ meetings: updatedMeetings }),
      });
      setSelectedClient(updated);
      setClients((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      setIsAddingMeeting(false);
      setNewMeetingTitle('');
      setNewMeetingDate('');
      setNewMeetingLocation('');
      setNewMeetingNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to add meeting');
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newPaymentTitle.trim() || !newPaymentAmount) return;

    const amountNum = parseFloat(newPaymentAmount) || 0;
    const payment: ClientPayment = {
      title: newPaymentTitle.trim(),
      amount: amountNum,
      invoiceNumber: newPaymentInvoice.trim(),
      dueDate: newPaymentDueDate || undefined,
      paidDate: newPaymentStatus === 'PAID' ? new Date().toISOString() : undefined,
      status: newPaymentStatus,
    };

    const updatedPayments = [...(selectedClient.payments || []), payment];
    // Recalculate paid amount
    const totalPaid = updatedPayments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    try {
      const updated = await apiFetch<Client>(`/clients/${selectedClient._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          payments: updatedPayments,
          paidAmount: totalPaid,
        }),
      });
      setSelectedClient(updated);
      setClients((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      setIsAddingPayment(false);
      setNewPaymentTitle('');
      setNewPaymentAmount('');
      setNewPaymentInvoice('');
      setNewPaymentDueDate('');
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newLinkTitle.trim() || !newLinkUrl.trim()) return;

    let formattedUrl = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const link: ResourceLink = {
      title: newLinkTitle.trim(),
      url: formattedUrl,
      category: newLinkCategory,
    };

    const updatedLinks = [...(selectedClient.links || []), link];

    try {
      const updated = await apiFetch<Client>(`/clients/${selectedClient._id}`, {
        method: 'PUT',
        body: JSON.stringify({ links: updatedLinks }),
      });
      setSelectedClient(updated);
      setClients((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      setIsAddingLink(false);
      setNewLinkTitle('');
      setNewLinkUrl('');
    } catch (err: any) {
      alert(err.message || 'Failed to add link');
    }
  };

  const handleDeleteLink = async (linkIndex: number) => {
    if (!selectedClient) return;
    const updatedLinks = (selectedClient.links || []).filter((_, idx) => idx !== linkIndex);

    try {
      const updated = await apiFetch<Client>(`/clients/${selectedClient._id}`, {
        method: 'PUT',
        body: JSON.stringify({ links: updatedLinks }),
      });
      setSelectedClient(updated);
      setClients((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    } catch (err: any) {
      alert(err.message || 'Failed to delete link');
    }
  };

  const activeClients = clients.filter(
    (c) => c.status === 'ACTIVE' || c.status === 'COMPLETED' || c.dealValue! > 0
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Clients & Accounts"
        subtitle="Manage client partnerships, contracts, project linkages, payments, and meeting schedules"
        actionButton={{
          label: 'Create Client Account',
          onClick: openCreateModal,
        }}
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-5 sm:space-y-6">
        {/* Navigation & Status Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-sm text-white">Client Accounts ({clients.length})</h2>
              <p className="text-[11px] text-neutral-400">Contracted partners, deal values, and scheduled meetings</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-neutral-400">
              Total Contracted: <span className="font-bold text-white font-mono">${clients.reduce((s, c) => s + (c.dealValue || 0), 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Client Accounts Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clients.map((client) => {
            const totalVal = client.dealValue || 0;
            const paidVal = client.paidAmount || 0;
            const pendingVal = Math.max(0, totalVal - paidVal);
            const paidPercent = totalVal > 0 ? Math.min(100, Math.round((paidVal / totalVal) * 100)) : 0;
            const linkedProjects = client.projects || [];
            const meetingsCount = client.meetings?.length || 0;

            return (
              <div
                key={client._id}
                onClick={() => router.push(`/clients/${client._id}`)}
                className="bg-[#121212] border border-[#222222] hover:border-teal-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl hover:shadow-teal-950/20 group flex flex-col justify-between"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-heading font-bold text-base text-white group-hover:text-teal-300 transition flex items-center gap-1.5">
                        {client.name}
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-teal-400" />
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">{client.contactPerson || 'Direct Client'}</p>
                    </div>

                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                      client.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                    }`}>
                      {client.status}
                    </span>
                  </div>

                  {/* Contact Pills */}
                  <div className="flex flex-wrap gap-2 text-[11px] text-neutral-400 mb-4">
                    {client.email && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#181818] border border-[#262626]">
                        <Mail className="w-3 h-3 text-neutral-500" /> {client.email}
                      </span>
                    )}
                    {client.phone && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#181818] border border-[#262626]">
                        <Phone className="w-3 h-3 text-neutral-500" /> {client.phone}
                      </span>
                    )}
                  </div>

                  {/* Linked Projects Section */}
                  <div className="mb-4 p-3 rounded-xl bg-[#171717] border border-[#242424]">
                    <div className="text-[11px] font-semibold text-neutral-300 flex items-center justify-between mb-2">
                      <span className="flex items-center gap-1.5">
                        <FolderKanban className="w-3.5 h-3.5 text-teal-400" /> Linked Projects
                      </span>
                      <span className="text-[10px] text-teal-400 font-bold">{linkedProjects.length}</span>
                    </div>

                    {linkedProjects.length > 0 ? (
                      <div className="space-y-1.5">
                        {linkedProjects.slice(0, 3).map((p) => (
                          <div key={p._id} className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-200 font-medium truncate pr-2">{p.name}</span>
                            <span className="text-[10px] text-teal-400 font-mono">{p.progress || 0}%</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-neutral-500 italic">No linked projects yet</p>
                    )}
                  </div>

                  {/* Financial Summary */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Payment Status ({paidPercent}%)</span>
                      <span className="font-semibold text-white">
                        ${paidVal.toLocaleString()} / <span className="text-neutral-400">${totalVal.toLocaleString()}</span>
                      </span>
                    </div>
                    <div className="w-full bg-[#242424] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${paidPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-[#1f1f1f] flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-teal-400" />
                    {meetingsCount} Scheduled Meetings
                  </span>
                  <span className="text-teal-400 font-medium group-hover:underline">
                    View Profile & Details →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CLIENT DETAIL MODAL / DRAWER */}
      <Modal
        isOpen={Boolean(selectedClient)}
        onClose={() => setSelectedClient(null)}
        title={selectedClient?.name || 'Client Details'}
      >
        {selectedClient && (
          <div className="space-y-5">
            {/* Top Overview & Action Buttons */}
            <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-base font-bold text-white">{selectedClient.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    {selectedClient.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 mt-1.5">
                  <span>Contact: <strong className="text-neutral-200">{selectedClient.contactPerson || 'N/A'}</strong></span>
                  {selectedClient.email && <span>• {selectedClient.email}</span>}
                  {selectedClient.phone && <span>• {selectedClient.phone}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openEditModal(selectedClient)}
                  className="px-3 py-1.5 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] hover:bg-[#222222] text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Client</span>
                </button>
                <button
                  type="button"
                  onClick={() => setClientToDelete(selectedClient)}
                  className="px-3 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#161616] border border-[#262626]">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Total Deal Value</span>
                <span className="text-base font-bold text-white font-mono mt-0.5 block">
                  ${(selectedClient.dealValue || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#161616] border border-[#262626]">
                <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Paid Amount</span>
                <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block">
                  ${(selectedClient.paidAmount || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#161616] border border-[#262626]">
                <span className="text-[10px] text-amber-400 uppercase font-semibold block">Balance Outstanding</span>
                <span className="text-base font-bold text-amber-400 font-mono mt-0.5 block">
                  ${Math.max(0, (selectedClient.dealValue || 0) - (selectedClient.paidAmount || 0)).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Detail Tabs */}
            <div className="flex items-center gap-1 border-b border-[#222222] pb-2">
              {[
                { id: 'PROJECTS', label: `Projects (${(selectedClient.projects || []).length})`, icon: FolderKanban },
                { id: 'MEETINGS', label: `Meetings (${(selectedClient.meetings || []).length})`, icon: Calendar },
                { id: 'PAYMENTS', label: `Payments & Invoices (${(selectedClient.payments || []).length})`, icon: Receipt },
                { id: 'LINKS', label: `Agreements & Links (${(selectedClient.links || []).length})`, icon: LinkIcon },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setDetailTab(t.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                      detailTab === t.id
                        ? 'bg-teal-600 text-white'
                        : 'text-neutral-400 hover:text-white hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: PROJECTS */}
            {detailTab === 'PROJECTS' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300">
                    Linked Projects (1 client can have multiple projects)
                  </span>
                  <button
                    type="button"
                    onClick={() => openEditModal(selectedClient)}
                    className="text-xs text-teal-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Link or Assign Project
                  </button>
                </div>

                {(selectedClient.projects || []).length > 0 ? (
                  <div className="space-y-2">
                    {selectedClient.projects!.map((proj) => (
                      <div
                        key={proj._id}
                        className="p-3 rounded-xl bg-[#161616] border border-[#262626] flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-heading text-xs font-bold text-white">{proj.name}</h4>
                          <p className="text-[11px] text-neutral-400">
                            Status: <span className="text-teal-400">{proj.status}</span> • Budget: ${proj.budget?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-teal-400">{proj.progress || 0}%</span>
                            <div className="w-20 bg-[#262626] h-1.5 rounded-full overflow-hidden mt-1">
                              <div
                                className="bg-teal-400 h-full rounded-full"
                                style={{ width: `${proj.progress || 0}%` }}
                              />
                            </div>
                          </div>
                          <Link
                            href="/projects"
                            className="p-1.5 rounded-lg bg-[#202020] hover:bg-[#282828] text-neutral-300 hover:text-white transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-[#161616] border border-dashed border-[#282828] text-center">
                    <FolderKanban className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <p className="text-xs text-neutral-400">No projects linked to this client yet.</p>
                    <button
                      type="button"
                      onClick={() => openEditModal(selectedClient)}
                      className="mt-2 text-xs text-teal-400 font-medium hover:underline"
                    >
                      Click here to link an existing project
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: MEETINGS */}
            {detailTab === 'MEETINGS' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300">
                    Meeting Schedules with {selectedClient.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingMeeting(!isAddingMeeting)}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" /> Schedule Meeting
                  </button>
                </div>

                {isAddingMeeting && (
                  <form onSubmit={handleAddMeeting} className="p-3.5 rounded-xl bg-[#181818] border border-teal-500/30 space-y-3">
                    <div className="text-xs font-bold text-teal-300">Schedule New Meeting</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Meeting Title / Purpose (e.g. Scope Alignment)"
                        value={newMeetingTitle}
                        onChange={(e) => setNewMeetingTitle(e.target.value)}
                        required
                        className="col-span-2 w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                      />
                      <input
                        type="date"
                        value={newMeetingDate}
                        onChange={(e) => setNewMeetingDate(e.target.value)}
                        required
                        className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                      />
                      <input
                        type="time"
                        value={newMeetingTime}
                        onChange={(e) => setNewMeetingTime(e.target.value)}
                        className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                      />
                      <input
                        type="text"
                        placeholder="Location or Video Link (Google Meet/Zoom)"
                        value={newMeetingLocation}
                        onChange={(e) => setNewMeetingLocation(e.target.value)}
                        className="col-span-2 w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingMeeting(false)}
                        className="px-3 py-1 rounded-lg text-xs text-neutral-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-lg bg-teal-600 text-white text-xs font-medium"
                      >
                        Save Meeting
                      </button>
                    </div>
                  </form>
                )}

                {(selectedClient.meetings || []).length > 0 ? (
                  <div className="space-y-2">
                    {selectedClient.meetings!.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#161616] border border-[#262626] flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-white">{m.title}</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                              {m.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-neutral-500" />
                              {new Date(m.date).toLocaleDateString()} {m.time ? `@ ${m.time}` : ''}
                            </span>
                            {m.linkOrLocation && <span>• {m.linkOrLocation}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 italic p-4 text-center">No meetings scheduled yet.</p>
                )}
              </div>
            )}

            {/* TAB CONTENT: PAYMENTS */}
            {detailTab === 'PAYMENTS' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300">
                    Payment Milestones & Invoices
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingPayment(!isAddingPayment)}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" /> Record Payment / Milestone
                  </button>
                </div>

                {isAddingPayment && (
                  <form onSubmit={handleAddPayment} className="p-3.5 rounded-xl bg-[#181818] border border-teal-500/30 space-y-3">
                    <div className="text-xs font-bold text-teal-300">Record Payment Milestone</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Milestone Title (e.g. 50% Advance Deposit)"
                        value={newPaymentTitle}
                        onChange={(e) => setNewPaymentTitle(e.target.value)}
                        required
                        className="col-span-2 w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                      />
                      <input
                        type="number"
                        placeholder="Amount ($)"
                        value={newPaymentAmount}
                        onChange={(e) => setNewPaymentAmount(e.target.value)}
                        required
                        className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                      />
                      <input
                        type="text"
                        placeholder="Invoice # (e.g. INV-2026-01)"
                        value={newPaymentInvoice}
                        onChange={(e) => setNewPaymentInvoice(e.target.value)}
                        className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                      />
                      <select
                        value={newPaymentStatus}
                        onChange={(e) => setNewPaymentStatus(e.target.value as any)}
                        className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid / Received</option>
                        <option value="OVERDUE">Overdue</option>
                      </select>
                      <input
                        type="date"
                        placeholder="Due Date"
                        value={newPaymentDueDate}
                        onChange={(e) => setNewPaymentDueDate(e.target.value)}
                        className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingPayment(false)}
                        className="px-3 py-1 rounded-lg text-xs text-neutral-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-lg bg-teal-600 text-white text-xs font-medium"
                      >
                        Save Payment
                      </button>
                    </div>
                  </form>
                )}

                {(selectedClient.payments || []).length > 0 ? (
                  <div className="space-y-2">
                    {selectedClient.payments!.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#161616] border border-[#262626] flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-white">{p.title}</span>
                            {p.invoiceNumber && (
                              <span className="text-[10px] text-neutral-500 font-mono">#{p.invoiceNumber}</span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-0.5">
                            {p.dueDate ? `Due: ${new Date(p.dueDate).toLocaleDateString()}` : 'Flexible milestone'}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-white">
                            ${(p.amount || 0).toLocaleString()}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            p.status === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : p.status === 'OVERDUE'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 italic p-4 text-center">No payment milestones recorded.</p>
                )}
              </div>
            )}

            {/* TAB CONTENT: LINKS & AGREEMENTS */}
            {detailTab === 'LINKS' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300">
                    Agreements, Contracts & External Resources
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingLink(!isAddingLink)}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" /> Add Link / Agreement
                  </button>
                </div>

                {isAddingLink && (
                  <form onSubmit={handleAddLink} className="p-3.5 rounded-xl bg-[#181818] border border-teal-500/30 space-y-3">
                    <div className="text-xs font-bold text-teal-300">Attach Document or Link</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Link Title (e.g. Master Services Agreement / Contract)"
                        value={newLinkTitle}
                        onChange={(e) => setNewLinkTitle(e.target.value)}
                        required
                        className="col-span-2 w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                      />
                      <input
                        type="url"
                        placeholder="URL (e.g. https://drive.google.com/... or Figma link)"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        required
                        className="col-span-2 w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                      />
                      <select
                        value={newLinkCategory}
                        onChange={(e) => setNewLinkCategory(e.target.value)}
                        className="col-span-2 w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                      >
                        <option value="CONTRACT">Contract / Legal Agreement</option>
                        <option value="DESIGN">Design Mockup / Figma</option>
                        <option value="DRIVE">Google Drive Folder</option>
                        <option value="DOCS">Scope of Work / Documentation</option>
                        <option value="INVOICE">Invoice Document</option>
                        <option value="OTHER">Other Resource</option>
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
                        Add Link
                      </button>
                    </div>
                  </form>
                )}

                {(selectedClient.links || []).length > 0 ? (
                  <div className="space-y-2">
                    {selectedClient.links!.map((l, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#161616] border border-[#262626] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-[#202020] text-teal-400">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-white">{l.title}</span>
                              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                                {l.category || 'LINK'}
                              </span>
                            </div>
                            <span className="text-[11px] text-neutral-500 truncate block max-w-sm">
                              {l.url}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={l.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-[#202020] hover:bg-[#282828] text-teal-400 transition"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteLink(idx)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-neutral-500 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 italic p-4 text-center">No agreements or documents attached.</p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* CREATE / EDIT CLIENT MODAL */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? 'Edit Client Account' : 'Create Client That Deals With Us'}
      >
        <form onSubmit={handleSaveClient} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Company / Client Name *
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. ABC Bakery or Horizon Trading"
              required
              className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={formContactPerson}
                onChange={(e) => setFormContactPerson(e.target.value)}
                placeholder="e.g. Dawit Mengistu"
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Account Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              >
                <option value="ACTIVE">Active Deal Client</option>
                <option value="PROPOSAL">Proposal Stage</option>
                <option value="MEETING">Meeting Stage</option>
                <option value="CONTACTED">Contacted</option>
                <option value="LEAD">Lead</option>
                <option value="COMPLETED">Completed Partnership</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="client@company.com"
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+251 91 123 4567"
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              />
            </div>
          </div>

          {/* Deal Value & Paid Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Total Deal / Contract Value ($)
              </label>
              <input
                type="number"
                value={formDealValue}
                onChange={(e) => setFormDealValue(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Amount Paid So Far ($)
              </label>
              <input
                type="number"
                value={formPaidAmount}
                onChange={(e) => setFormPaidAmount(e.target.value)}
                placeholder="e.g. 2500"
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              />
            </div>
          </div>

          {/* Link Projects (One client can have 2 or more projects) */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Link Projects (Select one or more projects)
            </label>
            <div className="max-h-36 overflow-y-auto p-2 rounded-xl bg-[#181818] border border-[#262626] space-y-1.5">
              {availableProjects.map((p) => {
                const isSelected = formSelectedProjectIds.includes(p._id);
                return (
                  <label
                    key={p._id}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#202020] cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) {
                          setFormSelectedProjectIds(formSelectedProjectIds.filter((id) => id !== p._id));
                        } else {
                          setFormSelectedProjectIds([...formSelectedProjectIds, p._id]);
                        }
                      }}
                      className="accent-teal-500"
                    />
                    <span className="text-white font-medium">{p.name}</span>
                    <span className="text-[10px] text-neutral-500">({p.status})</span>
                  </label>
                );
              })}
              {availableProjects.length === 0 && (
                <p className="text-xs text-neutral-500 italic p-1">No projects available to link.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Scope of Work / Service Description
            </label>
            <input
              type="text"
              value={formService}
              onChange={(e) => setFormService(e.target.value)}
              placeholder="e.g. Custom Bakery ERP & Kitchen Display"
              className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Notes & Contract Highlights
            </label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Notes on client requirements, deliverables, or agreements..."
              rows={2}
              className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
            />
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
              {isEditModalOpen ? 'Save Changes' : 'Create Client Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(clientToDelete)}
        onClose={() => setClientToDelete(null)}
        title="Confirm Client Deletion"
      >
        {clientToDelete && (
          <div className="space-y-4">
            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-white">{clientToDelete.name}</span>? 
              This will remove all associated payment milestones and meetings, and unlink any linked projects.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteClient}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-950/30"
              >
                Delete Client
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
