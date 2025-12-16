'use client';

import { memo } from 'react';
import type { DetailedProgress } from '@/types';
import { ExclamationTriangleIcon } from '@/components/ui';
import type { StatusLevel } from './types';

interface ActivityLogProps {
  itemsNewestFirst: DetailedProgress[];
  totalEvents: number;
  statusLevel: StatusLevel;
  isStuck: boolean;
  currentTestName: string;
}

export const ActivityLog = memo(function ActivityLog({ itemsNewestFirst, totalEvents, statusLevel, isStuck, currentTestName }: ActivityLogProps) {
  return (
    <div className="lg:col-span-5 p-5 flex flex-col min-h-[400px] max-h-[500px]">
      <h3 className="text-xs uppercase tracking-wide text-navy-500 dark:text-navy-400 mb-3 flex items-center gap-2 flex-shrink-0">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        Live Activity
        {totalEvents > 0 && <span className="text-navy-500 font-mono">({totalEvents} events)</span>}
      </h3>

      <div className="bg-navy-900 dark:bg-navy-950 rounded-xl p-4 flex-1 overflow-y-auto font-mono text-xs scrollbar-thin scrollbar-thumb-navy-600 scrollbar-track-navy-800">
        {itemsNewestFirst.length > 0 ? (
          <div className="space-y-1">
            {/* Show ALL items, newest first for easier scrolling */}
            {itemsNewestFirst.map((item, index) => (
              <div key={`${item.timestamp}-${index}`} className="flex items-start gap-2 py-0.5">
                <span
                  className={`flex-shrink-0 w-4 text-center ${
                    item.stage === 'error' ? 'text-red-400' : item.stage === 'complete' ? 'text-green-400' : 'text-gold-400'
                  }`}
                >
                  {item.stage === 'error' ? '✗' : item.stage === 'complete' ? '✓' : '→'}
                </span>
                <span className="text-cyan-400 flex-shrink-0">[{item.testName}]</span>
                <span className="text-navy-200 flex-1 break-words">{item.message}</span>
                {item.percentage !== undefined && (
                  <span className="text-navy-500 flex-shrink-0 tabular-nums">{item.percentage}%</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-navy-500 text-center py-8">
            <p>Waiting for activity...</p>
          </div>
        )}
      </div>

      {/* Status message if any */}
      {statusLevel !== 'normal' && (
        <div
          className={`mt-3 p-3 rounded-lg text-xs ${
            statusLevel === 'critical'
              ? 'bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300 border border-danger-200 dark:border-danger-800'
              : 'bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 border border-warning-200 dark:border-warning-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
            <span>{isStuck ? `${currentTestName} is taking longer than expected` : 'This evaluation is taking longer than usual'}</span>
          </div>
        </div>
      )}
    </div>
  );
});
