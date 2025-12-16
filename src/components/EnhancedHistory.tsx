'use client';

import { useState, memo } from 'react';
import dynamic from 'next/dynamic';
import { AnalyticsPortal } from './analytics';
import {
  HistoryEmptyState,
  HistoryErrorState,
  HistoryHeader,
  HistoryLoadingSkeleton,
  RepoGroupItem,
  VirtualizedList,
  useHistoryData,
} from './history';

// Lazy load DashboardStats since it's not always visible
const DashboardStats = dynamic(() => import('./DashboardStats').then(mod => ({ default: mod.DashboardStats })), {
  ssr: false,
});

interface EnhancedHistoryProps {
  apiBase: string;
  onSelectEvaluation: (evaluationId: string) => void;
  showStats?: boolean;
}

export const EnhancedHistory = memo(function EnhancedHistory({ apiBase, onSelectEvaluation, showStats: showStatsProp = true }: EnhancedHistoryProps) {
  const [showStats, setShowStats] = useState(showStatsProp);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const {
    evaluations,
    costAggregation,
    loading,
    error,
    filteredEvaluations,
    groupedByRepo,
    sortedFlat,
    searchQuery,
    setSearchQuery,
    scoreFilter,
    setScoreFilter,
    sortField,
    sortOrder,
    setSortField,
    setSortOrder,
    viewMode,
    setViewMode,
    expandedRepos,
    toggleRepoExpanded,
    fetchEvaluations,
  } = useHistoryData({ apiBase });

  if (loading) {
    return <HistoryLoadingSkeleton />;
  }

  if (error) {
    return <HistoryErrorState error={error} onRetry={fetchEvaluations} />;
  }

  return (
    <div className="space-y-4">
      {showStats && evaluations.length > 0 && (
        <DashboardStats 
          evaluations={evaluations} 
          costAggregation={costAggregation}
          onOpenAnalytics={() => setShowAnalytics(true)}
        />
      )}
      
      {/* Analytics Portal */}
      <AnalyticsPortal
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        evaluations={evaluations}
        costAggregation={costAggregation}
      />

      <div className="glass dark:bg-navy-900/90 rounded-2xl shadow-xl border border-navy-100 dark:border-navy-700 overflow-hidden">
        <HistoryHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showStats={showStats}
          onToggleStats={() => setShowStats(!showStats)}
          onRefresh={fetchEvaluations}
          groupedByRepo={groupedByRepo}
          filteredEvaluations={filteredEvaluations}
          evaluations={evaluations}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          scoreFilter={scoreFilter}
          onScoreFilterChange={setScoreFilter}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={(field, order) => {
            setSortField(field);
            setSortOrder(order);
          }}
        />

        {/* Evaluation List */}
        {filteredEvaluations.length === 0 ? (
          <HistoryEmptyState hasFilters={!!searchQuery || scoreFilter !== 'all'} />
        ) : viewMode === 'grouped' ? (
          <div className="divide-y divide-navy-100 dark:divide-navy-700 max-h-[500px] overflow-y-auto">
            {groupedByRepo.map((group) => (
              <RepoGroupItem
                key={group.repoUrl}
                group={group}
                isExpanded={expandedRepos.has(group.repoUrl)}
                onToggle={() => toggleRepoExpanded(group.repoUrl)}
                onSelectEvaluation={onSelectEvaluation}
              />
            ))}
          </div>
        ) : (
          <VirtualizedList
            evaluations={sortedFlat}
            onSelectEvaluation={onSelectEvaluation}
          />
        )}
      </div>
    </div>
  );
});
