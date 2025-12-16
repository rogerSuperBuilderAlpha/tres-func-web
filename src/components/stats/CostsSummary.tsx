'use client';

import { memo } from 'react';
import type { CostAggregation } from '@/types';
import { BoltIcon } from '@/components/ui';

interface CostsSummaryProps {
  costAggregation: CostAggregation;
}

export const CostsSummary = memo(function CostsSummary({ costAggregation }: CostsSummaryProps) {
  return (
    <div className="mt-4 pt-4 border-t border-navy-100 dark:border-navy-700">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <BoltIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
        </div>
        <p className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wide">LLM Costs</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <CostItem label="Today" value={costAggregation.today} />
        <CostItem label="This Week" value={costAggregation.thisWeek} />
        <CostItem label="This Month" value={costAggregation.thisMonth} />
        <CostItem label="All Time" value={costAggregation.allTime} highlight />
      </div>
    </div>
  );
});

const CostItem = memo(function CostItem({ 
  label, 
  value, 
  highlight 
}: { 
  label: string; 
  value: number; 
  highlight?: boolean;
}) {
  return (
    <div className="bg-navy-50/50 dark:bg-navy-800/50 rounded-lg p-2 text-center">
      <p className="text-xs text-navy-400 dark:text-navy-500">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-purple-600 dark:text-purple-400' : 'text-navy-900 dark:text-white'}`}>
        ${value.toFixed(2)}
      </p>
    </div>
  );
});
