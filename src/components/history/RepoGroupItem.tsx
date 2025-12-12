'use client';

import { getPerformanceTier, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui';
import type { RepoGroup } from './types';

interface RepoGroupItemProps {
  group: RepoGroup;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectEvaluation: (evaluationId: string) => void;
}

export function RepoGroupItem({ group, isExpanded, onToggle, onSelectEvaluation }: RepoGroupItemProps) {
  const latestTier = getPerformanceTier(group.latestScore);
  const bestTier = getPerformanceTier(group.bestScore);

  return (
    <div className="bg-white dark:bg-navy-900">
      {/* Repo Header */}
      <div
        className="px-4 py-3 hover:bg-navy-50/50 dark:hover:bg-navy-800/50 cursor-pointer transition"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button className="p-1 hover:bg-navy-100 dark:hover:bg-navy-700 rounded transition flex-shrink-0">
              <svg 
                className={`w-4 h-4 text-navy-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-navy-900 dark:text-white truncate">
                  {group.repoName}
                </span>
                <span className="text-xs text-navy-400 dark:text-navy-500 flex-shrink-0">
                  {group.runCount} run{group.runCount !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-navy-500 dark:text-navy-400">
                <span className="flex items-center gap-1">
                  <span className="text-navy-400">Latest:</span>
                  <Badge variant={latestTier.variant as 'success' | 'warning' | 'danger'} size="sm">
                    {group.latestScore}/90
                  </Badge>
                </span>
                {group.bestScore !== group.latestScore && (
                  <span className="flex items-center gap-1">
                    <span className="text-navy-400">Best:</span>
                    <Badge variant={bestTier.variant as 'success' | 'warning' | 'danger'} size="sm">
                      {group.bestScore}/90
                    </Badge>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-xs text-navy-400 dark:text-navy-500 flex-shrink-0 ml-2">
            {formatDate(group.latestDate)}
          </div>
        </div>
      </div>
      
      {/* Expanded Runs */}
      {isExpanded && (
        <div className="bg-navy-50/50 dark:bg-navy-800/30 border-t border-navy-100 dark:border-navy-700">
          {group.evaluations.map((evaluation, idx) => {
            const score = evaluation.rubricScore ?? evaluation.overallScore ?? 0;
            const tier = getPerformanceTier(score);
            const isLatest = idx === 0;
            
            return (
              <div
                key={evaluation.evaluationId}
                className="pl-12 pr-4 py-2 hover:bg-navy-100/50 dark:hover:bg-navy-700/50 cursor-pointer transition border-b border-navy-100/50 dark:border-navy-700/50 last:border-b-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEvaluation(evaluation.evaluationId);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isLatest && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 rounded">
                        LATEST
                      </span>
                    )}
                    <Badge variant={tier.variant as 'success' | 'warning' | 'danger'} size="sm">
                      {score}/90
                    </Badge>
                    <span className="text-xs font-mono text-navy-400 dark:text-navy-500">
                      {evaluation.evaluationId}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-navy-400 dark:text-navy-500">
                      {formatDate(evaluation.evaluatedAt)}
                    </span>
                    <svg className="w-4 h-4 text-navy-300 dark:text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}




