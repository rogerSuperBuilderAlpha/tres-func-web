'use client';

import { memo } from 'react';

const COLOR_CLASSES: Record<string, string> = {
  navy: 'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300',
  gold: 'bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400',
  success: 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400',
  danger: 'bg-danger-100 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
};

interface MetricCardProps {
  label: string;
  value: string;
  color: keyof typeof COLOR_CLASSES;
}

export const MetricCard = memo(function MetricCard({ label, value, color }: MetricCardProps) {
  return (
    <div className={`rounded-xl p-4 ${COLOR_CLASSES[color] || COLOR_CLASSES.navy}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
});

