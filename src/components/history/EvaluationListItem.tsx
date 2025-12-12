'use client';

import type { EvaluationSummary } from '@/types';
import { getPerformanceTier, formatDate, extractRepoName } from '@/lib/utils';
import { Badge } from '@/components/ui';

interface EvaluationListItemProps {
  evaluation: EvaluationSummary;
  onClick: () => void;
}

export function EvaluationListItem({ evaluation, onClick }: EvaluationListItemProps) {
  const score = evaluation.rubricScore ?? evaluation.overallScore ?? 0;
  const tier = getPerformanceTier(score);

  return (
    <div
      className="px-4 py-3 hover:bg-navy-50/50 dark:hover:bg-navy-800/50 cursor-pointer transition group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={tier.variant as 'success' | 'warning' | 'danger'} size="sm">
              {tier.label}
            </Badge>
            <span className="text-sm font-mono font-semibold text-navy-700 dark:text-navy-300">{score}/90</span>
          </div>
          <p className="text-sm text-navy-800 dark:text-navy-200 truncate font-medium group-hover:text-navy-900 dark:group-hover:text-white">
            {extractRepoName(evaluation.repoUrl)}
          </p>
          <p className="text-xs text-navy-400 dark:text-navy-500 mt-0.5">{formatDate(evaluation.evaluatedAt)}</p>
          {evaluation.criticalFailuresCount > 0 && (
            <p className="text-xs text-danger-600 dark:text-danger-400 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {evaluation.criticalFailuresCount} critical
            </p>
          )}
        </div>
        <svg className="w-5 h-5 text-navy-300 dark:text-navy-600 group-hover:text-navy-500 dark:group-hover:text-navy-400 transition ml-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}




