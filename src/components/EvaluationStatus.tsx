'use client';

import { useState, useEffect, useMemo } from 'react';
import type { TestProgress, DetailedProgress } from '@/types';

// Re-export types for backward compatibility
export type { TestProgress, DetailedProgress } from '@/types';

interface EvaluationStatusProps {
  evaluationId: string;
  progress?: TestProgress;
  startTime?: string;
  detailedProgress?: DetailedProgress[];
}

// Test expected durations in seconds
const TEST_DURATIONS: Record<string, number> = {
  preflight: 15,
  repoAnalysis: 45,
  security: 60,
  imageEdgeCases: 60,
  formInput: 45,
  resilience: 90,
  functional: 90,
  uxTest: 120,
  aiReview: 60,
  deployment: 30,
  reportGeneration: 45,
  pdfGeneration: 60,
};

// Time thresholds
const WARNING_THRESHOLD = 180; // 3 minutes - show warning
const CRITICAL_THRESHOLD = 300; // 5 minutes - show critical status
const STUCK_THRESHOLD = 120; // 2 minutes on same test = stuck

export function EvaluationStatus({ evaluationId, progress, startTime, detailedProgress }: EvaluationStatusProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastChangeTime, setLastChangeTime] = useState(Date.now());
  const [lastProgress, setLastProgress] = useState<TestProgress | undefined>(undefined);

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
    const progressStr = JSON.stringify(progress);
    const lastProgressStr = JSON.stringify(lastProgress);
    if (progressStr !== lastProgressStr) {
      setLastChangeTime(Date.now());
      setLastProgress(progress);
    }
  }, [progress, lastProgress]);

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const remainingSeconds = elapsedSeconds % 60;

  // Calculate stuck time
  const stuckSeconds = Math.floor((Date.now() - lastChangeTime) / 1000);
  const isStuck = stuckSeconds > STUCK_THRESHOLD;

  // Get currently running tests
  const runningTests = useMemo(() => {
    if (!progress) return [];
    return Object.entries(progress)
      .filter(([_, status]) => status === 'running')
      .map(([key]) => key);
  }, [progress]);

  // Calculate completion percentage
  const getCompletedCount = () => {
    if (!progress) return 0;
    return Object.values(progress).filter(s => s === 'complete').length;
  };

  const completedCount = getCompletedCount();
  const totalTests = 12;
  const progressPercent = Math.round((completedCount / totalTests) * 100);

  // Determine status level
  const statusLevel = useMemo(() => {
    if (elapsedSeconds > CRITICAL_THRESHOLD || isStuck) return 'critical';
    if (elapsedSeconds > WARNING_THRESHOLD) return 'warning';
    return 'normal';
  }, [elapsedSeconds, isStuck]);

  // Get status message
  const statusMessage = useMemo(() => {
    if (isStuck && runningTests.length > 0) {
      const testName = runningTests[0].replace(/([A-Z])/g, ' $1').trim();
      return `${testName} is taking longer than expected. This might indicate an issue with the candidate's application or a slow response from their server.`;
    }
    if (statusLevel === 'critical') {
      return 'This evaluation is taking unusually long. There may be an issue with the candidate\'s deployment or one of our test services.';
    }
    if (statusLevel === 'warning') {
      return 'Still running... Some tests are taking longer than usual. This can happen with slow or complex applications.';
    }
    return null;
  }, [statusLevel, isStuck, runningTests]);

  // Get the latest activity message
  const latestActivity = detailedProgress?.[0];

  return (
    <div className="w-full max-w-4xl">
      <div className="glass dark:bg-navy-900/90 rounded-2xl shadow-xl p-6 border border-navy-100 dark:border-navy-700">
        <h2 className="text-xl font-semibold text-navy-900 dark:text-white mb-4">
          Evaluation in Progress
        </h2>

        <div className="flex gap-4">
          {/* Left side - Status info */}
          <div className="flex-1 space-y-4">
            {/* Header with spinner */}
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${
                statusLevel === 'critical' ? 'bg-danger-100 dark:bg-danger-900/30' :
                statusLevel === 'warning' ? 'bg-warning-100 dark:bg-warning-900/30' :
                'bg-gold-100 dark:bg-gold-900/30'
              }`}>
                <svg className={`animate-spin h-5 w-5 ${
                  statusLevel === 'critical' ? 'text-danger-600 dark:text-danger-400' :
                  statusLevel === 'warning' ? 'text-warning-600 dark:text-warning-400' :
                  'text-gold-600 dark:text-gold-400'
                }`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-navy-600 dark:text-navy-300">
                  {runningTests.length > 0 
                    ? `Running: ${runningTests.map(t => t.replace(/([A-Z])/g, ' $1').trim()).join(', ')}`
                    : 'Running comprehensive tests...'}
                </p>
                <p className="text-xs text-navy-400 dark:text-navy-500 font-mono">{evaluationId}</p>
              </div>
            </div>

            {/* Timer and Progress */}
            <div className="flex items-center gap-6">
              <div>
                <div className={`text-2xl font-mono font-bold ${
                  statusLevel === 'critical' ? 'text-danger-600 dark:text-danger-400' :
                  statusLevel === 'warning' ? 'text-warning-600 dark:text-warning-400' :
                  'text-navy-800 dark:text-white'
                }`}>
                  {elapsedMinutes > 0 ? `${elapsedMinutes}:${remainingSeconds.toString().padStart(2, '0')}` : `0:${remainingSeconds.toString().padStart(2, '0')}`}
                </div>
                <p className="text-xs text-navy-500 dark:text-navy-400">Elapsed</p>
              </div>
              {progress && (
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-navy-600 dark:text-navy-400 mb-1">
                    <span>Progress</span>
                    <span>{completedCount}/{totalTests}</span>
                  </div>
                  <div className="w-full bg-navy-200 dark:bg-navy-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        statusLevel === 'critical' ? 'bg-danger-500' :
                        statusLevel === 'warning' ? 'bg-warning-500' :
                        'bg-gold-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Status message */}
            {statusMessage ? (
              <div className={`p-3 rounded-lg text-sm ${
                statusLevel === 'critical' 
                  ? 'bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300 border border-danger-200 dark:border-danger-800' 
                  : 'bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 border border-warning-200 dark:border-warning-800'
              }`}>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p>{statusMessage}</p>
                    {isStuck && (
                      <p className="text-xs mt-1 opacity-75">No progress for {Math.floor(stuckSeconds / 60)}m {stuckSeconds % 60}s</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-navy-500 dark:text-navy-400">
                Typically takes 2-4 minutes. Complex applications may take longer.
              </p>
            )}

            {/* Latest activity */}
            {latestActivity && (
              <div className="bg-navy-50 dark:bg-navy-800/50 rounded-lg p-3">
                <p className="text-xs text-navy-500 dark:text-navy-400 mb-1">Latest Activity</p>
                <p className="text-sm text-navy-700 dark:text-navy-200">
                  <span className="font-medium">[{latestActivity.testName}]</span> {latestActivity.message}
                </p>
              </div>
            )}
          </div>

          {/* Right side - Test status list */}
          <div className="w-56 bg-navy-50 dark:bg-navy-800/50 rounded-lg p-4">
            <h3 className="font-medium text-navy-800 dark:text-navy-200 mb-2 text-xs uppercase tracking-wide">Test Status</h3>
            <div className="space-y-1.5">
              <StatusItem label="Pre-flight Check" status={progress?.preflight || 'pending'} isStuck={isStuck && runningTests.includes('preflight')} />
              <StatusItem label="Repo Analysis" status={progress?.repoAnalysis || 'pending'} isStuck={isStuck && runningTests.includes('repoAnalysis')} />
              <StatusItem label="Security" status={progress?.security || 'pending'} isStuck={isStuck && runningTests.includes('security')} />
              <StatusItem label="Image Edge Cases" status={progress?.imageEdgeCases || 'pending'} isStuck={isStuck && runningTests.includes('imageEdgeCases')} />
              <StatusItem label="Form Validation" status={progress?.formInput || 'pending'} isStuck={isStuck && runningTests.includes('formInput')} />
              <StatusItem label="Resilience" status={progress?.resilience || 'pending'} isStuck={isStuck && runningTests.includes('resilience')} />
              <StatusItem label="Functional" status={progress?.functional || 'pending'} isStuck={isStuck && runningTests.includes('functional')} />
              <StatusItem label="UX Testing" status={progress?.uxTest || 'pending'} isStuck={isStuck && runningTests.includes('uxTest')} />
              <StatusItem label="AI Review" status={progress?.aiReview || 'pending'} isStuck={isStuck && runningTests.includes('aiReview')} />
              <StatusItem label="Deployment" status={progress?.deployment || 'pending'} isStuck={isStuck && runningTests.includes('deployment')} />
              <StatusItem label="Report Gen" status={progress?.reportGeneration || 'pending'} isStuck={isStuck && runningTests.includes('reportGeneration')} />
              <StatusItem label="PDF Report" status={progress?.pdfGeneration || 'pending'} isStuck={isStuck && runningTests.includes('pdfGeneration')} />
            </div>
          </div>
        </div>

        {/* Live activity log */}
        {detailedProgress && detailedProgress.length > 0 && (
          <div className="mt-4 border-t border-navy-200 dark:border-navy-700 pt-4">
            <h3 className="font-medium text-navy-800 dark:text-navy-200 mb-2 text-xs uppercase tracking-wide">Live Activity Log</h3>
            <div className="bg-navy-900 dark:bg-navy-950 rounded-lg p-3 max-h-32 overflow-y-auto font-mono text-xs">
              {detailedProgress.slice(0, 10).map((item, index) => (
                <div key={`${item.timestamp}-${index}`} className="flex items-start gap-2 py-0.5">
                  <span className={`flex-shrink-0 ${
                    item.stage === 'error' ? 'text-red-400' :
                    item.stage === 'complete' ? 'text-green-400' :
                    'text-gold-400'
                  }`}>
                    {item.stage === 'error' ? '✗' : item.stage === 'complete' ? '✓' : '→'}
                  </span>
                  <span className="text-navy-400">[{item.testName}]</span>
                  <span className="text-navy-200">{item.message}</span>
                  {item.percentage !== undefined && (
                    <span className="text-navy-500 ml-auto">{item.percentage}%</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusItem({ label, status, isStuck }: { label: string; status: 'pending' | 'running' | 'complete' | 'failed' | 'warning'; isStuck?: boolean }) {
  const showWarning = isStuck && status === 'running';
  
  return (
    <div className="flex items-center space-x-2">
      {status === 'pending' && (
        <div className="w-3.5 h-3.5 rounded-full border-2 border-navy-300 dark:border-navy-600" />
      )}
      {status === 'running' && !showWarning && (
        <div className="w-3.5 h-3.5 rounded-full border-2 border-gold-500 border-t-transparent animate-spin" />
      )}
      {status === 'running' && showWarning && (
        <div className="w-3.5 h-3.5 rounded-full bg-warning-500 flex items-center justify-center animate-pulse">
          <span className="text-[8px] text-white font-bold">!</span>
        </div>
      )}
      {status === 'complete' && (
        <div className="w-3.5 h-3.5 rounded-full bg-success-500 flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      {status === 'warning' && (
        <div className="w-3.5 h-3.5 rounded-full bg-warning-500 flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01" />
          </svg>
        </div>
      )}
      {status === 'failed' && (
        <div className="w-3.5 h-3.5 rounded-full bg-danger-500 flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}
      <span className={`text-xs ${
        status === 'pending' ? 'text-navy-400 dark:text-navy-500' :
        status === 'failed' ? 'text-danger-600 dark:text-danger-400' :
        showWarning ? 'text-warning-600 dark:text-warning-400 font-medium' :
        status === 'warning' ? 'text-warning-600 dark:text-warning-400' :
        status === 'complete' ? 'text-success-600 dark:text-success-400' :
        'text-navy-700 dark:text-navy-300'
      }`}>
        {label}
        {showWarning && <span className="ml-1 text-[10px]">(slow)</span>}
      </span>
    </div>
  );
}
