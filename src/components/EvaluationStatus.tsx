'use client';

import { useMemo, useEffect, useRef, useState } from 'react';
import type { TestProgress, DetailedProgress } from '@/types';
import { TIME_THRESHOLDS } from '@/lib/constants';
import { ActivityLog, getStatusLevelStyles, TEST_STATUS_CONFIG, TestStatusChecklist, TimerPanel, type StatusLevel } from './status';

// Re-export types for backward compatibility
export type { TestProgress, DetailedProgress } from '@/types';

interface EvaluationStatusProps {
  evaluationId: string;
  progress?: TestProgress;
  startTime?: string;
  detailedProgress?: DetailedProgress[];
  repoUrl?: string;
  deployedUrl?: string;
}

export function EvaluationStatus({ evaluationId, progress, startTime, detailedProgress, repoUrl, deployedUrl }: EvaluationStatusProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastChangeTime, setLastChangeTime] = useState(Date.now());
  const lastProgressSerializedRef = useRef<string | undefined>(undefined);

  // Real-time timer that updates every second
  useEffect(() => {
    const startDate = startTime ? new Date(startTime) : new Date();

    const updateElapsed = () => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startDate.getTime()) / 1000);
      setElapsedSeconds(elapsed);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Track when progress last changed
  useEffect(() => {
    const progressStr = progress ? JSON.stringify(progress) : undefined;
    if (progressStr !== lastProgressSerializedRef.current) {
      setLastChangeTime(Date.now());
      lastProgressSerializedRef.current = progressStr;
    }
  }, [progress]);

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const remainingSeconds = elapsedSeconds % 60;

  // Calculate stuck time
  const stuckSeconds = Math.floor((Date.now() - lastChangeTime) / 1000);
  const isStuck = stuckSeconds > TIME_THRESHOLDS.STUCK;

  // Get currently running tests
  const runningTests = useMemo((): Array<keyof TestProgress> => {
    if (!progress) return [];
    return Object.entries(progress)
      .filter(([_, status]) => status === 'running')
      .map(([key]) => key as keyof TestProgress);
  }, [progress]);

  const completedCount = useMemo(() => {
    if (!progress) return 0;
    return Object.values(progress).filter((s) => s === 'complete').length;
  }, [progress]);
  const totalTests = TEST_STATUS_CONFIG.length;
  const progressPercent = Math.round((completedCount / totalTests) * 100);

  // Determine status level
  const statusLevel: StatusLevel = useMemo(() => {
    if (elapsedSeconds > TIME_THRESHOLDS.CRITICAL || isStuck) return 'critical';
    if (elapsedSeconds > TIME_THRESHOLDS.WARNING) return 'warning';
    return 'normal';
  }, [elapsedSeconds, isStuck]);

  // Get styles for current status level
  const statusStyles = getStatusLevelStyles(statusLevel);

  // Format running test name
  const currentTestName = runningTests.length > 0 
    ? runningTests[0].replace(/([A-Z])/g, ' $1').trim()
    : 'Initializing';

  const activityItemsNewestFirst = useMemo(() => {
    if (!detailedProgress || detailedProgress.length === 0) return [];
    return [...detailedProgress].reverse();
  }, [detailedProgress]);

  return (
    <div className="w-full max-w-6xl">
      <div className="glass dark:bg-navy-900/90 rounded-2xl shadow-xl border border-navy-100 dark:border-navy-700 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-navy-100 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-800/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
              Evaluation in Progress
            </h2>
            <span className="text-xs font-mono text-navy-400 dark:text-navy-500 bg-navy-100 dark:bg-navy-800 px-2 py-1 rounded">
              {evaluationId}
            </span>
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-navy-100 dark:divide-navy-700">
          <TimerPanel
            statusStyles={statusStyles}
            elapsedMinutes={elapsedMinutes}
            remainingSeconds={remainingSeconds}
            completedCount={completedCount}
            totalTests={totalTests}
            progressPercent={progressPercent}
            currentTestName={currentTestName}
            isStuck={isStuck}
            stuckSeconds={stuckSeconds}
            repoUrl={repoUrl}
            deployedUrl={deployedUrl}
          />

          <ActivityLog
            itemsNewestFirst={activityItemsNewestFirst}
            totalEvents={detailedProgress?.length ?? 0}
            statusLevel={statusLevel}
            isStuck={isStuck}
            currentTestName={currentTestName}
          />

          <TestStatusChecklist progress={progress} isStuck={isStuck} runningTests={runningTests} />
        </div>
      </div>
    </div>
  );
}
