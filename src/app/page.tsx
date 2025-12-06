'use client';

import { useState } from 'react';
import { SubmissionForm } from '@/components/SubmissionForm';
import { EvaluationStatus } from '@/components/EvaluationStatus';
import { EvaluationReport } from '@/components/EvaluationReport';

interface Evaluation {
  evaluationId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  reportUrl?: string;
  report?: EvaluationReportData;
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
      const response = await fetch(`${API_BASE}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl, deployedUrl }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit: ${response.statusText}`);
      }

      const data = await response.json();
      setEvaluation({
        evaluationId: data.evaluationId,
        status: 'PROCESSING',
        reportUrl: data.reportUrl,
      });

      // Start polling for status
      pollStatus(data.evaluationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit evaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollStatus = async (evaluationId: string) => {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`${API_BASE}/status/${evaluationId}`);
        const data = await response.json();

        if (data.status === 'COMPLETED' && data.report) {
          setEvaluation({
            evaluationId,
            status: 'COMPLETED',
            reportUrl: data.reportUrl,
            report: data.report,
          });
          return;
        }

        if (data.status === 'FAILED') {
          setEvaluation({
            evaluationId,
            status: 'FAILED',
          });
          setError(data.error || 'Evaluation failed');
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        } else {
          setError('Evaluation timed out. Please check back later.');
        }
      } catch (err) {
        setError('Failed to check evaluation status');
      }
    };

    poll();
  };

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
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {!evaluation ? (
          <SubmissionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        ) : evaluation.status === 'PROCESSING' ? (
          <EvaluationStatus evaluationId={evaluation.evaluationId} />
        ) : evaluation.status === 'COMPLETED' && evaluation.report ? (
          <EvaluationReport report={evaluation.report} onReset={handleReset} />
        ) : (
          <div className="text-center">
            <p className="text-red-600 mb-4">Evaluation failed</p>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
