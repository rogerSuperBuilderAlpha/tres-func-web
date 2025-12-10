'use client';

type SortField = 'date' | 'score' | 'name';
type SortOrder = 'asc' | 'desc';
type ScoreFilter = 'all' | 'excellent' | 'proficient' | 'needs-work';

interface HistoryFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  scoreFilter: ScoreFilter;
  onScoreFilterChange: (filter: ScoreFilter) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
}

export function HistoryFilters({
  searchQuery,
  onSearchChange,
  scoreFilter,
  onScoreFilterChange,
  sortField,
  sortOrder,
  onSortChange,
}: HistoryFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
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
}

