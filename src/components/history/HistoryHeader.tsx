'use client';

import { memo } from 'react';
import type { SortField, SortOrder, ViewMode, ScoreFilter, RepoGroup } from './types';
import { HistoryFilters } from './HistoryFilters';
import type { EvaluationSummary } from '@/types';
import { ClockIcon, StackIcon, ListIcon, ChartBarIcon, RefreshIcon } from '@/components/ui';

interface HistoryHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showStats: boolean;
  onToggleStats: () => void;
  onRefresh: () => void;
  groupedByRepo: RepoGroup[];
  filteredEvaluations: EvaluationSummary[];
  evaluations: EvaluationSummary[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  scoreFilter: ScoreFilter;
  onScoreFilterChange: (filter: ScoreFilter) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
}

export const HistoryHeader = memo(function HistoryHeader({
  viewMode,
  onViewModeChange,
  showStats,
  onToggleStats,
  onRefresh,
  groupedByRepo,
  filteredEvaluations,
  evaluations,
  searchQuery,
  onSearchChange,
  scoreFilter,
  onScoreFilterChange,
  sortField,
  sortOrder,
  onSortChange,
}: HistoryHeaderProps) {
  return (
    <div className="p-4 border-b border-navy-100 dark:border-navy-700 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy-100 dark:bg-navy-700">
            <ClockIcon className="w-4 h-4 text-navy-600 dark:text-navy-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-navy-900 dark:text-white">Evaluation History</h3>
            <p className="text-xs text-navy-500 dark:text-navy-400">
              {viewMode === 'grouped'
                ? `${groupedByRepo.length} repos, ${filteredEvaluations.length} runs`
                : `${filteredEvaluations.length} of ${evaluations.length} evaluations`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-navy-100 dark:bg-navy-800 rounded-lg p-0.5">
            <button
              onClick={() => onViewModeChange('grouped')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                viewMode === 'grouped'
                  ? 'bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-sm'
                  : 'text-navy-600 dark:text-navy-400 hover:text-navy-800 dark:hover:text-navy-200'
              }`}
              title="Group by repo"
            >
              <StackIcon className="w-3.5 h-3.5" />
              Grouped
            </button>
            <button
              onClick={() => onViewModeChange('flat')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                viewMode === 'flat'
                  ? 'bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-sm'
                  : 'text-navy-600 dark:text-navy-400 hover:text-navy-800 dark:hover:text-navy-200'
              }`}
              title="Flat list"
            >
              <ListIcon className="w-3.5 h-3.5" />
              List
            </button>
          </div>
          <button
            onClick={onToggleStats}
            className={`p-2 rounded-lg transition ${
              showStats
                ? 'bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400'
                : 'text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-700'
            }`}
            title="Toggle statistics"
          >
            <ChartBarIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onRefresh}
            className="p-2 text-navy-400 hover:text-navy-600 dark:hover:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-700 rounded-lg transition"
            title="Refresh"
          >
            <RefreshIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <HistoryFilters
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        scoreFilter={scoreFilter}
        onScoreFilterChange={onScoreFilterChange}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={onSortChange}
      />
    </div>
  );
});




