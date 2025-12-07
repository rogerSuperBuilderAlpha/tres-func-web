'use client';

import { useState, useEffect } from 'react';
import type { EvaluationSummary } from '@/types';

interface EvaluationHistoryProps {
  apiBase: string;
  onSelectEvaluation: (evaluationId: string) => void;
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
      if (!response.ok) {
        throw new Error('Failed to fetch evaluations');
      }
      const data = await response.json();
      setEvaluations(data.evaluations || []);
    } catch (err) {
      console.error('Failed to fetch evaluations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  // Get performance tier based on score (out of 90)
  const getPerformanceTier = (score: number) => {
    if (score >= 75) return { label: 'Excellent', color: 'bg-green-100 text-green-800 border-green-200' };
    if (score >= 54) return { label: 'Proficient', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { label: 'Needs Work', color: 'bg-red-100 text-red-800 border-red-200' };
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const extractRepoName = (url: string | undefined | null) => {
    if (!url) return 'Unknown repository';
    try {
      const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
      return match ? match[1] : url;
    } catch {
      return url;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Evaluations</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Evaluations</h3>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchEvaluations}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (evaluations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Evaluations</h3>
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No evaluations yet</p>
          <p className="text-sm mt-1">Submit your first evaluation above</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Evaluations</h3>
          <button
            onClick={fetchEvaluations}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            title="Refresh"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      <div className="divide-y max-h-96 overflow-y-auto">
        {evaluations.map((evaluation) => (
          <div
            key={evaluation.evaluationId}
            className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition"
            onClick={() => onSelectEvaluation(evaluation.evaluationId)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {(() => {
                    const score = evaluation.rubricScore ?? evaluation.overallScore ?? 0;
                    const tier = getPerformanceTier(score);
                    return (
                      <>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${tier.color}`}>
                          {tier.label}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {score}/90
                        </span>
                      </>
                    );
                  })()}
                </div>
                <p className="text-sm text-gray-700 truncate font-medium">
                  {extractRepoName(evaluation.repoUrl)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(evaluation.evaluatedAt)}
                </p>
                {evaluation.criticalFailuresCount > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    {evaluation.criticalFailuresCount} critical issue{evaluation.criticalFailuresCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <svg className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
