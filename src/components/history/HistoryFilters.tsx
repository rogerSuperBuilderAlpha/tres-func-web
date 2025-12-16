'use client';

import { memo, useState, useEffect, useRef } from 'react';
import { SearchIcon } from '@/components/ui';
import type { SortField, SortOrder, ScoreFilter } from './types';

interface HistoryFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  scoreFilter: ScoreFilter;
  onScoreFilterChange: (filter: ScoreFilter) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
}

export const HistoryFilters = memo(function HistoryFilters({
  searchQuery,
  onSearchChange,
  scoreFilter,
  onScoreFilterChange,
  sortField,
  sortOrder,
  onSortChange,
}: HistoryFiltersProps) {
  // Local state for immediate UI feedback, debounced for actual filtering
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Sync local state when external searchQuery changes
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounce search changes (150ms)
  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 150);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by repo name or ID..."
          className="w-full pl-10 pr-4 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-600 rounded-lg focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition text-sm text-navy-900 dark:text-navy-100 placeholder:text-navy-400 dark:placeholder:text-navy-500"
        />
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-2">
        {/* Score Filter */}
        <div className="flex bg-navy-100 dark:bg-navy-800 rounded-lg p-0.5">
          {(['all', 'excellent', 'proficient', 'needs-work'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => onScoreFilterChange(filter)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                scoreFilter === filter
                  ? 'bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-sm'
                  : 'text-navy-600 dark:text-navy-400 hover:text-navy-800 dark:hover:text-navy-200'
              }`}
            >
              {filter === 'all' ? 'All' : filter === 'needs-work' ? 'Needs Work' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={`${sortField}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-') as [SortField, SortOrder];
            onSortChange(field, order);
          }}
          className="px-3 py-1 text-xs font-medium bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 border-none rounded-lg focus:ring-2 focus:ring-gold-400"
        >
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="score-desc">Highest score</option>
          <option value="score-asc">Lowest score</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
        </select>
      </div>
    </div>
  );
});
