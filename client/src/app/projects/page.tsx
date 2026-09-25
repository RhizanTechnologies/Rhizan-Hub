'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Modal } from '@/components/Modal';
import { Project } from '@/types';
import { apiFetch } from '@/lib/api';
import {
  Calendar,
  Users,
  CheckSquare,
  DollarSign,
} from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Project Form
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');

  const initialProjects: Project[] = [
    {
      _id: 'p1',
      name: 'Bakery ERP',
      clientName: 'ABC Bakery',
      description: 'Comprehensive ERP system for bakery production, inventory, recipes, and point of sale.',
      members: [
        { name: 'Abdulaziz', email: 'abdulaziz@rhizan.com', role: 'ADMIN', title: 'Development', weeklyCapacityHours: 40, status: 'ACTIVE' },
        { name: 'Nebiyu', email: 'nebiyu@rhizan.com', role: 'MEMBER', title: 'Business / Client', weeklyCapacityHours: 40, status: 'ACTIVE' },
        { name: 'Sadam', email: 'sadam@rhizan.com', role: 'MEMBER', title: 'Operations / Product', weeklyCapacityHours: 40, status: 'ACTIVE' },
      ],
      status: 'IN_PROGRESS',
      progress: 80,
      totalTasks: 18,
      completedTasks: 14,
      deadline: 'Oct 14, 2026',
      budget: 5000,
      notes: 'Finalizing payment gateway integration & kitchen display system.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'p2',
      name: 'RHIZAN Website',
      clientName: 'Internal',
      description: 'Official corporate website showcasing RHIZAN products, engineering standards, and case studies.',
      members: [
        { name: 'Abdulaziz', email: 'abdulaziz@rhizan.com', role: 'ADMIN', title: 'Development', weeklyCapacityHours: 40, status: 'ACTIVE' },
        { name: 'Sadam', email: 'sadam@rhizan.com', role: 'MEMBER', title: 'Operations / Product', weeklyCapacityHours: 40, status: 'ACTIVE' },
      ],
      status: 'IN_PROGRESS',
      progress: 50,
      totalTasks: 12,
      completedTasks: 6,
      deadline: 'Oct 21, 2026',
      budget: 1500,
      notes: 'Landing page copy approved. Reviewing mobile layouts.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'p3',
      name: 'Client Acquisition Q4',
      clientName: 'Internal',
      description: 'Systematic cold outreach and demonstration campaign targeting retail & F&B businesses in Addis.',
      members: [
        { name: 'Nebiyu', email: 'nebiyu@rhizan.com', role: 'MEMBER', title: 'Business / Client', weeklyCapacityHours: 40, status: 'ACTIVE' },
      ],
      status: 'IN_PROGRESS',
      progress: 25,
      totalTasks: 8,
      completedTasks: 2,
      deadline: 'Nov 1, 2026',
      budget: 1000,
      notes: '5 qualified leads currently in demo & proposal stages.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await apiFetch<Project[]>('/projects');
        if (data && data.length > 0) {
          setProjects(data);
        } else {
          setProjects(initialProjects);
        }
      } catch {
        setProjects(initialProjects);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProject: Project = {
      _id: `p-${Date.now()}`,
      name,
      clientName: clientName || 'Internal',
      description,
      members: [],
      status: 'IN_PROGRESS',
      progress: 0,
      totalTasks: 0,
      completedTasks: 0,
      deadline: deadline || 'Upcoming',
      budget: budget ? Number(budget) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects([newProject, ...projects]);
    setIsModalOpen(false);
    setName('');
    setClientName('');
    setDescription('');
    setBudget('');
    setDeadline('');

    try {
      await apiFetch('/projects', {
        method: 'POST',
        body: JSON.stringify({
          name,
          clientName,
          description,
          budget: Number(budget) || 0,
          deadline,
        }),
      });
    } catch {
      // Local state already updated
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Projects"
        subtitle="Manage client deliverables, internal roadmaps, and progress tracking"
        actionButton={{
          label: 'New Project',
          onClick: () => setIsModalOpen(true),
        }}
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <div
              key={proj._id}
              className="p-5 rounded-2xl bg-[#121212] border border-[#222222] hover:border-[#333333] transition flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-heading text-base font-bold text-white">{proj.name}</h3>
                    <span className="text-xs text-teal-400 font-medium">
                      Client: {proj.clientName}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    {proj.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed mb-4 line-clamp-2">
                  {proj.description || 'No description provided.'}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Progress</span>
                    <span className="font-bold text-white">{proj.progress}%</span>
                  </div>
                  <div className="w-full bg-[#262626] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#222222] text-[11px] text-neutral-400">
                  <div>
                    <div className="text-white font-semibold flex items-center gap-1">
                      <CheckSquare className="w-3 h-3 text-teal-400" />
                      {proj.totalTasks || 0}
                    </div>
                    <div>Tasks</div>
                  </div>
                  <div>
                    <div className="text-white font-semibold flex items-center gap-1">
                      <Users className="w-3 h-3 text-emerald-400" />
                      {proj.members?.length || 2}
                    </div>
                    <div>Members</div>
                  </div>
                  <div>
                    <div className="text-white font-semibold flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-amber-400" />
                      {proj.budget ? `$${proj.budget.toLocaleString()}` : 'N/A'}
                    </div>
                    <div>Budget</div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 mt-2 flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3 h-3 text-neutral-500" />
                  {proj.deadline ? `Due ${proj.deadline}` : 'No deadline'}
                </span>
                <span className="text-teal-400 hover:text-teal-300 font-medium cursor-pointer">
                  Details →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Project Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Retail POS System"
              className="w-full px-3 py-2 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. ABC Bakery or Internal"
              className="w-full px-3 py-2 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project goals, scope, and deliverables..."
              className="w-full px-3 py-2 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Budget ($)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="5000"
                className="w-full px-3 py-2 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Deadline</label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="e.g. Nov 15, 2026"
                className="w-full px-3 py-2 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-teal-500"
              />
            </div>
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
              Create Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
