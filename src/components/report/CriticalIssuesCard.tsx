'use client';

import { memo } from 'react';
import type { CriticalIssue } from '@/types';
import { formatCriticalIssue } from './utils';

interface CriticalIssuesCardProps {
  issues: Array<string | CriticalIssue>;
}

export const CriticalIssuesCard = memo(function CriticalIssuesCard({ issues }: CriticalIssuesCardProps) {
  if (issues.length === 0) return null;

  return (
    <div className="bg-danger-50 rounded-xl border border-danger-200 p-4 mb-6">
      <h3 className="text-sm font-semibold text-danger-700 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
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
