'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { EvaluationSummary, CostAggregation } from '@/types';
import type { ScoreFilter, SortField, SortOrder, ViewMode, RepoGroup } from '../types';
import { compareEvaluations, compareRepoGroups, filterEvaluations, groupEvaluationsByRepo } from '../utils';

// Simple cache for evaluations list (shared across all instances)
const evaluationsCache = {
  data: null as { evaluations: EvaluationSummary[]; costAggregation?: CostAggregation } | null,
  timestamp: 0,
  TTL: 30000, // 30 second cache
};

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
  refreshEvaluations: () => Promise<void>;
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

  const isMountedRef = useRef(true);

  const fetchEvaluations = useCallback(async (forceRefresh = false) => {
    // Check cache first (unless force refresh)
    const now = Date.now();
    if (!forceRefresh && evaluationsCache.data && now - evaluationsCache.timestamp < evaluationsCache.TTL) {
      setEvaluations(evaluationsCache.data.evaluations);
      setCostAggregation(evaluationsCache.data.costAggregation);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/evaluations?limit=50`);
      if (!response.ok) throw new Error('Failed to fetch evaluations');
      const data = await response.json();
      
      // Update cache
      evaluationsCache.data = { evaluations: data.evaluations || [], costAggregation: data.costAggregation };
      evaluationsCache.timestamp = now;
      
      if (isMountedRef.current) {
        setEvaluations(data.evaluations || []);
        setCostAggregation(data.costAggregation);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load history');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiBase]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchEvaluations();
    return () => { isMountedRef.current = false; };
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
    refreshEvaluations: () => fetchEvaluations(true),
  };
}
