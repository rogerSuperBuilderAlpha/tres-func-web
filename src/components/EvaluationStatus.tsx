'use client';

import { useState, useEffect, useMemo } from 'react';
import type { TestProgress, DetailedProgress } from '@/types';
import { TIME_THRESHOLDS } from '@/lib/constants';

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

// Status level styling helper - reduces repeated ternary chains
type StatusLevel = 'normal' | 'warning' | 'critical';

function getStatusLevelStyles(level: StatusLevel) {
  return {
    bg: level === 'critical' ? 'bg-danger-100 dark:bg-danger-900/30' :
        level === 'warning' ? 'bg-warning-100 dark:bg-warning-900/30' :
        'bg-gold-100 dark:bg-gold-900/30',
    text: level === 'critical' ? 'text-danger-600 dark:text-danger-400' :
          level === 'warning' ? 'text-warning-600 dark:text-warning-400' :
          'text-gold-600 dark:text-gold-400',
    timerText: level === 'critical' ? 'text-danger-600 dark:text-danger-400' :
               level === 'warning' ? 'text-warning-600 dark:text-warning-400' :
               'text-navy-800 dark:text-white',
    progressBar: level === 'critical' ? 'bg-danger-500' :
                 level === 'warning' ? 'bg-warning-500' :
                 'bg-gold-500',
  };
}

// Test status configuration - data-driven for the checklist
const TEST_STATUS_CONFIG: { key: keyof TestProgress; label: string }[] = [
  { key: 'preflight', label: 'Pre-flight Check' },
  { key: 'repoAnalysis', label: 'Repo Analysis' },
  { key: 'security', label: 'Security' },
  { key: 'imageEdgeCases', label: 'Image Edge Cases' },
  { key: 'formInput', label: 'Form Validation' },
  { key: 'resilience', label: 'Resilience' },
  { key: 'functional', label: 'Functional' },
  { key: 'uxTest', label: 'UX Testing' },
  { key: 'aiReview', label: 'AI Review' },
  { key: 'deployment', label: 'Deployment' },
  { key: 'reportGeneration', label: 'Report Gen' },
  { key: 'pdfGeneration', label: 'PDF Report' },
];

