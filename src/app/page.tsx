'use client';

import { useState, useCallback, useRef } from 'react';
import { SubmissionForm } from '@/components/SubmissionForm';
import { EvaluationStatus } from '@/components/EvaluationStatus';
import { EvaluationReport, PdfStatusButton } from '@/components/EvaluationReport';
import { EvaluationHistory } from '@/components/EvaluationHistory';
import { ManualReviewModal } from '@/components/ManualReviewModal';
import type { Evaluation, EvaluationReportData } from '@/types';

// Re-export shared types for other components
export type { RubricScores, AiExecutiveSummary, EvaluationReportData } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://3mw2hq6l57.execute-api.us-east-1.amazonaws.com/prod';

export default function Home() {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualReview, setShowManualReview] = useState(false);
  const pdfPollRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for PDF status after evaluation completes
  const pollPdfStatus = useCallback((evaluationId: string) => {
    if (pdfPollRef.current) {
      clearTimeout(pdfPollRef.current);
    }

    const poll = async () => {
      try {
        const response = await fetch(`${API_BASE}/status/${evaluationId}`);
        if (response.ok) {
          const data = await response.json();
          setEvaluation(prev => prev ? {
            ...prev,
            pdfStatus: data.pdfStatus,
            pdfUrl: data.pdfUrl,
          } : null);

          if (data.pdfStatus === 'pending' || data.pdfStatus === 'generating') {
            pdfPollRef.current = setTimeout(poll, 3000);
          }
        }
      } catch (err) {
        console.error('PDF status poll error:', err);
      }
    };

    pdfPollRef.current = setTimeout(poll, 2000);
  }, []);

  const handleSubmit = async (repoUrl: string, deployedUrl: string, backendRepoUrl?: string) => {
    setIsSubmitting(true);
    setError(null);
    setEvaluation(null);

    try {
      const response = await fetch(`${API_BASE}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, deployedUrl, backendRepoUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `API error: ${response.status}`);
      }

      if (!data.evaluationId) {
        throw new Error('Invalid response: missing evaluationId');
      }

      setEvaluation({
        evaluationId: data.evaluationId,
        status: 'PROCESSING',
        reportUrl: data.reportUrl,
        startTime: new Date().toISOString(),
      });

      pollStatus(data.evaluationId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit evaluation';
      setError(errorMessage);
      setEvaluation(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollStatus = useCallback(async (evaluationId: string) => {
    const maxAttempts = 60;
    let attempts = 0;
    let consecutiveErrors = 0;

    const poll = async () => {
      attempts++;

      try {
        const response = await fetch(`${API_BASE}/status/${evaluationId}`);

        if (!response.ok) {
          throw new Error(`Status check failed: ${response.status}`);
        }

        const data = await response.json();
        consecutiveErrors = 0;

        setEvaluation(prev => prev ? {
          ...prev,
          progress: data.progress,
          startTime: data.startTime || prev.startTime,
          detailedProgress: data.detailedProgress,
        } : null);

        if (data.status === 'COMPLETED' && data.report) {
          setEvaluation({
            evaluationId,
            status: 'COMPLETED',
            reportUrl: data.reportUrl,
            report: data.report,
            pdfStatus: data.pdfStatus,
            pdfUrl: data.pdfUrl,
          });
          if (data.pdfStatus === 'pending' || data.pdfStatus === 'generating') {
            pollPdfStatus(evaluationId);
          }
          return;
        }

        if (data.status === 'FAILED') {
          setEvaluation({ evaluationId, status: 'FAILED', error: data.error });
          setError(data.error || 'Evaluation failed.');
          return;
        }

        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        } else {
          setError('Evaluation timed out after 5 minutes.');
          setEvaluation(prev => prev ? { ...prev, status: 'FAILED' } : null);
        }
      } catch (err) {
        consecutiveErrors++;
        if (consecutiveErrors >= 3) {
          setError(`Failed to check status. Please refresh.`);
          setEvaluation(prev => prev ? { ...prev, status: 'FAILED' } : null);
          return;
        }
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000 * consecutiveErrors);
        }
      }
    };

    poll();
  }, [pollPdfStatus]);

  const handleReset = () => {
    setEvaluation(null);
    setError(null);
  };

  const handleRetryPdf = async (evaluationId: string) => {
    setEvaluation(prev => prev ? { ...prev, pdfStatus: 'generating' } : null);

    try {
      const response = await fetch(`${API_BASE}/retry-pdf/${evaluationId}`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to retry PDF generation');

      const pollPdf = async () => {
        const statusResponse = await fetch(`${API_BASE}/status/${evaluationId}`);
        if (statusResponse.ok) {
          const data = await statusResponse.json();
          setEvaluation(prev => prev ? { ...prev, pdfStatus: data.pdfStatus, pdfUrl: data.pdfUrl } : null);
          if (data.pdfStatus === 'generating') setTimeout(pollPdf, 3000);
        }
      };
      setTimeout(pollPdf, 2000);
    } catch (err) {
      setEvaluation(prev => prev ? { ...prev, pdfStatus: 'failed' } : null);
    }
  };

  const handleSelectEvaluation = async (evaluationId: string) => {
    setError(null);
    setEvaluation({ evaluationId, status: 'PROCESSING' });

    try {
      const response = await fetch(`${API_BASE}/status/${evaluationId}`);
      if (!response.ok) throw new Error('Failed to load evaluation');
      const data = await response.json();

      if (data.status === 'COMPLETED' && data.report) {
        setEvaluation({
          evaluationId,
          status: 'COMPLETED',
          reportUrl: data.reportUrl,
          report: data.report,
          pdfStatus: data.pdfStatus,
          pdfUrl: data.pdfUrl,
        });
        if (data.pdfStatus === 'pending' || data.pdfStatus === 'generating') {
          pollPdfStatus(evaluationId);
        }
      } else if (data.status === 'FAILED') {
        setError(data.error || 'This evaluation failed');
        setEvaluation(null);
      } else {
        pollStatus(evaluationId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load evaluation');
      setEvaluation(null);
    }
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-grid-pattern">
      {/* Header */}
      <header className="flex-shrink-0 glass border-b border-navy-200/50">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Logo */}
              <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-navy-700 to-navy-900 shadow-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-navy-900 tracking-tight">
                  TTB Evaluator
                </h1>
                <p className="text-xs sm:text-sm text-navy-500 hidden sm:block">
                  Automated candidate assessment
                </p>
              </div>
            </div>
            
            {/* Header actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* PDF Button - only show when evaluation is complete */}
              {evaluation?.status === 'COMPLETED' && (
                <PdfStatusButton
                  pdfStatus={evaluation.pdfStatus}
                  pdfUrl={evaluation.pdfUrl}
                  onRetryPdf={() => handleRetryPdf(evaluation.evaluationId)}
                />
              )}
              
              {evaluation && (
                <button
                  onClick={handleReset}
                  className="px-3 sm:px-4 py-2 text-sm bg-navy-100 text-navy-700 rounded-lg hover:bg-navy-200 transition font-medium"
                >
                  <span className="hidden sm:inline">← New Evaluation</span>
                  <span className="sm:hidden">← New</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="flex-shrink-0 bg-danger-50 border-b border-danger-200 px-4 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center min-w-0">
              <svg className="w-5 h-5 text-danger-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-danger-700 text-sm truncate">{error}</span>
            </div>
            {evaluation?.status === 'FAILED' && (
              <button
                onClick={handleReset}
                className="px-3 py-1 text-sm bg-danger-600 text-white rounded hover:bg-danger-500 transition flex-shrink-0"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {!evaluation ? (
          <div className="h-full overflow-y-auto p-4 sm:p-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col justify-center">
                <SubmissionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
              </div>
              <div>
                <EvaluationHistory apiBase={API_BASE} onSelectEvaluation={handleSelectEvaluation} />
              </div>
            </div>
          </div>
        ) : evaluation.status === 'PROCESSING' ? (
          <div className="h-full flex items-center justify-center p-4 sm:p-6">
            <EvaluationStatus
              evaluationId={evaluation.evaluationId}
              progress={evaluation.progress}
              startTime={evaluation.startTime}
              detailedProgress={evaluation.detailedProgress}
            />
          </div>
        ) : evaluation.status === 'COMPLETED' && evaluation.report ? (
          <EvaluationReport
            report={evaluation.report}
            onReset={handleReset}
            pdfStatus={evaluation.pdfStatus}
            pdfUrl={evaluation.pdfUrl}
            onRetryPdf={() => handleRetryPdf(evaluation.evaluationId)}
            onOpenManualReview={() => setShowManualReview(true)}
          />
        ) : null}
      </div>

      {/* Manual Review Modal */}
      {evaluation && (
        <ManualReviewModal
          isOpen={showManualReview}
          onClose={() => setShowManualReview(false)}
          evaluationId={evaluation.evaluationId}
        />
      )}
    </main>
  );
}
