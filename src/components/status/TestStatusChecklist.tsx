'use client';

import { memo } from 'react';
import type { TestProgress, TestStageStatus } from '@/types';
import { TEST_STATUS_CONFIG } from './config';
import { CheckIcon, XIcon, ExclamationIcon } from '@/components/ui';

interface TestStatusChecklistProps {
  progress?: TestProgress;
  isStuck: boolean;
  runningTests: Array<keyof TestProgress>;
}

export const TestStatusChecklist = memo(function TestStatusChecklist({ progress, isStuck, runningTests }: TestStatusChecklistProps) {
  return (
    <div className="lg:col-span-4 p-5 bg-navy-50/30 dark:bg-navy-800/30 min-h-[400px]">
      <h3 className="text-xs uppercase tracking-wide text-navy-500 dark:text-navy-400 mb-3">Test Status</h3>
      <div className="space-y-2">
        {TEST_STATUS_CONFIG.map(({ key, label }) => (
          <StatusItem key={key} label={label} status={progress?.[key] || 'pending'} isStuck={isStuck && runningTests.includes(key)} />
        ))}
      </div>

      {/* Typical time note */}
      <p className="text-[10px] text-navy-400 dark:text-navy-500 mt-4 pt-3 border-t border-navy-200 dark:border-navy-700">
        Typically takes 8-12 minutes. Complex applications may take longer.
      </p>
    </div>
  );
});

const StatusItem = memo(function StatusItem({ label, status, isStuck }: { label: string; status: TestStageStatus; isStuck?: boolean }) {
  const showWarning = isStuck && status === 'running';

  return (
    <div className="flex items-center gap-2.5 py-1">
      {/* Status icon */}
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
        {status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-navy-300 dark:border-navy-600" />}
        {status === 'running' && !showWarning && (
          <div className="w-4 h-4 rounded-full border-2 border-gold-500 border-t-transparent animate-spin" />
        )}
        {status === 'running' && showWarning && (
          <div className="w-4 h-4 rounded-full bg-warning-500 flex items-center justify-center animate-pulse">
            <span className="text-[10px] text-white font-bold">!</span>
          </div>
        )}
        {status === 'complete' && (
          <div className="w-4 h-4 rounded-full bg-success-500 flex items-center justify-center">
            <CheckIcon className="w-2.5 h-2.5 text-white" />
          </div>
        )}
        {status === 'warning' && (
          <div className="w-4 h-4 rounded-full bg-warning-500 flex items-center justify-center">
            <ExclamationIcon className="w-2.5 h-2.5 text-white" />
          </div>
        )}
        {status === 'failed' && (
          <div className="w-4 h-4 rounded-full bg-danger-500 flex items-center justify-center">
            <XIcon className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>

      {/* Label */}
      <span
        className={`text-sm ${
          status === 'pending'
            ? 'text-navy-400 dark:text-navy-500'
            : status === 'failed'
              ? 'text-danger-600 dark:text-danger-400'
              : showWarning
                ? 'text-warning-600 dark:text-warning-400 font-medium'
                : status === 'warning'
                  ? 'text-warning-600 dark:text-warning-400'
                  : status === 'complete'
                    ? 'text-navy-700 dark:text-navy-200'
                    : 'text-navy-700 dark:text-navy-200 font-medium'
        }`}
      >
        {label}
      </span>

      {/* Slow indicator */}
      {showWarning && (
        <span className="text-[10px] px-1.5 py-0.5 bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400 rounded ml-auto">
          slow
        </span>
      )}
    </div>
  );
});

