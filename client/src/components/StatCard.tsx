import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'warning' | 'danger' | 'success' | 'teal';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
}) => {
  const variantStyles = {
    default: {
      border: 'border-[#222222]',
      iconBg: 'bg-[#181818] text-neutral-300',
      valueColor: 'text-white',
    },
    warning: {
      border: 'border-amber-500/20 bg-amber-500/[0.02]',
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      valueColor: 'text-amber-400',
    },
    danger: {
      border: 'border-rose-500/20 bg-rose-500/[0.02]',
      iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      valueColor: 'text-rose-400',
    },
    success: {
      border: 'border-emerald-500/20 bg-emerald-500/[0.02]',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      valueColor: 'text-emerald-400',
    },
    teal: {
      border: 'border-teal-500/20 bg-teal-500/[0.02]',
      iconBg: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
      valueColor: 'text-teal-400',
    },
  }[variant];

  return (
    <div
      className={`p-4 rounded-2xl bg-[#121212] border ${variantStyles.border} backdrop-blur-sm transition-all hover:border-[#333333] shadow-sm`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-neutral-400">{label}</span>
        <div className={`p-2 rounded-xl ${variantStyles.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className={`font-heading text-2xl font-bold tracking-tight ${variantStyles.valueColor}`}>
        {value}
      </div>
      {subtitle && <p className="text-[11px] text-neutral-500 mt-1">{subtitle}</p>}
    </div>
  );
};
