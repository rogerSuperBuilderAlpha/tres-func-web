'use client';

import { memo } from 'react';
import { ExclamationCircleIcon } from '@/components/ui';

interface ErrorBannerProps {
  error: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export const ErrorBanner = memo(function ErrorBanner({ error, showRetry, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex-shrink-0 bg-danger-50 dark:bg-danger-900/30 border-b border-danger-200 dark:border-danger-800 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center min-w-0">
          <ExclamationCircleIcon className="w-5 h-5 text-danger-600 mr-2 flex-shrink-0" />
          <span className="text-danger-700 dark:text-danger-400 text-sm truncate">{error}</span>
        </div>
        {showRetry && onRetry && (
          <button 
            onClick={onRetry} 
            className="px-3 py-1 text-sm bg-danger-600 text-white rounded hover:bg-danger-500 transition flex-shrink-0"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
});

