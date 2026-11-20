import React from 'react';
import { TaskPriority, TaskStatus, ClientStatus } from '@/types';

export const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  const styles: Record<TaskPriority, string> = {
    LOW: 'bg-slate-100 dark:bg-[#151d2a] text-slate-600 dark:text-neutral-400 border-slate-200 dark:border-[#1e2a3c]',
    MEDIUM: 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/20',
    HIGH: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    URGENT: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
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
        return 'bg-slate-100 dark:bg-[#151d2a] text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-[#1e2a3c]';
      case 'IN_PROGRESS':
      case 'CONTACTED':
      case 'MEETING':
        return 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/20';
      case 'REVIEW':
      case 'PROPOSAL':
        return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
      case 'DONE':
      case 'ACTIVE':
      case 'COMPLETED':
        return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
      default:
        return 'bg-slate-100 dark:bg-[#151d2a] text-slate-600 dark:text-neutral-400 border-slate-200 dark:border-[#1e2a3c]';
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
