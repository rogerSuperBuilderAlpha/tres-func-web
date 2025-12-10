'use client';

import { useState, useEffect, useMemo } from 'react';
import type { EvaluationSummary } from '@/types';
import { getPerformanceTier, formatDate, extractRepoName } from '@/lib/utils';
import { Badge } from '@/components/ui';
import { DashboardStats } from './DashboardStats';

interface EnhancedHistoryProps {
  apiBase: string;
  onSelectEvaluation: (evaluationId: string) => void;
  showStats?: boolean;
}

type SortField = 'date' | 'score' | 'name';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'flat' | 'grouped';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'excellent' | 'proficient' | 'needs-work'>('all');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  // Filter evaluations
  const filteredEvaluations = useMemo(() => {
    let result = [...evaluations];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.repoUrl.toLowerCase().includes(query) ||
          e.evaluationId.toLowerCase().includes(query) ||
          extractRepoName(e.repoUrl).toLowerCase().includes(query)
      );
    }

    // Score filter
    if (scoreFilter !== 'all') {
      result = result.filter((e) => {
        const score = e.rubricScore ?? e.overallScore ?? 0;
        switch (scoreFilter) {
          case 'excellent':
            return score >= 75;
          case 'proficient':
            return score >= 54 && score < 75;
          case 'needs-work':
            return score < 54;
          default:
            return true;
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
      
      // Update best score
      if (score > group.bestScore) {
        group.bestScore = score;
      }
      
      // Update latest
      if (new Date(evaluation.evaluatedAt) > new Date(group.latestDate)) {
        group.latestDate = evaluation.evaluatedAt;
        group.latestScore = score;
      }
    }
    
    // Sort evaluations within each group by date (newest first)
    Array.from(groups.values()).forEach(group => {
      group.evaluations.sort((a, b) => 
        new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime()
      );
    });
    
    // Sort groups
    let sortedGroups = Array.from(groups.values());
    sortedGroups.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime();
          break;
        case 'score':
          comparison = b.bestScore - a.bestScore;
          break;
        case 'name':
          comparison = a.repoName.localeCompare(b.repoName);
          break;
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
        case 'date':
          comparison = new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime();
          break;
        case 'score':
          comparison = (b.rubricScore ?? b.overallScore ?? 0) - (a.rubricScore ?? a.overallScore ?? 0);
          break;
        case 'name':
          comparison = extractRepoName(a.repoUrl).localeCompare(extractRepoName(b.repoUrl));
          break;
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });
    return result;
  }, [filteredEvaluations, sortField, sortOrder]);

  const toggleRepoExpanded = (repoUrl: string) => {
    setExpandedRepos(prev => {
      const next = new Set(prev);
      if (next.has(repoUrl)) {
        next.delete(repoUrl);
      } else {
        next.add(repoUrl);
      }
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

  const uniqueRepoCount = new Set(evaluations.map(e => e.repoUrl)).size;

  return (
    <div className="space-y-4">
      {/* Stats Section */}
      {showStats && evaluations.length > 0 && (
        <DashboardStats evaluations={evaluations} />
      )}

      {/* History List */}
      <div className="glass dark:bg-navy-900/90 rounded-2xl shadow-xl border border-navy-100 dark:border-navy-700 overflow-hidden">
        {/* Header with controls */}
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

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                  onClick={() => setScoreFilter(filter)}
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
                setSortField(field);
                setSortOrder(order);
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
          // Grouped by Repo View
          <div className="divide-y divide-navy-100 dark:divide-navy-700 max-h-[500px] overflow-y-auto">
            {groupedByRepo.map((group) => {
              const isExpanded = expandedRepos.has(group.repoUrl);
              const latestTier = getPerformanceTier(group.latestScore);
              const bestTier = getPerformanceTier(group.bestScore);
              
              return (
                <div key={group.repoUrl} className="bg-white dark:bg-navy-900">
                  {/* Repo Header */}
                  <div
                    className="px-4 py-3 hover:bg-navy-50/50 dark:hover:bg-navy-800/50 cursor-pointer transition"
                    onClick={() => toggleRepoExpanded(group.repoUrl)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button className="p-1 hover:bg-navy-100 dark:hover:bg-navy-700 rounded transition flex-shrink-0">
                          <svg 
                            className={`w-4 h-4 text-navy-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-semibold text-navy-900 dark:text-white truncate">
                              {group.repoName}
                            </span>
                            <span className="text-xs text-navy-400 dark:text-navy-500 flex-shrink-0">
                              {group.runCount} run{group.runCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-navy-500 dark:text-navy-400">
                            <span className="flex items-center gap-1">
                              <span className="text-navy-400">Latest:</span>
                              <Badge variant={latestTier.variant as 'success' | 'warning' | 'danger'} size="sm">
                                {group.latestScore}/90
                              </Badge>
                            </span>
                            {group.bestScore !== group.latestScore && (
                              <span className="flex items-center gap-1">
                                <span className="text-navy-400">Best:</span>
                                <Badge variant={bestTier.variant as 'success' | 'warning' | 'danger'} size="sm">
                                  {group.bestScore}/90
                                </Badge>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-navy-400 dark:text-navy-500 flex-shrink-0 ml-2">
                        {formatDate(group.latestDate)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Runs */}
                  {isExpanded && (
                    <div className="bg-navy-50/50 dark:bg-navy-800/30 border-t border-navy-100 dark:border-navy-700">
                      {group.evaluations.map((evaluation, idx) => {
                        const score = evaluation.rubricScore ?? evaluation.overallScore ?? 0;
                        const tier = getPerformanceTier(score);
                        const isLatest = idx === 0;
                        
                        return (
                          <div
                            key={evaluation.evaluationId}
                            className="pl-12 pr-4 py-2 hover:bg-navy-100/50 dark:hover:bg-navy-700/50 cursor-pointer transition border-b border-navy-100/50 dark:border-navy-700/50 last:border-b-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectEvaluation(evaluation.evaluationId);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {isLatest && (
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 rounded">
                                    LATEST
                                  </span>
                                )}
                                <Badge variant={tier.variant as 'success' | 'warning' | 'danger'} size="sm">
                                  {score}/90
                                </Badge>
                                <span className="text-xs font-mono text-navy-400 dark:text-navy-500">
                                  {evaluation.evaluationId}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-navy-400 dark:text-navy-500">
                                  {formatDate(evaluation.evaluatedAt)}
                                </span>
                                <svg className="w-4 h-4 text-navy-300 dark:text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Flat List View
          <div className="divide-y divide-navy-100 dark:divide-navy-700 max-h-[500px] overflow-y-auto">
            {sortedFlat.map((evaluation) => {
              const score = evaluation.rubricScore ?? evaluation.overallScore ?? 0;
              const tier = getPerformanceTier(score);
              return (
                <div
                  key={evaluation.evaluationId}
                  className="px-4 py-3 hover:bg-navy-50/50 dark:hover:bg-navy-800/50 cursor-pointer transition group"
                  onClick={() => onSelectEvaluation(evaluation.evaluationId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={tier.variant as 'success' | 'warning' | 'danger'} size="sm">
                          {tier.label}
                        </Badge>
                        <span className="text-sm font-mono font-semibold text-navy-700 dark:text-navy-300">{score}/90</span>
                      </div>
                      <p className="text-sm text-navy-800 dark:text-navy-200 truncate font-medium group-hover:text-navy-900 dark:group-hover:text-white">
                        {extractRepoName(evaluation.repoUrl)}
                      </p>
                      <p className="text-xs text-navy-400 dark:text-navy-500 mt-0.5">{formatDate(evaluation.evaluatedAt)}</p>
                      {evaluation.criticalFailuresCount > 0 && (
                        <p className="text-xs text-danger-600 dark:text-danger-400 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {evaluation.criticalFailuresCount} critical
                        </p>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-navy-300 dark:text-navy-600 group-hover:text-navy-500 dark:group-hover:text-navy-400 transition ml-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