export function EvaluationStatus({ evaluationId, progress, startTime, detailedProgress, repoUrl, deployedUrl }: EvaluationStatusProps) {
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
  const isStuck = stuckSeconds > TIME_THRESHOLDS.STUCK;

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
          
          {/* LEFT COLUMN: Timer & Progress */}
          <div className="lg:col-span-3 p-5">
            <div className="flex flex-col items-center text-center">
              {/* Spinning indicator */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${statusStyles.bg}`}>
                <svg className={`animate-spin h-8 w-8 ${statusStyles.text}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              
              {/* Timer */}
              <div className={`text-4xl font-mono font-bold mb-1 ${statusStyles.timerText}`}>
                {elapsedMinutes}:{remainingSeconds.toString().padStart(2, '0')}
              </div>
              <p className="text-xs text-navy-500 dark:text-navy-400 mb-4">Elapsed</p>
              
              {/* Progress bar */}
              <div className="w-full">
                <div className="flex justify-between text-xs text-navy-600 dark:text-navy-400 mb-1">
                  <span>Progress</span>
                  <span className="font-mono">{completedCount}/{totalTests}</span>
                </div>
                <div className="w-full bg-navy-200 dark:bg-navy-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${statusStyles.progressBar}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Current task */}
              <div className="mt-4 pt-4 border-t border-navy-100 dark:border-navy-700 w-full">
                <p className="text-[10px] uppercase tracking-wide text-navy-400 dark:text-navy-500 mb-1">Currently Running</p>
                <p className={`text-sm font-medium ${
                  isStuck ? 'text-warning-600 dark:text-warning-400' : 'text-navy-700 dark:text-navy-200'
                }`}>
                  {currentTestName}
                </p>
                {isStuck && (
                  <p className="text-[10px] text-warning-500 mt-1">
                    Slow response ({Math.floor(stuckSeconds / 60)}m {stuckSeconds % 60}s)
                  </p>
                )}
              </div>

              {/* Links for manual testing */}
              {(repoUrl || deployedUrl) && (
                <div className="mt-4 pt-4 border-t border-navy-100 dark:border-navy-700 w-full">
                  <p className="text-[10px] uppercase tracking-wide text-navy-400 dark:text-navy-500 mb-2">Quick Links</p>
                  <div className="space-y-2">
                    {repoUrl && (
                      <a
                        href={repoUrl.startsWith('http') ? repoUrl : `https://github.com/${repoUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        <span className="truncate">View Repository</span>
                      </a>
                    )}
                    {deployedUrl && (
                      <a
                        href={deployedUrl.startsWith('http') ? deployedUrl : `https://${deployedUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        <span className="truncate">Open Live App</span>
                      </a>
                    )}
                  </div>
                  
                  {/* Encouragement message */}
                  <div className="mt-3 p-2 bg-gold-50 dark:bg-gold-900/20 rounded-lg border border-gold-200 dark:border-gold-800/50">
                    <p className="text-[10px] text-gold-700 dark:text-gold-300 leading-relaxed">
                      💡 <strong>Pro tip:</strong> While waiting, try the app yourself! Manual testing helps you assess UX and edge cases the AI might miss.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MIDDLE COLUMN: Live Activity Log */}
          <div className="lg:col-span-5 p-5 flex flex-col min-h-[400px] max-h-[500px]">
            <h3 className="text-xs uppercase tracking-wide text-navy-500 dark:text-navy-400 mb-3 flex items-center gap-2 flex-shrink-0">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live Activity
              {detailedProgress && detailedProgress.length > 0 && (
                <span className="text-navy-500 font-mono">({detailedProgress.length} events)</span>
              )}
            </h3>
            <div className="bg-navy-900 dark:bg-navy-950 rounded-xl p-4 flex-1 overflow-y-auto font-mono text-xs scrollbar-thin scrollbar-thumb-navy-600 scrollbar-track-navy-800">
              {detailedProgress && detailedProgress.length > 0 ? (
                <div className="space-y-1">
                  {/* Show ALL items, newest first for easier scrolling */}
                  {[...detailedProgress].reverse().map((item, index) => (
                    <div key={`${item.timestamp}-${index}`} className="flex items-start gap-2 py-0.5">
                      <span className={`flex-shrink-0 w-4 text-center ${
                        item.stage === 'error' ? 'text-red-400' :
                        item.stage === 'complete' ? 'text-green-400' :
                        'text-gold-400'
                      }`}>
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
              <div className={`mt-3 p-3 rounded-lg text-xs ${
                statusLevel === 'critical' 
                  ? 'bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300 border border-danger-200 dark:border-danger-800' 
                  : 'bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 border border-warning-200 dark:border-warning-800'
              }`}>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>
                    {isStuck 
                      ? `${currentTestName} is taking longer than expected`
                      : 'This evaluation is taking longer than usual'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Test Status Checklist */}
          <div className="lg:col-span-4 p-5 bg-navy-50/30 dark:bg-navy-800/30 min-h-[400px]">
            <h3 className="text-xs uppercase tracking-wide text-navy-500 dark:text-navy-400 mb-3">
              Test Status
            </h3>
            <div className="space-y-2">
              {TEST_STATUS_CONFIG.map(({ key, label }) => (
                <StatusItem
                  key={key}
                  label={label}
                  status={progress?.[key] || 'pending'}
                  isStuck={isStuck && runningTests.includes(key)}
                />
              ))}
            </div>

            {/* Typical time note */}
            <p className="text-[10px] text-navy-400 dark:text-navy-500 mt-4 pt-3 border-t border-navy-200 dark:border-navy-700">
              Typically takes 8-12 minutes. Complex applications may take longer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, status, isStuck }: { label: string; status: 'pending' | 'running' | 'complete' | 'failed' | 'warning'; isStuck?: boolean }) {
  const showWarning = isStuck && status === 'running';
  
  return (
    <div className="flex items-center gap-2.5 py-1">
      {/* Status icon */}
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
        {status === 'pending' && (
          <div className="w-4 h-4 rounded-full border-2 border-navy-300 dark:border-navy-600" />
        )}
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
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {status === 'warning' && (
          <div className="w-4 h-4 rounded-full bg-warning-500 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01" />
            </svg>
          </div>
        )}
        {status === 'failed' && (
          <div className="w-4 h-4 rounded-full bg-danger-500 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Label */}
      <span className={`text-sm ${
        status === 'pending' ? 'text-navy-400 dark:text-navy-500' :
        status === 'failed' ? 'text-danger-600 dark:text-danger-400' :
        showWarning ? 'text-warning-600 dark:text-warning-400 font-medium' :
        status === 'warning' ? 'text-warning-600 dark:text-warning-400' :
        status === 'complete' ? 'text-navy-700 dark:text-navy-200' :
        'text-navy-700 dark:text-navy-200 font-medium'
      }`}>
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
}
