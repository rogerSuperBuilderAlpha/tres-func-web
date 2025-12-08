'use client';

import { useState, useCallback, useRef } from 'react';
import { SubmissionForm } from '@/components/SubmissionForm';
import { EvaluationStatus } from '@/components/EvaluationStatus';
import { EvaluationReport, PdfStatusButton } from '@/components/EvaluationReport';
import { EvaluationHistory } from '@/components/EvaluationHistory';
import { ManualReviewModal } from '@/components/ManualReviewModal';
import { Spinner } from '@/components/ui';
import { API_BASE } from '@/lib/api';
import type { Evaluation } from '@/types';

export default function Home() {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualReview, setShowManualReview] = useState(false);
  const pdfPollRef = useRef<NodeJS.Timeout | null>(null);

  const pollPdfStatus = useCallback((evaluationId: string) => {
    if (pdfPollRef.current) clearTimeout(pdfPollRef.current);

    const poll = async () => {
      try {
        const response = await fetch(`${API_BASE}/status/${evaluationId}`);
        if (response.ok) {
          const data = await response.json();
          setEvaluation(prev => prev ? { ...prev, pdfStatus: data.pdfStatus, pdfUrl: data.pdfUrl } : null);
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
      if (!response.ok) throw new Error(data.error || data.message || `API error: ${response.status}`);
      if (!data.evaluationId) throw new Error('Invalid response: missing evaluationId');

      setEvaluation({
        evaluationId: data.evaluationId,
        status: 'PROCESSING',
        reportUrl: data.reportUrl,
        startTime: new Date().toISOString(),
      });
      pollStatus(data.evaluationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit evaluation');
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
        if (!response.ok) throw new Error(`Status check failed: ${response.status}`);
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
          if (data.pdfStatus === 'pending' || data.pdfStatus === 'generating') pollPdfStatus(evaluationId);
          return;
        }
        if (data.status === 'FAILED') {
          setEvaluation({ evaluationId, status: 'FAILED', error: data.error });
          setError(data.error || 'Evaluation failed.');
          return;
        }
        if (attempts < maxAttempts) setTimeout(poll, 5000);
        else {
          setError('Evaluation timed out after 5 minutes.');
          setEvaluation(prev => prev ? { ...prev, status: 'FAILED' } : null);
        }
      } catch (err) {
        consecutiveErrors++;
        if (consecutiveErrors >= 3) {
          setError('Failed to check status. Please refresh.');
          setEvaluation(prev => prev ? { ...prev, status: 'FAILED' } : null);
          return;
        }
        if (attempts < maxAttempts) setTimeout(poll, 5000 * consecutiveErrors);
      }
    };
    poll();
  }, [pollPdfStatus]);

  const handleReset = () => { setEvaluation(null); setError(null); };

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
    } catch {
      setEvaluation(prev => prev ? { ...prev, pdfStatus: 'failed' } : null);
    }
  };

  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const handleSelectEvaluation = async (evaluationId: string) => {
    setError(null);
    setIsLoadingHistory(true);
    
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
        if (data.pdfStatus === 'pending' || data.pdfStatus === 'generating') pollPdfStatus(evaluationId);
      } else if (data.status === 'FAILED') {
        setError(data.error || 'This evaluation failed');
        setEvaluation(null);
      } else {
        // Still processing - show the processing screen
        setEvaluation({ evaluationId, status: 'PROCESSING' });
        pollStatus(evaluationId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load evaluation');
      setEvaluation(null);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-grid-pattern">
      {/* Header */}
      <header className="flex-shrink-0 glass border-b border-navy-200/50">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-navy-700 to-navy-900 shadow-lg">
                <svg className="w-5 h-5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-navy-900 tracking-tight">TTB Evaluator</h1>
                <p className="text-xs text-navy-500 hidden sm:block">Automated candidate assessment</p>
              </div>
            </div>
            
            {/* Header CTAs */}
            <div className="flex items-center gap-2">
              {evaluation?.status === 'COMPLETED' && (
                <>
                  {/* Manual Review Button */}
                  <button
                    onClick={() => setShowManualReview(true)}
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition text-sm font-medium shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span className="hidden sm:inline">Manual Review</span>
                  </button>
                  
                  {/* PDF Button */}
                  <PdfStatusButton
                    pdfStatus={evaluation.pdfStatus}
                    pdfUrl={evaluation.pdfUrl}
                    onRetryPdf={() => handleRetryPdf(evaluation.evaluationId)}
                  />
                </>
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
              <button onClick={handleReset} className="px-3 py-1 text-sm bg-danger-600 text-white rounded hover:bg-danger-500 transition flex-shrink-0">
                Try Again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading overlay for history selection */}
      {isLoadingHistory && (
        <div className="fixed inset-0 z-40 bg-navy-950/30 backdrop-blur-sm flex items-center justify-center">
          <div className="glass rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <Spinner size="lg" className="text-gold-500" />
            <p className="text-navy-700 font-medium">Loading evaluation...</p>
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
