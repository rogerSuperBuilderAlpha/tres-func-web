'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui';

// Lazy load AnalyticsPortal since it's heavy (~500 lines) and not always needed
export const AnalyticsPortal = dynamic(
  () => import('./AnalyticsPortal').then(mod => ({ default: mod.AnalyticsPortal })),
  {
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-navy-900 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
          <Spinner size="lg" className="text-purple-600" />
          <p className="mt-4 text-navy-600 dark:text-navy-300">Loading Analytics...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

