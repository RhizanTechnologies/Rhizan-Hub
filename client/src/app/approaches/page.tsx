'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Modal } from '@/components/Modal';
import { Approach, ApproachStatus } from '@/types';
import { apiFetch } from '@/lib/api';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  ArrowRight,
  Filter,
  Search,
  Sparkles,
  Tag,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

const STATUS_CONFIG: Record<ApproachStatus, { label: string; color: string }> = {
  PROSPECT: { label: 'Prospect', color: 'bg-neutral-800 text-neutral-300 border-neutral-700' },
  CONTACTED: { label: 'Contacted', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  PITCHED: { label: 'Pitched / Demo Sent', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  IN_DISCUSSION: { label: 'In Discussion', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  DEAL_WON: { label: 'Deal Won (Client)', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  NOT_INTERESTED: { label: 'Not Interested', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
};

const DEFAULT_NICHES = [
  'All Niches',
  'Bakery & Cafe',
  'Retail & Supermarket',
  'Logistics & Fleet',
  'Restaurant & Bistro',
  'Printing & Publishing',
  'Healthcare & Clinic',
];

export default function ApproachesPage() {
  const router = useRouter();
  const [approaches, setApproaches] = useState<Approach[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('All Niches');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApproach, setEditingApproach] = useState<Approach | null>(null);
  const [approachToDelete, setApproachToDelete] = useState<Approach | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  // Form Fields
  const [businessName, setBusinessName] = useState('');
  const [niche, setNiche] = useState('Bakery & Cafe');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<ApproachStatus>('PROSPECT');
  const [notes, setNotes] = useState('');

  const loadApproaches = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Approach[]>('/approaches');
      if (data) setApproaches(data);
    } catch (err) {
      console.error('Failed to load approaches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApproaches();
  }, []);

  const openCreateModal = () => {
    setEditingApproach(null);
    setBusinessName('');
    setNiche(selectedNiche !== 'All Niches' ? selectedNiche : 'Bakery & Cafe');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setLocation('');
    setStatus('PROSPECT');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (appr: Approach) => {
    setEditingApproach(appr);
    setBusinessName(appr.businessName);
    setNiche(appr.niche || 'General');
    setContactPerson(appr.contactPerson || '');
    setPhone(appr.phone || '');
    setEmail(appr.email || '');
    setLocation(appr.location || '');
    setStatus(appr.status);
    setNotes(appr.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveApproach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    const payload = {
      businessName: businessName.trim(),
      niche: niche.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      location: location.trim(),
      status,
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

  // Convert an approach into an Official Client!
  const handleConvertToClient = async (approach: Approach) => {
    try {
      setConvertingId(approach._id);
      const res = await apiFetch<{ message: string; client: any; approach: Approach }>(
        `/approaches/${approach._id}/convert`,
        { method: 'POST' }
      );

      setApproaches((prev) => prev.map((a) => (a._id === approach._id ? res.approach : a)));
      // Route immediately to the client's dedicated detail page!
      router.push(`/clients/${res.client._id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to convert to client');
    } finally {
      setConvertingId(null);
    }
  };

  // Filter list
  const filteredApproaches = approaches.filter((a) => {
    const matchesNiche = selectedNiche === 'All Niches' || a.niche === selectedNiche;
    const matchesSearch =
      a.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.location && a.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.contactPerson && a.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesNiche && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Business Outreach & Approaches"
        subtitle="Target businesses approached by selected niche/category before deal closing"
        actionButton={{
          label: 'Add Approach Target',
          onClick: openCreateModal,
        }}
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Niche Filter Pills Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            {DEFAULT_NICHES.map((n) => (
              <button
                key={n}
                onClick={() => setSelectedNiche(n)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  selectedNiche === n
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                    : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#222222]'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search business or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141414] border border-[#262626] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Approaches Table */}
        <div className="bg-[#111111] border border-[#222222] rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#222222] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-heading text-xs font-bold text-white uppercase tracking-wider">
                Approached Businesses Table
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1a1a] text-neutral-400 border border-[#282828] font-mono">
                {filteredApproaches.length} targets
              </span>
            </div>
            <span className="text-[11px] text-neutral-500">
              When a business agrees to deal with us, click &quot;Convert to Client&quot;
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1f1f1f] bg-[#141414]/60 text-[11px] text-neutral-400 font-medium">
                  <th className="py-3 px-4">Business Name</th>
                  <th className="py-3 px-4">Niche / Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Outreach Status</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c1c1c]">
                {filteredApproaches.map((appr) => {
                  const statusConf = STATUS_CONFIG[appr.status] || STATUS_CONFIG.PROSPECT;
                  const isDealWon = appr.status === 'DEAL_WON';
                  const isConverting = convertingId === appr._id;

                  return (
                    <tr
                      key={appr._id}
                      className="hover:bg-[#161616] transition group"
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#202020] text-teal-400 font-bold flex items-center justify-center shrink-0">
                            {appr.businessName.charAt(0)}
                          </div>
                          <span className="truncate max-w-[160px]">{appr.businessName}</span>
                        </div>
                      </td>

                      {/* Niche */}
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

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {appr.contactPerson && (
                            <div className="text-neutral-200 font-medium">{appr.contactPerson}</div>
                          )}
                          {appr.phone && (
                            <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-neutral-500" /> {appr.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${statusConf.color}`}>
                          {statusConf.label}
                        </span>
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 px-4 text-neutral-400 max-w-[200px] truncate">
                        {appr.notes || '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isDealWon ? (
                            <Link
                              href={appr.convertedClientId ? `/clients/${typeof appr.convertedClientId === 'object' ? appr.convertedClientId._id : appr.convertedClientId}` : '/clients'}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1 transition"
                            >
                              <span>Official Client</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleConvertToClient(appr)}
                              disabled={isConverting}
                              className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-semibold flex items-center gap-1 transition shadow-sm disabled:opacity-50"
                              title="Deal Closed: Convert to Client"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>{isConverting ? 'Converting...' : 'Deal Won → Client'}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openEditModal(appr)}
                            className="p-1.5 rounded-lg hover:bg-[#222222] text-neutral-400 hover:text-white transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setApproachToDelete(appr)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-neutral-500 hover:text-rose-400 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
              Business / Company Name *
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Enrico Pastry or Meda Supermarket"
              required
              className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Target Niche / Category
              </label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. Bakery & Cafe"
                required
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Location / Neighborhood
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bole Medhanialem or Piazza"
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Contact Person / Owner
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Abebe K."
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251 91 123 4567"
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@business.com"
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Outreach Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="PROSPECT">Prospect (Not yet contacted)</option>
                <option value="CONTACTED">Contacted (Phone / Email)</option>
                <option value="PITCHED">Pitched / Proposal Sent</option>
                <option value="IN_DISCUSSION">In Discussion / Meeting</option>
                <option value="DEAL_WON">Deal Won (Client)</option>
                <option value="NOT_INTERESTED">Not Interested</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Notes & Pitch Angles
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Pain points observed, current manual registers, potential budget, best time to call..."
              rows={2}
              className="w-full bg-[#181818] border border-[#262626] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs shadow-md shadow-teal-900/30"
            >
              {editingApproach ? 'Save Changes' : 'Add Target Business'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION */}
      <Modal
        isOpen={Boolean(approachToDelete)}
        onClose={() => setApproachToDelete(null)}
        title="Delete Outreach Target"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-300 leading-relaxed">
            Are you sure you want to remove <strong className="text-white">{approachToDelete?.businessName}</strong> from the outreach list?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setApproachToDelete(null)}
              className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-950/30"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
