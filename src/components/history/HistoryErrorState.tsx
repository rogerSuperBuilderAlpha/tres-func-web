'use client';

import { memo } from 'react';
import { Alert } from '@/components/ui';

interface HistoryErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const HistoryErrorState = memo(function HistoryErrorState({ error, onRetry }: HistoryErrorStateProps) {
  return (
    <div className="glass rounded-2xl shadow-xl border border-navy-100 p-6 dark:bg-navy-900/90 dark:border-navy-700">
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
          <svg className="w-6 h-6 text-danger-600 dark:text-danger-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="max-w-md mx-auto mb-4 text-left">
          <Alert variant="danger">{error}</Alert>
        </div>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-navy-700 text-white rounded-lg hover:bg-navy-600 transition text-sm font-medium"
        >
          Retry
        </button>
      </div>
    </div>
  );
});


