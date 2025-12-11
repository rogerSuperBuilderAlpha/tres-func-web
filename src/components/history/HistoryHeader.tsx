'use client';

import type { SortField, SortOrder, ViewMode, ScoreFilter, RepoGroup } from './types';
import { HistoryFilters } from './HistoryFilters';
import type { EvaluationSummary } from '@/types';

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

export function HistoryHeader({
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
            <svg className="w-4 h-4 text-navy-600 dark:text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
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
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
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
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </button>
          <button
            onClick={onRefresh}
            className="p-2 text-navy-400 hover:text-navy-600 dark:hover:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-700 rounded-lg transition"
            title="Refresh"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
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
}

