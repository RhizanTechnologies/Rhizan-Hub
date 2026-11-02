'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import {
  User as UserIcon,
  Crown,
  Cpu,
  Layers,
  Shield,
  Clock,
  Check,
  Sparkles,
  AlertCircle,
  Briefcase,
  Activity,
} from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('CEO');
  const [title, setTitle] = useState('');
  const [weeklyCapacityHours, setWeeklyCapacityHours] = useState(48);
  const [status, setStatus] = useState<'ACTIVE' | 'AWAY' | 'OFFLINE'>('ACTIVE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setRole((user.role as UserRole) || 'CEO');
      setTitle(user.title || '');
      setWeeklyCapacityHours(user.weeklyCapacityHours || 48);
      setStatus(user.status || 'ACTIVE');
      setError(null);
      setSavedSuccess(false);
    }
  }, [user, isOpen]);

  // Handle changing role and auto-suggesting job title if applicable
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (!title || title === 'Team Member' || title === 'Founder' || title.includes('CEO') || title.includes('CTO') || title.includes('COO')) {
      if (newRole === 'CEO') setTitle('Founder & CEO');
      else if (newRole === 'CTO') setTitle('Founder & CTO');
      else if (newRole === 'COO') setTitle('Founder & COO');
      else setTitle('Founder');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await updateProfile({
        name: name.trim(),
        role,
        title: title.trim() || (role === 'MEMBER' ? 'Founder' : `Founder & ${role}`),
        weeklyCapacityHours: Number(weeklyCapacityHours) || 48,
        status,
      });

      setSavedSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Profile">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 shrink-0" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        {/* Read-only Email Field */}
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full bg-[#161616] border border-[#262626] rounded-xl px-3 py-2 text-xs text-neutral-500 cursor-not-allowed outline-none"
          />
          <p className="text-[10px] text-neutral-500 mt-1">
            Account email is fixed and associated with workspace authorization.
          </p>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Abdulaziz Isa"
            required
            className="w-full bg-[#181818] border border-[#2a2a2a] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none transition"
          />
        </div>

        {/* Role Selection Dropdown (CEO, CTO, COO, Member) */}
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1 flex items-center justify-between">
            <span>Executive / Company Role</span>
            <span className="text-[10px] text-teal-400 font-semibold">Options: 👑 CEO, ⚡ CTO, 📊 COO, 👤 Member</span>
          </label>
          <div className="relative">
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              className="w-full bg-[#181818] border border-[#2a2a2a] focus:border-teal-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition font-medium appearance-none"
            >
              <option value="CEO">👑 CEO — Chief Executive Officer</option>
              <option value="CTO">⚡ CTO — Chief Technology Officer</option>
              <option value="COO">📊 COO — Chief Operating Officer</option>
              <option value="MEMBER">👤 Member — Team Member</option>
            </select>
          </div>
          <p className="text-[10px] text-neutral-400 mt-1">
            CEO, CTO, and COO roles automatically possess full workspace executive privileges.
          </p>
        </div>

        {/* Job Title / Department */}
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">
            Job Title / Position
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Founder & CEO"
            className="w-full bg-[#181818] border border-[#2a2a2a] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none transition"
          />

          {/* Quick Founder Preset Buttons */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[
              { label: 'Founder & CEO', titleVal: 'Founder & CEO', r: 'CEO' as UserRole },
              { label: 'Founder & CTO', titleVal: 'Founder & CTO', r: 'CTO' as UserRole },
              { label: 'Founder & COO', titleVal: 'Founder & COO', r: 'COO' as UserRole },
              { label: 'Co-Founder', titleVal: 'Co-Founder', r: 'CEO' as UserRole },
              { label: 'Founder', titleVal: 'Founder', r: 'CEO' as UserRole },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setTitle(preset.titleVal);
                  setRole(preset.r);
                }}
                className={`text-[10px] px-2 py-0.5 rounded-lg border transition ${
                  title === preset.titleVal
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/30 font-semibold'
                    : 'bg-[#181818] text-neutral-400 border-[#262626] hover:text-white hover:border-[#383838]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status and Weekly Capacity in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Active Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-[#181818] border border-[#2a2a2a] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
            >
              <option value="ACTIVE">🟢 Active (Available)</option>
              <option value="AWAY">🟡 Away (In Meeting / Break)</option>
              <option value="OFFLINE">⚪ Offline (Off Hours)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-neutral-300">
                Weekly Capacity
              </label>
              <span className="text-[10px] text-teal-400 font-mono">48h (Rhizan)</span>
            </div>
            <input
              type="number"
              value={weeklyCapacityHours}
              onChange={(e) => setWeeklyCapacityHours(parseInt(e.target.value, 10) || 48)}
              min="10"
              max="120"
              className="w-full bg-[#181818] border border-[#2a2a2a] focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition font-mono"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#222222] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1c1c1c] text-neutral-300 hover:text-white hover:bg-[#252525] border border-[#2c2c2c] transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold transition flex items-center gap-1.5 shadow-lg shadow-teal-900/30 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
