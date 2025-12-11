'use client';

import { useState, useEffect, useMemo } from 'react';
import type { EvaluationSummary, CostAggregation } from '@/types';
import { extractRepoName } from '@/lib/utils';
import { SCORE_THRESHOLDS } from '@/lib/constants';
import { DashboardStats } from './DashboardStats';
import { HistoryFilters, EvaluationListItem, RepoGroupItem } from './history';

interface EnhancedHistoryProps {
  apiBase: string;
  onSelectEvaluation: (evaluationId: string) => void;
  showStats?: boolean;
}

type SortField = 'date' | 'score' | 'name';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'flat' | 'grouped';
type ScoreFilter = 'all' | 'excellent' | 'proficient' | 'needs-work';

interface RepoGroup {
  repoUrl: string;
  repoName: string;
  evaluations: EvaluationSummary[];
  latestScore: number;
  latestDate: string;
  bestScore: number;
  runCount: number;
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

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
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
  };

  // Filter evaluations
  const filteredEvaluations = useMemo(() => {
    let result = [...evaluations];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.repoUrl.toLowerCase().includes(query) ||
          e.evaluationId.toLowerCase().includes(query) ||
          extractRepoName(e.repoUrl).toLowerCase().includes(query)
      );
    }

    if (scoreFilter !== 'all') {
      result = result.filter((e) => {
        const score = e.rubricScore ?? e.overallScore ?? 0;
        switch (scoreFilter) {
          case 'excellent': return score >= SCORE_THRESHOLDS.EXCELLENT_MIN;
          case 'proficient': return score >= SCORE_THRESHOLDS.PROFICIENT_MIN && score < SCORE_THRESHOLDS.EXCELLENT_MIN;
          case 'needs-work': return score < SCORE_THRESHOLDS.PROFICIENT_MIN;
          default: return true;
        }
      });
    }

    return result;
  }, [evaluations, searchQuery, scoreFilter]);

  // Group evaluations by repo
  const groupedByRepo = useMemo(() => {
    const groups = new Map<string, RepoGroup>();
    
    for (const evaluation of filteredEvaluations) {
      const repoUrl = evaluation.repoUrl;
      const score = evaluation.rubricScore ?? evaluation.overallScore ?? 0;
      
      if (!groups.has(repoUrl)) {
        groups.set(repoUrl, {
          repoUrl,
          repoName: extractRepoName(repoUrl),
          evaluations: [],
          latestScore: score,
          latestDate: evaluation.evaluatedAt,
          bestScore: score,
          runCount: 0,
        });
      }
      
      const group = groups.get(repoUrl)!;
      group.evaluations.push(evaluation);
      group.runCount++;
      
      if (score > group.bestScore) group.bestScore = score;
      if (new Date(evaluation.evaluatedAt) > new Date(group.latestDate)) {
        group.latestDate = evaluation.evaluatedAt;
        group.latestScore = score;
      }
    }
    
    Array.from(groups.values()).forEach(group => {
      group.evaluations.sort((a, b) => 
        new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime()
      );
    });
    
    let sortedGroups = Array.from(groups.values());
    sortedGroups.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date': comparison = new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime(); break;
        case 'score': comparison = b.bestScore - a.bestScore; break;
        case 'name': comparison = a.repoName.localeCompare(b.repoName); break;
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });
    
    return sortedGroups;
  }, [filteredEvaluations, sortField, sortOrder]);

  // Flat sorted list
  const sortedFlat = useMemo(() => {
    let result = [...filteredEvaluations];
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date': comparison = new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime(); break;
        case 'score': comparison = (b.rubricScore ?? b.overallScore ?? 0) - (a.rubricScore ?? a.overallScore ?? 0); break;
        case 'name': comparison = extractRepoName(a.repoUrl).localeCompare(extractRepoName(b.repoUrl)); break;
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });
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
    return (
      <div className="space-y-4">
        <div className="glass rounded-2xl shadow-xl border border-navy-100 p-6 dark:bg-navy-900/90 dark:border-navy-700">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-navy-100 dark:bg-navy-700 rounded w-1/3"></div>
            <div className="h-10 bg-navy-100 dark:bg-navy-700 rounded"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-navy-100 dark:bg-navy-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-2xl shadow-xl border border-navy-100 p-6 dark:bg-navy-900/90 dark:border-navy-700">
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-danger-600 dark:text-danger-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-danger-600 dark:text-danger-400 mb-4 text-sm">{error}</p>
          <button onClick={fetchEvaluations} className="px-4 py-2 bg-navy-700 text-white rounded-lg hover:bg-navy-600 transition text-sm font-medium">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showStats && evaluations.length > 0 && <DashboardStats evaluations={evaluations} costAggregation={costAggregation} />}

      <div className="glass dark:bg-navy-900/90 rounded-2xl shadow-xl border border-navy-100 dark:border-navy-700 overflow-hidden">
        {/* Header */}
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
                    : `${filteredEvaluations.length} of ${evaluations.length} evaluations`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex bg-navy-100 dark:bg-navy-800 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grouped')}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                    viewMode === 'grouped'
                      ? 'bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-sm'
                      : 'text-navy-600 dark:text-navy-400 hover:text-navy-800 dark:hover:text-navy-200'
                  }`}
                  title="Group by repo"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Grouped
                </button>
                <button
                  onClick={() => setViewMode('flat')}
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
                onClick={() => setShowStats(!showStats)}
                className={`p-2 rounded-lg transition ${showStats ? 'bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400' : 'text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-700'}`}
                title="Toggle statistics"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
              <button
                onClick={fetchEvaluations}
                className="p-2 text-navy-400 hover:text-navy-600 dark:hover:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-700 rounded-lg transition"
                title="Refresh"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          <HistoryFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            scoreFilter={scoreFilter}
            onScoreFilterChange={setScoreFilter}
            sortField={sortField}
            sortOrder={sortOrder}
            onSortChange={(field, order) => { setSortField(field); setSortOrder(order); }}
          />
        </div>

        {/* Evaluation List */}
        {filteredEvaluations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-navy-100 dark:bg-navy-700 flex items-center justify-center">
              <svg className="w-8 h-8 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-navy-600 dark:text-navy-300 font-medium mb-1">No evaluations found</p>
            <p className="text-sm text-navy-400 dark:text-navy-500">
              {searchQuery || scoreFilter !== 'all' ? 'Try adjusting your filters' : 'Submit your first evaluation to get started'}
            </p>
          </div>
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
