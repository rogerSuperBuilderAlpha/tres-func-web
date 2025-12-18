'use client';

import { memo } from 'react';
import { Spinner } from '@/components/ui';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay = memo(function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-40 bg-navy-950/30 backdrop-blur-sm flex items-center justify-center">
      <div className="glass dark:bg-navy-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
        <Spinner size="lg" className="text-gold-500" />
        <p className="text-navy-700 dark:text-navy-200 font-medium">{message}</p>
      </div>
    </div>
  );
});

