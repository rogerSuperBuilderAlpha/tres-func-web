'use client';

import { useState } from 'react';
import { EnhancedSubmissionForm, SubmissionOptions } from '@/components/EnhancedSubmissionForm';
import { BatchSubmissionForm, type BatchSubmissionResult } from '@/components/BatchSubmissionForm';
import { EvaluationStatus } from '@/components/EvaluationStatus';
import { EvaluationReport } from '@/components/EvaluationReport';
import { EnhancedHistory } from '@/components/EnhancedHistory';
import { ManualReviewModal } from '@/components/ManualReviewModal';
import { PageHeader, ErrorBanner, LoadingOverlay } from '@/components/layout';
import { Tabs, TabsList, TabsTrigger, TabsContent, useToast, PlusIcon, ClockIcon } from '@/components/ui';
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
      <PageHeader
        evaluation={evaluation}
        onShowManualReview={() => setShowManualReview(true)}
        onRetryPdf={handleRetryPdf}
        onReset={handleReset}
      />

      {/* Error banner */}
      {error && (
        <ErrorBanner
          error={error}
          showRetry={evaluation?.status === 'FAILED'}
          onRetry={handleReset}
        />
      )}

      {/* Loading overlay */}
      {isLoadingHistory && <LoadingOverlay message="Loading evaluation..." />}

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
                      <SubmissionModeToggle 
                        mode={submissionMode} 
                        onModeChange={setSubmissionMode} 
                      />

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
          onReviewSaved={() => handleSelectEvaluation(evaluation.evaluationId)}
        />
      )}
    </main>
  );
}

// Submission Mode Toggle Component
function SubmissionModeToggle({ 
  mode, 
  onModeChange 
}: { 
  mode: 'single' | 'batch'; 
  onModeChange: (mode: 'single' | 'batch') => void;
}) {
  return (
    <div className="flex items-center gap-2 p-1 bg-navy-100 dark:bg-navy-800 rounded-lg w-fit">
      <button
        type="button"
        onClick={() => onModeChange('single')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
          mode === 'single'
            ? 'bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-sm'
            : 'text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white'
        }`}
      >
        Single
      </button>
      <button
        type="button"
        onClick={() => onModeChange('batch')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
          mode === 'batch'
            ? 'bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-sm'
            : 'text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white'
        }`}
      >
        Batch
      </button>
    </div>
  );
}
