'use client';

import { memo } from 'react';

interface HistoryEmptyStateProps {
  hasFilters: boolean;
}

export const HistoryEmptyState = memo(function HistoryEmptyState({ hasFilters }: HistoryEmptyStateProps) {
  return (
    <div className="p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-navy-100 dark:bg-navy-700 flex items-center justify-center">
        <svg className="w-8 h-8 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <p className="text-navy-600 dark:text-navy-300 font-medium mb-1">No evaluations found</p>
      <p className="text-sm text-navy-400 dark:text-navy-500">
        {hasFilters ? 'Try adjusting your filters' : 'Submit your first evaluation to get started'}
      </p>
    </div>
  );
});


