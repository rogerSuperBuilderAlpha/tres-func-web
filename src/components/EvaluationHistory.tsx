'use client';

import { useState, useEffect } from 'react';
import type { EvaluationSummary } from '@/types';
import { getPerformanceTier, formatDate, extractRepoName } from '@/lib/utils';

interface EvaluationHistoryProps {
  apiBase: string;
  onSelectEvaluation: (evaluationId: string) => void;
}

function SkeletonItem() {
  return (
    <div className="px-5 py-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-4 w-12 rounded" />
          </div>
          <div className="skeleton h-4 w-48 rounded mb-2" />
          <div className="skeleton h-3 w-32 rounded" />
        </div>
        <div className="skeleton h-5 w-5 rounded" />
      </div>
    </div>
  );
}

export function EvaluationHistory({ apiBase, onSelectEvaluation }: EvaluationHistoryProps) {
  const [evaluations, setEvaluations] = useState<EvaluationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/evaluations?limit=20`);
      if (!response.ok) throw new Error('Failed to fetch evaluations');
      const data = await response.json();
      setEvaluations(data.evaluations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const headerContent = (
    <div className="px-5 py-4 border-b border-navy-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy-100">
            <svg className="w-4 h-4 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-navy-900">Recent Evaluations</h3>
        </div>
        {!loading && !error && evaluations.length > 0 && (
          <button
            onClick={fetchEvaluations}
            className="p-2 text-navy-400 hover:text-navy-600 hover:bg-navy-100 rounded-lg transition"
            title="Refresh"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="glass rounded-2xl shadow-xl border border-navy-100 overflow-hidden">
        {headerContent}
        <div className="divide-y divide-navy-100">
          <SkeletonItem />
          <SkeletonItem />
          <SkeletonItem />
          <SkeletonItem />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-2xl shadow-xl border border-navy-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy-100">
            <svg className="w-4 h-4 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-navy-900">Recent Evaluations</h3>
        </div>
        <div className="text-center py-6">
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

  if (evaluations.length === 0) {
    return (
      <div className="glass rounded-2xl shadow-xl border border-navy-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy-100">
            <svg className="w-4 h-4 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-navy-900">Recent Evaluations</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-navy-600 font-medium mb-1">No evaluations yet</p>
          <p className="text-sm text-navy-400">Submit your first evaluation to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl shadow-xl border border-navy-100 overflow-hidden">
      {headerContent}
      <div className="divide-y divide-navy-100 max-h-96 overflow-y-auto">
        {evaluations.map((evaluation) => {
          const score = evaluation.rubricScore ?? evaluation.overallScore ?? 0;
          const tier = getPerformanceTier(score);
          return (
            <div
              key={evaluation.evaluationId}
              className="px-5 py-4 hover:bg-navy-50/50 cursor-pointer transition group"
              onClick={() => onSelectEvaluation(evaluation.evaluationId)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${tier.color}`}>
                      {tier.label}
                    </span>
                    <span className="text-sm font-mono font-medium text-navy-700">{score}/90</span>
                  </div>
                  <p className="text-sm text-navy-800 truncate font-medium group-hover:text-navy-900">
                    {extractRepoName(evaluation.repoUrl)}
                  </p>
                  <p className="text-xs text-navy-400 mt-1">{formatDate(evaluation.evaluatedAt)}</p>
                  {evaluation.criticalFailuresCount > 0 && (
                    <p className="text-xs text-danger-600 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {evaluation.criticalFailuresCount} critical issue{evaluation.criticalFailuresCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <svg className="w-5 h-5 text-navy-300 group-hover:text-navy-500 transition ml-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
