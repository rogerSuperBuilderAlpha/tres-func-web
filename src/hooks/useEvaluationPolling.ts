import { useState, useCallback, useRef, useEffect } from 'react';
import type { Evaluation } from '@/types';

interface UseEvaluationPollingOptions {
  apiBase: string;
  maxAttempts?: number;
  pollIntervalMs?: number;
  stuckTimeoutMs?: number;
}

interface PollingState {
  evaluation: Evaluation | null;
  error: string | null;
  isSubmitting: boolean;
  isLoadingHistory: boolean;
}

interface PollingActions {
  handleSubmit: (
    repoUrl: string,
    deployedUrl: string,
    backendRepoUrl?: string,
    options?: object
  ) => Promise<void>;
  handleSelectEvaluation: (evaluationId: string) => Promise<void>;
  handleRetryPdf: (evaluationId: string) => Promise<void>;
  handleReset: () => void;
  clearError: () => void;
}

/**
 * Custom hook for managing evaluation polling and state
 * Extracts complex polling logic from the main page component
 */
export function useEvaluationPolling({
  apiBase,
  maxAttempts = 300,
  pollIntervalMs = 5000,
  stuckTimeoutMs = 600000, // 10 minutes
}: UseEvaluationPollingOptions): [PollingState, PollingActions] {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const pdfPollRef = useRef<NodeJS.Timeout | null>(null);
  const statusPollRef = useRef<boolean>(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pdfPollRef.current) clearTimeout(pdfPollRef.current);
      statusPollRef.current = false;
    };
  }, []);

  /**
   * Poll PDF generation status
   */
  const pollPdfStatus = useCallback((evaluationId: string) => {
    if (pdfPollRef.current) clearTimeout(pdfPollRef.current);

    const poll = async () => {
      try {
        const response = await fetch(`${apiBase}/status/${evaluationId}`);
        if (response.ok) {
          const data = await response.json();
          setEvaluation(prev => 
            prev ? { ...prev, pdfStatus: data.pdfStatus, pdfUrl: data.pdfUrl } : null
          );
          if (data.pdfStatus === 'pending' || data.pdfStatus === 'generating') {
            pdfPollRef.current = setTimeout(poll, 3000);
          }
        }
      } catch (err) {
        console.error('PDF status poll error:', err);
      }
    };
    pdfPollRef.current = setTimeout(poll, 2000);
  }, [apiBase]);

  /**
   * Poll evaluation status
   */
  const pollStatus = useCallback((evaluationId: string) => {
    let attempts = 0;
    let consecutiveErrors = 0;
    let lastProgressChange = Date.now();
    let lastProgressStr = '';
    statusPollRef.current = true;

    const poll = async () => {
      if (!statusPollRef.current) return;
      
      attempts++;
      try {
        const response = await fetch(`${apiBase}/status/${evaluationId}`);
        if (!response.ok) throw new Error(`Status check failed: ${response.status}`);
        const data = await response.json();
        consecutiveErrors = 0;

        // Track if progress is changing
        const currentProgressStr = JSON.stringify(data.progress);
        if (currentProgressStr !== lastProgressStr) {
          lastProgressChange = Date.now();
          lastProgressStr = currentProgressStr;
        }

        setEvaluation(prev => prev ? {
          ...prev,
          progress: data.progress,
          startTime: data.startTime || prev.startTime,
          detailedProgress: data.detailedProgress,
        } : null);

        if (data.status === 'COMPLETED' && data.report) {
          statusPollRef.current = false;
          setEvaluation({
            evaluationId,
            status: 'COMPLETED',
            reportUrl: data.reportUrl,
            report: data.report,
            pdfStatus: data.pdfStatus,
            pdfUrl: data.pdfUrl,
            manualReviews: data.manualReviews,
          });
          if (data.pdfStatus === 'pending' || data.pdfStatus === 'generating') {
            pollPdfStatus(evaluationId);
          }
          return;
        }
        
        if (data.status === 'FAILED') {
          statusPollRef.current = false;
          setEvaluation({ evaluationId, status: 'FAILED', error: data.error });
          setError(data.error || 'Evaluation failed.');
          return;
        }

        // Check if evaluation seems truly stuck
        const stuckTime = Date.now() - lastProgressChange;
        if (stuckTime > stuckTimeoutMs) {
          setError('Evaluation appears to be stuck. You can wait or try again later.');
        }
        
        if (attempts < maxAttempts && statusPollRef.current) {
          setTimeout(poll, pollIntervalMs);
        } else if (attempts >= maxAttempts) {
          // After max attempts, give up but provide helpful message
          const runningTests = data.progress 
            ? Object.entries(data.progress)
                .filter(([, status]) => status === 'running')
                .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim())
            : [];
          
          const stuckMsg = runningTests.length > 0 
            ? `Tests stuck on: ${runningTests.join(', ')}. This usually indicates an issue with the candidate's application.`
            : `Evaluation timed out after ${Math.round(maxAttempts * pollIntervalMs / 60000)} minutes.`;
          
          setError(stuckMsg);
        }
      } catch (err) {
        consecutiveErrors++;
        if (consecutiveErrors >= 5) {
          setError('Lost connection to server. The evaluation may still be running. Try refreshing in a few minutes.');
          statusPollRef.current = false;
          return;
        }
        if (attempts < maxAttempts && statusPollRef.current) {
          setTimeout(poll, pollIntervalMs * Math.min(consecutiveErrors, 3));
        }
      }
    };
    poll();
  }, [apiBase, maxAttempts, pollIntervalMs, stuckTimeoutMs, pollPdfStatus]);

  /**
   * Submit a new evaluation
   */
  const handleSubmit = useCallback(async (
    repoUrl: string,
    deployedUrl: string,
    backendRepoUrl?: string,
    options?: object
  ) => {
    setIsSubmitting(true);
    setError(null);
    setEvaluation(null);

    try {
      const response = await fetch(`${apiBase}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, deployedUrl, backendRepoUrl, ...options }),
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
        repoUrl,
        deployedUrl,
      });
      pollStatus(data.evaluationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit evaluation');
      setEvaluation(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [apiBase, pollStatus]);

  /**
   * Load and display a historical evaluation
   */
  const handleSelectEvaluation = useCallback(async (evaluationId: string) => {
    setError(null);
    setIsLoadingHistory(true);
    
    try {
      const response = await fetch(`${apiBase}/status/${evaluationId}`);
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
          manualReviews: data.manualReviews,
        });
        if (data.pdfStatus === 'pending' || data.pdfStatus === 'generating') {
          pollPdfStatus(evaluationId);
        }
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
  }, [apiBase, pollStatus, pollPdfStatus]);

  /**
   * Retry PDF generation
   */
  const handleRetryPdf = useCallback(async (evaluationId: string) => {
    setEvaluation(prev => prev ? { ...prev, pdfStatus: 'generating' } : null);
    
    try {
      const response = await fetch(`${apiBase}/retry-pdf/${evaluationId}`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to retry PDF generation');
      pollPdfStatus(evaluationId);
    } catch {
      setEvaluation(prev => prev ? { ...prev, pdfStatus: 'failed' } : null);
    }
  }, [apiBase, pollPdfStatus]);

  /**
   * Reset to initial state
   */
  const handleReset = useCallback(() => {
    statusPollRef.current = false;
    if (pdfPollRef.current) clearTimeout(pdfPollRef.current);
    setEvaluation(null);
    setError(null);
  }, []);

  /**
   * Clear error without resetting evaluation
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return [
    { evaluation, error, isSubmitting, isLoadingHistory },
    { handleSubmit, handleSelectEvaluation, handleRetryPdf, handleReset, clearError },
  ];
}



