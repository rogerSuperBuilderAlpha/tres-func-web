'use client';

import { useState } from 'react';
import { EnhancedSubmissionForm, SubmissionOptions } from '@/components/EnhancedSubmissionForm';
import { BatchSubmissionForm, type BatchSubmissionResult } from '@/components/BatchSubmissionForm';
import { EvaluationStatus } from '@/components/EvaluationStatus';
import { EvaluationReport, PdfStatusButton } from '@/components/EvaluationReport';
import { EnhancedHistory } from '@/components/EnhancedHistory';
import { ManualReviewModal } from '@/components/ManualReviewModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Spinner, Tabs, TabsList, TabsTrigger, TabsContent, useToast, PlusIcon, ClockIcon, CheckCircleIcon, ClipboardCheckIcon } from '@/components/ui';
import { API_BASE } from '@/lib/api';
import { useEvaluationPolling } from '@/hooks';

export default function Home() {
  const [showManualReview, setShowManualReview] = useState(false);
  const [submissionMode, setSubmissionMode] = useState<'single' | 'batch'>('single');
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [batchCount, setBatchCount] = useState(0);
  const { addToast } = useToast();

  const [
    { evaluation, error, isSubmitting, isLoadingHistory },
    { handleSubmit, handleSelectEvaluation, handleRetryPdf, handleReset },
  ] = useEvaluationPolling({ apiBase: API_BASE });

  // Wrapper for form submission with proper typing
  const onSubmit = (
    repoUrl: string,
    deployedUrl: string,
    backendRepoUrl?: string,
    options?: SubmissionOptions
  ) => handleSubmit(repoUrl, deployedUrl, backendRepoUrl, options as object);

  // Batch submission handler
  const onBatchSubmit = async (submissions: Array<{ repoUrl: string; deployedUrl: string }>): Promise<BatchSubmissionResult> => {
    setBatchSubmitting(true);
    setBatchCount(submissions.length);
    
    try {
      // Submit all evaluations in parallel
      const results = await Promise.allSettled(
        submissions.map(async (sub) => {
          const response = await fetch(`${API_BASE}/evaluate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              repoUrl: sub.repoUrl,
              deployedUrl: sub.deployedUrl,
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Failed to start evaluation for ${sub.repoUrl}`);
          }
          
          return response.json();
        })
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      // Show toast notification
      if (successful > 0) {
        addToast(
          `Started ${successful} evaluation${successful !== 1 ? 's' : ''}${failed > 0 ? `. ${failed} failed.` : ''}. Check History for progress.`,
          failed > 0 ? 'warning' : 'success'
        );
      } else {
        addToast('All submissions failed. Please try again.', 'error');
      }
      
      return { successful, failed };
    } catch (err) {
      console.error('Batch submission error:', err);
      addToast('Error submitting batch. Please try again.', 'error');
      return { successful: 0, failed: submissions.length };
    } finally {
      setBatchSubmitting(false);
      setBatchCount(0);
    }
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-grid-pattern dark:bg-navy-950">
      {/* Header */}
      <header className="flex-shrink-0 glass dark:bg-navy-900/90 border-b border-navy-200/50 dark:border-navy-700">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-navy-700 to-navy-900 shadow-lg">
                <CheckCircleIcon className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-navy-900 dark:text-white tracking-tight">TTB Evaluator</h1>
                <p className="text-xs text-navy-500 dark:text-navy-400 hidden sm:block">Automated candidate assessment</p>
              </div>
            </div>
            
            {/* Header CTAs */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              
              {evaluation?.status === 'COMPLETED' && (
                <>
                  {/* Manual Review Button */}
                  <button
                    onClick={() => setShowManualReview(true)}
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition text-sm font-medium shadow-md"
                  >
                    <ClipboardCheckIcon className="w-4 h-4" />
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
                  className="px-3 sm:px-4 py-2 text-sm bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-200 rounded-lg hover:bg-navy-200 dark:hover:bg-navy-700 transition font-medium"
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
        <div className="flex-shrink-0 bg-danger-50 dark:bg-danger-900/30 border-b border-danger-200 dark:border-danger-800 px-4 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center min-w-0">
              <svg className="w-5 h-5 text-danger-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-danger-700 dark:text-danger-400 text-sm truncate">{error}</span>
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
          <div className="glass dark:bg-navy-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <Spinner size="lg" className="text-gold-500" />
            <p className="text-navy-700 dark:text-navy-200 font-medium">Loading evaluation...</p>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {!evaluation ? (
          <div className="h-full overflow-y-auto p-4 sm:p-6">
            <div className="max-w-6xl mx-auto">
              <Tabs defaultValue="new" className="h-full">
                <TabsList className="mb-6 inline-flex">
                  <TabsTrigger value="new" icon={<PlusIcon className="w-4 h-4" />}>
                    New Submission
                  </TabsTrigger>
                  <TabsTrigger value="history" icon={<ClockIcon className="w-4 h-4" />}>
                    History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="new">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 space-y-4">
                      {/* Mode Toggle */}
                      <div className="flex items-center gap-2 p-1 bg-navy-100 dark:bg-navy-800 rounded-lg w-fit">
                        <button
                          type="button"
                          onClick={() => setSubmissionMode('single')}
                          className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                            submissionMode === 'single'
                              ? 'bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-sm'
                              : 'text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white'
                          }`}
                        >
                          Single
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubmissionMode('batch')}
                          className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                            submissionMode === 'batch'
                              ? 'bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-sm'
                              : 'text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white'
                          }`}
                        >
                          Batch
                        </button>
                      </div>

                      {/* Form */}
                      {submissionMode === 'single' ? (
                        <EnhancedSubmissionForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
                      ) : (
                        <BatchSubmissionForm 
                          onSubmitBatch={onBatchSubmit} 
                          isSubmitting={batchSubmitting}
                          submittingCount={batchCount}
                        />
                      )}
                    </div>
                    <div className="lg:col-span-2">
                      <EnhancedHistory apiBase={API_BASE} onSelectEvaluation={handleSelectEvaluation} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history">
                  <EnhancedHistory apiBase={API_BASE} onSelectEvaluation={handleSelectEvaluation} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : evaluation.status === 'PROCESSING' ? (
          <div className="h-full flex items-center justify-center p-4 sm:p-6">
            <EvaluationStatus
              evaluationId={evaluation.evaluationId}
              progress={evaluation.progress}
              startTime={evaluation.startTime}
              detailedProgress={evaluation.detailedProgress}
              repoUrl={evaluation.repoUrl}
              deployedUrl={evaluation.deployedUrl}
            />
          </div>
        ) : evaluation.status === 'COMPLETED' && evaluation.report ? (
          <EvaluationReport
            report={evaluation.report}
            manualReviews={evaluation.manualReviews}
          />
        ) : null}
      </div>

      {/* Manual Review Modal */}
      {evaluation && (
        <ManualReviewModal
          isOpen={showManualReview}
          onClose={() => setShowManualReview(false)}
          evaluationId={evaluation.evaluationId}
          onReviewSaved={() => {
            // Refresh evaluation data to show the new manual review
            handleSelectEvaluation(evaluation.evaluationId);
          }}
        />
      )}
    </main>
  );
}
