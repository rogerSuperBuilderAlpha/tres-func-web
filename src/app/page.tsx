'use client';

import { useState, useCallback } from 'react';
import { SubmissionForm } from '@/components/SubmissionForm';
import { EvaluationStatus, TestProgress } from '@/components/EvaluationStatus';
import { EvaluationReport } from '@/components/EvaluationReport';

interface DetailedProgress {
  testName: string;
  stage: string;
  message: string;
  details?: string;
  percentage?: number;
  timestamp: number;
}

interface Evaluation {
  evaluationId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  reportUrl?: string;
  report?: EvaluationReportData;
  error?: string;
  progress?: TestProgress;
  startTime?: string;
  detailedProgress?: DetailedProgress[];
}

interface AiTestAnalysis {
  testRanSuccessfully: boolean;
  failureAttribution: 'app' | 'test_infrastructure' | 'unclear' | 'none';
  explanation: string;
  scoreAdjustment: number;
  keyFindings: string[];
  shouldCountInScore: boolean;
}

export interface RubricScores {
  coreFunctionality: number;
  codeQuality: number;
  security: number;
  errorHandling: number;
  imageProcessing: number;
  formValidation: number;
  uxAccessibility: number;
  deploymentCompliance: number;
  loadPerformance: number;
  overall: number;
}

export interface AiExecutiveSummary {
  overallAssessment: string;
  hiringRecommendation: string;
  keyStrengths: string[];
  keyWeaknesses: string[];
  fairnessConsiderations: string[];
  scoreBreakdown?: string;
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
    uxDesign: number;
    aiReview: number;
    overall: number;
    rubric?: RubricScores;
  };
  tier: 'STRONG_HIRE' | 'MAYBE' | 'NO_HIRE';
  tierReason: string;
  criticalFailures: string[];
  summary: {
    strengths: string[];
    concerns: string[];
    recommendations: string[];
  };
  aiExecutiveSummary?: AiExecutiveSummary;
  suites?: {
    repoAnalysis?: {
      cloneSuccess: boolean;
      cloneError?: string;
      hasTests?: boolean;
      hasSourceDirectory?: boolean;
      separatesFrontendBackend?: boolean;
      readmeExists?: boolean;
      readmeHasSetupInstructions?: boolean;
      aiAnalysis?: AiTestAnalysis;
    };
    security?: {
      xss?: { brandNameFieldVulnerable?: boolean; productTypeFieldVulnerable?: boolean };
      injection?: { sqlInjectionPayloadsAccepted?: boolean };
      disclosure?: { apiKeysInClientCode?: boolean };
      aiAnalysis?: AiTestAnalysis;
    };
    functional?: {
      scenarioA_Match?: { passed?: boolean };
      scenarioB_BrandMismatch?: { passed?: boolean };
      scenarioC_AbvMismatch?: { passed?: boolean };
      aiAnalysis?: AiTestAnalysis;
    };
    imageEdgeCases?: {
      aiAnalysis?: AiTestAnalysis;
    };
    formInput?: {
      aiAnalysis?: AiTestAnalysis;
    };
    resilience?: {
      aiAnalysis?: AiTestAnalysis;
    };
    uxTest?: {
      pageLoads?: boolean;
      loadTimeMs?: number;
      findings?: string[];
      uxScore?: number;
      aiAnalysis?: AiTestAnalysis;
    };
    aiReview?: {
      overallAssessment?: string;
      codeQualityRating?: string;
      hiringSignal?: string;
    };
    deployment?: {
      urlAccessible?: boolean;
      formRendersCorrectly?: boolean;
      appStartsWithoutModification?: boolean;
      findings?: string[];
      aiAnalysis?: AiTestAnalysis;
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
        startTime: new Date().toISOString(),
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

        // Update progress from API
        setEvaluation(prev => prev ? {
          ...prev,
          progress: data.progress,
          startTime: data.startTime || prev.startTime,
          detailedProgress: data.detailedProgress,
        } : null);

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
    <main className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header - fixed height */}
      <header className="flex-shrink-0 bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              TTB Take-Home Evaluator
            </h1>
            <p className="text-sm text-gray-500">
              Automated candidate evaluation system
            </p>
          </div>
          {evaluation && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              New Evaluation
            </button>
          )}
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="flex-shrink-0 bg-red-50 border-b border-red-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
            {evaluation?.status === 'FAILED' && (
              <button
                onClick={handleReset}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main content - fills remaining space */}
      <div className="flex-1 overflow-hidden">
        {!evaluation ? (
          <div className="h-full flex items-center justify-center p-6">
            <SubmissionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
        ) : evaluation.status === 'PROCESSING' ? (
          <div className="h-full flex items-center justify-center p-6">
            <EvaluationStatus
              evaluationId={evaluation.evaluationId}
              progress={evaluation.progress}
              startTime={evaluation.startTime}
              detailedProgress={evaluation.detailedProgress}
            />
          </div>
        ) : evaluation.status === 'COMPLETED' && evaluation.report ? (
          <EvaluationReport report={evaluation.report} onReset={handleReset} />
        ) : null}
      </div>
    </main>
  );
}
