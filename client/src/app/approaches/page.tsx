'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Modal } from '@/components/Modal';
import { Approach, ApproachStatus, ContactChannel, Niche } from '@/types';
import { apiFetch } from '@/lib/api';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Search,
  Sparkles,
  Tag,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Calendar,
  Clock,
  AlertCircle,
  TrendingUp,
  Target,
  Users,
  Eye,
  Settings2,
  Check,
  X,
} from 'lucide-react';
import Link from 'next/link';

const STATUS_CONFIG: Record<ApproachStatus, { label: string; color: string; dot: string }> = {
  PROSPECT: {
    label: 'Prospect',
    color: 'bg-neutral-800 text-neutral-300 border-neutral-700',
    dot: 'bg-neutral-400',
  },
  CONTACTED: {
    label: 'Contacted',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    dot: 'bg-blue-400',
  },
  PITCHED: {
    label: 'Pitched / Demo',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    dot: 'bg-purple-400',
  },
  IN_DISCUSSION: {
    label: 'In Discussion',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400',
  },
  DEAL_WON: {
    label: 'Deal Won (Client)',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  NOT_INTERESTED: {
    label: 'Not Interested',
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    dot: 'bg-rose-400',
  },
};

function formatCleanPhone(raw?: string): string {
  if (!raw) return '';
  return raw.replace(/[^0-9+]/g, '');
}

export default function ApproachesPage() {
  const router = useRouter();
  const [approaches, setApproaches] = useState<Approach[]>([]);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('All Niches');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApproach, setEditingApproach] = useState<Approach | null>(null);
  const [approachToDelete, setApproachToDelete] = useState<Approach | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  // Manage Niches Modal State
  const [isNicheModalOpen, setIsNicheModalOpen] = useState(false);
  const [editingNiche, setEditingNiche] = useState<Niche | null>(null);
  const [nicheNameInput, setNicheNameInput] = useState('');
  const [nicheDescInput, setNicheDescInput] = useState('');
  const [nicheToDelete, setNicheToDelete] = useState<Niche | null>(null);
  const [savingNiche, setSavingNiche] = useState(false);

  // Quick Log Modal
  const [quickLogTarget, setQuickLogTarget] = useState<Approach | null>(null);
  const [quickChannel, setQuickChannel] = useState<ContactChannel>('CALL');
  const [quickDate, setQuickDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [quickNotes, setQuickNotes] = useState('');
  const [quickNextFollowUp, setQuickNextFollowUp] = useState('');
  const [quickUpdateStatus, setQuickUpdateStatus] = useState<ApproachStatus | ''>('');
  const [submittingQuickLog, setSubmittingQuickLog] = useState(false);

  // Form Fields
  const [businessName, setBusinessName] = useState('');
  const [niche, setNiche] = useState('');
  const [inlineNewNiche, setInlineNewNiche] = useState(false);
  const [inlineNicheName, setInlineNicheName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<ApproachStatus>('PROSPECT');
  const [lastContactDate, setLastContactDate] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [approachesData, nichesData] = await Promise.all([
        apiFetch<Approach[]>('/approaches'),
        apiFetch<Niche[]>('/niches'),
      ]);
      if (approachesData) setApproaches(approachesData);
      if (nichesData) setNiches(nichesData);
    } catch (err) {
      console.error('Failed to load outreach data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshNiches = async () => {
    try {
      const data = await apiFetch<Niche[]>('/niches');
      if (data) setNiches(data);
    } catch (err) {
      console.error('Failed to refresh niches:', err);
    }
  };

  // Metric computations
  const metrics = useMemo(() => {
    const total = approaches.length;
    const inProgress = approaches.filter((a) =>
      ['CONTACTED', 'PITCHED', 'IN_DISCUSSION'].includes(a.status)
    ).length;
    const dealsWon = approaches.filter((a) => a.status === 'DEAL_WON').length;
    const needsFollowUp = approaches.filter((a) => {
      if (a.status === 'DEAL_WON' || a.status === 'NOT_INTERESTED') return false;
      if (!a.lastContactDate) return true;
      if (a.nextFollowUpDate) {
        return new Date(a.nextFollowUpDate) <= new Date();
      }
      return false;
    }).length;

    return { total, inProgress, dealsWon, needsFollowUp };
  }, [approaches]);

  const openCreateModal = () => {
    setEditingApproach(null);
    setBusinessName('');
    setNiche(selectedNiche !== 'All Niches' ? selectedNiche : (niches[0]?.name || 'General'));
    setInlineNewNiche(false);
    setInlineNicheName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setLocation('');
    setStatus('PROSPECT');
    setLastContactDate('');
    setNextFollowUpDate('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (appr: Approach) => {
    setEditingApproach(appr);
    setBusinessName(appr.businessName);
    setNiche(appr.niche || (niches[0]?.name || 'General'));
    setInlineNewNiche(false);
    setInlineNicheName('');
    setContactPerson(appr.contactPerson || '');
    setPhone(appr.phone || '');
    setEmail(appr.email || '');
    setLocation(appr.location || '');
    setStatus(appr.status);
    setLastContactDate(appr.lastContactDate ? appr.lastContactDate.split('T')[0] : '');
    setNextFollowUpDate(appr.nextFollowUpDate ? appr.nextFollowUpDate.split('T')[0] : '');
    setNotes(appr.notes || '');
    setIsModalOpen(true);
  };

  // Create inline new niche right inside the approach form
  const handleCreateInlineNiche = async () => {
    if (!inlineNicheName.trim()) return;
    try {
      const created = await apiFetch<Niche>('/niches', {
        method: 'POST',
        body: JSON.stringify({ name: inlineNicheName.trim() }),
      });
      setNiches((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNiche(created.name);
      setInlineNewNiche(false);
      setInlineNicheName('');
    } catch (err: any) {
      alert(err.message || 'Failed to create niche');
    }
  };

  const handleSaveApproach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    let finalNiche = niche;
    if (inlineNewNiche && inlineNicheName.trim()) {
      try {
        const created = await apiFetch<Niche>('/niches', {
          method: 'POST',
          body: JSON.stringify({ name: inlineNicheName.trim() }),
        });
        setNiches((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        finalNiche = created.name;
      } catch (err: any) {
        // if duplicate, use the name
        finalNiche = inlineNicheName.trim();
      }
    }

    const payload = {
      businessName: businessName.trim(),
      niche: finalNiche || 'General',
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      location: location.trim(),
      status,
      lastContactDate: lastContactDate ? new Date(lastContactDate).toISOString() : undefined,
      nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : undefined,
      notes: notes.trim(),
    };

    try {
      if (editingApproach) {
        const updated = await apiFetch<Approach>(`/approaches/${editingApproach._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setApproaches((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));
      } else {
        const created = await apiFetch<Approach>('/approaches', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setApproaches((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save approach record');
    }
  };

  const handleQuickStatusChange = async (appr: Approach, newStatus: ApproachStatus) => {
    try {
      const updated = await apiFetch<Approach>(`/approaches/${appr._id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setApproaches((prev) =>
        prev.map((a) => (a._id === appr._id ? { ...a, status: updated.status } : a))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!approachToDelete) return;
    try {
      await apiFetch(`/approaches/${approachToDelete._id}`, { method: 'DELETE' });
      setApproaches((prev) => prev.filter((a) => a._id !== approachToDelete._id));
      setApproachToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
    }
  };

  const handleConvertToClient = async (approach: Approach) => {
    try {
      setConvertingId(approach._id);
      const res = await apiFetch<{ message: string; client: any; approach: Approach }>(
        `/approaches/${approach._id}/convert`,
        { method: 'POST' }
      );

      setApproaches((prev) => prev.map((a) => (a._id === approach._id ? res.approach : a)));
      router.push(`/clients/${res.client._id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to convert to client');
    } finally {
      setConvertingId(null);
    }
  };

  // Quick Log Modal handlers
  const openQuickLogModal = (appr: Approach) => {
    setQuickLogTarget(appr);
    setQuickChannel('CALL');
    setQuickDate(new Date().toISOString().split('T')[0]);
    setQuickNotes('');
    setQuickNextFollowUp('');
    setQuickUpdateStatus('');
  };

  const handleSaveQuickLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLogTarget || !quickNotes.trim()) return;

    try {
      setSubmittingQuickLog(true);
      const payload: any = {
        channel: quickChannel,
        date: quickDate || new Date().toISOString(),
        notes: quickNotes.trim(),
        nextFollowUpDate: quickNextFollowUp || undefined,
      };

      if (quickUpdateStatus) {
        payload.status = quickUpdateStatus;
      }

      const updated = await apiFetch<Approach>(`/approaches/${quickLogTarget._id}/contact`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setApproaches((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));
      setQuickLogTarget(null);
    } catch (err: any) {
      alert(err.message || 'Failed to log contact interaction');
    } finally {
      setSubmittingQuickLog(false);
    }
  };

  // Manage Niches Handlers
  const openManageNichesModal = () => {
    setEditingNiche(null);
    setNicheNameInput('');
    setNicheDescInput('');
    setNicheToDelete(null);
    setIsNicheModalOpen(true);
  };

  const handleSaveNiche = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicheNameInput.trim()) return;

    try {
      setSavingNiche(true);
      if (editingNiche) {
        const updated = await apiFetch<Niche>(`/niches/${editingNiche._id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: nicheNameInput.trim(),
            description: nicheDescInput.trim(),
          }),
        });
        setNiches((prev) =>
          prev
            .map((n) => (n._id === updated._id ? updated : n))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        // Refresh approaches in case name changed
        const freshApproaches = await apiFetch<Approach[]>('/approaches');
        if (freshApproaches) setApproaches(freshApproaches);
        setEditingNiche(null);
      } else {
        const created = await apiFetch<Niche>('/niches', {
          method: 'POST',
          body: JSON.stringify({
            name: nicheNameInput.trim(),
            description: nicheDescInput.trim(),
          }),
        });
        setNiches((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setNicheNameInput('');
      setNicheDescInput('');
    } catch (err: any) {
      alert(err.message || 'Failed to save niche');
    } finally {
      setSavingNiche(false);
    }
  };

  const handleEditNicheClick = (n: Niche) => {
    setEditingNiche(n);
    setNicheNameInput(n.name);
    setNicheDescInput(n.description || '');
  };

  const cancelEditNiche = () => {
    setEditingNiche(null);
    setNicheNameInput('');
    setNicheDescInput('');
  };

  const handleDeleteNicheConfirm = async () => {
    if (!nicheToDelete) return;
    try {
      await apiFetch(`/niches/${nicheToDelete._id}`, { method: 'DELETE' });
      setNiches((prev) => prev.filter((n) => n._id !== nicheToDelete._id));
      if (selectedNiche === nicheToDelete.name) {
        setSelectedNiche('All Niches');
      }
      setNicheToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete niche');
    }
  };

  // Filter list
  const filteredApproaches = approaches.filter((a) => {
    const matchesNiche = selectedNiche === 'All Niches' || a.niche === selectedNiche;
    const matchesStatus = selectedStatus === 'ALL' || a.status === selectedStatus;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      a.businessName.toLowerCase().includes(query) ||
      (a.location && a.location.toLowerCase().includes(query)) ||
      (a.contactPerson && a.contactPerson.toLowerCase().includes(query)) ||
      (a.notes && a.notes.toLowerCase().includes(query));

    return matchesNiche && matchesStatus && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-16">
      <Header
        title="Business Outreach & Approaches"
        subtitle="Track targeted leads, contact history, and turn outreach prospects into paying clients"
        actionButton={{
          label: 'Add Outreach Target',
          onClick: openCreateModal,
        }}
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* TOP STAT METRIC CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Total Outreach Targets
              </span>
              <span className="text-2xl font-bold font-heading text-white mt-1 block">
                {metrics.total}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
              <Target className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Active Discussions
              </span>
              <span className="text-2xl font-bold font-heading text-amber-400 mt-1 block">
                {metrics.inProgress}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Deals Won (Clients)
              </span>
              <span className="text-2xl font-bold font-heading text-emerald-400 mt-1 block">
                {metrics.dealsWon}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Needs Follow-Up / Contact
              </span>
              <span className="text-2xl font-bold font-heading text-rose-400 mt-1 block">
                {metrics.needsFollowUp}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* CONTROLS: NICHE FILTER, MANAGE NICHES & SEARCH BAR */}
        <div className="space-y-3">
          {/* Niche Filter Pills Bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 flex-1">
              <button
                onClick={() => setSelectedNiche('All Niches')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedNiche === 'All Niches'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                    : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#222222]'
                }`}
              >
                All Niches ({approaches.length})
              </button>
              {niches.map((n) => {
                const count = approaches.filter((a) => a.niche === n.name).length;
                return (
                  <button
                    key={n._id}
                    onClick={() => setSelectedNiche(n.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                      selectedNiche === n.name
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                        : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#222222]'
                    }`}
                  >
                    <span>{n.name}</span>
                    {count > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-neutral-300">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Manage Niches Trigger Button */}
            <button
              onClick={openManageNichesModal}
              className="px-3 py-1.5 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] text-neutral-300 hover:text-white border border-[#222222] text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
              title="Add, edit or delete industry niches"
            >
              <Settings2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Manage Niches</span>
            </button>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-medium">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-[#141414] border border-[#262626] rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-teal-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PROSPECT">Prospect</option>
                <option value="CONTACTED">Contacted</option>
                <option value="PITCHED">Pitched / Demo Sent</option>
                <option value="IN_DISCUSSION">In Discussion</option>
                <option value="DEAL_WON">Deal Won (Client)</option>
                <option value="NOT_INTERESTED">Not Interested</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search business, contact, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#141414] border border-[#262626] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* APPROACHES TABLE */}
        <div className="bg-[#111111] border border-[#222222] rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#222222] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-heading text-xs font-bold text-white uppercase tracking-wider">
                Approached Businesses Pipeline
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1a1a] text-neutral-400 border border-[#282828] font-mono">
                {filteredApproaches.length} targets
              </span>
            </div>
            <span className="text-[11px] text-neutral-500 hidden sm:inline">
              Click any row to view full details, history & actions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1f1f1f] bg-[#141414]/80 text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Business Name</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Niche / Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Outreach Status</th>
                  <th className="py-3 px-4">Last Contact Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c1c1c]">
                {filteredApproaches.map((appr) => {
                  const statusConf = STATUS_CONFIG[appr.status] || STATUS_CONFIG.PROSPECT;
                  const cleanPhone = formatCleanPhone(appr.phone);

                  return (
                    <tr
                      key={appr._id}
                      onClick={() => router.push(`/approaches/${appr._id}`)}
                      className="hover:bg-[#181818] transition group cursor-pointer"
                    >
                      {/* Business Name */}
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#202020] group-hover:bg-teal-500/15 group-hover:border-teal-500/30 border border-[#2a2a2a] text-teal-400 font-bold flex items-center justify-center shrink-0 transition">
                            {appr.businessName.charAt(0).toUpperCase()}
                          </div>
                          <div className="truncate max-w-[190px]">
                            <span className="block truncate font-heading font-medium text-white group-hover:text-teal-400 transition">
                              {appr.businessName}
                            </span>
                            {appr.contactHistory && appr.contactHistory.length > 0 && (
                              <span className="text-[10px] text-neutral-500 font-normal">
                                {appr.contactHistory.length} interaction{appr.contactHistory.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Person */}
                      <td className="py-3.5 px-4 text-neutral-300 font-medium">
                        {appr.contactPerson ? (
                          <span>{appr.contactPerson}</span>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </td>

                      {/* Niche / Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-medium">
                          <Tag className="w-2.5 h-2.5" />
                          {appr.niche}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-neutral-400">
                        {appr.location ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-neutral-500" />
                            {appr.location}
                          </span>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </td>

                      {/* Contact Info (WhatsApp & Phone & Email) */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          {appr.phone ? (
                            <div className="flex items-center gap-1.5 text-neutral-300">
                              <span className="font-mono text-[11px]">{appr.phone}</span>
                              <a
                                href={`tel:${cleanPhone}`}
                                className="p-0.5 rounded text-neutral-400 hover:text-white"
                                title="Call"
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-1.5 py-0.2 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-[9px] font-semibold flex items-center gap-0.5"
                                  title="WhatsApp"
                                >
                                  <MessageCircle className="w-2.5 h-2.5" />
                                  <span>WA</span>
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-neutral-600">—</span>
                          )}
                          {appr.email && (
                            <a
                              href={`mailto:${appr.email}`}
                              className="text-[11px] text-neutral-400 hover:text-teal-400 flex items-center gap-1"
                            >
                              <Mail className="w-2.5 h-2.5" /> {appr.email}
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Outreach Status with Quick Switcher */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <select
                            value={appr.status}
                            onChange={(e) =>
                              handleQuickStatusChange(appr, e.target.value as ApproachStatus)
                            }
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border outline-none cursor-pointer ${statusConf.color}`}
                          >
                            <option value="PROSPECT">Prospect</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="PITCHED">Pitched / Demo</option>
                            <option value="IN_DISCUSSION">In Discussion</option>
                            <option value="DEAL_WON">Deal Won (Client)</option>
                            <option value="NOT_INTERESTED">Not Interested</option>
                          </select>
                        </div>
                      </td>

                      {/* Last Contact Date */}
                      <td className="py-3.5 px-4">
                        {appr.lastContactDate ? (
                          <div className="space-y-0.5">
                            <span className="text-neutral-200 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3 text-neutral-500" />
                              {new Date(appr.lastContactDate).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                            {appr.nextFollowUpDate && (
                              <span className="text-[10px] text-amber-400 flex items-center gap-1">
                                Follow-up:{' '}
                                {new Date(appr.nextFollowUpDate).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-amber-500/80 font-medium text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Never Contacted
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredApproaches.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-neutral-500">
                      <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-xs">No outreach targets found matching your filter.</p>
                      <button
                        type="button"
                        onClick={openCreateModal}
                        className="mt-2 text-xs text-teal-400 font-semibold hover:underline"
                      >
                        + Add First Target
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT APPROACH MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingApproach ? 'Edit Outreach Target' : 'Add Target Business to Approach'}
      >
        <form onSubmit={handleSaveApproach} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Business Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mama Bakery & Pastry"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-neutral-300">
                  Niche / Category *
                </label>
                <button
                  type="button"
                  onClick={() => setInlineNewNiche(!inlineNewNiche)}
                  className="text-[10px] text-teal-400 hover:underline"
                >
                  {inlineNewNiche ? 'Select Existing' : '+ New Niche'}
                </button>
              </div>

              {inlineNewNiche ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    required
                    placeholder="Enter new niche..."
                    value={inlineNicheName}
                    onChange={(e) => setInlineNicheName(e.target.value)}
                    className="flex-1 bg-[#181818] border border-teal-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleCreateInlineNiche}
                    className="px-2.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold"
                    title="Save Niche to Backend"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                >
                  {niches.map((n) => (
                    <option key={n._id} value={n.name}>
                      {n.name}
                    </option>
                  ))}
                  {niches.length === 0 && <option value="General">General</option>}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Outreach Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApproachStatus)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
              >
                <option value="PROSPECT">Prospect</option>
                <option value="CONTACTED">Contacted</option>
                <option value="PITCHED">Pitched / Demo Sent</option>
                <option value="IN_DISCUSSION">In Discussion</option>
                <option value="DEAL_WON">Deal Won (Client)</option>
                <option value="NOT_INTERESTED">Not Interested</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                placeholder="e.g. Ato Dawit (Manager)"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. +251 911 234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. info@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Bole, Addis Ababa"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Last Contact Date (optional)
              </label>
              <input
                type="date"
                value={lastContactDate}
                onChange={(e) => setLastContactDate(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Next Follow-Up Date (optional)
              </label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Notes & What to Remember
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Wants POS and multi-store inventory. Budget around 150k ETB. Prefers WhatsApp communication."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-teal-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222222]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] text-neutral-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition shadow-md shadow-teal-900/30"
            >
              {editingApproach ? 'Save Changes' : 'Create Outreach Target'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MANAGE NICHES MODAL */}
      <Modal
        isOpen={isNicheModalOpen}
        onClose={() => setIsNicheModalOpen(false)}
        title="Manage Industry Niches & Categories"
      >
        <div className="space-y-5">
          {/* Add / Edit Form */}
          <form onSubmit={handleSaveNiche} className="bg-[#161616] border border-[#262626] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                {editingNiche ? `Edit Niche: ${editingNiche.name}` : '+ Add New Niche'}
              </span>
              {editingNiche && (
                <button
                  type="button"
                  onClick={cancelEditNiche}
                  className="text-[11px] text-neutral-400 hover:text-white"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  Niche Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pharmacy & Drugstore"
                  value={nicheNameInput}
                  onChange={(e) => setNicheNameInput(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333333] rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Retail pharmacies and medicine distributors"
                  value={nicheDescInput}
                  onChange={(e) => setNicheDescInput(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333333] rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={savingNiche}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition disabled:opacity-50"
              >
                {savingNiche ? 'Saving...' : editingNiche ? 'Update Niche' : 'Add Niche'}
              </button>
            </div>
          </form>

          {/* List of Niches */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Current Niches ({niches.length})
            </span>

            <div className="max-h-64 overflow-y-auto divide-y divide-[#1f1f1f] border border-[#222222] rounded-2xl bg-[#141414]">
              {niches.map((n) => {
                const targetCount = approaches.filter((a) => a.niche === n.name).length;
                return (
                  <div
                    key={n._id}
                    className="p-3 flex items-center justify-between hover:bg-[#181818] transition gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{n.name}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-mono">
                          {targetCount} targets
                        </span>
                      </div>
                      {n.description && (
                        <p className="text-[11px] text-neutral-400 mt-0.5">{n.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditNicheClick(n)}
                        className="p-1.5 rounded-lg hover:bg-[#262626] text-neutral-400 hover:text-white transition"
                        title="Edit Niche"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setNicheToDelete(n)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-neutral-500 hover:text-rose-400 transition"
                        title="Delete Niche"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {niches.length === 0 && (
                <div className="p-6 text-center text-xs text-neutral-500">
                  No niches found. Add one above!
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[#222222]">
            <button
              type="button"
              onClick={() => setIsNicheModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] text-neutral-300 text-xs font-semibold transition"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>

      {/* DELETE NICHE CONFIRM MODAL */}
      <Modal
        isOpen={Boolean(nicheToDelete)}
        onClose={() => setNicheToDelete(null)}
        title="Delete Niche"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-300">
            Are you sure you want to delete the niche <strong className="text-white">{nicheToDelete?.name}</strong>?
            Any existing targets with this niche will remain unchanged.
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222222]">
            <button
              type="button"
              onClick={() => setNicheToDelete(null)}
              className="px-4 py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] text-neutral-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteNicheConfirm}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition shadow-md shadow-rose-900/30"
            >
              Delete Niche
            </button>
          </div>
        </div>
      </Modal>

      {/* QUICK LOG CONTACT MODAL */}
      <Modal
        isOpen={Boolean(quickLogTarget)}
        onClose={() => setQuickLogTarget(null)}
        title={`Quick Log Contact: ${quickLogTarget?.businessName || ''}`}
      >
        <form onSubmit={handleSaveQuickLog} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Channel / Method
              </label>
              <select
                value={quickChannel}
                onChange={(e) => setQuickChannel(e.target.value as ContactChannel)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
              >
                <option value="CALL">Phone Call</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="EMAIL">Email</option>
                <option value="MEETING">In-Person Meeting</option>
                <option value="OTHER">Other / Social Media</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Contact Date
              </label>
              <input
                type="date"
                required
                value={quickDate}
                onChange={(e) => setQuickDate(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Notes / What the client mentioned to remember *
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Called owner, they want a demo next Tuesday. Follow up on Monday."
              value={quickNotes}
              onChange={(e) => setQuickNotes(e.target.value)}
              className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-teal-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Next Follow-up Date (optional)
              </label>
              <input
                type="date"
                value={quickNextFollowUp}
                onChange={(e) => setQuickNextFollowUp(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Update Status To
              </label>
              <select
                value={quickUpdateStatus}
                onChange={(e) => setQuickUpdateStatus(e.target.value as any)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
              >
                <option value="">Keep current ({quickLogTarget?.status})</option>
                <option value="CONTACTED">Contacted</option>
                <option value="PITCHED">Pitched / Demo Sent</option>
                <option value="IN_DISCUSSION">In Discussion</option>
                <option value="DEAL_WON">Deal Won</option>
                <option value="NOT_INTERESTED">Not Interested</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222222]">
            <button
              type="button"
              onClick={() => setQuickLogTarget(null)}
              className="px-4 py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] text-neutral-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingQuickLog}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition shadow-md shadow-teal-900/30 disabled:opacity-50"
            >
              {submittingQuickLog ? 'Saving...' : 'Save Interaction'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(approachToDelete)}
        onClose={() => setApproachToDelete(null)}
        title="Delete Outreach Target"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-300">
            Are you sure you want to delete{' '}
            <strong className="text-white">{approachToDelete?.businessName}</strong>?
            This will remove all associated interaction history.
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222222]">
            <button
              type="button"
              onClick={() => setApproachToDelete(null)}
              className="px-4 py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] text-neutral-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition shadow-md shadow-rose-900/30"
            >
              Delete Target
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
