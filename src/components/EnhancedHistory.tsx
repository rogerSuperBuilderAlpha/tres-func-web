'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { EvaluationSummary, CostAggregation } from '@/types';
import { DashboardStats } from './DashboardStats';
import { AnalyticsPortal } from './analytics';
import {
  EvaluationListItem,
  HistoryEmptyState,
  HistoryErrorState,
  HistoryHeader,
  HistoryLoadingSkeleton,
  RepoGroupItem,
  compareEvaluations,
  compareRepoGroups,
  filterEvaluations,
  groupEvaluationsByRepo,
  type ScoreFilter,
  type SortField,
  type SortOrder,
  type ViewMode,
} from './history';

interface EnhancedHistoryProps {
  apiBase: string;
  onSelectEvaluation: (evaluationId: string) => void;
  showStats?: boolean;
}

export function EnhancedHistory({ apiBase, onSelectEvaluation, showStats: showStatsProp = true }: EnhancedHistoryProps) {
  const [evaluations, setEvaluations] = useState<EvaluationSummary[]>([]);
  const [costAggregation, setCostAggregation] = useState<CostAggregation | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showStats, setShowStats] = useState(showStatsProp);
  const [viewMode, setViewMode] = useState<ViewMode>('grouped');
  const [expandedRepos, setExpandedRepos] = useState<Set<string>>(new Set());
  const [showAnalytics, setShowAnalytics] = useState(false);

  const fetchEvaluations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/evaluations?limit=50`);
      if (!response.ok) throw new Error('Failed to fetch evaluations');
      const data = await response.json();
      setEvaluations(data.evaluations || []);
      setCostAggregation(data.costAggregation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  // Filter evaluations
  const filteredEvaluations = useMemo(() => {
    return filterEvaluations(evaluations, searchQuery, scoreFilter);
  }, [evaluations, searchQuery, scoreFilter]);

  // Group evaluations by repo
  const groupedByRepo = useMemo(() => {
    const groups = groupEvaluationsByRepo(filteredEvaluations);
    return [...groups].sort(compareRepoGroups(sortField, sortOrder));
  }, [filteredEvaluations, sortField, sortOrder]);

  // Flat sorted list
  const sortedFlat = useMemo(() => {
    let result = [...filteredEvaluations];
    result.sort(compareEvaluations(sortField, sortOrder));
    return result;
  }, [filteredEvaluations, sortField, sortOrder]);

  const toggleRepoExpanded = (repoUrl: string) => {
    setExpandedRepos(prev => {
      const next = new Set(prev);
      if (next.has(repoUrl)) next.delete(repoUrl);
      else next.add(repoUrl);
      return next;
    });
  };

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
          <div className="divide-y divide-navy-100 dark:divide-navy-700 max-h-[500px] overflow-y-auto">
            {sortedFlat.map((evaluation) => (
              <EvaluationListItem
                key={evaluation.evaluationId}
                evaluation={evaluation}
                onClick={() => onSelectEvaluation(evaluation.evaluationId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
