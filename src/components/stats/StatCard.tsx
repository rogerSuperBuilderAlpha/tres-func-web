'use client';

import { memo, type ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: ReactNode;
  color: 'navy' | 'gold' | 'success' | 'danger';
}

export const StatCard = memo(function StatCard({ label, value, subtext, icon, color }: StatCardProps) {
  const colorClasses = {
    navy: 'bg-navy-100 dark:bg-navy-700 text-navy-600 dark:text-navy-300',
    gold: 'bg-gold-100 dark:bg-gold-900/50 text-gold-600 dark:text-gold-400',
    success: 'bg-success-50 dark:bg-success-900/30 text-success-600 dark:text-success-400',
    danger: 'bg-danger-50 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400',
  } as const;

  return (
    <div className="bg-navy-50/50 dark:bg-navy-800/50 rounded-xl p-3">
      <div className={`w-7 h-7 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-2`}>{icon}</div>
      <p className="text-xs text-navy-500 dark:text-navy-400">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className="text-lg font-bold text-navy-900 dark:text-white">{value}</p>
        {subtext && <span className="text-xs text-navy-400 dark:text-navy-500">{subtext}</span>}
      </div>
    </div>
  );
});
