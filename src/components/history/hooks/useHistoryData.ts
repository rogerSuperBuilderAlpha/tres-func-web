'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { EvaluationSummary, CostAggregation } from '@/types';
import type { ScoreFilter, SortField, SortOrder, ViewMode, RepoGroup } from '../types';
import { compareEvaluations, compareRepoGroups, filterEvaluations, groupEvaluationsByRepo } from '../utils';

interface UseHistoryDataOptions {
  apiBase: string;
}

interface UseHistoryDataReturn {
  // Data
  evaluations: EvaluationSummary[];
  costAggregation?: CostAggregation;
  loading: boolean;
  error: string | null;
  
  // Filtered/sorted data
  filteredEvaluations: EvaluationSummary[];
  groupedByRepo: RepoGroup[];
  sortedFlat: EvaluationSummary[];
  
  // Filters state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  scoreFilter: ScoreFilter;
  setScoreFilter: (filter: ScoreFilter) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  
  // View state
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  expandedRepos: Set<string>;
  toggleRepoExpanded: (repoUrl: string) => void;
  
  // Actions
  fetchEvaluations: () => Promise<void>;
}

export function useHistoryData({ apiBase }: UseHistoryDataOptions): UseHistoryDataReturn {
  const [evaluations, setEvaluations] = useState<EvaluationSummary[]>([]);
  const [costAggregation, setCostAggregation] = useState<CostAggregation | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grouped');
  const [expandedRepos, setExpandedRepos] = useState<Set<string>>(new Set());

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
    const result = [...filteredEvaluations];
    result.sort(compareEvaluations(sortField, sortOrder));
    return result;
  }, [filteredEvaluations, sortField, sortOrder]);

  const toggleRepoExpanded = useCallback((repoUrl: string) => {
    setExpandedRepos(prev => {
      const next = new Set(prev);
      if (next.has(repoUrl)) next.delete(repoUrl);
      else next.add(repoUrl);
      return next;
    });
  }, []);

  return {
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
  };
}
