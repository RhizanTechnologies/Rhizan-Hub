'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { Clock, Plus, Check } from 'lucide-react';

interface Entry {
  id: string;
  project: string;
  description: string;
  hours: number;
  minutes: number;
  user: string;
}

export default function TimeTrackingPage() {
  const { user } = useAuth();

  // Quick logger form state
  const [project, setProject] = useState('Bakery ERP');
  const [hours, setHours] = useState('2');
  const [minutes, setMinutes] = useState('30');
  const [description, setDescription] = useState('');
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  // Exact data from user's specification Section 7
  const [todayEntries, setTodayEntries] = useState<Entry[]>([
    {
      id: 'e1',
      project: 'Bakery ERP',
      description: 'Authentication tokens and session refresh logic',
      hours: 4,
      minutes: 20,
      user: 'Abdulaziz',
    },
    {
      id: 'e2',
      project: 'RHIZAN Website',
      description: 'Landing page responsive tweaks and brand assets',
      hours: 2,
      minutes: 10,
      user: 'Abdulaziz',
    },
    {
      id: 'e3',
      project: 'Internal / Research',
      description: 'Next.js 15 server action optimization',
      hours: 1,
      minutes: 30,
      user: 'Abdulaziz',
    },
  ]);

  const weeklySummary = [
    { name: 'Abdulaziz', hours: 32, title: 'Development' },
    { name: 'Nebiyu', hours: 29, title: 'Business / Client' },
    { name: 'Sadam', hours: 25, title: 'Operations / Product' },
  ];

  const totalMinutesToday = todayEntries.reduce(
    (sum, e) => sum + (e.hours * 60 + e.minutes),
    0
  );
  const totalHoursToday = Math.floor(totalMinutesToday / 60);
  const remainingMinsToday = totalMinutesToday % 60;

  const handleLogTime = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: Entry = {
      id: `e-${Date.now()}`,
      project,
      description: description || 'General development & operations',
      hours: Number(hours) || 0,
      minutes: Number(minutes) || 0,
      user: user?.name || 'Abdulaziz',
    };

    setTodayEntries([newEntry, ...todayEntries]);
    setDescription('');
    setLoggedSuccess(true);
    setTimeout(() => setLoggedSuccess(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Time Tracking"
        subtitle="Lightweight daily log and weekly team hours (Clockify alternative)"
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Quick Logger Form */}
        <div className="p-5 rounded-2xl bg-[#121212] border border-[#222222] shadow-sm backdrop-blur-sm">
          <h2 className="font-heading text-sm font-bold text-white mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-400" />
            Log Time Entry
          </h2>
          <p className="text-xs text-neutral-400 mb-4">
            Record hours spent today on client or internal work
          </p>

          <form onSubmit={handleLogTime} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-3">
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">Project</label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full px-3 py-2 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="Bakery ERP">Bakery ERP</option>
                <option value="RHIZAN Website">RHIZAN Website</option>
                <option value="Client Acquisition Q4">Client Acquisition Q4</option>
                <option value="Internal / Research">Internal / Research</option>
              </select>
            </div>

            <div className="md:col-span-4">
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                Description / Notes
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What did you work on?"
                className="w-full px-3 py-2 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="md:col-span-1.5 col-span-2">
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">Hours</label>
              <input
                type="number"
                min="0"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-3 py-2 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="md:col-span-1.5 col-span-2">
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                step="5"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full px-3 py-2 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm ${
                  loggedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-900/30'
                }`}
              >
                {loggedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Logged!
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" /> Log Time
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 2-Column: Today's Breakdown + Team Weekly Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Today's Entries (7 cols) */}
          <div className="lg:col-span-7 bg-[#121212] border border-[#222222] rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading text-sm font-bold text-white">Today's Logged Hours</h3>
                <p className="text-xs text-neutral-400">Activities recorded for today</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-neutral-400">Total: </span>
                <span className="font-heading text-base font-bold text-teal-400">
                  {totalHoursToday}h {remainingMinsToday}m
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {todayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-xl bg-[#181818] border border-[#262626] flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{entry.project}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1c1c1c] text-neutral-400 border border-[#2a2a2a]">
                        {entry.user}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400 mt-0.5">{entry.description}</div>
                  </div>
                  <div className="font-heading text-sm font-bold text-white shrink-0 ml-3">
                    {entry.hours}h {entry.minutes > 0 ? `${entry.minutes}m` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Weekly Hours (5 cols) */}
          <div className="lg:col-span-5 bg-[#121212] border border-[#222222] rounded-2xl p-5 backdrop-blur-sm">
            <div className="mb-4">
              <h3 className="font-heading text-sm font-bold text-white">Team Weekly Hours</h3>
              <p className="text-xs text-neutral-400">Current week summary (Monday - Today)</p>
            </div>

            <div className="space-y-3">
              {weeklySummary.map((mem) => {
                const target = 40;
                const pct = Math.min(100, Math.round((mem.hours / target) * 100));

                return (
                  <div
                    key={mem.name}
                    className="p-3.5 rounded-xl bg-[#181818] border border-[#262626]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-xs font-semibold text-white">{mem.name}</div>
                        <div className="text-[10px] text-neutral-400">{mem.title}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-heading text-sm font-bold text-teal-400">{mem.hours}h</span>
                        <span className="text-xs text-neutral-500"> / 40h</span>
                      </div>
                    </div>

                    <div className="w-full bg-[#262626] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
