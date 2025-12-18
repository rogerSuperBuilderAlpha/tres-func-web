'use client';

import { memo } from 'react';
import { Spinner, DownloadIcon, RefreshIcon, DocumentTextIcon } from '@/components/ui';

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
        <DownloadIcon className="w-4 h-4" />
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
        <RefreshIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Retry PDF</span>
      </button>
    );
  }
  
  return (
    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-navy-100 text-navy-400 rounded-lg text-sm">
      <DocumentTextIcon className="w-4 h-4 animate-pulse" />
      <span className="hidden sm:inline">PDF pending...</span>
    </div>
  );
});



