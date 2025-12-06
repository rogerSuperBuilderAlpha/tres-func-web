'use client';

import { useState, useCallback } from 'react';
import { SubmissionForm } from '@/components/SubmissionForm';
import { EvaluationStatus } from '@/components/EvaluationStatus';
import { EvaluationReport } from '@/components/EvaluationReport';

interface Evaluation {
  evaluationId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  reportUrl?: string;
  report?: EvaluationReportData;
  error?: string;
  pollAttempts?: number;
}

export interface EvaluationReportData {
  submissionId: string;
  evaluatedAt: string;
  repoUrl: string;
  deployedUrl: string;
  scores: {
    security: number;
    errorHandling: number;
    edgeCases: number;
    codeQuality: number;
    documentation: number;
    functional: number;
    overall: number;
  };
  tier: 'STRONG_HIRE' | 'MAYBE' | 'NO_HIRE';
  tierReason: string;
  criticalFailures: string[];
  summary: {
    strengths: string[];
    concerns: string[];
    recommendations: string[];
  };
  suites?: {
    repoAnalysis?: {
      cloneSuccess: boolean;
      cloneError?: string;
    };
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://3mw2hq6l57.execute-api.us-east-1.amazonaws.com/prod';

export default function Home() {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (repoUrl: string, deployedUrl: string) => {
    setIsSubmitting(true);
    setError(null);
    setEvaluation(null);

    try {
      console.log('Submitting evaluation request...');
      const response = await fetch(`${API_BASE}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl, deployedUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `API error: ${response.status} ${response.statusText}`);
      }

      if (!data.evaluationId) {
        throw new Error('Invalid response: missing evaluationId');
      }

      console.log('Evaluation started:', data.evaluationId);
      setEvaluation({
        evaluationId: data.evaluationId,
        status: 'PROCESSING',
        reportUrl: data.reportUrl,
        pollAttempts: 0,
      });

      // Start polling for status
      pollStatus(data.evaluationId);
    } catch (err) {
      console.error('Submit error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit evaluation';
      setError(errorMessage);
      setEvaluation(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollStatus = useCallback(async (evaluationId: string) => {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;
    let consecutiveErrors = 0;

    const poll = async () => {
      attempts++;
      console.log(`Polling status attempt ${attempts}/${maxAttempts}`);

      try {
        const response = await fetch(`${API_BASE}/status/${evaluationId}`);

        if (!response.ok) {
          throw new Error(`Status check failed: ${response.status}`);
        }

        const data = await response.json();
        consecutiveErrors = 0; // Reset on success

        // Update poll attempts for UI
        setEvaluation(prev => prev ? { ...prev, pollAttempts: attempts } : null);

        if (data.status === 'COMPLETED' && data.report) {
          console.log('Evaluation completed');
          setEvaluation({
            evaluationId,
            status: 'COMPLETED',
            reportUrl: data.reportUrl,
            report: data.report,
          });
          return;
        }

        if (data.status === 'FAILED') {
          console.log('Evaluation failed:', data.error);
          setEvaluation({
            evaluationId,
            status: 'FAILED',
            error: data.error,
          });
          setError(data.error || 'Evaluation failed. The repository may be private or inaccessible.');
          return;
        }

        // Still processing
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        } else {
          setError('Evaluation timed out after 5 minutes. The evaluation may still be running - check back later.');
          setEvaluation(prev => prev ? { ...prev, status: 'FAILED' } : null);
        }
      } catch (err) {
        console.error('Poll error:', err);
        consecutiveErrors++;

        if (consecutiveErrors >= 3) {
          setError(`Failed to check status after ${consecutiveErrors} attempts. Please refresh and try again.`);
          setEvaluation(prev => prev ? { ...prev, status: 'FAILED' } : null);
          return;
        }

        // Retry with backoff
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000 * consecutiveErrors);
        }
      }
    };

    poll();
  }, []);

  const handleReset = () => {
    setEvaluation(null);
    setError(null);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            TTB Take-Home Evaluator
          </h1>
          <p className="text-gray-600">
            Submit a candidate&apos;s repository and deployed app for automated evaluation
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
            {evaluation?.status === 'FAILED' && (
              <button
                onClick={handleReset}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Try Again
              </button>
            )}
          </div>
        )}

        {!evaluation ? (
          <SubmissionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        ) : evaluation.status === 'PROCESSING' ? (
          <EvaluationStatus
            evaluationId={evaluation.evaluationId}
            pollAttempts={evaluation.pollAttempts}
          />
        ) : evaluation.status === 'COMPLETED' && evaluation.report ? (
          <EvaluationReport report={evaluation.report} onReset={handleReset} />
        ) : null}
      </div>
    </main>
  );
}
