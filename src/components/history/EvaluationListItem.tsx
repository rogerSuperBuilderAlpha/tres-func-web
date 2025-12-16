'use client';

import { memo } from 'react';
import type { EvaluationSummary } from '@/types';
import { getPerformanceTier, formatDate, extractRepoName } from '@/lib/utils';
import { Badge, ChevronRightIcon, ExclamationTriangleIcon } from '@/components/ui';
import { usePrefetch } from '@/hooks';

interface EvaluationListItemProps {
  evaluation: EvaluationSummary;
  onClick: () => void;
}

export const EvaluationListItem = memo(function EvaluationListItem({ evaluation, onClick }: EvaluationListItemProps) {
  const score = evaluation.rubricScore ?? evaluation.overallScore ?? 0;
  const tier = getPerformanceTier(score);
  const { prefetchEvaluation } = usePrefetch();

  return (
    <div
      className="px-4 py-3 hover:bg-navy-50/50 dark:hover:bg-navy-800/50 cursor-pointer transition group"
      onClick={onClick}
      onMouseEnter={() => prefetchEvaluation(evaluation.evaluationId)}
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
              <ExclamationTriangleIcon className="w-3 h-3" />
              {evaluation.criticalFailuresCount} critical
            </p>
          )}
        </div>
        <ChevronRightIcon className="w-5 h-5 text-navy-300 dark:text-navy-600 group-hover:text-navy-500 dark:group-hover:text-navy-400 transition ml-3 flex-shrink-0" />
      </div>
    </div>
  );
});


