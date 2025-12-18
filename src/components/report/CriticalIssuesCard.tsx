'use client';

import { memo } from 'react';
import type { CriticalIssue } from '@/types';
import { WarningIcon } from '@/components/ui';
import { formatCriticalIssue } from './utils';

interface CriticalIssuesCardProps {
  issues: Array<string | CriticalIssue>;
}

export const CriticalIssuesCard = memo(function CriticalIssuesCard({ issues }: CriticalIssuesCardProps) {
  if (issues.length === 0) return null;

  return (
    <div className="bg-danger-50 rounded-xl border border-danger-200 p-4 mb-6">
      <h3 className="text-sm font-semibold text-danger-700 mb-3 flex items-center gap-2">
        <WarningIcon className="w-4 h-4" />
        Critical Issues ({issues.length})
      </h3>

      <ul className="space-y-2">
        {issues.map((issue, i) => (
          <li key={i} className="text-sm text-danger-700 flex items-start gap-2">
            <span className="text-danger-400 mt-0.5">•</span>
            <span>{formatCriticalIssue(issue)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});

