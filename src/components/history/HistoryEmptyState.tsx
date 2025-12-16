'use client';

import { memo } from 'react';
import { SearchIcon } from '@/components/ui';

interface HistoryEmptyStateProps {
  hasFilters: boolean;
}

export const HistoryEmptyState = memo(function HistoryEmptyState({ hasFilters }: HistoryEmptyStateProps) {
  return (
    <div className="p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-navy-100 dark:bg-navy-700 flex items-center justify-center">
        <SearchIcon className="w-8 h-8 text-navy-400" />
      </div>
      <p className="text-navy-600 dark:text-navy-300 font-medium mb-1">No evaluations found</p>
      <p className="text-sm text-navy-400 dark:text-navy-500">
        {hasFilters ? 'Try adjusting your filters' : 'Submit your first evaluation to get started'}
      </p>
    </div>
  );
});
