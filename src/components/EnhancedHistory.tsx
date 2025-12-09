'use client';

import { useState, useEffect, useMemo } from 'react';
import type { EvaluationSummary } from '@/types';
import { getPerformanceTier, formatDate, extractRepoName } from '@/lib/utils';
import { Badge } from '@/components/ui';
import { DashboardStats } from './DashboardStats';

interface EnhancedHistoryProps {
  apiBase: string;
  onSelectEvaluation: (evaluationId: string) => void;
}

type SortField = 'date' | 'score' | 'name';
type SortOrder = 'asc' | 'desc';

export function EnhancedHistory({ apiBase, onSelectEvaluation }: EnhancedHistoryProps) {
  const [evaluations, setEvaluations] = useState<EvaluationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'excellent' | 'proficient' | 'needs-work'>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showStats, setShowStats] = useState(true);

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

  // Filter and sort evaluations
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

    // Sort
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
  }, [evaluations, searchQuery, scoreFilter, sortField, sortOrder]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="glass rounded-2xl shadow-xl border border-navy-100 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-navy-100 rounded w-1/3"></div>
            <div className="h-10 bg-navy-100 rounded"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-navy-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-2xl shadow-xl border border-navy-100 p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-danger-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-danger-600 mb-4 text-sm">{error}</p>
          <button onClick={fetchEvaluations} className="px-4 py-2 bg-navy-700 text-white rounded-lg hover:bg-navy-600 transition text-sm font-medium">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Section */}
      {showStats && evaluations.length > 0 && (
        <DashboardStats evaluations={evaluations} />
      )}

      {/* History List */}
      <div className="glass rounded-2xl shadow-xl border border-navy-100 overflow-hidden">
        {/* Header with controls */}
        <div className="p-4 border-b border-navy-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy-100">
                <svg className="w-4 h-4 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-navy-900">Evaluation History</h3>
                <p className="text-xs text-navy-500">{filteredEvaluations.length} of {evaluations.length} evaluations</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className={`p-2 rounded-lg transition ${showStats ? 'bg-gold-100 text-gold-700' : 'text-navy-400 hover:bg-navy-100'}`}
                title="Toggle statistics"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
              <button
                onClick={fetchEvaluations}
                className="p-2 text-navy-400 hover:text-navy-600 hover:bg-navy-100 rounded-lg transition"
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
              className="w-full pl-10 pr-4 py-2 bg-navy-50 border border-navy-200 rounded-lg focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition text-sm"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-2">
            {/* Score Filter */}
            <div className="flex bg-navy-100 rounded-lg p-0.5">
              {(['all', 'excellent', 'proficient', 'needs-work'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setScoreFilter(filter)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                    scoreFilter === filter
                      ? 'bg-white text-navy-900 shadow-sm'
                      : 'text-navy-600 hover:text-navy-800'
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
              className="px-3 py-1 text-xs font-medium bg-navy-100 border-none rounded-lg focus:ring-2 focus:ring-gold-400"
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
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-navy-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-navy-600 font-medium mb-1">No evaluations found</p>
            <p className="text-sm text-navy-400">
              {searchQuery || scoreFilter !== 'all' ? 'Try adjusting your filters' : 'Submit your first evaluation to get started'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-navy-100 max-h-[400px] overflow-y-auto">
            {filteredEvaluations.map((evaluation) => {
              const score = evaluation.rubricScore ?? evaluation.overallScore ?? 0;
              const tier = getPerformanceTier(score);
              return (
                <div
                  key={evaluation.evaluationId}
                  className="px-4 py-3 hover:bg-navy-50/50 cursor-pointer transition group"
                  onClick={() => onSelectEvaluation(evaluation.evaluationId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={tier.variant as 'success' | 'warning' | 'danger'} size="sm">
                          {tier.label}
                        </Badge>
                        <span className="text-sm font-mono font-semibold text-navy-700">{score}/90</span>
                      </div>
                      <p className="text-sm text-navy-800 truncate font-medium group-hover:text-navy-900">
                        {extractRepoName(evaluation.repoUrl)}
                      </p>
                      <p className="text-xs text-navy-400 mt-0.5">{formatDate(evaluation.evaluatedAt)}</p>
                      {evaluation.criticalFailuresCount > 0 && (
                        <p className="text-xs text-danger-600 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {evaluation.criticalFailuresCount} critical
                        </p>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-navy-300 group-hover:text-navy-500 transition ml-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

