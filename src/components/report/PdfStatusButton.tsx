'use client';

import { memo } from 'react';
import { Spinner } from '@/components/ui';

interface PdfStatusButtonProps {
  pdfStatus?: 'pending' | 'generating' | 'ready' | 'failed';
  pdfUrl?: string;
  onRetryPdf?: () => void;
}

export const PdfStatusButton = memo(function PdfStatusButton({ 
  pdfStatus, 
  pdfUrl, 
  onRetryPdf 
}: PdfStatusButtonProps) {
  if (pdfStatus === 'ready' && pdfUrl) {
    return (
      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-navy-700 to-navy-900 text-white rounded-lg hover:from-navy-600 hover:to-navy-800 transition text-sm font-medium shadow-md"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="hidden sm:inline">Download PDF</span>
      </a>
    );
  }
  
  if (pdfStatus === 'generating') {
    return (
      <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-navy-100 text-navy-600 rounded-lg text-sm font-medium">
        <Spinner size="sm" />
        <span className="hidden sm:inline">Generating...</span>
      </div>
    );
  }
  
  if (pdfStatus === 'failed') {
    return (
      <button
        onClick={onRetryPdf}
        className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-danger-100 text-danger-700 rounded-lg hover:bg-danger-200 transition text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="hidden sm:inline">Retry PDF</span>
      </button>
    );
  }
  
  return (
    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-navy-100 text-navy-400 rounded-lg text-sm">
      <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="hidden sm:inline">PDF pending...</span>
    </div>
  );
});
