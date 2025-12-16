'use client';

import { memo } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PdfStatusButton } from '@/components/EvaluationReport';
import { CheckCircleIcon, ClipboardCheckIcon } from '@/components/ui';

interface PageHeaderProps {
  evaluation?: {
    evaluationId: string;
    status: string;
    pdfStatus?: string;
    pdfUrl?: string;
  } | null;
  onShowManualReview: () => void;
  onRetryPdf: (evaluationId: string) => void;
  onReset: () => void;
}

export const PageHeader = memo(function PageHeader({
  evaluation,
  onShowManualReview,
  onRetryPdf,
  onReset,
}: PageHeaderProps) {
  return (
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
                  onClick={onShowManualReview}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition text-sm font-medium shadow-md"
                >
                  <ClipboardCheckIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Manual Review</span>
                </button>
                
                {/* PDF Button */}
                <PdfStatusButton
                  pdfStatus={evaluation.pdfStatus as 'pending' | 'generating' | 'ready' | 'failed' | undefined}
                  pdfUrl={evaluation.pdfUrl}
                  onRetryPdf={() => onRetryPdf(evaluation.evaluationId)}
                />
              </>
            )}
            
            {evaluation && (
              <button
                onClick={onReset}
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
  );
});
