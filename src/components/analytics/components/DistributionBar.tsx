'use client';

import { memo } from 'react';

interface DistributionBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

export const DistributionBar = memo(function DistributionBar({ label, count, total, color }: DistributionBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-navy-600 dark:text-navy-300">{label}</span>
        <span className="font-medium text-navy-900 dark:text-white">{count} ({percentage.toFixed(0)}%)</span>
      </div>
      <div className="h-2 bg-navy-200 dark:bg-navy-600 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
});
