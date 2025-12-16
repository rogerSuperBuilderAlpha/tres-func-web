'use client';

import { memo } from 'react';

interface CostRowProps {
  label: string;
  value: number;
  highlight?: boolean;
  bold?: boolean;
}

export const CostRow = memo(function CostRow({ label, value, highlight, bold }: CostRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? 'font-medium text-navy-900 dark:text-white' : 'text-navy-600 dark:text-navy-300'}`}>
        {label}
      </span>
      <span className={`font-bold ${highlight ? 'text-purple-600 dark:text-purple-400' : bold ? 'text-lg text-navy-900 dark:text-white' : 'text-navy-900 dark:text-white'}`}>
        ${value.toFixed(2)}
      </span>
    </div>
  );
});
