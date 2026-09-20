import React from 'react';
import { TaskPriority, TaskStatus, ClientStatus } from '@/types';

export const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  const styles: Record<TaskPriority, string> = {
    LOW: 'bg-[#181818] text-neutral-400 border-[#262626]',
    MEDIUM: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    HIGH: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    URGENT: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${styles[priority] || styles.MEDIUM}`}
    >
      {priority}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: TaskStatus | string }> = ({ status }) => {
  const formatText = (s: string) => s.replace('_', ' ');

  const getStyle = (s: string) => {
    switch (s) {
      case 'TODO':
      case 'LEAD':
        return 'bg-[#181818] text-neutral-300 border-[#262626]';
      case 'IN_PROGRESS':
      case 'CONTACTED':
      case 'MEETING':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'REVIEW':
      case 'PROPOSAL':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'DONE':
      case 'ACTIVE':
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-[#181818] text-neutral-400 border-[#262626]';
    }
  };

  return (
    <span
      className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${getStyle(status)}`}
    >
      {formatText(status)}
    </span>
  );
};
