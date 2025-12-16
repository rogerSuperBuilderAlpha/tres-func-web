'use client';

import { useState, useCallback } from 'react';
import { EnhancedSubmissionForm, SubmissionOptions } from '@/components/EnhancedSubmissionForm';
import { BatchSubmissionForm, type BatchSubmissionResult } from '@/components/BatchSubmissionForm';
import { EvaluationStatus } from '@/components/EvaluationStatus';
import { EvaluationReport } from '@/components/EvaluationReport';
import { EnhancedHistory } from '@/components/EnhancedHistory';
import { ManualReviewModal } from '@/components/ManualReviewModal';
import { PageHeader, ErrorBanner, LoadingOverlay } from '@/components/layout';
import { Tabs, TabsList, TabsTrigger, TabsContent, useToast, PlusIcon, ClockIcon, ToggleGroup } from '@/components/ui';
import { API_BASE } from '@/lib/api';
import { useEvaluationPolling, useBatchMutation } from '@/hooks';

const SUBMISSION_MODE_OPTIONS = [
  { value: 'single' as const, label: 'Single' },
  { value: 'batch' as const, label: 'Batch' },
];

export default function Home() {
  const [showManualReview, setShowManualReview] = useState(false);
  const [submissionMode, setSubmissionMode] = useState<'single' | 'batch'>('single');
  const { addToast } = useToast();

  const [
    { evaluation, error, isSubmitting, isLoadingHistory },
    { handleSubmit, handleSelectEvaluation, handleRetryPdf, handleReset },
  ] = useEvaluationPolling({ apiBase: API_BASE });

  // Batch mutation hook
  const { isLoading: batchSubmitting, mutateAll } = useBatchMutation<
    { repoUrl: string; deployedUrl: string },
    { evaluationId: string }
  >('/evaluate');

  // Wrapper for form submission with proper typing
  const onSubmit = useCallback((
    repoUrl: string,
    deployedUrl: string,
    backendRepoUrl?: string,
    options?: SubmissionOptions
  ) => handleSubmit(repoUrl, deployedUrl, backendRepoUrl, options as object), [handleSubmit]);

  // Batch submission handler using the hook
  const onBatchSubmit = useCallback(async (
    submissions: Array<{ repoUrl: string; deployedUrl: string }>
  ): Promise<BatchSubmissionResult> => {
    const { successful, failed } = await mutateAll(submissions);
    
    if (successful > 0) {
      addToast(
        `Started ${successful} evaluation${successful !== 1 ? 's' : ''}${failed > 0 ? `. ${failed} failed.` : ''}. Check History for progress.`,
        failed > 0 ? 'warning' : 'success'
      );
    } else {
      addToast('All submissions failed. Please try again.', 'error');
    }
    
    return { successful, failed };
  }, [mutateAll, addToast]);

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
                      <ToggleGroup
                        value={submissionMode}
                        onChange={setSubmissionMode}
                        options={SUBMISSION_MODE_OPTIONS}
                        disabled={isSubmitting || batchSubmitting}
                      />

                      {/* Form */}
                      {submissionMode === 'single' ? (
                        <EnhancedSubmissionForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
                      ) : (
                        <BatchSubmissionForm 
                          onSubmitBatch={onBatchSubmit} 
                          isSubmitting={batchSubmitting}
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
