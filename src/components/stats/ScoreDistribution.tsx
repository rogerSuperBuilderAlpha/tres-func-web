'use client';

import { memo } from 'react';

interface ScoreDistributionProps {
  excellent: number;
  proficient: number;
  needsWork: number;
  total: number;
}

export const ScoreDistribution = memo(function ScoreDistribution({ 
  excellent, 
  proficient, 
  needsWork, 
  total 
}: ScoreDistributionProps) {
  return (
    <div className="mt-4 pt-4 border-t border-navy-100 dark:border-navy-700">
      <p className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wide mb-2">
        Score Distribution
      </p>
      <div className="h-3 bg-navy-100 dark:bg-navy-700 rounded-full overflow-hidden flex">
        {total > 0 && (
          <>
            <div
              className="bg-success-500 h-full transition-all"
              style={{ width: `${(excellent / total) * 100}%` }}
              title={`Excellent: ${excellent}`}
            />
            <div
              className="bg-gold-500 h-full transition-all"
              style={{ width: `${(proficient / total) * 100}%` }}
              title={`Proficient: ${proficient}`}
            />
            <div
              className="bg-danger-500 h-full transition-all"
              style={{ width: `${(needsWork / total) * 100}%` }}
              title={`Needs Work: ${needsWork}`}
            />
          </>
        )}
      </div>
      <div className="flex justify-between mt-1 text-xs text-navy-500 dark:text-navy-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-success-500"></span>
          Excellent
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gold-500"></span>
          Proficient
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-danger-500"></span>
          Needs Work
        </span>
      </div>
    </div>
  );
});
