'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Modal } from '@/components/Modal';
import { Approach, ApproachStatus, ContactChannel, Niche, User } from '@/types';
import { apiFetch } from '@/lib/api';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  ExternalLink,
  MessageCircle,
  Users,
  CheckCircle2,
  Plus,
  Send,
  AlertCircle,
  Tag,
  ChevronDown,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';

const STATUS_CONFIG: Record<ApproachStatus, { label: string; color: string; badge: string }> = {
  PROSPECT: {
    label: 'Prospect',
    color: 'bg-neutral-800 text-neutral-300 border-neutral-700',
    badge: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
  },
  CONTACTED: {
    label: 'Contacted',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  PITCHED: {
    label: 'Pitched / Demo Sent',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  IN_DISCUSSION: {
    label: 'In Discussion',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  DEAL_WON: {
    label: 'Deal Won (Client)',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  NOT_INTERESTED: {
    label: 'Not Interested',
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
};

const CHANNEL_ICONS: Record<ContactChannel, React.ComponentType<{ className?: string }>> = {
  CALL: Phone,
  WHATSAPP: MessageCircle,
  EMAIL: Mail,
  MEETING: Users,
  OTHER: Sparkles,
};

const CHANNEL_COLORS: Record<ContactChannel, { bg: string; text: string; border: string }> = {
  CALL: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  WHATSAPP: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  EMAIL: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  MEETING: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  OTHER: { bg: 'bg-neutral-800', text: 'text-neutral-300', border: 'border-neutral-700' },
};

function formatCleanPhone(raw?: string): string {
  if (!raw) return '';
  return raw.replace(/[^0-9+]/g, '');
}

export default function ApproachDetailPage() {
  const params = useParams();
  const router = useRouter();
  const approachId = params?.id as string;

  const [approach, setApproach] = useState<Approach | null>(null);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & form state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [converting, setConverting] = useState(false);

  // Convert to Client Form State
  const [convertName, setConvertName] = useState('');
  const [convertContactPerson, setConvertContactPerson] = useState('');
  const [convertPhone, setConvertPhone] = useState('');
  const [convertEmail, setConvertEmail] = useState('');
  const [convertService, setConvertService] = useState('');
  const [convertDealValue, setConvertDealValue] = useState('');
  const [convertPaidAmount, setConvertPaidAmount] = useState('0');
  const [convertCurrency, setConvertCurrency] = useState('ETB');
  const [convertAssignedTo, setConvertAssignedTo] = useState('');
  const [convertStatus, setConvertStatus] = useState<string>('ACTIVE');
  const [convertNotes, setConvertNotes] = useState('');

  // Edit form state
  const [formBusinessName, setFormBusinessName] = useState('');
  const [formNiche, setFormNiche] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formStatus, setFormStatus] = useState<ApproachStatus>('PROSPECT');
  const [formNotes, setFormNotes] = useState('');

  // Log contact form state
  const [logChannel, setLogChannel] = useState<ContactChannel>('CALL');
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [logNotes, setLogNotes] = useState('');
  const [logNextFollowUp, setLogNextFollowUp] = useState('');
  const [logUpdateStatus, setLogUpdateStatus] = useState<ApproachStatus | ''>('');
  const [submittingLog, setSubmittingLog] = useState(false);

  const loadApproach = async () => {
    try {
      setLoading(true);
      const [data, nichesData, teamData] = await Promise.all([
        apiFetch<Approach>(`/approaches/${approachId}`),
        apiFetch<Niche[]>('/niches'),
        apiFetch<User[]>('/team'),
      ]);
      if (nichesData) setNiches(nichesData);
      if (teamData) setTeamMembers(teamData);
      if (data) {
        setApproach(data);
        setFormBusinessName(data.businessName);
        setFormNiche(data.niche);
        setFormContactPerson(data.contactPerson || '');
        setFormPhone(data.phone || '');
        setFormEmail(data.email || '');
        setFormLocation(data.location || '');
        setFormStatus(data.status);
        setFormNotes(data.notes || '');
      }
    } catch (err) {
      console.error('Failed to load approach details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (approachId) {
      loadApproach();
    }
  }, [approachId]);

  const handleUpdateApproach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approach) return;

    try {
      const payload = {
        businessName: formBusinessName.trim(),
        niche: formNiche.trim(),
        contactPerson: formContactPerson.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        location: formLocation.trim(),
        status: formStatus,
        notes: formNotes.trim(),
      };

      const updated = await apiFetch<Approach>(`/approaches/${approach._id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setApproach((prev) => (prev ? { ...prev, ...updated } : updated));
      setIsEditModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update approach details');
    }
  };

  const handleQuickStatusChange = async (newStatus: ApproachStatus) => {
    if (!approach) return;
    try {
      const updated = await apiFetch<Approach>(`/approaches/${approach._id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setApproach((prev) => (prev ? { ...prev, status: updated.status } : updated));
      setFormStatus(newStatus);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleAddContactLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approach || !logNotes.trim()) return;

    try {
      setSubmittingLog(true);
      const payload: any = {
        channel: logChannel,
        date: logDate || new Date().toISOString(),
        notes: logNotes.trim(),
        nextFollowUpDate: logNextFollowUp || undefined,
      };

      if (logUpdateStatus) {
        payload.status = logUpdateStatus;
      }

      const updated = await apiFetch<Approach>(`/approaches/${approach._id}/contact`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setApproach(updated);
      setLogNotes('');
      setLogNextFollowUp('');
      setLogUpdateStatus('');
      setIsLogModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to log contact interaction');
    } finally {
      setSubmittingLog(false);
    }
  };

  const openConvertModal = () => {
    if (!approach) return;
    setConvertName(approach.businessName);
    setConvertContactPerson(approach.contactPerson || '');
    setConvertPhone(approach.phone || '');
    setConvertEmail(approach.email || '');
    setConvertService(approach.niche || 'Custom Software');
    setConvertDealValue('');
    setConvertPaidAmount('0');
    setConvertCurrency('ETB');
    setConvertAssignedTo(teamMembers[0]?._id || '');
    setConvertStatus('ACTIVE');
    setConvertNotes(
      approach.notes
        ? `${approach.notes}${approach.location ? `\nLocation: ${approach.location}` : ''}`
        : (approach.location ? `Location: ${approach.location}` : '')
    );
    setIsConvertModalOpen(true);
  };

  const handleConfirmConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approach || !convertName.trim()) return;

    try {
      setConverting(true);
      const payload = {
        name: convertName.trim(),
        contactPerson: convertContactPerson.trim(),
        phone: convertPhone.trim(),
        email: convertEmail.trim(),
        serviceInterested: convertService.trim(),
        dealValue: convertDealValue ? Number(convertDealValue) : 0,
        paidAmount: convertPaidAmount ? Number(convertPaidAmount) : 0,
        currency: convertCurrency,
        assignedTo: convertAssignedTo || undefined,
        status: convertStatus,
        notes: convertNotes.trim(),
      };

      const res = await apiFetch<{ message: string; client: any; approach: Approach }>(
        `/approaches/${approach._id}/convert`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      setApproach(res.approach);
      setIsConvertModalOpen(false);
      router.push(`/clients/${res.client._id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to convert to client');
    } finally {
      setConverting(false);
    }
  };

  const handleDeleteApproach = async () => {
    if (!approach) return;
    try {
      await apiFetch(`/approaches/${approach._id}`, { method: 'DELETE' });
      router.push('/approaches');
    } catch (err: any) {
      alert(err.message || 'Failed to delete target');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-neutral-400 text-sm">
          <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading approach details...</span>
        </div>
      </div>
    );
  }

  if (!approach) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-neutral-400">Outreach target not found.</p>
        <Link
          href="/approaches"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Approaches
        </Link>
      </div>
    );
  }

  const statusConf = STATUS_CONFIG[approach.status] || STATUS_CONFIG.PROSPECT;
  const isDealWon = approach.status === 'DEAL_WON';
  const cleanPhone = formatCleanPhone(approach.phone);
  const contactHistoryList = [...(approach.contactHistory || [])].reverse();

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-16">
      {/* Top Navigation Bar */}
      <div className="border-b border-[#222222] bg-[#0c0c0c] px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/approaches"
              className="p-2 rounded-xl bg-[#141414] hover:bg-[#1a1a1a] text-neutral-400 hover:text-white border border-[#222222] transition shrink-0"
              title="Back to All Approaches"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <h1 className="text-xl font-heading font-bold text-white tracking-tight">
                  {approach.businessName}
                </h1>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${statusConf.color}`}>
                  {statusConf.label}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[11px] font-medium">
                  <Tag className="w-3 h-3" />
                  {approach.niche}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-3">
                {approach.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-neutral-500" />
                    {approach.location}
                  </span>
                )}
                {approach.lastContactDate ? (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-neutral-500" />
                    Last Contacted:{' '}
                    <strong className="text-neutral-200">
                      {new Date(approach.lastContactDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </strong>
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium text-[11px]">⚠️ Not contacted yet</span>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-teal-900/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Contact / Note</span>
            </button>

            {isDealWon ? (
              <Link
                href={
                  approach.convertedClientId
                    ? `/clients/${typeof approach.convertedClientId === 'object' ? approach.convertedClientId._id : approach.convertedClientId}`
                    : '/clients'
                }
                className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <span>View Official Client</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                onClick={openConvertModal}
                disabled={converting}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deal Won → Make Client</span>
              </button>
            )}

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 rounded-xl bg-[#141414] hover:bg-[#1a1a1a] text-neutral-400 hover:text-white border border-[#222222] transition"
              title="Edit Business Details"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-2 rounded-xl bg-[#141414] hover:bg-rose-500/10 text-neutral-400 hover:text-rose-400 border border-[#222222] transition"
              title="Delete Target"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Left 2 Cols: Interaction History & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Status Bar */}
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Current Pipeline Stage
              </span>
              <span className="text-xs text-neutral-300">
                Click any stage to update outreach progress:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {(['PROSPECT', 'CONTACTED', 'PITCHED', 'IN_DISCUSSION', 'DEAL_WON', 'NOT_INTERESTED'] as ApproachStatus[]).map(
                (st) => {
                  const active = approach.status === st;
                  const cfg = STATUS_CONFIG[st];
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleQuickStatusChange(st)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition border ${
                        active
                          ? `${cfg.color} ring-1 ring-white/20`
                          : 'bg-[#181818] text-neutral-400 border-[#262626] hover:text-white'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Contact & History Card */}
          <div className="bg-[#111111] border border-[#222222] rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#222222] pb-4">
              <div>
                <h2 className="text-sm font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-400" />
                  Contact & Interaction History
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Chronological record of calls, meetings, and important client details to remember.
                </p>
              </div>
              <button
                onClick={() => setIsLogModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Contact</span>
              </button>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              {contactHistoryList.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#262626] rounded-2xl bg-[#141414]/40">
                  <Phone className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400 font-medium">No contact interactions logged yet.</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Log your first phone call, meeting, or message to track what the prospect requested.
                  </p>
                  <button
                    onClick={() => setIsLogModalOpen(true)}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold inline-flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log First Contact
                  </button>
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#222222]">
                  {contactHistoryList.map((entry, idx) => {
                    const ChannelIcon = CHANNEL_ICONS[entry.channel] || Sparkles;
                    const channelStyle = CHANNEL_COLORS[entry.channel] || CHANNEL_COLORS.OTHER;
                    const dateFormatted = new Date(entry.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });

                    return (
                      <div key={entry._id || idx} className="relative group">
                        {/* Timeline Marker */}
                        <div
                          className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full flex items-center justify-center border ${channelStyle.bg} ${channelStyle.border} ${channelStyle.text}`}
                        >
                          <ChannelIcon className="w-2.5 h-2.5" />
                        </div>

                        {/* Content Box */}
                        <div className="bg-[#141414] border border-[#222222] group-hover:border-[#333333] rounded-2xl p-4 transition shadow-sm space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1f1f1f] pb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${channelStyle.bg} ${channelStyle.text} ${channelStyle.border}`}
                              >
                                {entry.channel}
                              </span>
                              <span className="text-xs font-semibold text-white">
                                {dateFormatted}
                              </span>
                            </div>
                            {entry.loggedBy && (
                              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                                Logged by <strong className="text-neutral-300 font-medium">{entry.loggedBy.name}</strong>
                              </span>
                            )}
                          </div>

                          {/* Notes / Details to remember */}
                          <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
                            {entry.notes}
                          </p>

                          {/* Follow-up reminder if set */}
                          {entry.nextFollowUpDate && (
                            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
                              <Calendar className="w-3 h-3" />
                              <span>
                                Next Follow-up Set For:{' '}
                                {new Date(entry.nextFollowUpDate).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Profile, Contact Info & General Notes */}
        <div className="space-y-6">
          {/* Contact Details Card */}
          <div className="bg-[#111111] border border-[#222222] rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#222222] pb-3">
              <h2 className="text-xs font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-teal-400" />
                Contact Profile
              </h2>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold"
              >
                Edit
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                  Contact Person
                </span>
                <p className="text-white font-medium">
                  {approach.contactPerson || <span className="text-neutral-600">Not specified</span>}
                </p>
              </div>

              <div>
                <span className="text-neutral-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                  Phone & WhatsApp
                </span>
                {approach.phone ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white font-mono">{approach.phone}</span>
                    <a
                      href={`tel:${cleanPhone}`}
                      className="p-1 rounded-md bg-[#1f1f1f] text-neutral-300 hover:text-white transition"
                      title="Call"
                    >
                      <Phone className="w-3 h-3" />
                    </a>
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-0.5 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1 transition"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="text-neutral-600">No phone provided</span>
                )}
              </div>

              <div>
                <span className="text-neutral-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                  Email
                </span>
                {approach.email ? (
                  <a
                    href={`mailto:${approach.email}`}
                    className="text-teal-400 hover:underline flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" /> {approach.email}
                  </a>
                ) : (
                  <span className="text-neutral-600">No email provided</span>
                )}
              </div>

              <div>
                <span className="text-neutral-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                  Location / Area
                </span>
                <p className="text-neutral-300">
                  {approach.location || <span className="text-neutral-600">Not specified</span>}
                </p>
              </div>

              <div>
                <span className="text-neutral-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                  Next Follow-up Reminder
                </span>
                {approach.nextFollowUpDate ? (
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(approach.nextFollowUpDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                ) : (
                  <span className="text-neutral-600">None scheduled</span>
                )}
              </div>
            </div>
          </div>

          {/* Target Background & General Notes */}
          <div className="bg-[#111111] border border-[#222222] rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#222222] pb-3">
              <h2 className="text-xs font-heading font-bold text-white uppercase tracking-wider">
                Initial Notes & Background
              </h2>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold"
              >
                Edit
              </button>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
              {approach.notes || (
                <span className="text-neutral-600 italic">No background notes written yet.</span>
              )}
            </p>
          </div>

          {/* Deal Conversion Box */}
          <div className="bg-gradient-to-br from-teal-950/40 via-[#111111] to-[#141414] border border-teal-500/20 rounded-3xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-heading font-bold text-white">Client Conversion</h3>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              When this business approves a proposal and enters a contract, convert them into an official client to track deliverables, invoices, and projects.
            </p>
            {isDealWon ? (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-between">
                <span>Already Converted!</span>
                <Link
                  href={
                    approach.convertedClientId
                      ? `/clients/${typeof approach.convertedClientId === 'object' ? approach.convertedClientId._id : approach.convertedClientId}`
                      : '/clients'
                  }
                  className="hover:underline flex items-center gap-1 text-[11px]"
                >
                  Go to Client <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <button
                onClick={openConvertModal}
                disabled={converting}
                className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-md shadow-teal-900/30 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deal Won → Convert to Client</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* LOG CONTACT INTERACTION MODAL */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log Contact & Interaction"
      >
        <form onSubmit={handleAddContactLog} className="space-y-4">
          <p className="text-xs text-neutral-400">
            Record what you discussed, what the client mentioned to remember, and set any next follow-up.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Channel / Method
              </label>
              <select
                value={logChannel}
                onChange={(e) => setLogChannel(e.target.value as ContactChannel)}
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
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
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
              rows={4}
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              placeholder="e.g. Owner expressed interest in POS & inventory module. Wants us to prepare a quote for 2 branches. Call back on Friday afternoon."
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
                value={logNextFollowUp}
                onChange={(e) => setLogNextFollowUp(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Update Status To
              </label>
              <select
                value={logUpdateStatus}
                onChange={(e) => setLogUpdateStatus(e.target.value as any)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
              >
                <option value="">Keep current ({statusConf.label})</option>
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
              onClick={() => setIsLogModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] text-neutral-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingLog}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition shadow-md shadow-teal-900/30 disabled:opacity-50"
            >
              {submittingLog ? 'Saving...' : 'Save Interaction'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT TARGET MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Outreach Target"
      >
        <form onSubmit={handleUpdateApproach} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Business Name *
            </label>
            <input
              type="text"
              required
              value={formBusinessName}
              onChange={(e) => setFormBusinessName(e.target.value)}
              className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Niche / Category *
              </label>
              <select
                value={formNiche}
                onChange={(e) => setFormNiche(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
              >
                {niches.map((n) => (
                  <option key={n._id} value={n.name}>
                    {n.name}
                  </option>
                ))}
                {niches.every((n) => n.name !== formNiche) && formNiche && (
                  <option value={formNiche}>{formNiche}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Outreach Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as ApproachStatus)}
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
                value={formContactPerson}
                onChange={(e) => setFormContactPerson(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
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
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
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
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              General Background Notes
            </label>
            <textarea
              rows={3}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-teal-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222222]">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] text-neutral-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition shadow-md shadow-teal-900/30"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Outreach Target"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-300">
            Are you sure you want to delete <strong className="text-white">{approach.businessName}</strong>? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222222]">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] text-neutral-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteApproach}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition shadow-md shadow-rose-900/30"
            >
              Delete Target
            </button>
          </div>
        </div>
      </Modal>

      {/* CONVERT TO CLIENT MODAL */}
      <Modal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        title="Deal Won: Convert to Official Client"
      >
        <form onSubmit={handleConfirmConvert} className="space-y-4">
          <p className="text-xs text-neutral-400">
            Finalize deal terms and client profile to onboard this business into Rhizan Hub for projects, meetings, and invoice tracking.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Client / Company Name *
              </label>
              <input
                type="text"
                required
                value={convertName}
                onChange={(e) => setConvertName(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={convertContactPerson}
                onChange={(e) => setConvertContactPerson(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={convertPhone}
                onChange={(e) => setConvertPhone(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={convertEmail}
                onChange={(e) => setConvertEmail(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Service / Deliverable Interested *
              </label>
              <input
                type="text"
                required
                value={convertService}
                onChange={(e) => setConvertService(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Assign Account Lead / Manager
              </label>
              <select
                value={convertAssignedTo}
                onChange={(e) => setConvertAssignedTo(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deal Value & Financials Box */}
          <div className="p-3.5 bg-[#161616] border border-[#262626] rounded-2xl space-y-3">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider block">
                Contract & Financial Agreement
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                  Total Deal Value
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 150000"
                  value={convertDealValue}
                  onChange={(e) => setConvertDealValue(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333333] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                  Advance / Deposit Paid
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 50000"
                  value={convertPaidAmount}
                  onChange={(e) => setConvertPaidAmount(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333333] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                  Currency
                </label>
                <select
                  value={convertCurrency}
                  onChange={(e) => setConvertCurrency(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333333] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                >
                  <option value="ETB">ETB (Birr)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Client Pipeline Status
            </label>
            <select
              value={convertStatus}
              onChange={(e) => setConvertStatus(e.target.value)}
              className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
            >
              <option value="ACTIVE">Active Client (Contract signed)</option>
              <option value="PROPOSAL">Proposal (Awaiting final signoff)</option>
              <option value="MEETING">Meeting Stage</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Contract & Onboarding Notes
            </label>
            <textarea
              rows={3}
              value={convertNotes}
              onChange={(e) => setConvertNotes(e.target.value)}
              className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-teal-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222222]">
            <button
              type="button"
              onClick={() => setIsConvertModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] text-neutral-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={converting}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition shadow-md shadow-teal-900/30 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{converting ? 'Creating Client...' : 'Confirm & Onboard Client'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
