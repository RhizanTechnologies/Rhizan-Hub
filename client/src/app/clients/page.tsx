'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Modal } from '@/components/Modal';
import { Client, ClientStatus } from '@/types';
import { apiFetch } from '@/lib/api';
import {
  Phone,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';

const PIPELINE_STAGES: { id: ClientStatus; label: string; accent: string }[] = [
  { id: 'LEAD', label: 'Leads', accent: 'border-[#262626]' },
  { id: 'CONTACTED', label: 'Contacted', accent: 'border-blue-500/40' },
  { id: 'MEETING', label: 'Meeting', accent: 'border-teal-500/40' },
  { id: 'PROPOSAL', label: 'Proposal', accent: 'border-amber-500/40' },
  { id: 'ACTIVE', label: 'Active Client', accent: 'border-emerald-500/40' },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // New Lead Form
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceInterested, setServiceInterested] = useState('Custom Bakery ERP');
  const [dealValue, setDealValue] = useState('');
  const [notes, setNotes] = useState('');

  const initialClients: Client[] = [
    {
      _id: 'c1',
      name: 'ABC Bakery',
      contactPerson: 'Dawit Mengistu',
      phone: '+251 91 123 4567',
      email: 'dawit@abcbakery.com',
      status: 'ACTIVE',
      serviceInterested: 'Custom ERP & POS',
      dealValue: 5000,
      notes: 'Signed contract. Testing phase 1 production module.',
      assignedTo: { name: 'Nebiyu', email: 'nebiyu@rhizan.com', role: 'MEMBER', title: 'Business', weeklyCapacityHours: 40, status: 'ACTIVE' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'c2',
      name: 'Skyline Cafe & Roastery',
      contactPerson: 'Hana Kebede',
      phone: '+251 92 345 6789',
      email: 'hana@skyline.et',
      status: 'PROPOSAL',
      serviceInterested: 'Inventory & Ordering System',
      dealValue: 3500,
      notes: 'Proposal sent Monday. Follow up scheduled for Friday 3 PM.',
      assignedTo: { name: 'Nebiyu', email: 'nebiyu@rhizan.com', role: 'MEMBER', title: 'Business', weeklyCapacityHours: 40, status: 'ACTIVE' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'c3',
      name: 'Blue Nile Logistics',
      contactPerson: 'Yonas T.',
      phone: '+251 93 456 7890',
      email: 'yonas@bluenile.com',
      status: 'MEETING',
      serviceInterested: 'Fleet Tracking & Dispatch Portal',
      dealValue: 6200,
      notes: 'Meeting demo scheduled at their Bole office on Thursday.',
      assignedTo: { name: 'Nebiyu', email: 'nebiyu@rhizan.com', role: 'MEMBER', title: 'Business', weeklyCapacityHours: 40, status: 'ACTIVE' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'c4',
      name: 'Fresh Market Grocers',
      contactPerson: 'Samson B.',
      phone: '+251 94 567 8901',
      email: 'samson@freshmarket.com',
      status: 'CONTACTED',
      serviceInterested: 'Multi-store POS Integration',
      dealValue: 2400,
      notes: 'Introductory phone call completed. Preparing slide deck.',
      assignedTo: { name: 'Nebiyu', email: 'nebiyu@rhizan.com', role: 'MEMBER', title: 'Business', weeklyCapacityHours: 40, status: 'ACTIVE' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'c5',
      name: 'Apex Printing Press',
      contactPerson: 'Blen Assefa',
      phone: '+251 95 678 9012',
      email: 'blen@apexprint.et',
      status: 'LEAD',
      serviceInterested: 'Internal Workflow Tracking',
      dealValue: 3000,
      notes: 'Referred by retail contact. Needs initial discovery call.',
      assignedTo: { name: 'Nebiyu', email: 'nebiyu@rhizan.com', role: 'MEMBER', title: 'Business', weeklyCapacityHours: 40, status: 'ACTIVE' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    async function loadClients() {
      try {
        const data = await apiFetch<Client[]>('/clients');
        if (data && data.length > 0) {
          setClients(data);
        } else {
          setClients(initialClients);
        }
      } catch {
        setClients(initialClients);
      } finally {
        setLoading(false);
      }
    }
    loadClients();
  }, []);

  const moveStage = async (clientId: string, newStatus: ClientStatus) => {
    setClients((prev) =>
      prev.map((c) => (c._id === clientId ? { ...c, status: newStatus } : c))
    );

    try {
      await apiFetch(`/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // Local state is already updated
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newLead: Client = {
      _id: `c-${Date.now()}`,
      name,
      contactPerson,
      phone,
      email,
      status: 'LEAD',
      serviceInterested,
      dealValue: dealValue ? Number(dealValue) : 0,
      notes,
      assignedTo: { name: 'Nebiyu', email: 'nebiyu@rhizan.com', role: 'MEMBER', title: 'Business', weeklyCapacityHours: 40, status: 'ACTIVE' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setClients([newLead, ...clients]);
    setIsModalOpen(false);
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setDealValue('');
    setNotes('');

    try {
      await apiFetch('/clients', {
        method: 'POST',
        body: JSON.stringify({
          name,
          contactPerson,
          phone,
          email,
          status: 'LEAD',
          serviceInterested,
          dealValue: Number(dealValue) || 0,
          notes,
        }),
      });
    } catch {
      // Handled
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Client & Lead Pipeline (CRM)"
        subtitle="Track leads, meetings, proposals, and active client relationships"
        actionButton={{
          label: 'New Lead',
          onClick: () => setIsModalOpen(true),
        }}
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-5">
        {/* Pipeline Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {PIPELINE_STAGES.map((stage, sIdx) => {
            const stageClients = clients.filter((c) => c.status === stage.id);
            const nextStage = PIPELINE_STAGES[sIdx + 1]?.id;

            return (
              <div
                key={stage.id}
                className="bg-[#121212] border border-[#222222] rounded-2xl p-3.5 flex flex-col min-h-[580px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222222]">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-xs font-bold uppercase tracking-wider text-neutral-200">
                      {stage.label}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1c1c1c] text-neutral-400 font-semibold border border-[#262626]">
                      {stageClients.length}
                    </span>
                  </div>
                </div>

                {/* Lead Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {stageClients.map((client) => (
                    <div
                      key={client._id}
                      onClick={() => setSelectedClient(client)}
                      className="p-3.5 rounded-xl bg-[#181818] border border-[#262626] hover:border-[#383838] transition cursor-pointer shadow-sm group select-none"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-xs font-bold text-white group-hover:text-teal-300 transition">
                          {client.name}
                        </h4>
                        {client.dealValue ? (
                          <span className="font-heading text-[11px] font-semibold text-emerald-400">
                            ${client.dealValue.toLocaleString()}
                          </span>
                        ) : null}
                      </div>

                      <div className="text-[11px] text-teal-400 font-medium mb-2">
                        {client.serviceInterested}
                      </div>

                      <div className="space-y-1 text-[11px] text-neutral-400 mb-2.5">
                        {client.contactPerson && (
                          <div className="flex items-center gap-1.5 truncate">
                            <UserIcon className="w-3 h-3 text-neutral-500" />
                            <span>{client.contactPerson}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Phone className="w-3 h-3 text-neutral-500" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>

                      {client.notes && (
                        <p className="text-[10px] text-neutral-400 line-clamp-2 bg-[#141414] p-2 rounded-lg border border-[#262626] mb-2">
                          {client.notes}
                        </p>
                      )}

                      {/* Move to next stage button */}
                      {nextStage && (
                        <div className="pt-2 border-t border-[#222222] flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveStage(client._id, nextStage);
                            }}
                            className="text-[10px] text-teal-400 hover:text-teal-300 font-medium flex items-center gap-0.5"
                          >
                            Advance Stage <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {stageClients.length === 0 && (
                    <div className="h-32 border border-dashed border-[#262626] rounded-xl flex items-center justify-center text-xs text-neutral-600">
                      Empty stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Lead Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Lead / Client">
        <form onSubmit={handleCreateLead} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Company / Business Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Addis Cafe & Roastery"
              className="w-full px-3 py-2 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Yonas T."
                className="w-full px-3 py-2 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251 9..."
                className="w-full px-3 py-2 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Service Interested</label>
              <input
                type="text"
                value={serviceInterested}
                onChange={(e) => setServiceInterested(e.target.value)}
                placeholder="ERP, Web, POS..."
                className="w-full px-3 py-2 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Estimated Value ($)</label>
              <input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                placeholder="3500"
                className="w-full px-3 py-2 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Notes & Follow-up Details</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did they say? When to call back?"
              className="w-full px-3 py-2 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#222222]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-xs font-medium text-white rounded-xl shadow-md transition"
            >
              Add to Pipeline
            </button>
          </div>
        </form>
      </Modal>

      {/* Client Detail Modal */}
      {selectedClient && (
        <Modal
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
          title={selectedClient.name}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                {selectedClient.status}
              </span>
              {selectedClient.dealValue && (
                <span className="font-heading text-sm font-bold text-emerald-400">
                  ${selectedClient.dealValue.toLocaleString()}
                </span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-[#181818] border border-[#262626] space-y-2 text-xs">
              <div className="text-neutral-400">
                Contact Person:{' '}
                <span className="text-white font-medium">
                  {selectedClient.contactPerson || 'N/A'}
                </span>
              </div>
              <div className="text-neutral-400">
                Phone:{' '}
                <span className="text-white font-medium">{selectedClient.phone || 'N/A'}</span>
              </div>
              <div className="text-neutral-400">
                Interested in:{' '}
                <span className="text-teal-400 font-medium">
                  {selectedClient.serviceInterested}
                </span>
              </div>
            </div>

            <div>
              <span className="font-heading text-xs font-bold text-neutral-300 block mb-1">
                Meeting & Follow-up Notes
              </span>
              <p className="text-xs text-neutral-300 bg-[#181818] p-3 rounded-xl border border-[#262626] leading-relaxed">
                {selectedClient.notes || 'No notes added yet.'}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
